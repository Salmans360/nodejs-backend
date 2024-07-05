'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('customers', 'availableCredit', {
      type: Sequelize.DOUBLE,
    });
    
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('customers', 'availableCredit', {
      type: Sequelize.DOUBLE,
    });
    
  },
};
