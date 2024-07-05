const express = require('express');

const router = express.Router();

const labor = require('../controllers/labor');

router.post('/', labor.saveLabor);
router.put('/', labor.updateLabor);
router.delete('/:id', labor.deleteLabor);
router.get('/all/:id', labor.getLaborsByCategory);
router.get('/search', labor.searchLabors);
router.put('/favourite', labor.favouriteLabor);
router.get('/favourite', labor.getFavorites);
module.exports = router;
