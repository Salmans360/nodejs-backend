const express = require('express');
const router = express.Router();

const onAccount = require('../controllers/onAccount');

router.post('/', onAccount.addPayment);
router.get('/:id', onAccount.getById);


module.exports = router;
