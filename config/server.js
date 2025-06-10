module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  app: {
    keys: env.array("APP_KEYS"),
  },
  webhooks: {
    populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", false),
    defaultHeaders: {
      Authorization: `Bearer ${env("GITHUB_WEBHOOK_TOKEN")}`,
      "Content-Type": "application/json",
      "User-Agent": "Strapi-Blog-Webhook/1.0",
    },
  },
});
