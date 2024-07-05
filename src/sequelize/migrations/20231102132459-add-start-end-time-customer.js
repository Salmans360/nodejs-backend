'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('customers', 'startTime', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn('customers', 'endTime', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn('customers', 'revertToCash', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('customers', 'startTime', {
      type: Sequelize.STRING,
    });
    await queryInterface.removeColumn('customers', 'endTime', {
      type: Sequelize.STRING,
    });
    await queryInterface.removeColumn('customers', 'revertToCash', {
      type: Sequelize.BOOLEAN,
    });
  },
};
