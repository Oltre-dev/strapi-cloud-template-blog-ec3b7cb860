const token = process.env.GITHUB_WEBHOOK_TOKEN; // PAT GitHub
const apiUrl = `https://api.github.com/repos/Oltre-dev/oltre-news-front/dispatches`;

module.exports = async (eventType, payload = {}) => {
  await fetch(apiUrl, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      // GitHub demande un User-Agent explicite
      "User-Agent": "strapi5-webhook",
    },
    body: JSON.stringify({ event_type: eventType, client_payload: payload }),
  }).then((r) => {
    if (!r.ok) {
      strapi.log.error(`GitHub dispatch failed: ${r.status} ${r.statusText}`);
    }
  });
};
