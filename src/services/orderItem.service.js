const httpStatus = require('http-status');
const { order_item: OrderItem } = require('../sequelize/models/index');
const deleteOrderItemByOrderId = async (orderId) => {
  await OrderItem.destroy({ where: { orderId: orderId } });
  return true;
};
module.exports = {
  deleteOrderItemByOrderId,
};
