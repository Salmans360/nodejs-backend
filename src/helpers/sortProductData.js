const sortProductData = async (bodyData, companyId, branchId) => {
  try {
    const productData = {
      sku: bodyData?.sku,
      brand: bodyData?.brand,
      description: bodyData?.description,
      measurement: bodyData?.measurement,
      // for Tires => seasonality, Wheels => centreBore
      seasonality: bodyData?.seasonality,
      // for Tires => condition , Wheels => Bolt Pattern
      condition: bodyData?.condition,
      type: bodyData.productType,
      categoryId: bodyData?.categoryId,
      subCategoryId: bodyData?.subCategoryId,

      companyId: companyId,
      isActive: 1,
    };
    const inventoryData = {
      branchId: branchId,
      qty: bodyData?.qty,
      minQty: bodyData?.minQty,
      cost: bodyData?.cost,
      tireCondition: bodyData?.tireCondition,
      markup: bodyData?.markup,
      retail: bodyData?.retail,
      vendor: bodyData?.vendor,
      binLocation: bodyData?.binLocation,
      warranty: bodyData?.warranty,
      show: bodyData?.show,
      // isFavourite: 0,
      notes: bodyData?.notes,
    };

    return { productData, inventoryData };
  } catch (err) {
    return false;
  }
};
module.exports = { sortProductData };
