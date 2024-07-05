const asyncHandler = require('express-async-handler');

const { quickBookService } = require('../services');
const { getResponse } = require('../helpers/response');

require('dotenv').config();

const loginQuickBook = asyncHandler(async (req, res) => {
  try {
    const authUri = await quickBookService.logInQuickBook();
    return getResponse(
      res,
      1,
      'Log In Successfully.',
      200,
      { url: authUri },
      {},
    );
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

const generateAuthToken = asyncHandler(async (req, res) => {
  const {
    body: { url },
    user: { userId, branchId = '', companyId = '' },
  } = req;
  try {
    const configFound = await quickBookService?.findConfiguration(userId); // to avoid double entries

    if (configFound) return;
    const token = await quickBookService.generateAuthToken(
      url,
      userId,
      companyId,
      branchId,
    );
    return getResponse(res, 1, 'Token Generated Successfully.', 200, token, {});
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

const getItems = asyncHandler(async (req, res) => {
  const {
    user: { userId },
  } = req;
  try {
    const data = await quickBookService.getItems(userId);
    return getResponse(res, 1, 'Items Get Successfully.', 200, data, {});
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});
const saveConfig = asyncHandler(async (req, res) => {
  const {
    body: {
      partsSuppliesId,
      laborId,
      taxId,
      feeId,
      fetId,
      discountId,
      laborDiscountId,
    },
    user: { userId },
  } = req;
  try {
    const config = await quickBookService.saveConfig(
      partsSuppliesId,
      laborId,
      taxId,
      feeId,
      fetId,
      discountId,
      laborDiscountId,
      userId,
    );
    return getResponse(res, 1, 'Config Saved Successfully.', 200, config, {});
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});
module.exports = {
  loginQuickBook,
  generateAuthToken,
  getItems,
  saveConfig,
};
