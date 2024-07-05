const express = require('express');

const router = express.Router();

const fee = require('../controllers/fee');

router.post('/', fee.addFee);
router.put('/', fee.updateFee);
router.get('/:categoryId', fee.getFee);
router.delete('/:id', fee.deleteFee);
module.exports = router;
