module.exports = ({ env }) => ({
  defaultConnection: "default",
  connections: {
    default: {
      connector: "mongoose",
      settings: {
        client: "mongo",
        uri: env("localhost"),
      },
      options: {
        useNullAsDefault: true,
      },
    },
  },
});
