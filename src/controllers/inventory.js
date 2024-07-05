const asyncHandler = require('express-async-handler');
const { inventoryService, productService } = require('../services');
const { getResponse } = require('../helpers/response');

// ===================================GET DASHBOARD DATA=================================
const getDashboardData = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '' },
    } = req;
    const dashboardData = await inventoryService.dashboardData(branchId);
    if (dashboardData) {
      return getResponse(
        res,
        1,
        'Data Fetched Successfully',
        200,
        dashboardData,
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to fetch data', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});
// ===================================GET INVENTORY BY CATEGORY==========================
const getProductByCategory = asyncHandler(async (req, res) => {
  try {
    const {
      params: { id = 0, type = 3 },
      user: { branchId = '', companyId = '' },
      query: {
        page = 0,
        filterBy = '',
        searchBy = '',
        searchQuery = '',
        allProducts = '',
        filterByTire = '',
      },
    } = req;
    const productsData = await inventoryService.getInventoryProducts(
      id,
      type,
      branchId,
      companyId,
      page,
      filterBy,
      searchBy,
      searchQuery,
      allProducts,
      filterByTire,
    );
    if (productsData) {
      return getResponse(
        res,
        1,
        'Products list retrieved',
        200,
        productsData,
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to get products data', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});
module.exports = {
  getDashboardData,
  getProductByCategory,
};
