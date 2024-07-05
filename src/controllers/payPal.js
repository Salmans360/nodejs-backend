const asyncHandler = require('express-async-handler');
const { subscribedPlanService, userService } = require('../services');
const { getResponse } = require('../helpers/response');
const { subscription_plan: SubscribedPlan } = require('../sequelize/models');

const Email = require('../helpers/email');

// ===================================CREATING CUSTOMER=================================
const addCUstomer = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId, userId, email },
      body: { planId, payPalSubscriptionId, payPalPlanId },
    } = req;

    const planData = {
      userId,
      companyId,
      branchId,
      subscriptionPlanId: planId,
      paypalSubscriptionId: payPalSubscriptionId,
      paypalPlanId: payPalPlanId,
    };
    const subscribedPlan = await subscribedPlanService.save(planData);
    const userEmail = email;
    const user = await userService.getUserByEmail(userEmail);
    const userName = user?.firstName + ' ' + user?.lastName;
    const plan = await SubscribedPlan.findOne({ where: { id: planId } });
    const message = `<p>Dear concerned, new customer <b>${userName}</b> with email <b>${userEmail}</b> and phone <b>${
      user?.phone
    }</b> signed up for torque POS on <b>${plan?.name || ''} ${
      plan?.tenure || ''
    }</b> using signup form at ${new Date().toLocaleDateString()}</p> 
    <br/>
    <b> Torque360 Inc - Phone (917) 920-6645</b>`;
    // await new Email(user, '').sendLeadOfRegisteredUsers(message, true);
    return getResponse(
      res,
      1,
      'Subscribed to plan Successfully',
      200,
      { subscribedPlan },
      {},
    );
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

module.exports = {
  addCUstomer,
};
