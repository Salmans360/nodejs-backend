'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  invoice.init(
    {
      branchId: DataTypes.INTEGER,
      companyId: DataTypes.INTEGER,
      orderId: DataTypes.INTEGER,
      paymentMethod: DataTypes.STRING,
      paidAmount: DataTypes.DOUBLE,
      totalAmount: DataTypes.DOUBLE,
      salesRep: DataTypes.STRING,
      notes: DataTypes.TEXT,
      reference: DataTypes.STRING,
      qbSynced: DataTypes.BOOLEAN,
      qbResponse: DataTypes.JSON,
      discount: DataTypes.DOUBLE,
    },
    {
      sequelize,
      modelName: 'invoice',
    },
  );
  invoice.associate = function (models) {
    invoice.belongsTo(models.branch, {
      foreignKey: 'branchId',
    });
    invoice.belongsTo(models.company, {
      foreignKey: 'companyId',
    });
    invoice.belongsTo(models.order, {
      foreignKey: 'orderId',
    });
    invoice.hasMany(models.payment, {
      as: 'invoicePayments',
      foreignKey: 'invoiceId',
    });
  };
  return invoice;
};
