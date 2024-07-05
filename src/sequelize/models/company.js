'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  company.init(
    {
      ownerName: DataTypes.STRING,
      businessName: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.TEXT,
      },
      ard: {
        type: DataTypes.STRING,
      },
      businessEmail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      businessPhone: {
        type: DataTypes.STRING,
      },
      currency: DataTypes.STRING,
      timeZone: DataTypes.STRING,
      businessLogo: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'company',
    },
  );
  company.associate = function (models) {
    company.hasMany(models.users, {
      as: 'users',
      foreignKey: 'companyId',
    });
    company.hasMany(models.branch, {
      as: 'branches',
      foreignKey: 'companyId',
    });
    company.hasMany(models.product, {
      as: 'products',
      foreignKey: 'companyId',
    });
    company.hasMany(models.labor, {
      as: 'labors',
      foreignKey: 'companyId',
    });
    company.hasMany(models.order, {
      as: 'orders',
      foreignKey: 'companyId',
    });
    company.hasMany(models.invoice, {
      as: 'invoice',
      foreignKey: 'companyId',
    });
    company.hasMany(models.payment_method, {
      as: 'paymentMethod',
      foreignKey: 'companyId',
    });
    company.hasOne(models.subscribed_plan, {
      as: 'subscribedPlan',
      foreignKey: 'companyId',
    });
    company.hasOne(models.terms_condition, {
      as: 'termsCondition',
      foreignKey: 'companyId',
    });
  };
  return company;
};
