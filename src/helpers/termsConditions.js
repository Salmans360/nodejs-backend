const Sequelize = require('sequelize');
const { terms_condition: TermsCondition } = require('../sequelize/models');

const saveTerms = async (branchId, companyId) => {
  try {
    await TermsCondition.create({
      companyId: companyId,
      branchId: branchId,
      checkboxes: [],
      workoder: `TERMS & CONDITIONS: No Salesperson's Verbal Agreement is Binding upon the Company (above named company). You are hereby authorized to deliver and/or install the above listed products according to terms and conditions stated on the face of this order. You and your employees may operate above listed vehicle for purposes of testing, Inspection or delivery at my risk. An express Mechanic's Lien is acknowledged on the above listed vehicle to secure the amount of products installed. You will not be held responsible for loss or damage to my vehicle, or articles left in it in case of fire, theft, accident or any other cause beyond your control. If suit is commenced to enforce payment of balance of this order, I, the purchaser, agree to pay such additional sums and Attorney's Fees, Court's Fees and collection costs. You, the above dealership, will not be held responsible for damages to wheels. I have read and approved the above order, price(s). I hereby acknowledge receipt of a copy hereof. specifications. ALL SALES ARE FINAL. NOTICE: We are not responsible for any goods left over 3 days from above date.
      I have Air Suspension (shocks) and Hydraulics.`,
      estimate: `TERMS & CONDITIONS: No Salesperson's Verbal Agreement is Binding upon the Company (above named company). You are hereby authorized to deliver and/or install the above listed products according to terms and conditions stated on the face of this order. You and your employees may operate above listed vehicle for purposes of testing, Inspection or delivery at my risk. An express Mechanic's Lien is acknowledged on the above listed vehicle to secure the amount of products installed. You will not be held responsible for loss or damage to my vehicle, or articles left in it in case of fire, theft, accident or any other cause beyond your control. If suit is commenced to enforce payment of balance of this order, I, the purchaser, agree to pay such additional sums and Attorney's Fees, Court's Fees and collection costs. You, the above dealership, will not be held responsible for damages to wheels. I have read and approved the above order, price(s). I hereby acknowledge receipt of a copy hereof. specifications. ALL SALES ARE FINAL. NOTICE: We are not responsible for any goods left over 3 days from above date.
            I have Air Suspension (shocks) and Hydraulics.`,
      invoice: `TERMS & CONDITIONS: No Salesperson's Verbal Agreement is Binding upon the Company (above named company). You are hereby authorized to deliver and/or install the above listed products according to terms and conditions stated on the face of this order. You and your employees may operate above listed vehicle for purposes of testing, Inspection or delivery at my risk. An express Mechanic's Lien is acknowledged on the above listed vehicle to secure the amount of products installed. You will not be held responsible for loss or damage to my vehicle, or articles left in it in case of fire, theft, accident or any other cause beyond your control. If suit is commenced to enforce payment of balance of this order, I, the purchaser, agree to pay such additional sums and Attorney's Fees, Court's Fees and collection costs. You, the above dealership, will not be held responsible for damages to wheels. I have read and approved the above order, price(s). I hereby acknowledge receipt of a copy hereof. specifications. ALL SALES ARE FINAL. NOTICE: We are not responsible for any goods left over 3 days from above date.
            I have Air Suspension (shocks) and Hydraulics.`,
    });

    return true;
  } catch (err) {
    console.log('hahahaha', err);
    return false;
  }
};
module.exports = { saveTerms };
