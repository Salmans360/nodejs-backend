const express = require('express');

const router = express.Router();

const stripe = require('../controllers/stripe');

router.post('/customer', stripe.addCUstomer);
router.post('/addCard', stripe.addCard);
router.post('/removeCard/:id', stripe.deleteCard);
router.put('/cancelSubscription', stripe.cancelSubscription);
router.put('/updateSubscription', stripe.updateSubscription);
router.post('/payInvoice', stripe.payInvoice);
router.put('/setDefaultCard', stripe.setDefaultCard);
module.exports = router;
