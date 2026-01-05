'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Make customer_id nullable to allow guest orders
      await queryInterface.changeColumn(
        'orders',
        'customer_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        { transaction }
      );

      // Add guest customer information columns
      await queryInterface.addColumn('orders', 'guest_first_name', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('orders', 'guest_last_name', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('orders', 'guest_phone', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('orders', 'guest_email', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      // Add notes column
      await queryInterface.addColumn('orders', 'notes', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      // Add is_active column
      await queryInterface.addColumn('orders', 'is_active', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('orders', 'guest_first_name', { transaction });
      await queryInterface.removeColumn('orders', 'guest_last_name', { transaction });
      await queryInterface.removeColumn('orders', 'guest_phone', { transaction });
      await queryInterface.removeColumn('orders', 'guest_email', { transaction });
      await queryInterface.removeColumn('orders', 'notes', { transaction });
      await queryInterface.removeColumn('orders', 'is_active', { transaction });

      await queryInterface.changeColumn(
        'orders',
        'customer_id',
        {
          type: queryInterface.sequelize.INTEGER,
          allowNull: false
        },
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
