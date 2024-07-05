'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class sub_category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  sub_category.init(
    {
      categoryId: {
        type: DataTypes.INTEGER,
      },
      branchId: DataTypes.INTEGER,
      name: {
        type: DataTypes.STRING,
      },
      isGlobal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'sub_category',
    },
  );
  sub_category.associate = function (models) {
    sub_category.belongsTo(models.category, {
      foreignKey: 'categoryId',
    });
    sub_category.belongsTo(models.branch, {
      as: 'branch',
      foreignKey: 'branchId',
    });
    sub_category.hasMany(models.product, {
      as: 'products',
      foreignKey: 'subCategoryId',
    });
  };
  return sub_category;
};
