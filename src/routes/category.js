const express = require('express');

const router = express.Router();

const category = require('../controllers/category');

router.get('/', category.getAllCategories);
router.get('/favourites/:categoryId', category.getAllFavourites);
router.put('/toggleFavourite', category.toggleFavourite);
module.exports = router;
