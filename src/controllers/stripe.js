const stripe = require('../helpers/stripe');
const asyncHandler = require('express-async-handler');
const {
  subscribedPlanService,
  paymentMethodService,
  userService,
} = require('../services');
const { getResponse } = require('../helpers/response');
const { subscription_plan: SubscribedPlan } = require('../sequelize/models');

const { generateAuthToken } = require('../services/token.service');
const Email = require('../helpers/email');

// ===================================CREATING CUSTOMER=================================
const addCUstomer = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId, userId, email },
      body: {
        id,
        card: { exp_month, exp_year, last4 },
        billing_details: { name },
        priceId,
        planId,
      },
    } = req;
    const createCustomer = await stripe.createCustomer(email, name, id);
    if (createCustomer.status == 200) {
      const createSubscription = await stripe.createSubscription(
        createCustomer?.data?.id,
        priceId,
      );
      if (createSubscription.status == 200) {
        const stripeData = createSubscription?.data;
        // stripeData?.items?.data[0]?.id;
        const paymentData = {
          userId: userId,
          companyId,
          branchId,
          stripeCustomerId: createCustomer?.data?.id,
          stripePaymentId: id,
          exp_month,
          exp_year,
          cardHolderName: name,
          cardNumber: last4,
          isDefault: true,
        };
        const paymentMethod = await paymentMethodService.save(paymentData);
        const planData = {
          userId,
          companyId,
          branchId,
          subscriptionPlanId: planId,
          stripeSubscriptionId: stripeData?.id,
          stripePriceId: priceId,
          stripeItemId: stripeData?.items?.data[0]?.id,
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
          { subscribedPlan, paymentMethod },
          {},
        );
      } else {
        return getResponse(
          res,
          0,
          createSubscription.message,
          createSubscription.status,
          {},
          {},
        );
      }
    } else {
      return getResponse(
        res,
        0,
        createCustomer.message,
        createCustomer.status,
        {},
        {},
      );
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================ATTACHING CARD=================================
const addCard = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId, userId, email },
      body: {
        customerId,
        paymentMethodId,
        defaultMethod = false,
        card: { exp_month, exp_year, last4, cardHolderName, brand },
      },
    } = req;

    const attachCard = await stripe.attachPaymentMethod(
      customerId,
      paymentMethodId,
      defaultMethod,
    );
    if (attachCard.status == 200) {
      const paymentData = {
        userId: userId,
        companyId,
        branchId,
        stripeCustomerId: customerId,
        stripePaymentId: paymentMethodId,
        exp_month,
        exp_year,
        cardHolderName,
        cardNumber: last4,
        isDefault: defaultMethod,
        brand: brand === 'diners' ? 'dinersClub' : brand,
      };
      const paymentMethod = await paymentMethodService.save(paymentData);
      return getResponse(
        res,
        1,
        'Card added Successfully',
        200,
        { paymentMethod },
        {},
      );
    } else {
      return getResponse(res, 0, attachCard.message, attachCard.status, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================SET CARD TO DEFAULT=================================
const setDefaultCard = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId, userId, email },
      body: { customerId, paymentMethodId },
    } = req;

    const attachCard = await stripe.attachPaymentMethod(
      customerId,
      paymentMethodId,
      true,
    );
    if (attachCard.status == 200) {
      const paymentMethod = await paymentMethodService.setDefaultCard(
        customerId,
        paymentMethodId,
      );
      return getResponse(
        res,
        1,
        'Card added Successfully',
        200,
        { paymentMethod },
        {},
      );
    } else {
      return getResponse(res, 0, attachCard.message, attachCard.status, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================DELETING CARD=================================
const deleteCard = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId, userId, email },
      params: { id },
    } = req;
    const paymentMethod = await paymentMethodService.getById(
      id,
      companyId,
      branchId,
      userId,
    );
    const detachCard = await stripe.detachPaymentMethod(
      paymentMethod?.stripePaymentId,
    );
    if (detachCard.status == 200) {
      await paymentMethodService.deletePaymentMethod(id);
      return getResponse(res, 1, 'Card deleted Successfully', 200, { id }, {});
    } else {
      return getResponse(res, 0, attachCard.message, attachCard.status, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================CANCEL SUBSCRIPTION=================================
const cancelSubscription = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId, userId, email },
      body: { id },
    } = req;

    const subscription = await stripe.cancelSubscriptionAtPeriodEnd(id);
    if (subscription.status == 200) {
      return getResponse(
        res,
        1,
        `Subscription Cancelled you won't be charged from next billing cycle`,
        200,
        { id },
        {},
      );
    } else {
      return getResponse(
        res,
        0,
        subscription.message,
        subscription.status,
        {},
        {},
      );
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================UPDATE SUBSCRIPTION=================================
const updateSubscription = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId, userId },
      body: { stripePriceId, stripeCustomerId, planId, cancel_at_period_end },
    } = req;
    const currentSubscription = await subscribedPlanService.getSubscribedPlan(
      companyId,
      branchId,
    );
    let subscription;
    if (!cancel_at_period_end) {
      subscription = await stripe.updateSubscritpionPlan(
        currentSubscription?.stripeSubscriptionId,
        stripePriceId,
        currentSubscription?.stripeItemId,
      );
    } else {
      subscription = await stripe.createSubscription(
        stripeCustomerId,
        stripePriceId,
      );
    }
    if (subscription.status == 200) {
      if (cancel_at_period_end) {
        const stripeData = subscription?.data;
        const planData = await mapPlanData(
          companyId,
          branchId,
          planId,
          stripePriceId,
          stripeData,
        );
        [count, data] = await subscribedPlanService.updatePlan(
          planData,
          userId,
        );
      } else {
        [count, data] = await subscribedPlanService.updatePlan(
          { stripePriceId, subscriptionPlanId: planId },
          userId,
        );
      }
      const subscribedPlan = await subscribedPlanService.getSubscribedPlan(
        companyId,
        branchId,
      );
      return getResponse(
        res,
        1,
        `Subscription updated successfully`,
        200,
        subscribedPlan,
        {},
      );
    } else {
      return getResponse(
        res,
        0,
        subscription?.message,
        subscription?.status,
        {},
        {},
      );
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// ===================================PAY INVOICE=================================
const payInvoice = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId, userId, email },
      body: { paymentMethodId },
    } = req;
    const currentPaymentMethod = await paymentMethodService.getOne(
      userId,
      branchId,
    );
    const stripeCustomerId = currentPaymentMethod.stripeCustomerId;
    const attachCard = await stripe.attachPaymentMethod(
      stripeCustomerId,
      paymentMethodId,
      false,
    );
    if (attachCard.status == 200) {
      const invoices = await stripe.getInvoices(stripeCustomerId);
      if (invoices && invoices[0].status !== 'paid') {
        const payment = await stripe.payInvoice(
          invoices[0].id,
          paymentMethodId,
        );
        if (payment.status == 200) {
          const user = await userService.getUserById(userId);
          const token = await generateAuthToken(user);
          return getResponse(res, 1, 'Invoice paid', 200, {}, token);
        } else {
          return getResponse(
            res,
            0,
            'Payment not successfull please try again',
            400,
            {},
            {},
          );
        }
      } else {
        if (!invoices) {
          return getResponse(
            res,
            0,
            'No invoice found for this user',
            400,
            {},
            {},
          );
        }
        return getResponse(res, 1, 'Already Paid', 200, {}, {});
      }
    } else {
      return getResponse(res, 0, 'Unable to attach payment card', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

const mapPlanData = async (
  companyId,
  branchId,
  planId,
  priceId,
  stripeData,
) => {
  return {
    companyId,
    branchId,
    subscriptionPlanId: planId,
    stripeSubscriptionId: stripeData?.id,
    stripePriceId: priceId,
    stripeItemId: stripeData?.items?.data[0]?.id,
  };
};
module.exports = {
  addCUstomer,
  addCard,
  deleteCard,
  cancelSubscription,
  updateSubscription,
  payInvoice,
  setDefaultCard,
};
