'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class invoice_queue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  invoice_queue.init(
    {
        userId:  DataTypes.INTEGER,
        branchId: DataTypes.INTEGER,
        companyId: DataTypes.INTEGER,
        invoiceData:  DataTypes.JSON,
        invoiceId: DataTypes.INTEGER,
        weightage: DataTypes.INTEGER,
        taxId: DataTypes.INTEGER,
        authToken: DataTypes.JSON,
        refreshToken: DataTypes.STRING,
        sandboxCompanyId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'invoice_queue',
    },
  );
  invoice_queue.associate = function (models) {
    invoice_queue.belongsTo(models.company, {
        as:'company',
        foreignKey: 'companyId',
    });
    invoice_queue.belongsTo(models.branch, {
      as: 'branch',
      foreignKey: 'branchId',
    });
    invoice_queue.belongsTo(models.users, {
      as: 'user',
      foreignKey: 'userId',
    });
    invoice_queue.belongsTo(models.invoice, {
        as: 'invoice',
        foreignKey: 'invoiceId',
      });
  };
  return invoice_queue;
};