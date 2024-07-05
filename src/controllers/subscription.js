const stripe = require('../helpers/stripe');
const asyncHandler = require('express-async-handler');
const {
  paymentMethodService,
  subscribedPlanService,
  subscriptionPlanService,
} = require('../services');
const { getResponse } = require('../helpers/response');

// ===================================GET SUBSCRIPTION DATA=================================
const getData = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId, userId, email },
    } = req;

    const [paymentMethod, subscribedPlan] = await Promise.all([
      paymentMethodService.getAll(userId, branchId),
      subscribedPlanService.getSubscribedPlan(companyId, branchId),
    ]);
    const subscriptionStatus = await stripe.getStatus(
      subscribedPlan.stripeSubscriptionId,
    );
    const customerId = paymentMethod[0]?.stripeCustomerId;
    if (paymentMethod && subscribedPlan) {
      const invoices = await stripe.getInvoices(customerId);
      const invoiceData = [];
      invoices.forEach((element) => {
        invoiceData.push({
          date: element?.period_start,
          amount: parseInt(element?.total) / 100,
          status: element?.status,
          link: element?.hosted_invoice_url,
        });
      });
      return getResponse(
        res,
        1,
        'Subscribed to plan Successfully',
        200,
        {
          subscribedPlan,
          paymentMethod,
          invoiceData,
          subscriptionStatus: subscriptionStatus?.data,
        },
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to get data', 400, {}, {});
    }
  } catch (error) {
    console.log('heheheheheheh', error);
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================GET SUBSCRIPTION PLANS=================================
const getPlans = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId, userId, email },
    } = req;

    const plans = await subscriptionPlanService.getSubscriptionPlans();
    if (plans) {
      return getResponse(
        res,
        1,
        'Subscribed to plan Successfully',
        200,
        plans,
        {},
      );
    } else {
      return getResponse(res, 0, 'Unable to get data', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

module.exports = {
  getData,
  getPlans,
};
