const express = require('express');

const router = express.Router();

const payPal = require('../controllers/payPal');

router.post('/customer', payPal.addCUstomer);
module.exports = router;
