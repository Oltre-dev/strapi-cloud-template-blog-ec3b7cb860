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
        const { where, data } = event.params;
        const uid = event.model?.uid;

        // Ignore everything qui n'appartient pas à l'API
        if (!isApiContentType(uid) || !where?.id) {
          return;
        }

        const isConcerned =
          uid === "api::article.article" || uid === "api::video.video";

        const fieldsToSelect = isConcerned
          ? ["publishedAt", "publicationDate"]
          : ["publishedAt"];

        const entry = await strapi.entityService.findOne(uid, where.id, {
          fields: fieldsToSelect,
        });

        if (!entry) {
          return;
        }

        event.state = {
          prev: { publishedAt: entry.publishedAt },
        };

        if (isConcerned) {
          const isBeingPublished = data.publishedAt && !entry.publishedAt;
          if (
            isBeingPublished &&
            data.publicationDate == null &&
            entry.publicationDate == null
          ) {
            data.publicationDate = new Date();
          }
        }
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
        const { result, model } = event;
        const uid = model?.uid;
        if (!isApiContentType(uid)) {
          return;
        }

        if (result.publishedAt) {
          const isConcerned =
            uid === "api::article.article" || uid === "api::video.video";
          if (isConcerned && result.publicationDate == null) {
            await strapi.entityService.update(uid, result.id, {
              data: {
                publicationDate: new Date(),
              },
            });
          }
          await triggerGithubPublish();
        }
      },
    });
  },
};
