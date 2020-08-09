const crypto = require("crypto");
const _ = require("lodash");
const grant = require("grant-koa");
const { sanitizeEntity } = require("strapi-utils");
const { array } = require("prop-types");

const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const formatError = (error) => [
  { messages: [{ id: error.id, message: error.message, field: error.field }] },
];
module.exports = {
  async registerTeacher(ctx) {
    const pluginStore = await strapi.store({
      environment: "",
      type: "plugin",
      name: "users-permissions",
    });

    const settings = await pluginStore.get({
      key: "advanced",
    });

    if (!settings.allow_register) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.advanced.allow_register",
          message: "Register action is currently disabled.",
        })
      );
    }

    const params = {
      ..._.pick(ctx.request.body, [
        "username",
        "email",
        "password",
        "role",
        "info",
      ]),
      provider: "local",
    };

    // Password is required.
    if (!params.password) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.password.provide",
          message: "Please provide your password.",
        })
      );
    }

    // Email is required.
    if (!params.email) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.email.provide",
          message: "Please provide your email.",
        })
      );
    }
    // Check if the provided email is valid or not.
    const isEmail = emailRegExp.test(params.email);

    if (isEmail) {
      params.email = params.email.toLowerCase();
    } else {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.email.format",
          message: "Please provide valid email address.",
        })
      );
    }
    // Throw an error if the password selected by the user
    // contains more than two times the symbol '$'.
    if (
      strapi.plugins["users-permissions"].services.user.isHashed(
        params.password
      )
    ) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.password.format",
          message:
            "Your password cannot contain more than three times the symbol `$`.",
        })
      );
    }

    const role = await strapi
      .query("role", "users-permissions")
      .findOne({ type: params.role }, []);

    // create projets
    let promise_projet = [];
    let array_projet = [];
    if (params.info.projet) {
      params.info.projet.forEach((item, index) => {
        const recherche = strapi.query("projet-recherch").create({
          Tittre: item.Tittre,
          Mot_cle: item.Mot_cle,
          Anne: item.Anne,
          url: item.url,
        });
        promise_projet.push(recherche);
      });
      const result_projet = await Promise.all(promise_projet);
      result_projet.forEach((item, index) => {
        array_projet.push(item.id);
      });
    }

    // create encadrement
    let Promise_encadrement = [];
    let array_encadrement = [];

    if (params.info.Encadrement) {
      params.info.Encadrement.forEach((item, index) => {
        const Encadrement = strapi.query("encadrement").create({
          Titre: item.Titre,
          Condidat: item.Condidat,
          Anne: item.Anne,
          Type: item.Type,
          Specialite: item.Specialite,
        });
        Promise_encadrement.push(Encadrement);
      });
      const result_encadrement = await Promise.all(Promise_encadrement);
      console.log(result_encadrement);
      result_encadrement.forEach((item, index) => {
        array_encadrement.push(item.id);
      });
    }

    // create Enseignment

    let array_Enseignment = [];
    let Promise_enseignement = [];

    if (params.info.Enseignement) {
      params.info.Enseignement.forEach((item, index) => {
        const Enseignment = strapi.query("enseignement").create({
          Anne: item.Anne,
          Enseignement: item.Enseignement,
          Autre: item.Autre,
          Specialite: item.Specialite,
        });
        Promise_enseignement.push(Enseignment);
      });
      const result_enseignement = await Promise.all(Promise_enseignement);
      result_enseignement.forEach((item, index) => {
        array_Enseignment.push(item.id);
      });
    }

    // create communication
    let array_communication = [];
    let Promise_communication = [];

    if (params.info.communication) {
      params.info.communication.forEach((item, index) => {
        const communication = strapi.query("communications").create({
          Text: item.Text,
        });
        Promise_communication.push(communication);
      });
      const result_communication = await Promise.all(Promise_communication);
      result_communication.forEach((item, index) => {
        array_communication.push(item.id);
      });
    }

    // creat publication
    let array_publication = [];
    let Promise_publication = [];
    if (params.info.publications) {
      params.info.publications.forEach((item, index) => {
        const publications = strapi.query("publications").create({
          Text: item.Text,
        });
        Promise_publication.push(publications);
      });
      const result_publication = await Promise.all(Promise_publication);
      result_publication.forEach((item, index) => {
        array_publication.push(item.id);
      });
    }

    // create user info

    const info = await strapi.query("Prof-info").create({
      Full_name: params.info.Full_name,
      Activite_pedagogique: params.info.pedagogique,
      Experience: params.info.Experience,
      Livre: params.info.Livre,
      Grade: params.info.Grade,
      Fonction_actuel: params.info.Grade,
      Specialite: params.info.Specialite,
      Profile_g: params.info.Profile_g,
      Profile_linked: params.info.Profile_linked,
      Profile_id: params.info.Profile_id,
      Conference: params.info.Conference,
      encadrements: array_encadrement,
      projet_recherches: array_projet,
      Enseignement: array_Enseignment,
      encadrement: array_encadrement,
      publications: array_publication,
      communications: array_communication,
    });

    params.password = await strapi.plugins[
      "users-permissions"
    ].services.user.hashPassword(params);
    params.confirmed = true;
    /////////// if user exist

    const user = await strapi.query("user", "users-permissions").findOne({
      email: params.email,
    });

    if (user && user.provider === params.provider) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.email.taken",
          message: "Email is already taken.",
        })
      );
    }
    if (user && user.provider !== params.provider && settings.unique_email) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.email.taken",
          message: "Email is already taken.",
        })
      );
    }

    try {
      if (!settings.email_confirmation) {
        params.confirmed = true;
      } else {
        params.confirmed = false;
      }
      const newuser = {
        username: params.username,
        password: params.password,
        email: params.email,
        prof_info: info.id,
        confirmed: params.confirmed,
      };
      const user = await strapi
        .query("user", "users-permissions")
        .create(newuser);
      const jwt = strapi.plugins["users-permissions"].services.jwt.issue(
        _.pick(user.toJSON ? user.toJSON() : user, ["id"])
      );
      if (settings.email_confirmation) {
        const settings = await pluginStore
          .get({ key: "email" })
          .then((storeEmail) => {
            try {
              return storeEmail["email_confirmation"].options;
            } catch (error) {
              return {};
            }
          });

        settings.message = await strapi.plugins[
          "users-permissions"
        ].services.userspermissions.template(settings.message, {
          URL: new URL(
            "/auth/email-confirmation",
            strapi.config.url
          ).toString(),
          USER: _.omit(user.toJSON ? user.toJSON() : user, [
            "password",
            "resetPasswordToken",
            "role",
            "provider",
          ]),
          CODE: jwt,
        });

        settings.object = await strapi.plugins[
          "users-permissions"
        ].services.userspermissions.template(settings.object, {
          USER: _.omit(user.toJSON ? user.toJSON() : user, [
            "password",
            "resetPasswordToken",
            "role",
            "provider",
          ]),
        });

        try {
          // Send an email to the user.
          await strapi.plugins["email"].services.email.send({
            to: (user.toJSON ? user.toJSON() : user).email,
            from:
              settings.from.email && settings.from.name
                ? `${settings.from.name} <${settings.from.email}>`
                : undefined,
            replyTo: settings.response_email,
            subject: settings.object,
            text: settings.message,
            html: settings.message,
          });
        } catch (err) {
          return ctx.badRequest(null, err);
        }
      }
      ctx.send({
        jwt,
        user: sanitizeEntity(user.toJSON ? user.toJSON() : user, {
          model: strapi.query("user", "users-permissions").model,
        }),
      });
    } catch (err) {
      const adminError = _.includes(err.message, "username")
        ? {
            id: "Auth.form.error.username.taken",
            message: "Username already taken",
          }
        : { id: "Auth.form.error.email.taken", message: "Email already taken" };

      ctx.badRequest(null, formatError(adminError));
    }
  },

  async registerStudent(ctx) {
    const pluginStore = await strapi.store({
      environment: "",
      type: "plugin",
      name: "users-permissions",
    });

    const settings = await pluginStore.get({
      key: "advanced",
    });

    if (!settings.allow_register) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.advanced.allow_register",
          message: "Register action is currently disabled.",
        })
      );
    }

    const params = {
      ..._.omit(ctx.request.body, ["confirmed", "resetPasswordToken"]),
      provider: "local",
    };
    // Password is required.
    if (!params.password) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.password.provide",
          message: "Please provide your password.",
        })
      );
    }

    // Email is required.
    if (!params.email) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.email.provide",
          message: "Please provide your email.",
        })
      );
    }

    // Throw an error if the password selected by the user
    // contains more than two times the symbol '$'.
    if (
      strapi.plugins["users-permissions"].services.user.isHashed(
        params.password
      )
    ) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.password.format",
          message:
            "Your password cannot contain more than three times the symbol `$`.",
        })
      );
    }

    const role = await strapi
      .query("role", "users-permissions")
      .findOne({ type: settings.default_role }, []);

    if (!role) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.role.notFound",
          message: "Impossible to find the default role.",
        })
      );
    }

    // Check if the provided email is valid or not.
    const isEmail = emailRegExp.test(params.email);

    if (isEmail) {
      params.email = params.email.toLowerCase();
    } else {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.email.format",
          message: "Please provide valid email address.",
        })
      );
    }

    params.role = role.id;
    params.password = await strapi.plugins[
      "users-permissions"
    ].services.user.hashPassword(params);

    const user = await strapi.query("user", "users-permissions").findOne({
      email: params.email,
    });

    if (user && user.provider === params.provider) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.email.taken",
          message: "Email is already taken.",
        })
      );
    }

    if (user && user.provider !== params.provider && settings.unique_email) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.email.taken",
          message: "Email is already taken.",
        })
      );
    }

    const info = await strapi.query("student-info").create({
      Full_name: params.info.Full_name,
      Year: params.info.Year,
      Specialite: params.info.specialite,
    });
    try {
      if (!settings.email_confirmation) {
        params.confirmed = true;
      }
      const user = await strapi.query("user", "users-permissions").create({
        username: params.username,
        password: params.password,
        email: params.email,
        role: params.role,
        provider: params.provider,
        student_info: info.id,
        confirmed: params.confirmed,
      });
      console.log(user);

      const jwt = strapi.plugins["users-permissions"].services.jwt.issue(
        _.pick(user.toJSON ? user.toJSON() : user, ["id"])
      );

      if (settings.email_confirmation) {
        const settings = await pluginStore
          .get({ key: "email" })
          .then((storeEmail) => {
            try {
              return storeEmail["email_confirmation"].options;
            } catch (error) {
              return {};
            }
          });

        settings.message = await strapi.plugins[
          "users-permissions"
        ].services.userspermissions.template(settings.message, {
          URL: `${strapi.config.server.url}/auth/email-confirmation`,
          USER: _.omit(user.toJSON ? user.toJSON() : user, [
            "password",
            "resetPasswordToken",
            "role",
            "provider",
          ]),
          CODE: jwt,
        });

        settings.object = await strapi.plugins[
          "users-permissions"
        ].services.userspermissions.template(settings.object, {
          USER: _.omit(user.toJSON ? user.toJSON() : user, [
            "password",
            "resetPasswordToken",
            "role",
            "provider",
          ]),
        });

        try {
          // Send an email to the user.
          await strapi.plugins["email"].services.email.send({
            to: (user.toJSON ? user.toJSON() : user).email,
            from:
              settings.from.email && settings.from.name
                ? `${settings.from.name} <${settings.from.email}>`
                : undefined,
            replyTo: settings.response_email,
            subject: settings.object,
            text: settings.message,
            html: settings.message,
          });
        } catch (err) {
          return ctx.badRequest(null, err);
        }
      }

      const sanitizedUser = sanitizeEntity(user.toJSON ? user.toJSON() : user, {
        model: strapi.query("user", "users-permissions").model,
      });
      if (settings.email_confirmation) {
        ctx.send({
          user: sanitizedUser,
        });
      } else {
        ctx.send({
          jwt,
          user: sanitizedUser,
        });
      }
    } catch (err) {
      const adminError = _.includes(err.message, "username")
        ? {
            id: "Auth.form.error.username.taken",
            message: err,
          }
        : { id: "Auth.form.error.email.taken", message: "Email already taken" };

      ctx.badRequest(null, formatError(adminError));
    }
  },
};
