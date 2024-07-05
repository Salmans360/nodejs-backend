'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  users.init(
    {
      firstName: DataTypes.STRING,
      lastName: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profileImg: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      companyId: {
        type: DataTypes.INTEGER,
        defaultValue: null,
        allowNull: true,
      },
      branchId: {
        type: DataTypes.INTEGER,
        defaultValue: null,
        allowNull: true,
      },
      passwordResetLink: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
      },
      employeeTitle: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
      },
      qbAccessToken: {
        allowNull: true,
        defaultValue: null,
        type: DataTypes.TEXT,
      },
      address: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'users',
      // underscored:true
    },
  );
  users.associate = function (models) {
    users.belongsTo(models.company, {
      as: 'company',
      foreignKey: 'companyId',
    });
    users.belongsTo(models.branch, {
      foreignKey: 'branchId',
    });
    users.hasMany(models.payment_method, {
      foreignKey: 'userId',
    });
    users.hasMany(models.inventory, {
      foreignKey: 'deletedBy',
    });
    users.hasOne(models.subscribed_plan, {
      foreignKey: 'userId',
    });
  };
  return users;
};
