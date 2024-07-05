const asyncHandler = require('express-async-handler');
const {
  savePayment,
  getPaymentById,
} = require('../services/onAccount.service');
const { getResponse } = require('../helpers/response');
const { termsService } = require('../services');

// =================================== SAVING ORDER =================================
const addPayment = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '', userId },
      body: { onAccountData, transactionData },
    } = req;
    onAccountData.branchId = branchId;
    onAccountData.companyId = companyId;
    const storePayment = await savePayment(onAccountData, transactionData);
    return getResponse(
      res,
      1,
      'Payment added Successfully',
      200,
      { id: storePayment },
      {},
    );
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

const getById = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },

      params: { id },
    } = req;

    const paymentsData = await getPaymentById(id);
    const term = await termsService.getAll(branchId);
    console.log('>>>>>id', term);
    if (paymentsData) {
      return getResponse(
        res,
        1,
        'Payment data retrieved',
        200,
        { paymentsData, termsConditions: term },
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to get package data', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

module.exports = {
  addPayment,
  getById,
};
