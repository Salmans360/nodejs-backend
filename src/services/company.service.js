const httpStatus = require('http-status');
const { saveGlobalFees } = require('../helpers/fee');
const { saveTax } = require('../helpers/tax');
const { saveTerms } = require('../helpers/termsConditions');
const { savePaymentTerms } = require('./paymentTerms.service');

const {
  company: Company,
  branch: Branch,
  users: User,
} = require('../sequelize/models');

const getCompanyDetails = async (compId) => {
  return await Company.findOne({ where: { id: compId } });
};

const createCompany = async (companyBody) => {
  const companyData = await Company.create(companyBody);
  const branchData = await Branch.create({
    companyId: companyData.id,
    isParent: true,
  });
  await User.update(
    { branchId: branchData.id, companyId: companyData?.id },
    { where: { email: companyBody?.email } },
  );
  await saveGlobalFees(branchData?.id);
  await saveTax(branchData?.id, companyData?.id);
  await saveTerms(branchData?.id, companyData?.id);
  await savePaymentTerms({
    branchId: branchData?.id,
    companyId: companyData?.id,
    name: 'Net 30',
    tenure: 30,
  });
  return companyData;
};

const updateCompany = async (companyData) => {
  const update = await Company.update(companyData, {
    where: { id: companyData.id },
    returning: true,
  });

  return update;
};
module.exports = {
  createCompany,
  getCompanyDetails,
  updateCompany,
};
