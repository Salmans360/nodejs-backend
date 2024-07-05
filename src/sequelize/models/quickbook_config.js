'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class quickbook_config extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  quickbook_config.init(
    {
      userId: DataTypes.INTEGER,
      branchId: DataTypes.INTEGER,
      companyId: DataTypes.INTEGER,
      partsSuppliesId: DataTypes.INTEGER,
      miscellaneousId: DataTypes.INTEGER,
      laborId: DataTypes.INTEGER,
      fetId: DataTypes.INTEGER,
      feeId: DataTypes.INTEGER,
      laborDiscountId: DataTypes.INTEGER,
      discountId: DataTypes.INTEGER,
      taxId: DataTypes.STRING,
      accessToken: DataTypes.JSON,
      refreshToken: DataTypes.STRING,
      sandboxCompanyId: DataTypes.STRING,
      qbSynced: DataTypes.BOOLEAN,
      qbResponse: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: 'quickbook_config',
    },
  );
  quickbook_config.associate = function (models) {
    quickbook_config.belongsTo(models.company, {
      as: 'company',
      foreignKey: 'companyId',
    });
    quickbook_config.belongsTo(models.branch, {
      as: 'branch',
      foreignKey: 'branchId',
    });
    quickbook_config.belongsTo(models.users, {
      as: 'user',
      foreignKey: 'userId',
    });
  };
  return quickbook_config;
};
