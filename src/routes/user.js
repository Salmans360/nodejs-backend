const express = require('express');

const router = express.Router();

const user = require('../controllers/user');

router.get('/:id', user.getUser);
router.put('/changePassword', user.changePassword);
router.put('/', user.updateUser);

module.exports = router;
