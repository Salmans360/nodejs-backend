const axios = require('axios');
require('dotenv').config();
const convert = require('xml-js');

const getVehicleByCarfax = async (vinOrPlate = '', state = '', type) => {
  try {
    const config = {
      headers: { 'Content-Type': 'text/xml', Accept: 'application/xml' },
    };
    let xmlBodyStr;
    if (type === 'vin') {
      xmlBodyStr = `<carfax-request>
        <license-plate></license-plate>
        <state></state>
        <vin>${vinOrPlate}</vin>
        <product-data-id>${process.env.CARFAX_PRODUCT_ID}</product-data-id>
        <location-id>CARFAX</location-id>
      </carfax-request>`;
    } else {
      xmlBodyStr = `<carfax-request>
      <license-plate>${vinOrPlate}</license-plate>
      <state>${state}</state>
      <vin></vin>
      <product-data-id>${process.env.CARFAX_PRODUCT_ID}</product-data-id>
      <location-id>CARFAX</location-id>
    </carfax-request>`;
    }

    let test = await axios.post(
      `${process.env.CARFAX_API_URL}`,
      xmlBodyStr,
      config,
    );
    const json = JSON.parse(
      convert.xml2json(test?.data, { compact: true, spaces: 4 }),
    );
    if (!json['carfax-response']) {
      return [];
    }

    const {
      'carfax-response': {
        quickvinplus: {
          'vin-info': { 'carfax-vin-decode': { trim } = '', vin } = '',
        } = '',
      },
    } = json;
    const vinLookupList = [];
    let vinLookup = {};
    // check if response sends array or object
    if (trim?.length) {
      for (const car of trim) {
        vinLookup = await mapData(car);
      }
    } else if (typeof trim == 'object' && trim != null) {
      vinLookup = await mapData(trim);
    } else {
      return [];
    }

    type === 'plate'
      ? ((vinLookup.vin = vin?._text || ''),
        (vinLookup.licensePlate = vinOrPlate || ''))
      : '';
    return vinLookup;
  } catch (err) {
    return false;
  }
};

const mapData = async (vinObj) => {
  const commaChar = ',';
  const spaceChar = ' ';
  let vinLookup = {};
  // mapping data from api response
  vinLookup.displacementL = vinObj?.['oem-displacement']
    ? (parseInt(vinObj?.['oem-displacement']['_cdata']) * 0.0163871).toFixed(1)
    : '';
  vinLookup.displacementCC = vinLookup.displacementL
    ? vinLookup.displacementL * 1000
    : '';
  vinLookup.make = vinObj?.['base-make-name']
    ? vinObj?.['base-make-name']['_cdata']
    : '';
  vinLookup.model = vinObj?.['oem-base-model']
    ? vinObj?.['oem-base-model']['_cdata']
    : '';
  vinLookup.year = vinObj?.['base-year-model']
    ? vinObj?.['base-year-model']['_cdata']
    : '';
  vinLookup.year = vinObj?.['base-year-model']
    ? vinObj?.['base-year-model']['_cdata']
    : '';
  vinLookup.engineSize = vinObj?.['oem-fuel'] ? vinLookup.displacementL : '';
  vinLookup.displayName =
    (vinLookup?.year || '') +
    spaceChar +
    (vinLookup?.make || '') +
    spaceChar +
    (vinLookup?.model || '') +
    spaceChar +
    vinLookup?.model +
    spaceChar +
    (vinLookup?.displacementL?.trim() || '');

  return vinLookup;
};

module.exports = getVehicleByCarfax;
