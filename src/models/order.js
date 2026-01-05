module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true // kayıtsız müşteri ile sipariş için
    },
    guestFirstName: {
      type: DataTypes.STRING,
      allowNull: true // kayıtsız müşteri adı
    },
    guestLastName: {
      type: DataTypes.STRING,
      allowNull: true // kayıtsız müşteri soyadı
    },
    guestPhone: {
      type: DataTypes.STRING,
      allowNull: true // kayıtsız müşteri telefon
    },
    guestEmail: {
      type: DataTypes.STRING,
      allowNull: true // kayıtsız müşteri email
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'orders',
    underscored: true
  });

  return Order;
};
