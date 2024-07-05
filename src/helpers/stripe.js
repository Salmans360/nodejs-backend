require('dotenv').config();
const stripeKey =
  process.env.NODE_ENV == 'production'
    ? process.env.STRIPE_LIVE_KEY
    : process.env.STRIPE_TEST_KEY;
const stripe = require('stripe')(stripeKey, { apiVersion: '' });

const createCustomer = async (email, name, payment_method) => {
  let resData = {
    status: 200,
    message: 'Customer created successfully',
  };
  try {
    const customer = await stripe.customers.create({
      email: email,
      name,
      payment_method,
      invoice_settings: {
        default_payment_method: payment_method,
      },
    });

    if (customer?.id) {
      resData.data = customer;
      return resData;
    } else {
      resData.status = 403;
      resData.message = err.message
        ? err.message
        : 'Unable to create stripe customer';
      return resData;
    }
  } catch (err) {
    console.log('aaaaaa', err);
    resData.status = 403;
    resData.message = err.message
      ? err.message
      : 'Unable to create stripe customer';
    return resData;
  }
};

const createSubscription = async (custID, price) => {
  let resData = {
    status: 200,
    message: 'Subscription created successfully',
  };
  console.log(custID, '<<<<<<<<<< CREATE SUBS CUST ID>>>>>>>>>>>>>>>');
  try {
    let subscription = await stripe.subscriptions.create({
      customer: custID,
      items: [{ price: price }],
      trial_from_plan:true
    });
    if (subscription) {
      resData.data = subscription;
      return resData;
    } else {
      resData.status = 403;
      resData.message = 'Unable to create subscription';
      return resData;
    }
  } catch (err) {
    resData.status = 403;
    resData.message = err.message
      ? err.message
      : 'Unable to create subscription';
    return resData;
  }
};

const detachPaymentMethod = async (paymentMethodId) => {
  try {
    let resData = {
      status: 200,
      message: 'Payment method detached successfully',
    };
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    if (!paymentMethod) {
      resData.status = 403;
      resData.message = paymentMethod.message
        ? paymentMethod.message
        : 'Unable to detach payment method';
      return resData;
    }
    return resData;
  } catch (err) {
    console.error(err, '<<<<<<<< detach call err');
    resData.status = 403;
    resData.message = err.message
      ? err.message
      : 'Unable to detach payment method';
    return resData;
  }
};

const attachPaymentMethod = async (
  customerId,
  paymentMethodId,
  defaultMethod = false,
) => {
  let resData = {
    status: 200,
    message: 'Payment method attached successfully',
  };
  try {
    let attachCard;
    if (defaultMethod) {
      attachCard = await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    } else {
      attachCard = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    }
    if (!attachCard) {
      resData.status = 403;
      resData.message = attachCard?.message
        ? attachCard.message
        : 'Unable to attach payment method';
      return resData;
    } else {
      return resData;
    }
  } catch (err) {
    console.error(err, '<<<<< payment method attach call err');
    resData.status = 403;
    resData.message = err.message
      ? err.message
      : 'Unable to attach payment method';
    return resData;
  }
};

const getStatus = async (subscriptionId) => {
  //get subscription status
  let resData = {
    status: 200,
    message: `Subscription cancelled you won't be charged from next billing cycle`,
  };
  try {
    const subscriptionData = await stripe.subscriptions.retrieve(
      subscriptionId,
    );
    if (subscriptionData) {
      const stripeSubscriptionStatus = {
        status: subscriptionData?.status ? subscriptionData?.status : '',
        current_period_end: subscriptionData?.current_period_end
          ? subscriptionData?.current_period_end
          : '',
        current_period_start: subscriptionData?.current_period_start
          ? subscriptionData?.current_period_start
          : '',
        cancel_at_period_end: subscriptionData?.cancel_at_period_end
          ? subscriptionData?.cancel_at_period_end
          : '',
        cancel_at: subscriptionData?.cancel_at
          ? subscriptionData?.cancel_at
          : '',
        canceled_at: subscriptionData?.canceled_at
          ? subscriptionData?.canceled_at
          : '',
      };
      resData.data = stripeSubscriptionStatus;
      return resData;
    } else {
      resData.status = 400;
      resData.message = 'Unable to get subscription data';
      return resData;
    }
  } catch (err) {
    resData.status = 400;
    resData.message = err?.message || 'Unable to get subscription data';
    console.log(err);
  }
};

const cancelSubscriptionAtPeriodEnd = async (subscriptionId) => {
  try {
    let resData = {
      status: 200,
      message: `Subscription cancelled you won't be charged from next billing cycle`,
    };
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    if (!subscription) {
      resData.status = 403;
      resData.message = subscription.message
        ? subscription.message
        : 'Unable to cancel at this moment';
    }
    return resData;
  } catch (err) {
    resData.status = 403;
    resData.message = err.message
      ? err.message
      : 'Unable to cancel at this moment';
  }
};

const getInvoices = async (customerId) => {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
    });
    return invoices?.data;
  } catch (err) {
    return false;
  }
};

const updateSubscritpionPlan = async (
  subscriptionId,
  stripePriceId,
  subscriptionItemId,
) => {
  let resData = {
    status: 200,
    message: 'Success',
  };
  try {
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: false,
        proration_behavior: 'always_invoice',
        items: [
          {
            id: subscriptionItemId,
            price: stripePriceId,
          },
        ],
      },
    );
    resData.data = updatedSubscription;
    return resData;
  } catch (err) {
    resData.status = 400;
    resData.message = err.message;
    return resData;
  }
};

const payInvoice = async (id, paymentMethod) => {
  let resData = {
    status: 200,
    message: 'Success',
  };
  try {
    const payment = await stripe.invoices.pay(id, {
      payment_method: paymentMethod,
    });
    resData.data = payment;
    return resData;
  } catch (err) {
    resData.status = 400;
    resData.message = err.message;
    return resData;
  }
};

module.exports = {
  createCustomer,
  getStatus,
  createSubscription,
  getInvoices,
  detachPaymentMethod,
  attachPaymentMethod,
  cancelSubscriptionAtPeriodEnd,
  updateSubscritpionPlan,
  payInvoice,
};
