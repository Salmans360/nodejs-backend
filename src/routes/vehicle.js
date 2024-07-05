const express = require('express');
const multer = require('multer');

const router = express.Router();

const vehicle = require('../controllers/vehicle');
const upload = multer({ dest: 'tmp/csv/' });

router.post('/', vehicle.addVehicle);
router.put('/', vehicle.updateVehicle);
router.get('/search', vehicle.searchVehicle);
router.delete('/:id', vehicle.deleteVehicle);
router.get('/', vehicle.getAll);
router.get('/search-by-vin/:vin', vehicle.searchByVin);
router.get('/search-by-plate/:plate/:state', vehicle.searchByPlate);
router.post('/import', upload.single('file'), vehicle.importVehicle);

module.exports = router;
