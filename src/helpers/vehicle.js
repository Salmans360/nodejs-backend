const Sequelize = require('sequelize');
const { Op, fn, col } = Sequelize;

const whereClauseVehicle = (type, where, searchQuery) => {
  switch (type) {
    case 'vehicle':
      let query = searchQuery.replace(/\s/g, '');
      where =
        where + ` and CONCAT(v."make", v."model") iLike '%${query || ''}%'`;
      break;
    case 'year':
      where =
        where +
        ` and CAST (v."year" AS varchar) iLike '%${searchQuery || ''}%'`;
      break;
    case 'displacement':
      where = where + ` and v."engineSize" iLike '%${searchQuery || ''}%'`;
      break;
    case 'color':
      where = where + ` and v."color" iLike '%${searchQuery || ''}%'`;
      break;
    case 'licensePlate':
      where = where + ` and v."licensePlate" iLike '%${searchQuery || ''}%'`;
      break;
    case 'vin':
      where = where + ` and v."vin" iLike '%${searchQuery || ''}%'`;
      break;
    default:
      break;
  }
  return where;
};

module.exports = { whereClauseVehicle };
