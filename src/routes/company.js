const passport = require('passport');
const express = require('express');

const router = express.Router();

const companyController = require('../controllers/company');

router.post('/', companyController.createCompany);
router.put('/', companyController.updateCompany);
router.get('/', companyController.getCompany);
module.exports = router;
