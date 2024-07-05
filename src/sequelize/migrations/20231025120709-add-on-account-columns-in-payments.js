'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('payments', 'onAccount', {
      type: Sequelize.DOUBLE,
    });
    
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('payments', 'onAccount', {
      type: Sequelize.DOUBLE,
    });
  },
};
