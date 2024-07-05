'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('terms_conditions', 'estimate', {
      type: Sequelize.TEXT,
    });
    await queryInterface.renameColumn(
      'terms_conditions',
      'quote',
      'workorder',
      {
        type: Sequelize.TEXT,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('terms_conditions', 'estimate', {
      type: Sequelize.TEXT,
    });
    await queryInterface.removeColumn('terms_conditions', 'quote', {
      type: Sequelize.TEXT,
    });
  },
};
