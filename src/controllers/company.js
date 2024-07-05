const asyncHandler = require('express-async-handler');
const { companyService, userService, tokenService } = require('../services');
const { getResponse } = require('../helpers/response');
const imageUpload = require('../helpers/uploadImage');
const md5 = require('md5');
const logger = require('../helpers/logger');
// ===================================CREATING COMPANY(ONBOARDING)=================================
const createCompany = asyncHandler(async (req, res) => {
  try {
    const userData = await userService.getUserByEmail(req.body.email);
    if (!userData?.companyId) {
      const company = await companyService.createCompany(req.body);
      const hashedPath = md5(company.id + company.businessName);
      if (company) {
        let logo = false;
        if (req.body.profileImg) {
          logo = await imageUpload(
            req.body.profileImg,
            `company/${company.id}/${hashedPath}/businessImage/business`,
          );
        }
        if (logo) {
          await companyService.updateCompany({
            ...company.dataValues,
            businessLogo: logo,
          });
        }

        const user = await userService.getUserByEmail(req.body.email);
        const companyData = await companyService.getCompanyDetails(company.id);
        const token = await tokenService.generateAuthToken(user);
        return getResponse(
          res,
          1,
          logo
            ? 'Company Created Successfully'
            : 'Business Image not uploaded please try again from settings',
          200,
          companyData,
          token,
        );
      } else {
        return getResponse(
          res,
          0,
          'Unable to create company at this time',
          400,
          {},
          {},
        );
      }
    } else {
      logger.error({ email: req?.body?.email, error: 'testtt' });
      return getResponse(
        res,
        0,
        'User with this email is already owner of a company',
        400,
        {},
        {},
      );
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================UPDATE COMPANY=================================
const updateCompany = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '', businessName },
      body,
    } = req;
    const companyData = body;
    const hashedPath = md5(companyData.id + businessName);
    let logo = false;
    if (
      companyData.businessLogo &&
      companyData?.businessLogo?.includes('base64')
    ) {
      logo = await imageUpload(
        companyData.businessLogo,
        `company/${companyId}/${hashedPath}/businessImage/business`,
      );
      logo ? (companyData.businessLogo = logo) : '';
    }
    console.log('>>>companyData', body);
    const [count, company] = await companyService.updateCompany(companyData);
    if (company) {
      return getResponse(
        res,
        1,
        logo
          ? 'Business Settings updated Successfully'
          : 'Business Image not uploaded please try again',
        200,
        company[0],
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to update', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

const getCompany = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '', businessName },
      body,
    } = req;
    const companyData = await companyService.getCompanyDetails(companyId);
    if (companyData) {
      return getResponse(
        res,
        1,
        'company details Fetched',
        200,
        companyData,
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to Fetch', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});
module.exports = {
  createCompany,
  updateCompany,
  getCompany,
};
