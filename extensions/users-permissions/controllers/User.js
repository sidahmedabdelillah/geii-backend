"use strict";

/**
 * User.js controller
 *
 * @description: A set of functions called "actions" for managing `User`.
 */

const _ = require("lodash");
const { sanitizeEntity } = require("strapi-utils");

const sanitizeUser = (user) =>
  sanitizeEntity(user, {
    model: strapi.query("user", "users-permissions").model,
  });

const formatError = (error) => [
  { messages: [{ id: error.id, message: error.message, field: error.field }] },
];

module.exports = {
  /**
   * Retrieve user records.
   * @return {Object|Array}
   */

  async findTeacher(ctx, next, { populate } = {}) {
    let users;
    if (_.has(ctx.query, "_q")) {
      // use core strapi query to search for users
      users = await strapi.query("user", "users-permissions").search(ctx.query);
      console.log("searvhing");
    } else {
      users = await strapi.plugins["users-permissions"].services.user.fetchAll(
        ctx.query,
        [
          {
            path: "prof_info",
            populate: {
              path: "Enseignement",
            },
          },
          {
            path: "prof_info",
            populate: {
              path: "encadrements",
            },
          },
          {
            path: "prof_info",
            populate: {
              path: "projet_recherches",
            },
          },
          {
            path: "prof_info",
            populate: {
              path: "communications",
            },
          },
          {
            path: "prof_info",
            populate: {
              path: "publications",
            },
          },
        ]
      );
    }

    const data = users.map(sanitizeUser);
    ctx.send(data);
  },

  async findOneTeacher(ctx) {
    const { id } = ctx.params;
    let data = await strapi.plugins["users-permissions"].services.user.fetch(
      {
        id,
      },
      [
        {
          path: "prof_info",
          populate: {
            path: "Enseignement",
          },
        },
        {
          path: "prof_info",
          populate: {
            path: "encadrements",
          },
        },
        {
          path: "prof_info",
          populate: {
            path: "projet_recherches",
          },
        },
        {
          path: "prof_info",
          populate: {
            path: "communications",
          },
        },
        {
          path: "prof_info",
          populate: {
            path: "publications",
          },
        },
      ]
    );

    if (data) {
      data = sanitizeUser(data);
    }

    // Send 200 `ok`
    ctx.send(data);
  },
};
