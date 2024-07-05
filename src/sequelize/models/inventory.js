'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class inventory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  inventory.init(
    {
      productId: DataTypes.INTEGER,
      branchId: DataTypes.INTEGER,
      qty: DataTypes.INTEGER,
      minQty: DataTypes.INTEGER,
      cost: DataTypes.DOUBLE,
      tireCondition: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      retail: DataTypes.DOUBLE,
      markup: DataTypes.DOUBLE,
      vendor: DataTypes.STRING,
      binLocation: DataTypes.STRING,
      warranty: DataTypes.STRING,
      isFavourite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deletedAt: DataTypes.DATE,
      deletedBy: DataTypes.INTEGER,
      show: DataTypes.BOOLEAN,
      notes: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'inventory',
    },
  );
  inventory.associate = function (models) {
    inventory.belongsTo(models.product, {
      as: 'product',
      foreignKey: 'productId',
    });
    inventory.belongsTo(models.branch, {
      as: 'branch',
      foreignKey: 'branchId',
    });
    inventory.belongsTo(models.users, {
      as: 'user',
      foreignKey: 'deletedBy',
    });
  };
  return inventory;
};
