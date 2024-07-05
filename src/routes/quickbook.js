const express = require('express');

const router = express.Router();

const quickBook = require('../controllers/quickbook');

router.post('/login', quickBook.loginQuickBook);

router.post('/generateToken', quickBook.generateAuthToken);
router.get('/getItems', quickBook.getItems);
router.put('/saveConfigs', quickBook.saveConfig);
module.exports = router;
