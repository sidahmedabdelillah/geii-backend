"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  /**
   * Retrieve records.
   *
   * @return {Array}
   */

  async find1(ctx) {
    const entity = await strapi.services["abou-page"].find();
    return sanitizeEntity(entity, { model: strapi.models["abou-page"] });
  },
};
