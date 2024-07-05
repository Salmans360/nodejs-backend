const express = require('express');

const router = express.Router();

const report = require('../controllers/report');

router.get('/dayend', report.getDayEnd);

router.get('/dayend/cardDetails', report.getCardDetails);
router.get('/salesTax', report.getSalesTax);
router.get('/dayend/breakDown', report.getBreakDownData);
router.get('/fee', report.getfeeData);

module.exports = router;
