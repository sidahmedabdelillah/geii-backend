"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */
const axios = require("axios");

module.exports = {
  lifecycles: {
    async afterCreate(result, data) {
      console.log("here");
      const url = `www.geii.me/news/${result.id}`;
      const message = `📍 Checkout our LATEST article titled ${result.Title} 💻🖥📍`;
      await axios.post(
        " https://maker.ifttt.com/trigger/newPost/with/key/cnGSkCVRh7gApBwwJo5-PE ",
        { value1: url, value2: message }
      );
      await axios.post(
        " https://maker.ifttt.com/trigger/mail/with/key/cnGSkCVRh7gApBwwJo5-PE ",
        { value2: url, value1: message }
      );
    },
  },
};
