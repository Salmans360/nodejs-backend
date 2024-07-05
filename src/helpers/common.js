const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const formatDateRange = async (start, end, invoiceWhere) => {
  let from = new Date(start);
  from.setUTCHours(0, 0, 0, 0);
  let to = new Date(end);
  to.setUTCHours(23, 59, 59, 999);
  invoiceWhere['createdAt'] = {
    [Op.between]: [from, to],
  };
  return invoiceWhere;
};

const mapDepositDataForTransactions = async (depositArray) => {
  let returnArray = [];
  for (let i = 0; i < depositArray.length; i++) {
    let licensePlate = '';
    depositArray[i]?.order?.vehicle?.licensePlate
      ? (licensePlate = depositArray[i].order.vehicle.licensePlate)
      : '';
    let depositObj = {
      date: depositArray[i]?.createdAt,
      type: 'Deposit',
      workOrderNo: depositArray[i]?.workOrderId,
      invoiceStatus: '',
      licensePlate: licensePlate,
      openAmount: 0,
      remainingAmount: 0,
      totalAmount: depositArray[i].totalAmount,
    };
    returnArray.push(depositObj);
  }
  return returnArray;
};
const mapPaymentDataForTransactions = async (paymentArray) => {
  let returnArray = [];
  let openAmount = 0;
  for (let i = 0; i < paymentArray.length; i++) {
    let paymentObj = {
      date: paymentArray[i]?.createdAt,
      type: 'Payment',
      workOrderNo: '',
      invoiceStatus: '',
      licensePlate: '',
      openAmount: paymentArray[i]?.openAmount,
      remainingAmount: 0,
      totalAmount: paymentArray[i].totalAmount,
      transactions: paymentArray[i]?.transactions,
      paymentId: paymentArray[i].id,
    };
    openAmount = openAmount + paymentArray[i]?.openAmount;
    returnArray.push(paymentObj);
  }
  return { paymentMappedArray: returnArray, paymentOpenAmount: openAmount };
};
const mapOrderDataForTransactions = async (orderArray) => {
  let returnArray = [];
  let totalOpenAmount = 0;
  for (let i = 0; i < orderArray.length; i++) {
    let orderType = '';
    let openAmount = 0;
    let paymentStatus = '';
    let discount = 0;
    orderArray[i]?.type == 1
      ? (orderType = 'Estimate')
      : orderArray[i]?.type == 2
      ? (orderType = 'W/O')
      : orderArray[i]?.type == 3
      ? (orderType = 'Invoice')
      : '';
    orderArray[i].type == 3 &&
      (orderArray[i]?.invoice?.paidAmount + orderArray[i]?.invoice?.discount >=
      orderArray[i]?.invoice?.totalAmount
        ? (paymentStatus = 'Fully Paid')
        : (paymentStatus = 'Partial Paid'));
    if (orderArray[i].type == 3) {
      openAmount = orderArray[i].openAmount;
    }
    let remainingAmount = 0;
    orderArray[i].type == 3
      ? (remainingAmount =
          orderArray[i]?.invoice?.totalAmount -
          orderArray[i]?.invoice?.paidAmount -
          orderArray[i]?.invoice?.discount)
      : '';
    let licensePlate = '';
    orderArray[i]?.vehicle?.licensePlate
      ? (licensePlate = orderArray[i].vehicle.licensePlate)
      : '';
    totalOpenAmount = totalOpenAmount + openAmount;
    discount = orderArray[i]?.invoice?.discount;
    let orderObj = {
      date: orderArray[i]?.createdAt,
      type: orderType,
      workOrderNo: orderArray[i]?.id,
      invoiceStatus: '',
      licensePlate: licensePlate,
      openAmount: openAmount,
      remainingAmount: remainingAmount,
      totalAmount: orderArray[i].totalPayAble,
      paymentStatus,
      invoice: orderArray[i],
      discount,
    };
    returnArray.push(orderObj);
  }
  return { returnArray, totalOpenAmount };
};
module.exports = {
  formatDateRange,
  mapDepositDataForTransactions,
  mapOrderDataForTransactions,
  mapPaymentDataForTransactions,
};
