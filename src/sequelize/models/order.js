'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  order.init(
    {
      companyId: DataTypes.INTEGER,
      branchId: DataTypes.INTEGER,
      customerId: DataTypes.INTEGER,
      vehicleId: DataTypes.INTEGER,
      type: DataTypes.INTEGER, // 1 for quote || 2 for W/O || 3 for Invoice,
      totalItems: { type: DataTypes.DOUBLE, defaultValue: 0 },
      totalProducts: { type: DataTypes.DOUBLE, defaultValue: 0 },
      totalLabors: { type: DataTypes.DOUBLE, defaultValue: 0 },
      productsTotal: { type: DataTypes.DOUBLE, defaultValue: 0 },
      laborTotal: { type: DataTypes.DOUBLE, defaultValue: 0 },
      itemsTotal: { type: DataTypes.DOUBLE, defaultValue: 0 },
      totalFee: { type: DataTypes.DOUBLE, defaultValue: 0 },
      totalDiscount: { type: DataTypes.DOUBLE, defaultValue: 0 },
      totalTax: { type: DataTypes.DOUBLE, defaultValue: 0 },
      totalPayAble: { type: DataTypes.DOUBLE, defaultValue: 0 },
      totalProfit: { type: DataTypes.DOUBLE, defaultValue: 0 },
      openAmount: { type: DataTypes.DOUBLE, defaultValue: 0 },
      customCheckboxes: { type: DataTypes.JSON },
      isDraft: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'order',
    },
  );
  order.associate = function (models) {
    order.belongsTo(models.company, {
      as: 'company',
      foreignKey: 'companyId',
    });
    order.belongsTo(models.branch, {
      as: 'branch',
      foreignKey: 'branchId',
    });
    order.belongsTo(models.customer, {
      as: 'customer',
      foreignKey: 'customerId',
    });
    order.belongsTo(models.vehicle, {
      as: 'vehicle',
      foreignKey: 'vehicleId',
    });
    order.hasMany(models.order_item, {
      as: 'orderItems',
      foreignKey: 'orderId',
    });
    order.hasMany(models.payment, {
      as: 'orderPayments',
      foreignKey: 'orderId',
    });
    order.hasOne(models.invoice, {
      as: 'invoice',
      foreignKey: 'orderId',
    });
    order.hasOne(models.work_order_deposit, {
      as: 'deposit',
      foreignKey: 'workOrderId',
    });
  };
  return order;
};
