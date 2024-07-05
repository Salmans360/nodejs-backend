const asyncHandler = require('express-async-handler');
const { feeService } = require('../services');
const { getResponse } = require('../helpers/response');
const branch = require('../sequelize/models/branch');

// ===================================ADD FEE=================================
const addFee = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '' },
      body,
    } = req;
    const fee = await feeService.saveFee(body, branchId);
    if (fee) {
      return getResponse(res, 1, 'Fee Added Successfully', 200, fee, {});
    } else {
      return getResponse(res, 0, 'Unable to add fee', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================UPDATE FEE=================================
const updateFee = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '' },
      body,
    } = req;
    const fee = await feeService.getAll(body);
    if (fee) {
      return getResponse(res, 1, 'Fees updated Successfully', 200, fee, {});
    } else {
      return getResponse(res, 0, 'Unable to update fees', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================GET ALL FEES=================================
const getFee = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '' },
      params: { categoryId = '' },
      body,
    } = req;
    const fee = await feeService.getAll(branchId, categoryId);
    if (fee) {
      const globalFees = [];
      const customFees = [];
      for (let i = 0; i < fee.length; i++) {
        if (fee[i].isCustomized) {
          customFees.push(fee[i]);
        } else {
          globalFees.push(fee[i]);
        }
      }
      return getResponse(
        res,
        1,
        'Fee fetched Successfully',
        200,
        { globalFees, customFees },
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to fetch fee', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================DELETE FEES==================================
const deleteFee = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId },
      params: { id },
    } = req;

    const result = await feeService.deleteFee(id);
    if (result) {
      return getResponse(
        res,
        1,
        'Fee deleted Successfully',
        200,
        { id: result },
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to delete fee', 400, {}, {});
    }
  } catch (err) {
    return getResponse(res, 0, err?.message, 400, {}, {});
  }
});
module.exports = {
  addFee,
  updateFee,
  getFee,
  deleteFee,
};
