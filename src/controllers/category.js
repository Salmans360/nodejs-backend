const asyncHandler = require('express-async-handler');
const {
  categoryService,
  productService,
  laborService,
} = require('../services');
const { getResponse } = require('../helpers/response');
const { response } = require('../routes');
require('dotenv').config();
const constants = require('../constants');

// =================================== FETCHING CATEGORIES AND THEIR SUB CATEGORIES =================================
const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '' },
    } = req;
    const categories = await categoryService.getAll(branchId);
    if (categories) {
      return getResponse(
        res,
        1,
        'Categories received Successfully',
        200,
        categories,
        {},
      );
    } else {
      return getResponse(res, 0, 'No Categories Found', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// =================================== FETCHING FAVOURITES (CATEGORIES, PRODUCTS, LABORS, SERVICE PACKAGES) =================================

const getAllFavourites = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId },
      params: { categoryId },
      query: { page = 0, searchQuery },
    } = req;
    const limit = constants.LIMIT;
    const favourites = await categoryService.getFavourites(
      companyId,
      categoryId,
      branchId,
      searchQuery,
    );
    if (favourites) {
      const responseData = await mapFavouriteData(favourites);
      const count = responseData.favourites.length;

      responseData.favourites = await applyLimit(
        responseData.favourites,
        +limit,
        +page,
      );
      return getResponse(
        res,
        1,
        'Favourites Fetch Successfully',
        200,
        { favoutiteData: responseData, count },
        {},
      );
    } else {
      return getResponse(res, 0, 'Something went wrong', 400, {}, {});
    }
  } catch (error) {
    console.log(error);
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});
const mapFavouriteData = async (favouritesData) => {
  try {
    const responseData = {
      id: favouritesData.id,
      name: favouritesData.name,
      favourites: [],
    };
    if (favouritesData.products.length) {
      favouritesData.products.forEach((element) => {
        let dataObject = element?.dataValues;
        dataObject.type = 'product';
        responseData.favourites.push(dataObject);
      });
    }
    if (favouritesData.labors.length) {
      favouritesData.labors.forEach((element) => {
        let dataObject = element?.dataValues;
        dataObject.type = 'labor';
        responseData.favourites.push(dataObject);
      });
    }
    return responseData;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const applyLimit = async (data, limit, pageNo) => {
  return data.slice(pageNo * limit, limit * (pageNo + 1));
};
const toggleFavourite = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId },
      body: { isFavourite, type, id },
    } = req;
    let returnData = {};
    let data = {};
    switch (type) {
      case 'product':
        data = await productService.toggleFavourite(branchId, id, isFavourite);
        returnData = data?.dataValues;
        returnData.type = 'product';
        break;
      case 'labor':
        data = await laborService.setLaborFavourite(branchId, id, isFavourite);
        returnData = data?.dataValues;
        returnData.type = 'labor';
        break;
      default:
        break;
    }
    return getResponse(res, 1, 'Success', 200, returnData, {});
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});
module.exports = {
  getAllCategories,
  getAllFavourites,
  toggleFavourite,
};
