const asyncHandler = require('express-async-handler');
const { vehicleService } = require('../services');
const { getResponse } = require('../helpers/response');
const getVehicleByVin = require('../helpers/getVehicleByCarFax');
const getVehicleByCarfax = require('../helpers/getVehicleByCarFax');
require('dotenv').config();

// =================================== CREATING VEHICLE =================================
const addVehicle = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '' },
      body,
    } = req;
    const vehicle = await vehicleService.createVehicle(body, branchId);
    if (vehicle) {
      return getResponse(
        res,
        1,
        'Vehicle Created Successfully',
        200,
        vehicle,
        {},
      );
    } else {
      return getResponse(res, 0, 'Vehicle already created.', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// =================================== UPDATING VEHICLE =================================
const updateVehicle = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '' },
      body,
    } = req;
    const vehicle = await vehicleService.updateVehicle(body, branchId);
    if (vehicle) {
      return getResponse(
        res,
        1,
        'Vehicle Updated Successfully',
        200,
        vehicle,
        {},
      );
    } else {
      return getResponse(res, 0, 'Vehicle already created.', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// =================================== SEARCHING VEHICLE =================================
const searchVehicle = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId },
      query: { searchQuery },
    } = req;
    const vehicle = await vehicleService.searchVehicle(searchQuery, branchId);
    if (vehicle) {
      return getResponse(
        res,
        1,
        'Vehicle data received Successfully',
        200,
        vehicle,
        {},
      );
    } else {
      return getResponse(res, 0, 'Sonmething went wrong', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// =================================== GET ALL VEHICLES =================================
const getAll = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId },
      query: {
        searchQuery = false,
        searchType = false,
        page = 0,
        start = false,
        end = false,
        orderBy = false,
        order = 'DESC',
        allVehicles,
      },
    } = req;
    const vehicleData = await vehicleService.getAll(
      searchQuery,
      searchType,
      +page,
      start,
      end,
      orderBy,
      order,
      branchId,
      allVehicles,
    );
    if (vehicleData) {
      const { vehicle, count, vehicleTotal } = vehicleData;
      const totalVehicles = vehicleTotal?.dataValues?.total;
      return getResponse(
        res,
        1,
        'Vehicle data received Successfully',
        200,
        { vehicle, count, totalVehicles },
        {},
      );
    } else {
      return getResponse(res, 0, 'Sonmething went wrong', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

// =================================== SEARCHING VEHICLE BY VIN =================================

const searchByVin = asyncHandler(async (req, res) => {
  const {
    params: { vin = '' },
  } = req;
  const vinData = await getVehicleByCarfax(vin, '', 'vin');
  if (vinData) {
    return getResponse(res, 1, 'Vin retrieved succesfully', 200, vinData, {});
  } else {
    return getResponse(res, 0, 'Vin data not found', 400, {}, {});
  }
});
const searchByPlate = asyncHandler(async (req, res) => {
  const {
    params: { plate = '', state },
  } = req;
  const vinData = await getVehicleByCarfax(plate, state, 'plate');
  if (vinData) {
    return getResponse(
      res,
      1,
      'Plate lookup data retrieved succesfully',
      200,
      vinData,
      {},
    );
  } else {
    return getResponse(res, 0, 'plate data not found', 400, {}, {});
  }
});

const deleteVehicle = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId = '' },
      params: { id },
    } = req;

    const deletedId = await vehicleService.deleteVehicle(id);
    if (deletedId) {
      return getResponse(
        res,
        1,
        'Vehicle deleted Successfully',
        200,
        { deletedId },
        {},
      );
    } else {
      return getResponse(res, 0, 'Sonmething went wrong', 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, error?.message, 400, {}, {});
  }
});

const importVehicle = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId },
    } = req;

    const result = await vehicleService.importVehicleData(req.file, branchId);
    if (result.status === 200) {
      return getResponse(
        res,
        1,
        'Vehicle Data imported succesfully',
        200,
        result,
        {},
      );
    } else {
      return getResponse(res, 0, result.message, 400, {}, {});
    }
  } catch (error) {
    return getResponse(res, 0, 'Internal server Error', 400, {}, {});
  }
});

module.exports = {
  addVehicle,
  updateVehicle,
  searchVehicle,
  searchByVin,
  searchByPlate,
  getAll,
  deleteVehicle,
  importVehicle,
};
