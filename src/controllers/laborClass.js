const asyncHandler = require('express-async-handler');
const { laborClassService } = require('../services');
const { getResponse } = require('../helpers/response');
require('dotenv').config();

// =================================== SAVING LABOR =================================
const createLaborClass = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },
      body,
    } = req;
    const addedLabClass = await laborClassService.saveLaborClass(
      body,
      branchId,
      companyId,
    );
    if (addedLabClass) {
      return getResponse(
        res,
        1,
        'Labor Class saved Successfully',
        200,
        addedLabClass,
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to save labor class', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// =================================== GET LABORS =================================

const getLaborClasses = async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },
      query,
    } = req;

    const classes = await laborClassService.getAll(branchId, companyId, query);

    if (classes) {
      return getResponse(res, 1, 'Labor Classes fetched', 200, { classes }, {});
    } else {
      console.log('>>>>, ', res);
      return getResponse(res, 0, 'Something went wrong', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
};

const updateLaborClass = async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },
      body,
    } = req;
    const laborClass = await laborClassService.updateLaborClass(
      branchId,
      companyId,
      body,
    );
    if (laborClass) {
      return getResponse(
        res,
        1,
        body?.isDeleted
          ? 'Labor Class Deleted Successfully'
          : 'Labor Class updated Successfully',
        200,
        laborClass,
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
  createLaborClass,
  getLaborClasses,
  updateLaborClass,
};
