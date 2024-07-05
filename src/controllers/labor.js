const asyncHandler = require('express-async-handler');
const { laborService } = require('../services');
const { getResponse } = require('../helpers/response');
require('dotenv').config();

// =================================== SAVING LABOR =================================
const saveLabor = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },
      body,
    } = req;
    const addLabor = await laborService.saveLabor(body, companyId, branchId);
    if (addLabor) {
      return getResponse(res, 1, 'Labor saved Successfully', 200, addLabor, {});
    } else {
      return getResponse(res, 0, 'Unable to save labor', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// =================================== SET LABOR TO FAVOURIT  =================================
const favouriteLabor = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId },
      body: { laborId, isFavourite },
    } = req;
    const laborData = await laborService.setLaborFavourite(
      branchId,
      laborId,
      isFavourite,
    );
    if (laborData) {
      return getResponse(
        res,
        1,
        'Labor added to favourite',
        200,
        laborData,
        {},
      );
    } else {
      return getResponse(res, 0, 'Something went wrong', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// =================================== GET ALL LABORS =================================
const getLaborsByCategory = asyncHandler(async (req, res) => {
  try {
    const {
      params: { id = 0 },
      user: { branchId, companyId },
      query: { page = 0, searchQuery, excludeNotes },
    } = req;

    const laborsData = await laborService.getLabors(
      companyId,
      branchId,
      id,
      page,
      searchQuery,
      excludeNotes,
    );
    const getLaborsCount = await laborService.getCount(companyId, id);
    if (laborsData) {
      return getResponse(
        res,
        1,
        'Labor Fetch Successfully',
        200,
        { labors: laborsData, count: getLaborsCount },
        {},
      );
    } else {
      return getResponse(res, 0, 'Something went wrong', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// =================================== GET FAVOURITE LABORS =================================

const getFavorites = async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },
      query: { categoryId = false, page = 0 },
    } = req;

    const favourites = await laborService.getFavourites(
      companyId,
      branchId,
      categoryId,
      page,
    );
    const count = await laborService.getCount(companyId, categoryId, true);
    if (favourites) {
      return getResponse(
        res,
        1,
        'Favourite Labors list fetched',
        200,
        { labors: favourites, count },
        {},
      );
    } else {
      return getResponse(res, 0, 'Something went wrong', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
};

const updateLabor = async (req, res) => {
  try {
    const { body } = req;
    const labor = await laborService.updateLabor(body);
    if (labor) {
      return getResponse(res, 1, 'Labor updated Successfully', 200, labor, {});
    } else {
      return getResponse(res, 0, 'Something went wrong', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
};
const deleteLabor = async (req, res) => {
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

// =================================== SEARCH FROM ALL LABORS =================================
const searchLabors = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId },
      query: { searchQuery },
    } = req;

    const laborsData = await laborService.searchLabors(
      companyId,
      branchId,
      searchQuery,
    );

    if (laborsData) {
      return getResponse(
        res,
        1,
        'Labor Searched Successfully',
        200,
        laborsData,
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
  saveLabor,
  favouriteLabor,
  getLaborsByCategory,
  getFavorites,
  updateLabor,
  deleteLabor,
  searchLabors,
};
