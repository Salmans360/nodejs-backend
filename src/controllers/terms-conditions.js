const asyncHandler = require('express-async-handler');
const { termsService } = require('../services');
const { getResponse } = require('../helpers/response');

const company = require('../sequelize/models/company');

// ===================================ADD TERMS CONDITIONS=================================
const addTermsConditions = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId },
      body,
    } = req;
    const terms = await termsService.saveTerms(body, branchId, companyId);
    if (terms) {
      return getResponse(
        res,
        1,
        'Terms and Conditions Added Successfully',
        200,
        { termsConditions: terms },
        {}
      );
    } else {
      return getResponse(res, 0, 'Unable to save', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================UPDATE TERMS CONDITIONS=================================
const updateTermsConditions = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '' },
      body,
    } = req;
    const [count, term] = await termsService.updateTerms(body);
    if (count && term?.length > 0) {
      return getResponse(
        res,
        1,
        'Terms and conditions updated Successfully',
        200,
        { termsConditions: term[0] },
        {}
      );
    } else {
      return getResponse(res, 0, 'Unable to update fees', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================GET ALL TERMS CONDITIONS=================================
const getTermsConditions = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '' },
      params: { categoryId = '' },
      body,
    } = req;
    const term = await termsService.getAll(branchId);

    if (term || term !== false) {
      return getResponse(
        res,
        1,
        'Terms Conditions fetched Successfully',
        200,
        { termsConditions: term },
        {}
      );
    } else
      return getResponse(
        res,
        0,
        'Unable to fetch Terms and Conditions',
        400,
        {},
        {}
      );
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

module.exports = {
  addTermsConditions,
  updateTermsConditions,
  getTermsConditions,
};
