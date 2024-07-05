const express = require('express');

const router = express.Router();

const servicePackage = require('../controllers/servicePackage');

router.post('/', servicePackage.addPackage);
router.put('/', servicePackage.updatePackage);
router.delete('/:id', servicePackage.deletePackage);
router.get('/:id', servicePackage.getPackageById);
router.get('/', servicePackage.getPackages);
router.get('/all/count', servicePackage.getPackagesCount);
router.put('/toggleFavorite', servicePackage.toggleFavorite);

module.exports = router;
