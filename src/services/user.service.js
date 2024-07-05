const httpStatus = require('http-status');
const createHttpError = require('http-errors');
const { users: User, company } = require('../sequelize/models');
const { NOT_EXTENDED } = require('http-status');
const md5 = require('md5');
const { Op } = require('sequelize');

// const isEmailTaken = async function (email, excludeUserId) {
//   const user = await User.findOne({ where: { email } });
//   return user;
// };
const getUserByEmail = async (email) => {
  const user = await User.findOne({ where: { email: email } });
  return user;
};
const getUserById = async (id) => {
  const user = await User.findOne({
    where: { id: id },
    include: [
      {
        model: company,
        as: 'company',
        required: false,
      },
    ],
  });
  return user;
};
const createUser = async (userBody) => {
  if (
    await findUser({
      [Op.or]: [{ email: userBody.email }, { phone: userBody.phone }],
    })
  ) {
    // throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    return false;
  }

  return User.create(userBody);
};

const updateUser = async (userBody, companyData) => {
  const userData = await getUserByEmail(userBody.email);

  // adding company id in users table
  if (userData?.id && companyData?.id) {
    userData.companyId = companyData?.id;
    userData.save();
  }
};

const updatePassword = async (id, password, newPassword) => {
  try {
    const findUser = await User.findOne({
      where: { id, password: md5(password) },
    });
    if (findUser) {
      await User.update(
        { password: md5(newPassword) },
        {
          where: { id },
        },
      );
      return findUser;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

const setResetLink = async (link, id) => {
  await User.update({ passwordResetLink: link }, { where: { id } });
  return true;
};

const findUser = async (whereClause) => {
  return await User.findOne({ where: whereClause });
};

const updateUserData = async (userData, id) => {
  return await User.update(userData, { where: { id }, returning: true });
};
module.exports = {
  createUser,
  getUserByEmail,
  updateUser,
  getUserById,
  updatePassword,
  setResetLink,
  findUser,
  updateUserData,
};
