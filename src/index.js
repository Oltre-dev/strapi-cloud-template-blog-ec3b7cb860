"use strict";
const bootstrap = require("./bootstrap");

const triggerGithubPublish = require("./utils/github-dispatch");

module.exports = {
  async bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe({
      // `models: []` => all content-types
      async beforeUpdate(event) {
        // Store previous state to detect transition from unpublished to published
        const { where } = event.params;
        if (where?.id) {
          const uid = event.model.uid;
          event.state = {
            prev: await strapi.entityService.findOne(uid, where.id, {
              fields: ["publishedAt"],
            }),
          };
        }
      },

      async afterUpdate(event) {
        const { result } = event;
        const wasDraft = !event.state?.prev?.publishedAt;
        const isNowLive = !!result.publishedAt;
        if (wasDraft && isNowLive) {
          await triggerGithubPublish();
        }
      },

      async afterCreate(event) {
        // Case where entry is created directly as 'published'
        const { result } = event;
        if (result.publishedAt) {
          await triggerGithubPublish();
        }
      },
    });
  },
};
