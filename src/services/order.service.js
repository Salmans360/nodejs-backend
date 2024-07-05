const Sequelize = require('sequelize');
const {
  order: Order,
  order_item: OrderItem,
  customer: Customer,
  vehicle: Vehicle,
  invoice: Invoice,
  order_item_fee: OrderItemFee,
  product: Product,
  labor: Labor,
  inventory: Inventory,
  category: Category,
  payment: Payment,
  work_order_deposit: WorkOrderDeposit,
} = require('../sequelize/models');
const { storeOrderItemFee, mapAggregatedData } = require('../helpers/order');
const {
  whereClauseInvoice,
  generateOrderByClause,
} = require('../helpers/invoice');
const Op = Sequelize.Op;
const constants = require('../constants');
const { format } = require('morgan');
const { formatDateRange } = require('../helpers/common');
const order = require('../sequelize/models/order');
const saveOrder = async (orderObj, type) => {
  try {
    // type 1 for quote and 2 for order
    const { orderData, itemData } = orderObj;
    orderData.isDraft = type == 1 ? true : false;
    const order = await Order.create(orderData);
    if (order) {
      const itemArray = await storeOrderItemFee(itemData, order.id);
      if (itemArray) {
        return order;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

const getAllInvoices = async (
  searchQuery,
  searchType,
  page,
  start,
  end,
  orderBy,
  order,
  min,
  max,
  branchId,
  quoteOrWO,
  allQuotes,
  type,
) => {
  try {
    // where for orders table
    let invoiceWhere = {};
    // where for invoice table
    let invoiceNoWhere = {};
    if (
      (searchType && searchType !== 'licensePlate') ||
      searchType === 'walkIn' ||
      searchType === 'carriedAway' ||
      searchType === 'vehicle' ||
      searchType === 'customer' ||
      (searchType && searchQuery && searchType !== 'licensePlate')
    ) {
      invoiceWhere = whereClauseInvoice(searchType, invoiceWhere, searchQuery);
      quoteOrWO;
    }
    let dateFilter = false;
    if (start && end) {
      dateFilter = true;
      quoteOrWO
        ? (invoiceWhere = await formatDateRange(start, end, invoiceWhere))
        : (invoiceNoWhere = await formatDateRange(start, end, invoiceNoWhere));
    }
    let orderByClause;
    if (orderBy) {
      orderByClause = await generateOrderByClause(orderBy, order, quoteOrWO);
    }
    if (min && max) {
      quoteOrWO
        ? (invoiceWhere['totalPayAble'] = {
            [Op.between]: [+min, +max],
          })
        : (invoiceNoWhere['totalAmount'] = {
            [Op.between]: [+min, +max],
          });
    } else if (!min && max) {
      quoteOrWO
        ? (invoiceWhere['totalPayAble'] = {
            [Op.lte]: +max,
          })
        : (invoiceNoWhere['totalAmount'] = {
            [Op.lte]: +max,
          });
    } else if (!max && min) {
      quoteOrWO
        ? (invoiceWhere['totalPayAble'] = {
            [Op.gte]: +min,
          })
        : (invoiceNoWhere['totalAmount'] = {
            [Op.gte]: +min,
          });
    }
    if (searchQuery && searchType == 'id') {
      quoteOrWO
        ? (invoiceWhere['id'] = Sequelize.where(
            Sequelize.cast(Sequelize.col('order.id'), 'varchar'),
            {
              [Op.iLike]: `%${searchQuery}%`,
            },
          ))
        : (invoiceNoWhere['id'] = Sequelize.where(
            Sequelize.cast(Sequelize.col('invoice.id'), 'varchar'),
            {
              [Op.iLike]: `%${searchQuery}%`,
            },
          ));
    }
    if (searchQuery && searchType == 'salesMan') {
      invoiceNoWhere['salesRep'] = Sequelize.where(
        Sequelize.cast(Sequelize.col('invoice.salesRep'), 'varchar'),
        {
          [Op.iLike]: `%${searchQuery}%`,
        },
      );
    }

    let licenseWhere = false;
    if (searchQuery && searchType == 'licensePlate') {
      licenseWhere = {};
      licenseWhere = whereClauseInvoice(searchType, licenseWhere, searchQuery);
    }
    invoiceWhere['branchId'] = branchId;
    invoiceWhere['type'] = type;
    // invoiceWhere['isDraft'] = quoteOrWO ? true : false;
    const [invoiceData, aggregatedData, totalCount] = await Promise.all([
      findOrders(
        page,
        invoiceWhere,
        invoiceNoWhere,
        orderBy,
        orderByClause,
        quoteOrWO,
        allQuotes,
        licenseWhere,
      ),
      getOrderSums(branchId, start, end, dateFilter, type),
      getfilteredCount(invoiceWhere, invoiceNoWhere, quoteOrWO, licenseWhere),
    ]);
    let responseData;
    responseData = { invoiceData, aggregatedData, totalCount };
    return responseData;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const findOrders = async (
  page,
  invoiceWhere,
  invoiceNoWhere,
  orderBy,
  orderByClause,
  quoteOrWO,
  allQuotes,
  licenseWhere,
) => {
  try {
    console.log(licenseWhere);
    const limit = constants.LIMIT;
    const offset = limit * page;
    const invoiceData = Order.findAll({
      where: { ...invoiceWhere },
      ...(!allQuotes && { limit: limit, offset: offset }),

      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: [
            'firstName',
            'lastName',
            'totalDeposit',
            'balance',
            'availableCredit',
            'paymentTermDays',
            'overDue',
          ],
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['make', 'model', 'year', 'licensePlate'],
          required: false,
          ...(licenseWhere && {
            where: licenseWhere,
            required: true,
          }),
        },
        {
          model: Invoice,
          as: 'invoice',
          attributes: [
            'id',
            'salesRep',
            'totalAmount',
            'createdAt',
            'paymentMethod',
            'paidAmount',
            'discount',
          ],
          required: !quoteOrWO,
          ...(invoiceNoWhere && {
            where: invoiceNoWhere,
          }),
        },
      ],
      ...(orderBy && { order: [[orderByClause]] }),
      ...(!orderBy && { order: [['id', 'Desc']] }),
    });
    return invoiceData;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const getOrderSums = async (branchId, start, end, dateFilter, type) => {
  try {
    let aggregated;
    let orderWhere = { branchId: branchId, type }; //isDraft: draft
    let invoiceWhere = { branchId: branchId };
    // estimate || work Order
    if (type === 1 || type === 2) {
      dateFilter
        ? (orderWhere = await formatDateRange(start, end, orderWhere))
        : '';
      aggregated = await Order.findAll({
        attributes: [
          [Sequelize.fn('count', Sequelize.col('id')), 'totalInvoices'],
          [Sequelize.fn('sum', Sequelize.col('totalPayAble')), 'totalSales'],
          [Sequelize.fn('sum', Sequelize.col('totalTax')), 'totalTax'],
          [Sequelize.fn('sum', Sequelize.col('totalFee')), 'totalFee'],
          [Sequelize.fn('max', Sequelize.col('totalPayAble')), 'maxAmount'],
        ],
        where: orderWhere,
      });
    } else {
      dateFilter
        ? (invoiceWhere = await formatDateRange(start, end, invoiceWhere))
        : '';
      aggregated = await Order.findAll({
        attributes: [
          [Sequelize.fn('count', Sequelize.col('order.id')), 'totalInvoices'],
          [Sequelize.fn('sum', Sequelize.col('totalPayAble')), 'totalSales'],
          [Sequelize.fn('sum', Sequelize.col('totalTax')), 'totalTax'],
          [Sequelize.fn('sum', Sequelize.col('totalFee')), 'totalFee'],
          [Sequelize.fn('max', Sequelize.col('totalPayAble')), 'maxAmount'],
        ],
        include: [
          {
            model: Invoice,
            as: 'invoice',
            attributes: [],
            required: true,
            where: invoiceWhere,
          },
        ],
        where: orderWhere,
        group: 'order.branchId',
      });
    }

    const mappedData = await mapAggregatedData(aggregated[0], type);
    return { mappedData, maxRange: aggregated[0]?.dataValues.maxAmount };
  } catch (err) {
    console.log(err);
    return false;
  }
};

const getfilteredCount = async (
  invoiceWhere,
  invoiceNoWhere,
  quote,
  licenseWhere,
) => {
  try {
    const invoiceData = await Order.findAll({
      where: invoiceWhere,
      include: [
        {
          model: Invoice,
          as: 'invoice',
          attributes: ['id', 'salesRep', 'totalAmount', 'createdAt'],
          required: !quote,
          ...(invoiceNoWhere && {
            where: invoiceNoWhere,
          }),
        },
        {
          model: Customer,
          as: 'customer',
          attributes: [
            'firstName',
            'lastName',
            'totalDeposit',
            'balance',
            'availableCredit',
            'paymentTermDays',
          ],
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['make', 'model', 'year', 'licensePlate'],
          required: false,
          ...(licenseWhere && {
            where: licenseWhere,
            required: true,
          }),
        },
      ],
    });
    return invoiceData.length;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const getPaidByData = async (orderId) => {
  try {
    const paidByData = await Payment.findAll({
      attributes: [
        [Sequelize.literal('SUM(deposit)'), 'deposit'],
        [Sequelize.literal('SUM(cash)'), 'cash'],
        [Sequelize.literal('SUM(cheque)'), 'cheque'],
        [Sequelize.literal('SUM("debitCard")'), 'debitCard'],
        [Sequelize.literal('SUM("creditCard")'), 'creditCard'],
        [Sequelize.literal('SUM("financing")'), 'financing'],
        [Sequelize.literal('SUM("onAccount")'), 'onAccount'],
      ],
      where: { orderId: orderId },
    });
    return paidByData[0];
  } catch (err) {
    console.log(err);
    return false;
  }
};

const getInvoiceData = async (id, branchId, type) => {
  try {
    const orderData = Order.findOne({
      where: { branchId: branchId, id: id, type }, //isDraft: quote
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: [
            'id',
            'email',
            'firstName',
            'lastName',
            'mobileNumber',
            'company',
            'customerType',
            'totalDeposit',
            'isTaxExempt',
            'paymentTermDays',
            'balance',
            'availableCredit',
            'used',
          ],
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: [
            'id',
            'make',
            'model',
            'year',
            'licensePlate',
            'engineSize',
            'mileageIn',
          ],
        },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'products',
              include: [
                {
                  model: Inventory,
                  as: 'inventory',
                  // where: { branchId: branchId, deletedAt: null },
                  // required: true,
                },
                {
                  model: Category,
                  as: 'category',
                  attributes: ['id', 'name'],
                  required: true,
                },
              ],
            },
            { model: Labor, as: 'labors' },

            { model: OrderItemFee, as: 'orderItemFee' },
          ],
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['make', 'model', 'year', 'licensePlate', 'vin'],
        },
        {
          model: Invoice,
          as: 'invoice',
          attributes: [
            'id',
            'salesRep',
            'totalAmount',
            'createdAt',
            'paymentMethod',
            'paidAmount',
            'notes',
            'discount',
          ],
          // required: !quote,
        },

        {
          model: WorkOrderDeposit,
          as: 'deposit',
        },
      ],
    });
    return orderData;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const deleteOrder = async (orderId) => {
  Order.destroy({ where: { id: orderId } });
  return true;
};

const updateOrder = async (body, orderId) => {
  console.log('>>>>>df', body, orderId);
  const updatedQuote = await Order.update(body, {
    where: { id: orderId },
    returning: true,
  });
  return updatedQuote;
};

const getOrderById = async (orderId) => {
  const orderData = await Order.findOne({ where: { id: orderId } });
  return orderData;
};
module.exports = {
  saveOrder,
  getAllInvoices,
  getInvoiceData,
  deleteOrder,
  updateOrder,
  getPaidByData,
  getOrderById,
};
