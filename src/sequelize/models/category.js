'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  category.init(
    {
      name: DataTypes.STRING,
      isGlobal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      branchId: DataTypes.INTEGER,
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'category',
    },
  );
  category.associate = function (models) {
    category.hasMany(models.sub_category, {
      as: 'subCategory',
      foreignKey: 'categoryId',
    });
    category.hasMany(models.product, {
      as: 'products',
      foreignKey: 'categoryId',
    });
    category.hasMany(models.labor, {
      as: 'labors',
      foreignKey: 'categoryId',
    });
    category.belongsTo(models.branch, {
      as: 'branch',
      foreignKey: 'branchId',
    });
  };
  return category;
};
