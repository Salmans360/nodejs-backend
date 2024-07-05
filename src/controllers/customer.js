const asyncHandler = require('express-async-handler');
const { customerService } = require('../services');
const { getResponse } = require('../helpers/response');

// ===================================ADD CUSTOMER=================================
const addCustomer = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '' },
      body,
    } = req;
    const customer = await customerService.createCustomer(body, branchId);
    if (customer) {
      return getResponse(
        res,
        1,
        'Customer Created Successfully',
        200,
        customer,
        {},
      );
    } else {
      return getResponse(res, 0, 'Phone Number already taken', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================UPDATE CUSTOMER=================================
const updateCustomer = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '' },
      body,
    } = req;
    const customer = await customerService.updateCustomer(body, branchId);
    if (customer) {
      return getResponse(
        res,
        1,
        'Customer Updated Successfully',
        200,
        customer,
        {},
      );
    } else {
      return getResponse(res, 0, 'Phone Number already taken', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================SEARCH CUSTOMER=================================
const searchCustomer = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '' },
      query: { searchQuery },
    } = req;
    const customer = await customerService.searchCustomer(
      searchQuery,
      branchId,
    );

    if (customer) {
      return getResponse(
        res,
        1,
        'Customer data received Successfully',
        200,
        customer,
        {},
      );
    } else {
      return getResponse(res, 0, 'Sonmething went wrong', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});
// ===================================GET CUSTOMER TRANSACTIONS=================================
const getTransactions = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '' },
      query: {
        searchQuery = false,
        searchType = false,
        page = 0,
        start = false,
        end = false,
        orderBy = false,
        order = 'DESC',
        dataType=false,
        customerId,
      },
    } = req;

    const listData = await customerService.getAllTransactions(
      searchQuery,
      searchType,
      +page,
      start,
      end,
      orderBy,
      order,
      branchId,
      customerId,
      dataType
    );
    if (listData) {
      return getResponse(
        res,
        1,
        'Customer data received Successfully',
        200,
        { listData },
        {},
      );
    } else {
      return getResponse(res, 0, 'Sonmething went wrong', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});


// ===================================GET CUSTOMER On Account TRANSACTIONS=================================
const getOnAccountTransactions = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '' },
      query: {
        customerId,
      },
    } = req;

    const {returnArray,invoiceOpen,paymentOpen} = await customerService.getOnAccountTransactions(
      searchQuery = false,
        searchType = false,
        page = 0,
        start = false,
        end = false,
        orderBy = false,
        order = 'DESC',
        dataType=false,
        customerId,
    );
    if (returnArray) {
      return getResponse(
        res,
        1,
        'Customer data received Successfully',
        200,
        { listData:returnArray,invoiceOpen,paymentOpen },
        {},
      );
    } else {
      return getResponse(res, 0, 'Sonmething went wrong', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});
// ===================================GET ALL CUSTOMERS=================================
const getAll = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '' },
      query: {
        searchQuery = false,
        searchType = false,
        page = 0,
        start = false,
        end = false,
        orderBy = false,
        order = 'DESC',
        allCustomers = '',
      },
    } = req;

    const listData = await customerService.getAll(
      searchQuery,
      searchType,
      +page,
      start,
      end,
      orderBy,
      order,
      branchId,
      allCustomers,
    );
    if (listData) {
      const { customer, count, customerTotal } = listData;
      const totalCustomers = customerTotal?.dataValues?.total;
      return getResponse(
        res,
        1,
        'Customer data received Successfully',
        200,
        { customer, count, totalCustomers },
        {},
      );
    } else {
      return getResponse(res, 0, 'Sonmething went wrong', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

const deleteCustomer = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '' },
      params: { id },
    } = req;

    const deletedId = await customerService.deleteCustomer(id);
    if (deletedId) {
      return getResponse(
        res,
        1,
        'Customer deleted Successfully',
        200,
        { deletedId },
        {},
      );
    } else {
      return getResponse(res, 0, 'Sonmething went wrong', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});
const importCustomers = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId },
    } = req;

    const result = await customerService.importCustomerData(req.file, branchId);
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

module.exports = {
  addCustomer,
  updateCustomer,
  searchCustomer,
  getAll,
  deleteCustomer,
  importCustomers,
  getTransactions,
  getOnAccountTransactions
};
