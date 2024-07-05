const express = require('express');

const router = express.Router();

const terms = require('../controllers/terms-conditions');

router.post('/', terms.addTermsConditions);
router.put('/', terms.updateTermsConditions);
router.get('/', terms.getTermsConditions);
module.exports = router;
