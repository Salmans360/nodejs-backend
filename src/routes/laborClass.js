const express = require('express');

const router = express.Router();

const laborClass = require('../controllers/laborClass');

router.post('/', laborClass.createLaborClass);
router.put('/', laborClass.updateLaborClass);
router.get('/', laborClass.getLaborClasses);

module.exports = router;
