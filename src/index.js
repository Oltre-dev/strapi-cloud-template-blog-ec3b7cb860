"use strict";
const bootstrap = require("./bootstrap");

const triggerDispatch = require("./utils/github-dispatch");

module.exports = {
  async bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe({
      // `models: []` ⇒ toutes les content-types
      async beforeUpdate(event) {
        // On mémorise l’état précédent pour savoir si on passe de non-publié à publié
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
          await triggerDispatch("strapi-publish", {
            model: event.model.uid,
            id: result.id,
            slug: result.slug || result.title || result.id,
          });
        }
      },

      async afterCreate(event) {
        // Cas où l’entrée est créée directement en 'published'
        const { result } = event;
        if (result.publishedAt) {
          await triggerDispatch("strapi-publish", {
            model: event.model.uid,
            id: result.id,
          });
        }
      },
    });
  },
};
