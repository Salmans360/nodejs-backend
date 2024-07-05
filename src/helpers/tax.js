const Sequelize = require('sequelize');
const {
  tax_class: TaxClass,
  category_tax_class: CategoryTaxClass,
  category: Category,
} = require('../sequelize/models');

const saveTax = async (branchId, companyId) => {
  try {
    console.log('yessssss');
    const categories = await Category.findAll({ where: { isGlobal: true } });

    const taxData = [
      {
        name: 'Default Tax',
        type: 'product',
        tax: 7.75,
        status: true,
        isDefault: true,
        isDeleted: false,
        companyId: companyId,
        branchId: branchId,
      },
      // {
      //     name: 'Default Tax',
      //     type: 'labor',
      //     tax: 7.75,
      //     status: true,
      //     isDefault: true,
      //     isDeleted: false,
      //     companyId:companyId,
      //     branchId:branchId
      // },
    ];
    await TaxClass.bulkCreate(taxData);
    const taxClass = await TaxClass.findAll({ where: { branchId } });
    console.log('yessssss', taxClass);

    const categoryTaxData = [];
    categories.forEach((category) => {
      taxClass.forEach((tax) => {
        categoryTaxData.push({ taxId: tax?.id, categoryId: category?.id });
      });
    });
    await CategoryTaxClass.bulkCreate(categoryTaxData);
    console.log('yessssss', taxClass);

    return true;
  } catch (err) {
    console.log('hahahaha', err);
    return false;
  }
};
module.exports = { saveTax };
