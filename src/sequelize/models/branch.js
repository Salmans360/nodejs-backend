'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class branch extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  branch.init(
    {
      companyId: {
        type: DataTypes.INTEGER,
        defaultValue: null,
        allowNull: true,
      },
      isParent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'branch',
    },
  );
  branch.associate = function (models) {
    branch.belongsTo(models.company, {
      foreignKey: 'companyId',
    });
    branch.hasMany(models.users, {
      as: 'users',
      foreignKey: 'branchId',
    });
    branch.hasMany(models.customer, {
      as: 'customers',
      foreignKey: 'branchId',
    });
    branch.hasMany(models.vehicle, {
      as: 'vehicles',
      foreignKey: 'branchId',
    });
    branch.hasMany(models.category, {
      as: 'categories',
      foreignKey: 'branchId',
    });
    branch.hasMany(models.sub_category, {
      as: 'subCategories',
      foreignKey: 'branchId',
    });
    branch.hasMany(models.inventory, {
      as: 'inventory',
      foreignKey: 'branchId',
    });
    branch.hasMany(models.labor, {
      as: 'labors',
      foreignKey: 'branchId',
    });
    branch.hasMany(models.order, {
      as: 'orders',
      foreignKey: 'branchId',
    });
    branch.hasMany(models.fee, {
      as: 'fees',
      foreignKey: 'branchId',
    });
    branch.hasMany(models.invoice, {
      as: 'invoice',
      foreignKey: 'branchId',
    });
    branch.hasMany(models.payment_method, {
      as: 'paymentMethod',
      foreignKey: 'branchId',
    });
    branch.hasOne(models.subscribed_plan, {
      as: 'subscribedPlan',
      foreignKey: 'branchId',
    });
    branch.hasOne(models.terms_condition, {
      as: 'termsCondition',
      foreignKey: 'branchId',
    });
  };
  return branch;
};
