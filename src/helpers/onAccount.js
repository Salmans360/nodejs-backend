const Sequelize = require('sequelize');
const {
  payment_transaction: Transactions,
  order: Order,
  on_account_payment:Payment,
  customer
} = require('../sequelize/models');
const {getCustomerById,updateCustomer} = require('../services/customer.service')
const moment = require('moment');

const storeTransactions = async (transactionArray, paymentId,totalAmount,customerId,branchId) => {
  try {
    const transactionData = [];
    const updateOrderArray=[];
    const updatePaymentArray=[];
    for (let index = 0; index < transactionArray.length; index++) {
      const element = transactionArray[index];
      if(transactionArray[index].modelType == 'order')
      {
        updateOrderArray.push({id:transactionArray[index].modelId,openAmount:transactionArray[index].newOpenAmount})   
      }
      else if(transactionArray[index].modelType == 'payment'){
        updatePaymentArray.push({id:transactionArray[index].modelId,openAmount:transactionArray[index].newOpenAmount})   
      }
      transactionData.push({ ...element, paymentId });
    }
    console.log('yayayayay',updateOrderArray,updatePaymentArray)
    const insertedtransactions = await Transactions.bulkCreate(transactionData);
    if(updateOrderArray.length){
      await Order.bulkCreate(
        updateOrderArray,
        {
          updateOnDuplicate: ["openAmount"],
        }
      );
    }
    if(updatePaymentArray.length){
      await Payment.bulkCreate(
        updatePaymentArray,
        {
          updateOnDuplicate: ["openAmount"],
        }
      );
    }
    const customerData= await getCustomerById(customerId);
    let balance=customerData?.balance - totalAmount;
    let availableCredit=customerData?.availableCredit + totalAmount;
    let overDue=customerData.overDue;  
    let startTime=customerData?.startTime;
    let endTime=customerData?.endTime;
    try{
    if(customerData.overDue == true && balance <= 0)
    {
      const currentData = moment(customerData?.endTime).add(1,'day').format(); // Now
      const nextDate = moment(customerData?.endTime).add(30, 'days').format(); // next 30 days
      startTime = currentData;
      endTime = nextDate;
      overDue=customerData.overDue && balance <= 0 ? false:customerData.overDue;
    }
  }catch(err){
    console.log(err)
  }
    await updateCustomer(
      { availableCredit: +availableCredit,balance:+balance,overDue, startTime,endTime,id: customerId },
      branchId,
    );
    return true;
  } catch (err) {
    return false;
  }
};
module.exports = { storeTransactions };
