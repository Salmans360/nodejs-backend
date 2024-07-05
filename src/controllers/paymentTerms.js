const asyncHandler = require('express-async-handler');
const { paymentTermsService } = require('../services');
const { getResponse } = require('../helpers/response');
require('dotenv').config();

// =================================== GET ALL PAYMENT TERMS =================================
const getAll = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId },
    } = req;

    const paymentTermsData = await paymentTermsService.getAll(
      companyId,
      branchId);
    if (paymentTermsData) {
      return getResponse(
        res,
        1,
        'Payment Terms Fetch Successfully',
        200,
        { paymentTermsData },
        {},
      );
    } else {
      return getResponse(res, 0, 'Something went wrong', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});
module.exports = {
    getAll
};
