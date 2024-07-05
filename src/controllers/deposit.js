const asyncHandler = require('express-async-handler');
const { getById } = require('../services/deposit.service');
const {getResponse} =require('../helpers/response')
const { termsService } = require('../services');


const getDeposit = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '', companyId = '' },

      params: { id },
    } = req;
    console.log('>>>>>id', id);
    const depositData = await getById(id,branchId);

    if (depositData) {
        const term= await termsService.getAll(branchId);
        if(term){
      return getResponse(
        res,
        1,
        'Deposit data retrieved',
        200,
        { depositData,termsConditions:term },
        {},
      );
        }
    } else {
      return getResponse(res, 0, 'Unable to get deposit data', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

module.exports = {
getDeposit
};
