"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Contacts", "phone", {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
    await queryInterface.changeColumn("Contacts", "name", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Contacts", "phone", {
      allowNull: true,
      type: Sequelize.BIGINT,
    });
    await queryInterface.changeColumn("Contacts", "name", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
