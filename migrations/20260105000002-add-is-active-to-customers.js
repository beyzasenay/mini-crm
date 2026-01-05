'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('customers', 'is_active', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('customers', 'is_active');
  }
};
