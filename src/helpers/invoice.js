const Sequelize = require('sequelize');
const { Op, fn, col } = Sequelize;

const whereClauseInvoice = (type, where, searchQuery) => {
  console.log('>>>>>1');
  let query;
  switch (type) {
    case 'customer':
      if (searchQuery) {
        query = searchQuery.replace(/\s/g, '');
        where['nameQuery'] = Sequelize.where(
          fn('concat', col('customer.firstName'), col('customer.lastName')),
          {
            [Op.iLike]: `%${query}%`,
          },
        );
      } else {
        where['customerId'] = { [Op.ne]: null };
      }
      break;
    case 'vehicle':
      if (searchQuery) {
        query = searchQuery.replace(/\s/g, '');
        where[Op.or] = [
          {
            vehicleQuery: Sequelize.where(
              fn('concat', col('year'), col('make'), col('model')),
              {
                [Op.iLike]: `%${query}%`,
              },
            ),
          },
          {
            vehicleQuery: Sequelize.where(
              fn('concat', col('year'), col('make')),
              {
                [Op.iLike]: `%${query}%`,
              },
            ),
          },
          {
            vehicleQuery: Sequelize.where(
              fn('concat', col('make'), col('model')),
              {
                [Op.iLike]: `%${query}%`,
              },
            ),
          },
        ];
      } else {
        where['vehicleId'] = { [Op.ne]: null };
      }
      break;
    case 'walkIn':
      where['customerId'] = null;
      break;
    case 'carriedAway':
      where['vehicleId'] = null;
      break;
    // case 'salesMan':
    //   where['salesRep'] = {
    //     [Op.iLike]: `%${searchQuery}%`,
    //   };
    //   break;
    case 'licensePlate':
      where['licensePlate'] = {
        [Op.iLike]: `%${searchQuery}%`,
      };
      break;
    default:
      break;
  }
  console.log('yeyeye', where);
  return where;
};

const generateOrderByClause = async (orderBy, order, quote) => {
  let orderStatement;
  switch (orderBy) {
    case 'customer':
      orderStatement = ['customer', 'firstName', order];
      break;
    case 'vehicle':
      orderStatement = ['vehicle', 'year', order];
      break;
    case 'invoiceNo':
      orderStatement = quote ? ['id', order] : ['invoice', 'id', order];
      break;
    case 'date':
      orderStatement = quote
        ? ['createdAt', order]
        : ['invoice', 'createdAt', order];
      break;
    case 'quoteNo':
      orderStatement = ['id', order];
      break;
    default:
      orderStatement = ['id', 'Asc'];
      break;
  }
  return orderStatement;
};
module.exports = { whereClauseInvoice, generateOrderByClause };
