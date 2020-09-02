module.exports = {
  settings: {
    settings: {
      cors: {
        enabled: true,
        origin: "*",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        headers: ["Origin", "Content-Type", "Authorization"],
      },
    },
  },
};
