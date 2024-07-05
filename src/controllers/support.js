const asyncHandler = require('express-async-handler');

const Email = require('../helpers/email');
const { getResponse } = require('../helpers/response');
const {
  subscription_plan: SubscriptionPlan,
  users: User,
  subscribed_plan: SubscribedPlan,
} = require('../sequelize/models');

const sendSupportEmail = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId, userId, email },
    } = req;
    const user = await User.findOne({
      where: {
        id: userId,
      },
      include: {
        model: SubscribedPlan,
        include: {
          model: SubscriptionPlan,
          as: 'SubscriptionPlan',
        },
      },
    });
    const userName = user?.firstName + ' ' + user?.lastName;
    const planName = user.subscribed_plan?.SubscriptionPlan?.planName;
    const tenure = user.subscribed_plan?.SubscriptionPlan?.tenure;
    const message = `<p>User <b>${userName}</b>, has requested support related to payment issues.</p> <br/> 
    
    <p>Plan: ${planName} [${tenure}]</p>
    <br/>
   <p> Date: ${new Date().toLocaleDateString()}</p>
   <br/>
    <p>Time: ${new Date().toLocaleTimeString()}</p> `;
    // const planName
    await new Email(user, '').sendCustomerSupportEmail(message);
    return getResponse(res, 1, 'Email sent to Customer Support', 200, {}, {});
  } catch (error) {
    console.log('heheheheheheh', error);
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

module.exports = {
  sendSupportEmail,
};
