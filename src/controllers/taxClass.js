const asyncHandler = require('express-async-handler');
const { taxClassService } = require('../services');
const { getResponse } = require('../helpers/response');
require('dotenv').config();

// =================================== Create Tax Class =================================
const createTaxClass = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },
      body,
    } = req;
    const addedTaxClass = await taxClassService.saveTaxClass(
      body,
      branchId,
      companyId,
    );
    if (addedTaxClass) {
      return getResponse(
        res,
        1,
        'Tax Class saved Successfully',
        200,
        addedTaxClass,
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to save tax class', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// =================================== GET Tax Classes =================================

const getTaxClasses = async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },
      query,
    } = req;

    const classes = await taxClassService.getAll(branchId, companyId, query);

    if (classes) {
      return getResponse(res, 1, 'Tax Classes fetched', 200, { classes }, {});
    } else {
      console.log('>>>>, ', res);
      return getResponse(res, 0, 'Something went wrong', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
};

const updateTaxClass = async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },
      body,
    } = req;
    const taxClass = await taxClassService.updateTaxClass(
      branchId,
      companyId,
      body,
    );
    if (taxClass) {
      return getResponse(
        res,
        1,
        body?.isDeleted
          ? 'Tax Class Deleted Successfully'
          : 'Tax Class updated Successfully',
        200,
        taxClass,
        {},
      );
    } else {
      return getResponse(res, 0, 'Something went wrong', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
};

const deleteTaxClass = async (req, res) => {
  try {
    const {
      params: { id },
    } = req;
    const deletedId = await laborService.deleteLaborById(id);

    if (deletedId) {
      return getResponse(
        res,
        1,
        'Labor deleted Successfully',
        200,
        deletedId,
        {},
      );
    } else {
      return getResponse(res, 0, 'Something went wrong', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
};

module.exports = {
  createTaxClass,
  getTaxClasses,
  updateTaxClass,
  deleteTaxClass,
};
