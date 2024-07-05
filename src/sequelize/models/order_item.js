'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class order_item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  order_item.init(
    {
      type: DataTypes.STRING,
      // foreign id for product or labor
      modelId: DataTypes.INTEGER,
      orderId: DataTypes.INTEGER,
      brand: DataTypes.STRING,
      description: DataTypes.STRING,
      measurement: DataTypes.STRING,
      qty: DataTypes.INTEGER,
      duration: DataTypes.DOUBLE,
      price: DataTypes.DOUBLE,
      discount: DataTypes.DOUBLE,
      discountType: DataTypes.STRING,
      notes: DataTypes.TEXT,
      fet: DataTypes.DOUBLE,
      calculatedDiscount: DataTypes.DOUBLE,
      calculatedTax: DataTypes.DOUBLE,
      cost: DataTypes.DOUBLE,
      tax: DataTypes.DOUBLE,
      total: DataTypes.DOUBLE,
      taxId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'order_item',
    },
  );
  order_item.associate = function (models) {
    order_item.belongsTo(models.product, {
      as: 'products',
      foreignKey: 'modelId',
      constraints: false,
      scope: {
        type: 'product',
      },
    });
    order_item.belongsTo(models.tax_class, {
      as: 'taxClass',
      foreignKey: 'taxId',
    });
    order_item.belongsTo(models.labor, {
      as: 'labors',
      foreignKey: 'modelId',
      constraints: false,
      scope: {
        type: 'labor',
      },
    });
    order_item.belongsTo(models.order, {
      as: 'order',
      foreignKey: 'orderId',
    });

    order_item.hasMany(models.order_item_fee, {
      as: 'orderItemFee',
      foreignKey: 'orderItemId',
    });
  };
  return order_item;
};
