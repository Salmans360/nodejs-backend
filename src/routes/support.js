const express = require('express');

const router = express.Router();

const supportController = require('../controllers/support');

router.post('/', supportController.sendSupportEmail);

module.exports = router;
