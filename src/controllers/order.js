const asyncHandler = require('express-async-handler');
const { orderService, orderItemService, termsService } = require('../services');
const {
  quickbook_config: quickbookConfigs,
  invoice_queue: invoiceQueQb,
  work_order_deposit: WorkOrderDeposit,
} = require('../sequelize/models');
const {
  product,
  inventory,
  invoice: Invoice,
  payment: Payment,
} = require('../sequelize/models/index');
const { getResponse } = require('../helpers/response');
const { sortProductData } = require('../helpers/sortProductData');
require('dotenv').config();
const Email = require('../helpers/email');
const { storeOrderItemFee } = require('../helpers/order');
const { createInvoice, updateInvoice } = require('../services/invoice.service');
const {
  getCustomerById,
  saveDeposit,
  updateDeposit,
  updateCustomer,
  getDeposit,
} = require('../services/customer.service');

const qbQue = async (
  invoice,
  items,
  customerId,
  totalDiscount,
  branchId,
  companyId,
  userId,
) => {
  let customer = null;
  if (customerId) {
    customer = await getCustomerById(customerId);
  }

  const userConfig = await quickbookConfigs.findOne({
    where: {
      userId,
    },
  });

  if (userConfig && userConfig?.partsSuppliesId && userConfig?.laborId) {
    const queObj = {
      invoiceData: {
        ...invoice?.dataValues,
        totalDiscount,
        lineItems: items,
        customerName: customer
          ? `${customer?.dataValues?.firstName} ${
              customer?.dataValues?.email
                ? '[' + customer?.dataValues?.email + ']'
                : ''
            }`
          : `Walk In Customer`,
      },
      userId,
      branchId,
      companyId,
      invoiceId: invoice?.id,
      weightage: 0,
      authToken: userConfig?.accessToken,
      refreshToken: userConfig?.refreshToken,
      sandboxCompanyId: userConfig?.sandboxCompanyId,
    };

    await invoiceQueQb.create(queObj);
  }
};

const updateCustomerDeposit = async (
  customerId,
  deposit,
  branchId,
  remainingAmount,
  type,
) => {
  const customerD = await getCustomerById(customerId);

  let cusPreviousDep = 0;
  let totalDeposit = deposit || 0;
  if (customerD) {
    cusPreviousDep = customerD?.totalDeposit || 0;
  }
  console.log('>>>>>>123', type, cusPreviousDep, deposit);
  if (type === 'checkout') {
    // if user doing checkout and using deposit amount
    if (cusPreviousDep > 0) {
      // if remainingAmount in - then - will be added in deposit (customer balance)
      //if remainingAmount in - means remaining balance from deposit
      // if (remainingAmount < 0) {
      //   totalDeposit += -1 * remainingAmount; // to convert in +
      // }
      // after adding remaining then minus the paid deposit
      totalDeposit = cusPreviousDep - deposit || 0;
    } else {
      totalDeposit = 0;
    }
  } else {
    totalDeposit += cusPreviousDep || 0;
  }

  try {
    await updateCustomer(
      {
        totalDeposit: totalDeposit,
        id: customerId,
        availableCredit: customerD?.availableCredit,
      },
      branchId,
    );
  } catch (error) {
    console.log('>>>>err', error);
  }
};

const updateCustomerOnAccount = async (customerId, onAccount, branchId) => {
  const customerD = await getCustomerById(customerId);
  console.log('>>>>>>>>>>balance', customerD?.balance);
  console.log('>>>>>>>>>>onAccount', onAccount);
  console.log('>>>>>>>>>>availableCredit', customerD?.availableCredit);
  console.log(
    '>>>>>>>>>>total',
    customerD?.balance + +onAccount,
    customerD?.availableCredit - +onAccount,
  );

  let cusAvailableCredit = 0;
  let cusBalance = 0;
  if (customerD) {
    cusBalance = customerD?.balance + +onAccount;
    cusAvailableCredit = +customerD?.availableCredit - +onAccount;
  }
  try {
    const updatedData = {
      availableCredit: cusAvailableCredit
        .toString()
        .match(/^-?\d+(?:\.\d{0,2})?/)[0], //Math.trunc(+cusAvailableCredit * 100) / 100,
      balance: cusBalance.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0], // Math.trunc(+cusBalance * 100) / 100,
      id: customerId,
    };
    console.log('here it issss', cusAvailableCredit, cusBalance, updatedData);
    await updateCustomer(updatedData, branchId);
  } catch (error) {
    console.log('>>>>err', error);
  }
};

const depositService = async (customerId, depositData, orderId, branchId) => {
  const depositId = depositData?.id || null;
  let deposit = '';
  let depositAmount = depositData?.totalDeposit || 0;
  // first time customer deposit will be 0 and new added deposit will be add to customer
  let totalDeposit = depositData?.totalDeposit || 0;

  await updateCustomerDeposit(customerId, totalDeposit, branchId);
  console.log('>>>depositId', depositId);
  if (depositId) {
    const preWorkOrderDeposit = await getDeposit(depositId);

    let previousTotal = 0;
    let updatedTotal = 0;

    previousTotal = preWorkOrderDeposit?.totalAmount || 0;
    updatedTotal = (previousTotal || 0) + (depositAmount || 0);
    deposit = await updateDeposit({
      ...depositData,
      depositAmount: previousTotal || depositAmount, // first time previousTotal will be 0
      totalAmount: updatedTotal,
      workOrderId: orderId,
    });
  } else {
    deposit = await saveDeposit({
      ...depositData,
      depositAmount: 0, // on save deposit amount will be 0
      totalAmount: depositAmount, // first time both will be same (depositAmount, totalAmount)
      workOrderId: orderId,
    });
  }
  return deposit;
};

// =================================== SAVING ORDER =================================
const saveOrder = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '', userId },
      body,
    } = req;
    const items = body?.items;
    // const isDraft = false;
    const orderData = await sortOrderData(body, companyId, branchId);
    const invoiceData = body.invoice;
    const paymentData = body.paymentData;
    body?.paymentData?.onAccount > 0
      ? (orderData.openAmount = body?.paymentData?.onAccount)
      : '';
    console.log('order data', orderData, body);
    const saveOrder = await orderService.saveOrder(
      {
        orderData,
        itemData: items,
      },
      2,
    );
    if (saveOrder) {
      const updateQty = await manageInventoryQty(items);
      invoiceData.orderId = saveOrder.id;
      invoiceData.branchId = branchId;
      invoiceData.companyId = companyId;

      invoiceData.paidAmount = invoiceData?.paidAmount;
      invoiceData.totalAmount = invoiceData?.totalAmount;
      const invoiceResponse = await createInvoice(invoiceData);
      paymentData.invoiceId = invoiceResponse.id;
      paymentData.orderId = saveOrder.id;
      // console.log('>>>', invoiceResponse, items);
      await qbQue(
        invoiceResponse,
        items,
        body?.customerId || null,
        body.totalDiscount,
        branchId,
        companyId,
        userId,
      );
      console.log('paymentData', body?.paymentData);
      if (body?.paymentData?.deposit > 0) {
        await updateCustomerDeposit(
          body?.customerId,
          body?.paymentData?.deposit,
          branchId,
          body?.paymentData?.remainingAmount || 0,
          'checkout',
        );
      }
      if (body?.paymentData?.onAccount > 0) {
        await updateCustomerOnAccount(
          body?.customerId,
          body?.paymentData?.onAccount,
          branchId,
        );
      }
      const paymentResponse = await Payment.create(paymentData);
      const termsCondition = await termsService.getAll(branchId);
      const _paymentData = await orderService.getPaidByData(saveOrder.id);
      const _invoiceData = await orderService.getInvoiceData(
        saveOrder.id,
        branchId,
        body?.type,
      );

      return getResponse(
        res,
        1,
        'Order saved Successfully',
        200,
        {
          invoiceData: _invoiceData,
          order: saveOrder,
          invoice: invoiceResponse,
          termsCondition,
          paymentData: _paymentData,
        },
        {},
      );
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

// =================================== PARTIAL PAYMENT =================================
const partialPayment = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },
      body,
    } = req;

    const invoiceData = body.invoiceData;
    const paymentData = body.paymentData;

    const invoiceResponse = await updateInvoice(invoiceData);
    const orderData = await orderService.getOrderById(paymentData.orderId);
    const paymentResponse = await Payment.create(paymentData);
    if (paymentData?.deposit > 0) {
      await updateCustomerDeposit(
        body?.customerId,
        paymentData?.deposit,
        branchId,
        paymentData?.remainingAmount || 0,
        'checkout',
      );
    }
    if (paymentData?.onAccount > 0) {
      await updateCustomerOnAccount(
        body?.customerId,
        paymentData?.onAccount,
        branchId,
      );
      const newonAccount = orderData?.openAmount + paymentData?.onAccount;
      await orderService.updateOrder(
        { openAmount: newonAccount },
        paymentData?.orderId,
      );
    }
    return getResponse(
      res,
      1,
      'Payment Created Successfully',
      200,
      paymentResponse,
      {},
    );
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

const getWorkOrderPaymentDetails = async (workOrderId) => {
  if (!workOrderId) return '';
  const {
    dataValues: {
      depositAmount = '',
      cash = '',
      cheque = '',
      debitCard = '',
      creditCard = '',
      financing = '',
    } = '',
  } =
    (await WorkOrderDeposit.findOne({
      where: { workOrderId },
    })) || '';
  return {
    deposit: depositAmount,
    cash,
    cheque,
    debitCard,
    creditCard,
    financing,
  };
};

// =================================== SAVING QUOTE =================================
const saveQuote = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },
      body,
    } = req;
    const items = body?.items;
    // const isDraft = true;
    const orderData = await sortOrderData(body, companyId, branchId);
    console.log('>>>orderData', orderData);
    const saveOrder = await orderService.saveOrder(
      {
        orderData,
        itemData: items,
      },
      1,
    );

    const termsCondition = await termsService.getAll(branchId);
    let paymentData = {};
    // take deposit case
    if (saveOrder && body?.takeDeposit) {
      await depositService(
        body?.customerId,
        body?.depositData,
        saveOrder?.id,
        branchId,
      );

      paymentData = await getWorkOrderPaymentDetails(saveOrder?.id);
    }
    return getResponse(
      res,
      1,
      'Order saved Successfully',
      200,
      {
        order: {
          ...saveOrder?.dataValues,
          totalDeposit: +body?.depositData?.totalDeposit || 0,
        },
        paymentData,

        termsCondition,
      },
      {},
    );
    //  else {
    //   return getResponse(
    //     res,
    //     0,
    //     'Something wrong with request data',
    //     400,
    //     {},
    //     {},
    //   );
    // }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// =================================== SORTING ORDER DATA =================================
const sortOrderData = async (orderBody, companyId, branchId) => {
  return {
    companyId: companyId,
    branchId: branchId,
    customerId: orderBody.customerId,
    vehicleId: orderBody.vehicleId,
    totalItems: orderBody.totalItems,
    totalProducts: orderBody.totalProducts,
    totalLabors: orderBody.totalLabors,
    productsTotal: orderBody.productsTotal,
    laborTotal: orderBody.laborTotal,
    itemsTotal: orderBody.itemsTotal,
    totalFee: orderBody.totalFee,
    totalDiscount: orderBody.totalDiscount,
    totalTax: orderBody.totalTax,
    totalPayAble: orderBody.totalPayAble,
    totalProfit: orderBody.totalProfit,
    type: orderBody?.type, // quote ===1 || W/O===2
    // isDraft,
    customCheckboxes: orderBody?.customCheckboxes?.length
      ? orderBody.customCheckboxes
      : null,
  };
};

// =================================== SENDING EMAIL =================================
const sendEmail = async (req, res) => {
  const {
    user: { branchId = '', companyId = '', businessName },
    body: { email, url, recipientName, subject = 'Invoice', message },
  } = req;
  const user = {
    customerName: recipientName || '',
    email: email,
    subject,
    message,
    businessName: businessName,
  };
  await new Email(user, url).sendInvoice(subject);

  return getResponse(res, 1, 'PDF sent successfully', 200, {}, {});
};

// =================================== UPDATE INVENTORY QTY ON ORDER COMPLETION =================================
const manageInventoryQty = async (items) => {
  const inventoryArray = [];

  for (let i = 0; i < items.length; i++) {
    if (items[i].type == 'product' && items[i]?.inventory?.[0].id) {
      inventoryArray.push({
        id: items[i].inventory[0].id,
        qty: items[i].inventory[0].qty - items[i].qty,
      });
    }
  }

  await inventory.bulkCreate(inventoryArray, {
    updateOnDuplicate: ['qty'],
  });
};

// =================================== GET ALL INVOICES =================================
const getInvoices = async (req, res) => {
  try {
    let quoteOrWO = false; // for both  quote and work order  (1,2)
    const {
      user: { branchId = '', companyId = '' },
      query: {
        searchQuery = false,
        searchType = false,
        page = 0,
        start = false,
        end = false,
        orderBy = false,
        order = 'DESC',
        min = false,
        max = false,
        // quote = false,
        allQuotes,
      },
      params: { type },
    } = req;

    quoteOrWO = type === '1' || type === '2' ? true : false;

    const invoice = await orderService.getAllInvoices(
      searchQuery,
      searchType,
      +page,
      start,
      end,
      orderBy,
      order,
      min,
      max,
      branchId,
      quoteOrWO,
      allQuotes,
      +type,
    );

    if (invoice) {
      const { invoiceData, aggregatedData, totalCount } = invoice;
      const { mappedData, maxRange } = aggregatedData;
      let responseData = quoteOrWO
        ? {
            quoteData: invoiceData,
            aggregatedData: mappedData,
            max: maxRange,
            totalCount,
          }
        : {
            invoiceData,
            aggregatedData: mappedData,
            max: maxRange,
            totalCount,
          };
      return getResponse(
        res,
        1,
        'Invoices Fetched Successfully',
        200,
        responseData,
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to get invoices', 400, {}, {});
    }
  } catch (err) {
    return getResponse(res, 0, err?.message, 400, {}, {});
  }
};

// =================================== GET INVOICE BY ID =======================================
const getInvoiceData = async (req, res) => {
  try {
    const {
      user: { branchId = '' },
      params: { id, type },
      // query: { quote = false },
    } = req;

    const invoiceData = await orderService.getInvoiceData(id, branchId, +type);

    let paymentData = '';
    if (type === '1' || type === '2') {
      paymentData = await getWorkOrderPaymentDetails(id);
    } else {
      paymentData = await orderService.getPaidByData(id);
    }

    // const responseData = mapInvoiceData(invoiceData);
    const termsCondition = await termsService.getAll(branchId);
    return getResponse(
      res,
      1,
      'Invoice Fetched Successfully',
      200,
      { invoiceData, termsCondition, paymentData },
      {},
    );
  } catch (err) {
    console.log(err);
    return getResponse(res, 0, err?.message, 400, {}, {});
  }
};

const getQuotes = async (req, res) => {
  // req.query.quote = true;

  getInvoices(req, res);
};

const getQuoteData = async (req, res) => {
  // if (req.query?.negate) {
  //   // cause we need order data with draft false
  //   req.query.quote = false;
  // } else {
  //   req.query.quote = true;
  // }

  getInvoiceData(req, res);
};

const getNegateInvoiceData = async (req, res) => {
  req.query.quote = false; // cause quote converted to invoice and isDraft is set to false
  getInvoiceData(req, res);
};

const deleteQuote = async (req, res) => {
  try {
    const {
      user: { branchId = '' },
      params: { id },
    } = req;
    await orderItemService.deleteOrderItemByOrderId(id);
    await orderService.deleteOrder(id);
    return getResponse(res, 1, 'Quote Deleted Successfully', 200, {}, {});
  } catch (err) {
    console.log(err);
    return getResponse(res, 0, err?.message, 400, {}, {});
  }
};

// in updating order case updating inventory and creating invoice
const updatingInventoryInvoice = async (
  branchId,
  companyId,
  orderId,
  invoice,
  items,
) => {
  const invoiceData = invoice;

  const updateQty = await manageInventoryQty(items);
  invoiceData.orderId = orderId;
  invoiceData.branchId = branchId;
  invoiceData.companyId = companyId;
  invoiceData.paidAmount = invoiceData?.paidAmount;
  invoiceData.totalAmount = invoiceData?.totalAmount;

  const invoiceResponse = await createInvoice(invoiceData);

  return invoiceResponse;
};

const updateQuoteOrder = async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '', businessName, userId },
      body,
    } = req;
    const orderId = body.id;
    const type = body.type;
    delete body.id;
    // const isDraft = true;
    // console.log('>>>type', type);
    const orderData = await sortOrderData(body, companyId, branchId);
    // if (body?.updateOrder) {
    //   orderData.isDraft = false;
    // }
    const prevOrderData = await orderService.getOrderById(orderId);
    body?.paymentData?.onAccount > 0
      ? (orderData.openAmount =
          body?.paymentData?.onAccount + prevOrderData?.openAmount)
      : '';
    const updatedOrder = await orderService.updateOrder(orderData, orderId);
    const itemArray = body.items;
    await orderItemService.deleteOrderItemByOrderId(orderId);
    await storeOrderItemFee(itemArray, orderId);
    const paymentData = body.paymentData;

    if (body?.updateOrder) {
      const invoiceResponse = await updatingInventoryInvoice(
        branchId,
        companyId,
        orderId,
        body.invoice,
        itemArray,
      );
      paymentData.invoiceId = invoiceResponse.id;
      paymentData.orderId = orderId;

      await qbQue(
        invoiceResponse,
        itemArray,
        body?.customerId || null,
        body.totalDiscount,
        branchId,
        companyId,
        userId,
      );
      await Payment.create(paymentData);

      const termsCondition = await termsService.getAll(branchId);
      const _paymentData = await orderService.getPaidByData(orderId);
      const _invoiceData = await orderService.getInvoiceData(
        orderId,
        branchId,
        type,
      );

      if (paymentData?.deposit) {
        await updateCustomerDeposit(
          body?.customerId,
          paymentData?.deposit,
          branchId,
          paymentData?.remainingAmount || 0,
          'checkout',
        );
      }
      if (paymentData?.onAccount) {
        console.log(
          'onAccount',
          body?.customerId,
          paymentData?.onAccount,
          branchId,
        );
        await updateCustomerOnAccount(
          body?.customerId,
          paymentData?.onAccount,
          branchId,
        );
      }
      getResponse(
        res,
        1,
        'Order Saved Successfully',
        200,
        {
          invoiceData: _invoiceData,
          order: { id: orderId },
          invoice: invoiceResponse,
          termsCondition,
          paymentData: _paymentData,
        },

        {},
      );
    } else {
      if (updatedOrder) {
        let paymentData = {};
        let preWorkOrderDeposit = 0;

        // take deposit case

        if (body?.takeDeposit) {
          let createdUpdatedDepositData = await depositService(
            body?.customerId,
            body?.depositData,
            updatedOrder?.[1]?.[0]?.id,
            branchId,
          );

          paymentData = await getWorkOrderPaymentDetails(orderId);

          preWorkOrderDeposit = await getDeposit(
            body?.depositData?.id || createdUpdatedDepositData?.id,
          ); // update case ||create case
        }
        const updatedData = await orderService.getInvoiceData(
          orderId,
          branchId,
          +type,
        );

        console.log('>>>>preWorkOrderDeposit', preWorkOrderDeposit);
        return getResponse(
          res,
          1,
          'Quote Updated Successfully',
          200,
          {
            id: orderId,
            updatedData: updatedData,
            totalDeposit: +preWorkOrderDeposit?.totalAmount || 0,
            paymentData: paymentData,
          },
          {},
        );
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
    }
  } catch (err) {
    return getResponse(res, 0, err?.message, 400, {}, {});
  }
};

module.exports = {
  saveOrder,
  partialPayment,
  saveQuote,
  sendEmail,
  getInvoices,
  getQuotes,
  getInvoiceData,
  getQuoteData,
  deleteQuote,
  updateQuoteOrder,
  getNegateInvoiceData,
};
