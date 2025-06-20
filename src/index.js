"use strict";
const bootstrap = require("./bootstrap");

const triggerGithubPublish = require("./utils/github-dispatch");

// Utility : vérifier que l'UID correspond à un content-type de votre API
const isApiContentType = (uid) =>
  typeof uid === "string" && uid.startsWith("api::");

module.exports = {
  async bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe({
      // `models: []` => all content-types
      async beforeUpdate(event) {
        const { where } = event.params;
        const uid = event.model?.uid;

        // Ignore everything qui n'appartient pas à l'API
        if (!isApiContentType(uid) || !where?.id) {
          return;
        }

        event.state = {
          prev: await strapi.entityService.findOne(uid, where.id, {
            fields: ["publishedAt"],
          }),
        };
      },

      async afterUpdate(event) {
        const uid = event.model?.uid;
        if (!isApiContentType(uid)) {
          return;
        }

        const { result } = event;
        const wasDraft = !event.state?.prev?.publishedAt;
        const isNowLive = !!result.publishedAt;
        if (wasDraft && isNowLive) {
          await triggerGithubPublish();
        }
      },

      async afterCreate(event) {
        const uid = event.model?.uid;
        if (!isApiContentType(uid)) {
          return;
        }

        const { result } = event;
        if (result.publishedAt) {
          await triggerGithubPublish();
        }
      },
    });
  },
};
