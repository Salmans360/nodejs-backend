const asyncHandler = require('express-async-handler');

const { productService } = require('../services');
const { getResponse } = require('../helpers/response');
const { sortProductData } = require('../helpers/sortProductData');
const { product: Product } = require('../sequelize/models');
const md5 = require('md5');
const imageUpload = require('../helpers/uploadImage');
require('dotenv').config();

// =================================== SAVING PRODUCT =================================
const saveProduct = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '', businessName },
      body,
    } = req;
    const requestImage = req.body.image;
    // if body.productType = 1 => tires, 2 => wheels
    const sortedRequestData = await sortProductData(body, companyId, branchId);
    console.log('>>>sortedRequestData', sortedRequestData);
    if (sortedRequestData) {
      const addProduct = await productService.saveProduct(
        sortedRequestData,
        body?.fees,
        branchId,
        companyId,
      );
      let logo = false;
      if (addProduct && !addProduct.productExist) {
        // image storing
        const hashedPath = md5(companyId + businessName);
        if (requestImage) {
          logo = await imageUpload(
            requestImage,
            `company/${companyId}/${hashedPath}/products/${addProduct?.product?.id}/1`,
          );
        }
        await productService.updateProduct({
          ...addProduct.product.dataValues,
          ...(logo && { image: logo }),
        });
        return getResponse(
          res,
          requestImage ? (logo ? 1 : 0) : 1,
          requestImage
            ? logo
              ? 'Product saved Successfully'
              : 'Image not uploaded plese try uploading image again'
            : 'Product saved Successfully',
          requestImage ? (logo ? 200 : 300) : 200,
          addProduct,
          {},
        );
      } else if (addProduct?.productExist) {
        return getResponse(res, 0, 'SKU must be unique', 400, {}, {});
      } else {
        return getResponse(res, 0, 'Unable to store data', 400, {}, {});
      }
    } else {
      return getResponse(
        res,
        0,
        'Something wrong with request data',
        400,
        {},
        {},
      );
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// =================================== UPDATE PRODUCT ===================================
const updateProduct = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '', businessName },
      body,
    } = req;
    // if body.productType = 1 => tires, 2 => wheels
    const sortedRequestData = await sortProductData(body, companyId, branchId);
    // image storing of product yet to be added
    if (sortedRequestData) {
      const addProduct = await productService.update(
        sortedRequestData,
        body?.id,
        body?.fees,
        branchId,
      );
      if (addProduct) {
        // image storing
        const hashedPath = md5(companyId + businessName);
        let logo = '';
        if (req.body?.image?.includes('base64')) {
          logo = await imageUpload(
            req.body.image,
            `company/${companyId}/${hashedPath}/products/${body.id}/1`,
          );
        }
        if (logo && req.body?.image?.includes('base64')) {
          Product.update({ image: logo }, { where: { id: body?.id } });
          return getResponse(
            res,
            1,
            'Product saved Successfully',
            200,
            addProduct,
            {},
          );
        } else if (!req.body?.image?.includes('base64')) {
          return getResponse(
            res,
            1,
            'Product saved Successfully',
            200,
            addProduct,
            {},
          );
        } else {
          return getResponse(
            res,
            0,
            req.body.image
              ? 'Image not uploaded plese try uploading image again'
              : 'Product saved successfully  ',
            req.body.image ? 300 : 200,
            addProduct,
            {},
          );
        }
      } else {
        return getResponse(res, 0, 'Unable to store data', 400, {}, {});
      }
    } else {
      return getResponse(
        res,
        0,
        'Something wrong with request data',
        400,
        {},
        {},
      );
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});
// =================================== GEt PRODUCT BY CATEGORY=================================

const getProductByCategory = asyncHandler(async (req, res) => {
  try {
    const {
      params: { id = 0, type = 3 },
      user: { branchId = '', companyId = '' },
      query: { page = 0, searchQuery },
    } = req;
    const productsData = await productService.getProducts(
      id,
      type,
      branchId,
      companyId,
      page,
      searchQuery,
    );
    const getProductsCount = await productService.getCount(
      id,
      type,
      branchId,
      companyId,
    );
    if (productsData) {
      return getResponse(
        res,
        1,
        'Products list retrieved',
        200,
        { products: productsData, count: getProductsCount },
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to get products data', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// =================================== FAVOURIT PRODUCT TOGGLE=================================
const toggleFavourite = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId },
      body: { productId, isFavourite },
    } = req;
    const productData = await productService.toggleFavourite(
      branchId,
      productId,
      isFavourite,
    );
    console.log('>>>>', productData);
    if (productData) {
      return getResponse(
        res,
        1,
        'Products added to favourite',
        200,
        productData,
        {},
      );
    } else {
      return getResponse(res, 0, 'Something went wrong', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// =================================== SEARCH PRODUCT =================================
const search = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },
      query: {
        categoryId,
        searchQuery,
        subCategoryId,
        type,
        isFavourite = false,
        filterByTire = '',
      },
    } = req;

    const searchResult = await productService.search(
      branchId,
      companyId,
      categoryId,
      subCategoryId,
      searchQuery,
      type,
      isFavourite,
      filterByTire,
    );
    if (searchResult) {
      return getResponse(
        res,
        1,
        'Products list fetched',
        200,
        searchResult,
        {},
      );
    } else {
      return getResponse(res, 0, 'Something went wrong', 200, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// =================================== SEARCH PRODUCT =================================
const searchExistingSku = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },
      query: { sku, categoryId },
    } = req;
    console.log('>>>>>>>>>ssssss', sku, categoryId);
    const skuExist = await productService.searchSkuExisting(
      companyId,
      categoryId,
      sku,
    );

    return getResponse(res, 1, 'Sku fetched', 200, skuExist, {});
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});
// =================================== GET FAVOURITE PRODUCTS =================================
const getFavourite = async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },
      query: { categoryId = false, page = 0 },
    } = req;

    const favourites = await productService.getFavourites(
      categoryId,
      companyId,
      branchId,
      page,
    );
    const count = await productService.getCount(
      categoryId,
      1,
      branchId,
      companyId,
      true,
    );
    if (favourites) {
      return getResponse(
        res,
        1,
        'Favourite Products list fetched',
        200,
        { products: favourites, count },
        {},
      );
    } else {
      return getResponse(res, 0, 'Something went wrong', 200, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
};

// =================================== IMPORT PRODUCTS =================================
const importProducts = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId },
      query: { categoryId },
    } = req;

    const result = await productService.importProducts(
      req.file,
      parseInt(categoryId),
      companyId,
      branchId,
    );
    if (result.status === 200) {
      return getResponse(
        res,
        1,
        'Product Data imported succesfully',
        200,
        result,
        {},
      );
    } else {
      return getResponse(res, 0, result.message, 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, 'Internal server Error', 400, {}, {});
  }
});

// =================================== DELETE PRODUCT ===========================================
const deleteProduct = async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '', userId = '' },
      params: { id },
    } = req;

    const deletedId = await productService.deleteProd(id, branchId, userId);
    if (deletedId) {
      return getResponse(
        res,
        1,
        'Products deleted succesfully',
        200,
        deletedId,
        {},
      );
    } else {
      return getResponse(res, 0, 'Something went wrong', 200, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
};

// =================================== UPDATE BULK INVENTORY QUANTITIES =================================
const updateBulkQuantity = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },
      body: { data },
    } = req;

    const responseData = await productService.updateQuantities(data);
    if (responseData) {
      return getResponse(
        res,
        1,
        'Inventory  Updated Successfully',
        200,
        responseData,
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to Update Quantity', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

module.exports = {
  saveProduct,
  getProductByCategory,
  toggleFavourite,
  search,
  getFavourite,
  importProducts,
  updateProduct,
  deleteProduct,
  updateBulkQuantity,
  searchExistingSku,
};
