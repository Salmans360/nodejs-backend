const Sequelize = require('sequelize');
const { fee: Fee } = require('../sequelize/models');

const saveGlobalFees = async (branchId) => {
  try {
    const feeData = [
      {
        branchId: branchId,
        categoryId: 1,
        name: 'New Tire Fee',
        amount: 1.75,
        total: 1.75,
        isCustomized: false,
      },
      {
        branchId: branchId,
        categoryId: 1,
        name: 'Tire Disposal Fee',
        amount: 3,
        total: 3,
        isCustomized: false,
      },
    ];
    await Fee.bulkCreate(feeData);

    return true;
  } catch (err) {
    return false;
  }
};
module.exports = { saveGlobalFees };
