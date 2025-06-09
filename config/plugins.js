module.exports = () => ({
  documentation: {
    enabled: true,
    config: {
      openapi: "3.0.0",
      info: {
        version: "1.0.0",
        title: "Oltre STRAPI API",
        description: "",
        contact: {
          name: "Oltre",
          email: "jjy.quem@gmail.com",
          url: "olter.dev",
        },
        license: {
          name: "UNLICENSED",
        },
      },
      "x-strapi-config": {
        // Leave empty to ignore plugins during generation
        plugins: ["upload", "users-permissions"],
        path: "/documentation",
      },
      servers: [
        { url: "http://localhost:1337/api", description: "Development server" },
        {
          url: "https://shining-broccoli-866f330b9c.strapiapp.com/api",
          description: "Production server",
        },
      ],
      security: [{ bearerAuth: [] }],
    },
  },
});
