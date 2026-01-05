'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Ensure existing NULL statuses become 'pending'
      await queryInterface.sequelize.query("UPDATE orders SET status = 'pending' WHERE status IS NULL;", { transaction });

      // Change status column to ENUM with default 'pending' and NOT NULL
      if (queryInterface.sequelize.getDialect() === 'postgres') {
        // create enum type if not exists
        await queryInterface.sequelize.query(
          `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_orders_status') THEN CREATE TYPE "enum_orders_status" AS ENUM ('pending','processing','shipped','cancelled','completed'); END IF; END$$;`,
          { transaction }
        );

        // ensure problematic values are normalized to allowed enum values
        await queryInterface.sequelize.query(
          `UPDATE "orders" SET status = 'pending' WHERE status IS NULL OR status NOT IN ('pending','processing','shipped','cancelled','completed');`,
          { transaction }
        );

        // drop any default, alter type using explicit cast, then set default and not null
        await queryInterface.sequelize.query(`ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;`, { transaction });
        await queryInterface.sequelize.query(
          `ALTER TABLE "orders" ALTER COLUMN "status" TYPE "enum_orders_status" USING (status::text::"enum_orders_status");`,
          { transaction }
        );
        await queryInterface.sequelize.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending';`, { transaction });
        await queryInterface.sequelize.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET NOT NULL;`, { transaction });
      } else {
        await queryInterface.changeColumn(
          'orders',
          'status',
          {
            type: Sequelize.ENUM('pending', 'processing', 'shipped', 'cancelled', 'completed'),
            allowNull: false,
            defaultValue: 'pending'
          },
          { transaction }
        );
      }

      // Add foreign key constraint for customer_id -> customers.id
      await queryInterface.addConstraint('orders', {
        fields: ['customer_id'],
        type: 'foreign key',
        name: 'fk_orders_customer_id',
        references: {
          table: 'customers',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        transaction
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Remove foreign key constraint
      await queryInterface.removeConstraint('orders', 'fk_orders_customer_id', { transaction });

      // Change status back to simple STRING and allow nulls
      await queryInterface.changeColumn(
        'orders',
        'status',
        {
          type: Sequelize.STRING,
          allowNull: true
        },
        { transaction }
      );

      // Drop the ENUM type on Postgres
      if (queryInterface.sequelize.getDialect() === 'postgres') {
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_status";', { transaction });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
