require('dotenv').config();

const getFrontendUrl = async () => {
  let link = '';
  switch (`${process.env.NODE_ENV}`) {
    case 'development':
      link = `${process.env.FRONTEND_URL_LOCAL}`;
      break;
    case 'feature':
      link = `${process.env.FRONTEND_URL_FEATURE}`;
      break;
    case 'production':
      link = `${process.env.FRONTEND_URL_PRODUCTION}`;
      break;
  }
  console.log(link, '<<<<<<<<<<<<< link here >>>>>>>>>>>');
  return link;
};

module.exports = { getFrontendUrl };
