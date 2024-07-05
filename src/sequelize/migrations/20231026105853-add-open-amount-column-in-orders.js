'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'openAmount', {
      type: Sequelize.DOUBLE,
    });
    
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'openAmount', {
      type: Sequelize.DOUBLE,
    });
  },
};
