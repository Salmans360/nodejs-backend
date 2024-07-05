const express = require('express');
const multer = require('multer');
const router = express.Router();
const customer = require('../controllers/customer');
const upload = multer({ dest: 'tmp/csv/' });

router.post('/', customer.addCustomer);
router.put('/', customer.updateCustomer);
router.get('/search', customer.searchCustomer);
router.get('/', customer.getAll);
router.get('/get-transactions', customer.getTransactions);
router.get('/get-onaccount-transactions', customer.getOnAccountTransactions);
router.post('/import', upload.single('file'), customer.importCustomers);

router.delete('/:id', customer.deleteCustomer);
module.exports = router;
