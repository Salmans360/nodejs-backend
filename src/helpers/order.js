const Sequelize = require('sequelize');
const {
  order_item_fee: OrderItemFee,
  order_item: OrderItem,
} = require('../sequelize/models');
const order = require('../sequelize/models/order');
const Op = Sequelize.Op;

const storeOrderItemFee = async (itemArray, orderId) => {
  try {
    const itemData = [];

    itemArray.forEach((element) => {
      element.modelId = element.id;
      delete element.id;
      element.orderId = orderId;
      itemData.push(element);
    });
    console.log('>>>>>', itemData);
    const insertedProducts = await OrderItem.bulkCreate(itemData, {
      returning: true,
    });
    const feeArray = [];
    for (let i = 0; i < insertedProducts.length; i++) {
      itemArray[i].ProductFee?.forEach((feeElement) => {
        feeElement.orderItemId = insertedProducts[i].id;
        feeElement.feeId = feeElement.feeId;
        feeElement.amount = feeElement?.fee?.amount || 0;
        feeElement.name = feeElement.fee.name || '';
        feeElement.qty = feeElement.fee.qty || 1;
        feeElement.total = feeElement.fee.total || 0;
        feeElement.isCustomized = feeElement.fee.isCustomized || false;
        delete feeElement.id;
        feeArray.push(feeElement);
      });
    }
    OrderItemFee.bulkCreate(feeArray);
    return true;
  } catch (err) {
    console.log(err, 'uusuddududud');
    return false;
  }
};

const mapAggregatedData = async (aggregated, type) => {
  console.log('>>>type', type);
  const returnData = [];
  const totalSales = aggregated?.dataValues?.totalSales;
  const totalInvoices = aggregated?.dataValues?.totalInvoices;
  const totalTax = aggregated?.dataValues?.totalTax;
  const totalFee = aggregated?.dataValues?.totalFee;
  if (type === 1) {
    returnData.push(
      { label: 'Total Estimates', value: totalInvoices },
      { label: 'Total Estimated Sales', value: totalSales },
    );
  } else if (type === 2) {
    returnData.push(
      { label: 'Total Work Order', value: totalInvoices },
      { label: 'Total Estimated Sales', value: totalSales },
    );
  } else {
    returnData.push(
      { label: 'Total Invoices', value: totalInvoices },
      { label: 'Total Sales', value: totalSales },
      { label: 'Total Tax', value: totalTax },
      { label: 'Total Fees', value: totalFee },
    );
  }
  return returnData;
};
module.exports = { storeOrderItemFee, mapAggregatedData };
