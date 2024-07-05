'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('customers', 'overDue', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
    
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('customers', 'overDue', {
      type: Sequelize.BOOLEAN,
    });
    
  },
};
