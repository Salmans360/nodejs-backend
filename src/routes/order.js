const express = require('express');

const router = express.Router();

const order = require('../controllers/order');

router.post('/', order.saveOrder);
router.post('/partial-payment', order.partialPayment);
router.get('/invoice/:id/:type?', order.getInvoiceData);
router.get('/quote/:id/:type?', order.getQuoteData);
router.get('/quotes/:type?', order.getQuotes);
router.get('/invoices/:type?', order.getInvoices);
router.post('/quote', order.saveQuote);
router.put('/', order.updateQuoteOrder); // update quote
router.delete('/quote/:id', order.deleteQuote);
router.post('/share', order.sendEmail);
module.exports = router;
