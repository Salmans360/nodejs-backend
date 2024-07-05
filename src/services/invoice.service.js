const Sequelize = require('sequelize');
const { invoice: Invoice } = require('../sequelize/models');

const createInvoice = async (invoiceData) => {
  const invoiceResponse = await Invoice.create(invoiceData);

  return invoiceResponse;
};

const updateInvoice = async (invoiceData) => {
  const { paidAmount, id, discount } = invoiceData;
  const invoiceResponse = await Invoice.update(
    { paidAmount, discount },
    { where: { id } },
  );
  return invoiceResponse;
};

module.exports = {
  createInvoice,
  updateInvoice,
};
