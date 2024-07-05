const asyncHandler = require('express-async-handler');
const { packageService } = require('../services');
const { getResponse } = require('../helpers/response');
const branch = require('../sequelize/models/branch');

// ===================================ADD PACKAGE=================================
const checkDuplicate = asyncHandler(async (packageBody) => {
  const dupSkuArray = [];
  packageBody.lineItems.forEach(async (item) => {
    if (!item.id) {
      if (item.type == 'product') {
        const productExist = await Product.findOne({
          where: {
            sku: item.sku,
            companyId,
            categoryId: item.categoryId,
          },
        });
        productExist ? dupSkuArray.push(item.description) : '';
      }
    }
  });
  return dupSkuArray;
});
const addPackage = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },
      body: { packageBody },
    } = req;

    // const dupSkuArray = await checkDuplicate(packageBody);
    // if (dupSkuArray.length) {
    //   return getResponse(
    //     res,
    //     0,
    //     'Duplicate SKU',
    //     403,
    //     { duplicateArray: dupSkuArray },
    //     {},
    //   );
    // }

    const responseData = await packageService.savePackage(
      packageBody,
      companyId,
      branchId,
    );
    console.log('>>>>>responseData', responseData);
    if (responseData) {
      return getResponse(
        res,
        1,
        'Package Created Succesfully',
        200,
        responseData,
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to add package', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================UPDATE PACKAGE=================================
const updatePackage = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },
      body: packageBody,
    } = req;
    // const dupSkuArray = await checkDuplicate(packageBody);
    // if (dupSkuArray.length) {
    //   return getResponse(
    //     res,
    //     0,
    //     'Duplicate SKU',
    //     403,
    //     { duplicateArray: dupSkuArray },
    //     {},
    //   );
    // }
    const responseData = await packageService.updatePackage(
      packageBody,
      companyId,
      branchId,
    );
    console.log('>>>responseData', responseData);
    if (responseData) {
      return getResponse(
        res,
        1,
        'Package Update Successfully',
        200,
        responseData,
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to update package', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================DELETE FEES==================================
const deletePackage = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId },
      params: { id },
    } = req;

    const result = await packageService.deletePackage(id);
    if (result) {
      return getResponse(
        res,
        1,
        'Package deleted Successfully',
        200,
        { id: id, data: result },
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to delete package', 400, {}, {});
    }
  } catch (err) {
    return getResponse(res, 0, err?.message, 400, {}, {});
  }
});

// =================================== GET SERVICE PACKAGES=================================

const getPackages = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },
      query: { page = 0, searchQuery, isFavourite = null },
    } = req;
    console.log('>>>>>', branchId);
    const packagesData = await packageService.getPackages(
      branchId,
      companyId,
      page,
      searchQuery,
      isFavourite,
    );
    const count = await packageService.getPackagesCount(
      branchId,
      companyId,
      isFavourite,
    );
    console.log('>>>>count', count);
    if (packagesData) {
      return getResponse(
        res,
        1,
        'Packages list retrieved',
        200,
        { packages: packagesData, count },
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to get packages data', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// =================================== GET SERVICE PACKAGES COUNT=================================

const getPackagesCount = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },
    } = req;

    const count = await packageService.getPackagesCount(branchId, companyId);

    if (count) {
      return getResponse(
        res,
        1,
        'Packages Count retrieved',
        200,
        { count: count },
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to get packages Count', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});
// =================================== GET SERVICE PACKAGE=================================

const getPackageById = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },

      params: { id },
    } = req;
    console.log('>>>>>id', id);
    const packagesData = await packageService.findPackageById(id);

    if (packagesData) {
      return getResponse(
        res,
        1,
        'Package retrieved',
        200,
        { packages: packagesData },
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to get package data', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// =================================== ADD/REMOVE TO FAVORITE PACKAGES TOGGLE=================================
const toggleFavorite = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId },
      body: { packageId, isFavorite },
    } = req;
    const packageData = await packageService.toggleFavorite(
      branchId,
      packageId,
      isFavorite,
    );
    console.log('>>>>', packageData);
    if (packageData) {
      return getResponse(
        res,
        1,
        'Package added to favorite',
        200,
        packageData,
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
  addPackage,
  updatePackage,
  deletePackage,
  getPackages,
  getPackageById,
  toggleFavorite,
  getPackagesCount,
};
