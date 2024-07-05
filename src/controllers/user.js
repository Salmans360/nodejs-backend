const asyncHandler = require('express-async-handler');
const { userService } = require('../services');
const { getResponse } = require('../helpers/response');
const md5 = require('md5');
const imageUpload = require('../helpers/uploadImage');

require('dotenv').config();

// ===================================GET USER=================================
const getUser = asyncHandler(async (req, res) => {
  try {
    const {
      params: { id: userId },
    } = req;
    const userData = await userService.getUserById(userId);
    if (userData) {
      return getResponse(res, 1, 'User fetched succesfully', 200, userData, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================CHANGE PASSWORD=================================
const changePassword = asyncHandler(async (req, res) => {
  try {
    const {
      body: { id, password, newPassword },
    } = req;
    const userData = await userService.updatePassword(
      id,
      password,
      newPassword,
    );
    if (userData) {
      return getResponse(res, 1, 'Password updated', 200, userData, {});
    } else {
      return getResponse(res, 0, 'Wrong Password', 200, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================UPDATE USER=================================
const updateUser = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '', businessName, userId },
      body,
    } = req;
    const userData = body;
    const hashedPath = md5(companyId + businessName);
    let logo = false;
    if (userData.profileImg && userData.profileImg?.includes('base64')) {
      logo = await imageUpload(
        userData.profileImg,
        `company/${companyId}/${hashedPath}/${branchId}/${userId}/profileImg`,
      );
      logo ? (userData.profileImg = logo) : '';
    }
    const [count, updatedUser] = await userService.updateUserData(
      userData,
      userData?.id,
    );
    if (count && updatedUser) {
      return getResponse(
        res,
        1,
        logo
          ? 'Account Settings updated Successfully'
          : 'Account Image not uploaded please try again',
        200,
        updatedUser[0],
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to update', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});
module.exports = {
  getUser,
  changePassword,
  updateUser,
};
