const httpStatus = require('http-status');
const md5 = require('md5');
const asyncHandler = require('express-async-handler');
const Email = require('../helpers/email');
const bcrypt = require('bcryptjs');
const { getFrontendUrl } = require('../helpers/frontendUrl');
const { userService, tokenService, authService } = require('../services');
const { getResponse } = require('../helpers/response');
require('dotenv').config();

// ===================================CREATING USER(SIGN UP)=================================
const register = asyncHandler(async (req, res) => {
  try {
    const user = await userService.createUser({
      ...req.body,
      password: md5(req.body?.password),
    });
    if (!user) {
      return getResponse(res, 0, 'Email/Phone already taken', 400, {}, {});
    }
    const token = await tokenService.generateAuthToken(user);
    const userEmail = user?.email;
    const userName = user?.firstName + ' ' + user?.lastName;
    const message = `<p>Dear concerned, new customer <b>${userName}</b> with email <b>${userEmail}</b> and phone <b>${
      user?.phone
    }</b> signed up for torque using signup form at ${new Date().toLocaleDateString()}</p> 
    <br/>
   <b> Torque360 Inc - Phone (917) 920-6645</b>`;
   if (process.env.NODE_ENV === 'production') { 
   await new Email(user, '').sendLeadOfRegisteredUsers(message);
   }
    return getResponse(res, 1, 'User Created Successfully', 200, user, token);
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================SIGN IN=================================
const logIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('>>>>>sin, ', req.body);
    const user = await authService.loginUserWithEmailAndPassword(
      email,
      password,
    );
    if (!user) {
      return getResponse(
        res,
        0,
        'Incorrect Email or Password',
        httpStatus.UNAUTHORIZED,
        {},
        {},
      );
    } else {
      const token = await tokenService.generateAuthToken(user);
      return getResponse(
        res,
        1,
        'User Logged In Successfully',
        200,
        user,
        token,
      );
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================RESET PASSWORD=================================
const resetPassword = asyncHandler(async (req, res) => {
  const { password, key } = req.body;
  try {
    if (!key) {
      return getResponse(
        res,
        0,
        'Invalid request',
        httpStatus.UNAUTHORIZED,
        {},
        {},
      );
    }
    const user = await userService.findUser({ passwordResetLink: key });
    if (!user) {
      return getResponse(
        res,
        0,
        'Invalid request',
        httpStatus.UNAUTHORIZED,
        {},
        {},
      );
    } else {
      const updatedPassword = md5(password);
      await userService.updateUserData(
        {
          password: updatedPassword,
          passwordResetLink: null,
        },
        user?.id,
      );
      return getResponse(res, 1, 'Password updated Successfully', 200, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================CHANGE PASSWORD=================================
const sendPasswordLink = asyncHandler(async (req, res) => {
  try {
    const {
      body: { email },
    } = req;
    const userData = await userService.getUserByEmail(email);
    if (userData && userData.id) {
      const userId = userData?.id;
      let passwordResetLink = await bcrypt.hash(email + process.env.KEY, 12);
      passwordResetLink = await passwordResetLink.replaceAll('/', '||');
      await userService.setResetLink(passwordResetLink, userId);
      const baseURL = await getFrontendUrl();
      const hashedLink = baseURL + '/resetpassword?key=' + passwordResetLink;
      await new Email(userData, hashedLink).sendPasswordResetEmail();

      return getResponse(res, 1, 'Password reset link sent', 200, userData, {});
    } else {
      return getResponse(
        res,
        1,
        'User with this email does not exist',
        400,
        {},
        {},
      );
    }
  } catch (error) {
    console.log(error);
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

module.exports = {
  register,
  logIn,
  resetPassword,
  sendPasswordLink,
};
