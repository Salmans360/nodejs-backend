const Sequelize = require('sequelize');
const { whereClauseCustomer } = require('../helpers/customer');

const {
  customer: Customer,
  order: Order,
  work_order_deposit: WorkOrderDeposit,
  vehicle: Vehicle,
  invoice: Invoice,
  payment: Payment,
  on_account_payment: OnAccountPayment,
  payment_transaction: PaymentTransaction,
  payment_term: Payment_Terms,
} = require('../sequelize/models');
const Op = Sequelize.Op;
const constants = require('../constants');
const db = require('../sequelize/models');
const {
  formatDateRange,
  mapDepositDataForTransactions,
  mapOrderDataForTransactions,
  mapPaymentDataForTransactions,
} = require('../helpers/common');
const Validator = require('csv-file-validator');
const { customerConfig } = require('../helpers/csvValidator');
const { calculateIgnoredRecordsFromCsv } = require('../utils');
const util = require('util');
const fs = require('fs');
const moment = require('moment');
// const isEmailTaken = async function (email, excludeUserId) {
//   const user = await User.findOne({ where: { email } });
//   return user;
// };
const getCustomerByPhone = async (mobileNumber, branchId) => {
  const user = await Customer.findOne({
    where: { mobileNumber, branchId, isDeleted: false },
  });
  return user;
};
const getCustomerById = async (id) => {
  const user = await Customer.findOne({
    where: { id },
  });
  return user;
};

const createCustomer = async (customerBody, branchId) => {
  if (await getCustomerByPhone(customerBody.mobileNumber, branchId)) {
    return false;
  }
  customerBody.branchId = branchId;
  customerBody.credit;
  customerBody.availableCredit = customerBody.credit || 0;
  if (+customerBody?.paymentTermDays === 30) {
    const currentData = moment().format(); // Now

    const nextDate = moment().add(30, 'days'); // next 30 days
    customerBody.startTime = currentData;
    customerBody.endTime = nextDate?.format();
  }
  return Customer.create(customerBody);
};

const updateCustomer = async (customerBody, branchId) => {
  const customerData = await getCustomerById(customerBody.id, branchId);
  console.log('>>>customerBody', customerBody);

  if (customerData.id == customerBody.id) {
    customerBody.branchId = branchId;
    customerBody.availableCredit =
      customerBody.credit || customerBody.availableCredit || 0;
    if (+customerBody?.paymentTermDays === 30 && !customerBody?.startTime) {
      const currentData = moment().format(); // Now

      const nextDate = moment().add(30, 'days'); // next 30 days
      customerBody.startTime = currentData;
      customerBody.endTime = nextDate?.format();
    }
    await Customer.update(customerBody, {
      where: { id: customerBody.id },
    });

    return customerBody;
  } else {
    return false;
  }
};
const searchCustomer = async (searchQuery, branchId) => {
  const customerData = await Customer.findAll({
    where: {
      [Op.or]: [
        {
          firstName: {
            [Op.iLike]: `%${searchQuery || ''}%`,
          },
        },
        {
          lastName: {
            [Op.iLike]: `%${searchQuery || ''}%`,
          },
        },
        {
          mobileNumber: {
            [Op.iLike]: `%${searchQuery || ''}%`,
          },
        },
        {
          company: {
            [Op.iLike]: `%${searchQuery || ''}%`,
          },
        },
      ],
      branchId,
      isDeleted: false,
    },
  });
  return customerData;
};

const getAll = async (
  searchQuery,
  searchType,
  page,
  start,
  end,
  orderBy,
  order,
  branchId,
  allCustomers,
) => {
  try {
    const limit = constants.LIMIT;
    const offset = limit * page;
    let customerWhere = `and c."branchId" = ${branchId} and c."isDeleted" = false`;
    let aggregatedWhere = { branchId: branchId, isDeleted: false };
    if (searchQuery) {
      customerWhere = whereClauseCustomer(
        searchType,
        customerWhere,
        searchQuery,
      );
    }
    if (start && end) {
      let rawFrom = start + ' 00:00:00';
      let rawTo = end + ' 23:59:59';
      aggregatedWhere = await formatDateRange(start, end, aggregatedWhere);
      customerWhere =
        customerWhere +
        ` and c."createdAt" between '${rawFrom}' and '${rawTo}'`;
    }
    let orderByClause = 'c."id" Desc';
    if (orderBy) {
      orderByClause =
        orderBy !== 'serviceDate'
          ? `c."${orderBy}" ${order}`
          : `o1."createdAt" ${order}`;
    }
    const customersQuery = `SELECT c.*, o1."createdAt" serviceDate
    FROM customers c
    left JOIN orders o1 ON (c."id" = o1."customerId")
    LEFT OUTER JOIN orders o2 ON (c."id" = o2."customerId" AND 
        (o1."createdAt" < o2."createdAt" OR (o1."createdAt" = o2."createdAt" AND o1."id" < o2."id")))
    WHERE o2."id" IS NULL ${customerWhere}  order by ${orderByClause} ${
      allCustomers ? '' : `limit ${limit} offset ${offset}`
    };`;
    const countQuery = `SELECT c.*, o1."createdAt" serviceDate
    FROM customers c
    left JOIN orders o1 ON (c."id" = o1."customerId")
    LEFT OUTER JOIN orders o2 ON (c."id" = o2."customerId" AND 
        (o1."createdAt" < o2."createdAt" OR (o1."createdAt" = o2."createdAt" AND o1."id" < o2."id")))
    WHERE o2."id" IS NULL ${customerWhere};`;
    const [customerData, CustomerMetaData] = await db.sequelize.query(
      customersQuery,
    );
    const [countData, CountMetaData] = await db.sequelize.query(countQuery);
    const customersCount = await Customer.findAll({
      attributes: [[Sequelize.fn('count', Sequelize.col('id')), 'total']],
      where: aggregatedWhere,
    });
    return {
      customer: customerData,
      count: countData.length,
      customerTotal: customersCount[0],
    };
  } catch (err) {
    console.log(err);
  }
};

const deleteCustomer = async (customerId) => {
  try {
    await Customer.update({ isDeleted: true }, { where: { id: customerId } });
    return { customerId };
  } catch (err) {
    console.log(err);
  }
};

const importCustomerData = async (requestFile, branchId) => {
  try {
    const readFile = util.promisify(fs.readFile);
    const parsed = await readFile(requestFile.path, 'utf-8');
    //Customer config to validate the Customer CSV
    const file = await Validator(parsed, customerConfig);

    const invalidData = file.inValidData || [];
    fs.unlinkSync(requestFile.path);

    //Find all the customer of that branch
    const customers = await Customer.findAll({
      where: {
        branchId,
        isDeleted: false,
      },
      attributes: ['mobileNumber'],
    });
    const customersPhoneNumberFromDb = customers?.map(
      (item) => item.mobileNumber,
    );

    //Calculating ignored Records
    const ignoredRecords = calculateIgnoredRecordsFromCsv(invalidData);

    //removing ignored records from file data
    //Removing the customers from the file which already exist in db
    const customerData = file?.data?.filter((data, index) => {
      if (
        !ignoredRecords.includes(index) &&
        !customersPhoneNumberFromDb?.includes(data?.mobileNumber)
      )
        return true;
    });

    //Removing the duplicates Customer in the CSV uploaded
    const filteredData = customerData?.filter(
      (value, index, array) =>
        array.findIndex((item) => item.mobileNumber === value.mobileNumber) ===
        index,
    );

    //Bulk create Customers with branch id
    const customerDataToInsert = filteredData?.map((item) => {
      return { ...item, branchId };
    });
    const insertedCustomers = await Customer.bulkCreate(customerDataToInsert, {
      returning: true,
    });

    return {
      customers: insertedCustomers,
      status: 200,
      errorsLength: file?.data?.length - customerDataToInsert?.length || 0,
      ignoredRecordsLength:
        file?.data?.length - customerDataToInsert?.length || 0,
    };
  } catch (error) {
    return { message: error?.message, status: 400 };
  }
};

const saveDeposit = async (depositData) => {
  return WorkOrderDeposit.create(depositData);
};

const updateDeposit = async (depositData) => {
  return WorkOrderDeposit.update(depositData, {
    where: { id: depositData.id },
  });
};
const getDeposit = async (id) => {
  const dep = await WorkOrderDeposit.findOne({
    where: { id },
  });
  return dep;
};

const getAllDeposits = async (
  searchQuery,
  searchType,
  page,
  start,
  end,
  orderBy,
  order,
  branchId,
  customerId,
) => {
  try {
    const limit = 30;
    const offset = limit * page;
    let depositWhere = {};
    if (searchType === 'woNumber') {
      depositWhere['workOrderId'] = Sequelize.literal(
        `CAST("workOrderId" AS TEXT) ILIKE '%${searchQuery}%'`,
      );
    }
    let from = new Date(start);
    from.setUTCHours(0, 0, 0, 0);
    let to = new Date(end);
    to.setUTCHours(23, 59, 59, 999);
    start
      ? (depositWhere['createdAt'] = {
          [Op.between]: [from, to],
        })
      : '';
    const depositData = await WorkOrderDeposit.findAll({
      where: { ...depositWhere },
      order: [['id', 'ASC']],
      limit: limit,
      offset: offset,
      include: [
        {
          model: Order,
          as: 'order',
          required: true,
          where: { customerId },
          include: [
            {
              model: Vehicle,
              as: 'vehicle',
              ...(searchType == 'licensePlate' && {
                required: true,
                where: {
                  licensePlate: {
                    [Op.iLike]: `%${searchQuery || ''}%`,
                  },
                },
              }),
            },
          ],
        },
      ],
    });
    const depositArray = await mapDepositDataForTransactions(depositData);
    return depositArray;
  } catch (err) {
    console.log(err);
  }
};

const getAllOrders = async (
  searchQuery,
  searchType,
  page,
  start,
  end,
  orderBy,
  order,
  branchId,
  customerId,
  orderType,
  openAmount = false,
) => {
  try {
    const limit = 30;
    const offset = limit * page;
    let orderWhere = { customerId };
    if (searchType === 'id') {
      orderWhere['id'] = Sequelize.literal(
        `CAST("id" AS TEXT) ILIKE '%${searchQuery}%'`,
      );
    }
    let from = new Date(start);
    from.setUTCHours(0, 0, 0, 0);
    let to = new Date(end);
    to.setUTCHours(23, 59, 59, 999);
    orderType && orderType != 'all' ? (orderWhere['type'] = orderType) : '';
    openAmount
      ? (orderWhere['openAmount'] = {
          [Op.gt]: 0,
        })
      : '';
    start
      ? (orderWhere['createdAt'] = {
          [Op.between]: [from, to],
        })
      : '';
    const orderData = await Order.findAll({
      where: { ...orderWhere },
      order: [['createdAt', 'ASC']],
      ...(!openAmount && { limit: limit, offset: offset }),
      include: [
        {
          model: Vehicle,
          as: 'vehicle',
          ...(searchType == 'licensePlate' && {
            required: true,
            where: {
              licensePlate: {
                [Op.iLike]: `%${searchQuery || ''}%`,
              },
            },
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
            'paymentTermDays',
            'availableCredit',
          ],
          include: [
            {
              model: Payment_Terms,
              // as: 'termCustomer',
            },
          ],
        },
        {
          model: Payment,
          as: 'orderPayments',
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
        },
      ],
    });
    const { returnArray, totalOpenAmount } = await mapOrderDataForTransactions(
      orderData,
    );
    const returnData = {
      returnArray: returnArray,
      totalOpenAmount: totalOpenAmount,
    };
    return returnData;
  } catch (err) {
    console.log(err);
  }
};

const getAllPayments = async (
  searchQuery,
  searchType,
  page,
  start,
  end,
  orderBy,
  order,
  branchId,
  customerId,
  openAmount,
) => {
  try {
    const limit = 30;
    const offset = limit * page;
    let paymentWhere = { customerId: customerId };
    if (searchType === 'id') {
      paymentWhere['id'] = Sequelize.literal(
        `CAST("id" AS TEXT) ILIKE '%${searchQuery}%'`,
      );
    }
    let from = new Date(start);
    from.setUTCHours(0, 0, 0, 0);
    let to = new Date(end);
    to.setUTCHours(23, 59, 59, 999);
    start
      ? (paymentWhere['createdAt'] = {
          [Op.between]: [from, to],
        })
      : '';
    openAmount
      ? (paymentWhere['openAmount'] = {
          [Op.ne]: 0,
        })
      : '';
    const paymentData = await OnAccountPayment.findAll({
      where: { ...paymentWhere },
      limit: limit,
      offset: offset,
      order: [['id', 'ASC']],
      include: [
        {
          model: PaymentTransaction,
          as: 'transactions',
        },
      ],
    });
    const { paymentMappedArray, paymentOpenAmount } =
      await mapPaymentDataForTransactions(paymentData);
    return {
      paymentArray: paymentMappedArray,
      paymentOpenAmount: paymentOpenAmount,
    };
  } catch (err) {
    console.log(err);
  }
};

const getAllTransactions = async (
  searchQuery,
  searchType,
  page,
  start,
  end,
  orderBy,
  order,
  branchId,
  customerId,
  dataType,
) => {
  const limit = 30;
  const results = [];
  if (dataType == 'all' || dataType == 'deposit') {
    const deposits = await getAllDeposits(
      searchQuery,
      searchType,
      page,
      start,
      end,
      orderBy,
      order,
      branchId,
      customerId,
    );
    results.push(...deposits);
  }
  if (
    dataType == 'all' ||
    dataType == 'invoice' ||
    dataType == 'estimate' ||
    dataType == 'w/o'
  ) {
    let orderType = false;
    dataType == 'invoice'
      ? (orderType = 3)
      : dataType == 'estimate'
      ? (orderType = 1)
      : dataType == 'w/o'
      ? (orderType = 2)
      : '';

    const { returnArray, totalOpenAmount } = await getAllOrders(
      searchQuery,
      searchType,
      page,
      start,
      end,
      orderBy,
      order,
      branchId,
      customerId,
      orderType,
      false,
    );
    results.push(...returnArray);
  }
  if (
    (dataType == 'all' || dataType == 'payment') &&
    searchType !== 'licensePlate'
  ) {
    const { paymentArray, paymentOpenAmount } = await getAllPayments(
      searchQuery,
      searchType,
      page,
      start,
      end,
      orderBy,
      order,
      branchId,
      customerId,
      false,
    );
    results.push(...paymentArray);
  }
  // Implement pagination logic for the combined results
  const calculateTotalPages = (data, pageSize) => {
    return Math.ceil(data.length / pageSize);
  };

  // Function to paginate the results
  const paginateResults = (data, currentPage, pageSize) => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  };
  const totalPages = calculateTotalPages(results, limit);
  const paginatedResults = paginateResults(results, page, limit);

  // Process the paginated results
  console.log('Total Pages:', totalPages);
  console.log('Current Page Results:', paginatedResults);

  return paginatedResults;

  // Function to calculate the total number of pages
};

const getOnAccountTransactions = async (
  searchQuery,
  searchType,
  page,
  start,
  end,
  orderBy,
  order,
  branchId,
  customerId,
) => {
  const limit = constants.LIMIT;
  const results = [];
  let totalOpAmount = 0;

  let orderType = 3;
  const { returnArray, totalOpenAmount } = await getAllOrders(
    searchQuery,
    searchType,
    page,
    start,
    end,
    orderBy,
    order,
    branchId,
    customerId,
    orderType,
    true,
  );
  results.push(...returnArray);
  totalOpenAmount ? (totalOpAmount = totalOpAmount + totalOpenAmount) : '';
  let paymentOpAmt = 0;
  const { paymentArray, paymentOpenAmount } = await getAllPayments(
    searchQuery,
    searchType,
    page,
    start,
    end,
    orderBy,
    order,
    branchId,
    customerId,
    true,
  );
  results.push(...paymentArray);
  paymentOpenAmount ? (paymentOpAmt = paymentOpAmt + paymentOpenAmount) : '';
  const returnData = {
    returnArray: results,
    invoiceOpen: totalOpAmount,
    paymentOpen: paymentOpAmt,
  };
  return returnData;

  // Function to calculate the total number of pages
};
module.exports = {
  createCustomer,
  getCustomerByPhone,
  getCustomerById,
  updateCustomer,
  searchCustomer,
  getAll,
  deleteCustomer,
  importCustomerData,
  saveDeposit,
  updateDeposit,
  getDeposit,
  getAllDeposits,
  getAllOrders,
  getAllTransactions,
  getOnAccountTransactions,
};
