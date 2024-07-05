const express = require('express');

const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'tmp/csv/' });
const product = require('../controllers/product');

router.post('/', product.saveProduct);
router.get('/:id/:type', product.getProductByCategory);
router.put('/toggleFavourite', product.toggleFavourite);
router.put('/', product.updateProduct);
router.put('/inventory-quantity', product.updateBulkQuantity);
router.get('/favourite', product.getFavourite);
router.get('/search', product.search);
router.get('/sku', product.searchExistingSku);
router.post('/import', upload.single('file'), product.importProducts);
router.delete('/:id', product.deleteProduct);
module.exports = router;
