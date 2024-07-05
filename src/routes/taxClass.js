const express = require('express');

const router = express.Router();

const taxClass = require('../controllers/taxClass');

router.post('/', taxClass.createTaxClass);
router.put('/', taxClass.updateTaxClass);
router.get('/', taxClass.getTaxClasses);
router.delete('/:id', taxClass.deleteTaxClass);
module.exports = router;
