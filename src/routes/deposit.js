const express = require('express');
const router = express.Router();

const deposit = require('../controllers/deposit');

router.get('/:id', deposit.getDeposit);


module.exports = router;
