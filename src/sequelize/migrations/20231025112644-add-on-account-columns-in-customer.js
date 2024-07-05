'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('customers', 'paymentTermId', {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn('customers', 'paymentTermDays', {
      type: Sequelize.DOUBLE,
    });
    await queryInterface.addColumn('customers', 'balance', {
      type: Sequelize.DOUBLE,
    });
    await queryInterface.addColumn('customers', 'credit', {
      type: Sequelize.DOUBLE,
    });
    await queryInterface.addColumn('customers', 'used', {
      type: Sequelize.DOUBLE,
    });
    await queryInterface.addColumn('customers', 'paid', {
      type: Sequelize.DOUBLE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('customers', 'paymentTermId', {
      type: Sequelize.INTEGER,
    });
    await queryInterface.removeColumn('customers', 'paymentTermDays', {
      type: Sequelize.DOUBLE,
    });
    await queryInterface.removeColumn('customers', 'balance', {
      type: Sequelize.DOUBLE,
    });
    await queryInterface.removeColumn('customers', 'credit', {
      type: Sequelize.DOUBLE,
    });
    await queryInterface.removeColumn('customers', 'used', {
      type: Sequelize.DOUBLE,
    });
    await queryInterface.removeColumn('customers', 'paid', {
      type: Sequelize.DOUBLE,
    });
  },
};
