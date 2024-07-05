const Sequelize = require('sequelize');
const { Op, fn, col } = Sequelize;

const whereClauseCustomer = (type, where, searchQuery) => {
  switch (type) {
    case 'name':
      let query = searchQuery.replace(/\s/g, '');
      where =
        where +
        ` and CONCAT(REPLACE(c."firstName",' ',''), REPLACE(c."lastName",' ',''),REPLACE(c."company",' ','')) iLike '%${query || ''}%'`;
      break;
    case 'email':
      where = where + ` and c."email" iLike '%${searchQuery || ''}%'`;
      break;
    case 'phoneNumber':
      where = where + ` and c."mobileNumber" iLike '%${searchQuery || ''}%'`;
      break;
      case 'all':
      let query2 = searchQuery.replace(/\s/g, '');
        where =
          where +
           ` and (CONCAT(REPLACE(c."firstName",' ',''), REPLACE(c."lastName",' ',''),REPLACE(c."company",' ','')) iLike '%${query2 || ''}%' or c."email" iLike '%${
            searchQuery || ''
          }%' or c."mobileNumber" iLike '%${searchQuery || ''}%')`;
          break;
    default:
      break;
  }
  return where;
};

module.exports = { whereClauseCustomer };
