const express = require('express');

const router = express.Router();

const subscription = require('../controllers/subscription');

router.get('/', subscription.getData);
router.get('/getPlans', subscription.getPlans);

module.exports = router;
