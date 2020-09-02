module.exports = ({ env }) => ({
  defaultConnection: "default",
  connections: {
    default: {
      connector: "mongoose",
      settings: {
        client: "mongo",
        uri: `mongodb://${env("DB_USER")}:${env("DB_PWD")}@${env(
          "DB_HOST"
        )}:27017/${env("DB_NAME")}?authSource=admin`,
      },
      options: {
        useNullAsDefault: true,
      },
    },
  },
});
