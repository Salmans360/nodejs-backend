const express = require('express');
const router = express.Router();

const inventory = require('../controllers/inventory');

router.get('/dashboard', inventory.getDashboardData);
router.get('/:id/:type', inventory.getProductByCategory);

module.exports = router;
