const express = require('express');

const router = express.Router();

const paymentTerms = require('../controllers/paymentTerms');

router.get('/', paymentTerms.getAll);
module.exports = router;
