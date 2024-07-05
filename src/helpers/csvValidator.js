const emailRegex = /^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i;
const validStringRegex = /^[A-Za-z0-9]+(?: +[A-Za-z0-9\/]+)*$/;
const regexForDecimalAndAlphabets = /^(\d*\.?\d)+[A-Za-z0-9]*$/;

const tireConfig = {
  headers: [
    // COLUMN VALIDATION CHECKS
    {
      name: 'SKU/Part Number*',
      inputName: 'sku',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Brand Name/Manufacturer',
      inputName: 'brand',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Description',
      inputName: 'description',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Tire Condition (Type "used" or "new")*',
      inputName: 'tireCondition',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Size*',
      inputName: 'size',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Cost*',
      inputName: 'cost',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      validate: function (value) {
        return value > 0;
      },

      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Retail Price*',
      inputName: 'retail',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      validate: function (value) {
        return value > 0;
      },
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Quantity*',
      inputName: 'qty',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      validate: function (value) {
        return value > 0;
      },
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Minimum Quantity*',
      inputName: 'minQty',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      optional: true,
    },
    {
      name: 'Bin Location',
      inputName: 'binLocation',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      optional: true,
    },
    {
      name: 'Vendor Name',
      inputName: 'vendor',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      optional: true,
    },
  ],
  header: true,
  delimiter: ',',
  skipEmptyLines: true,
  worker: false,
  encoding: 'utf-8',
  newline: '\n',
  transform: (value) => {
    return value.trim();
  },
  complete: (results) => {
    return results;
  },
  error: (error) => {
    return error;
  },
};

const wheelConfig = {
  headers: [
    // COLUMN VALIDATION CHECKS
    {
      name: 'SKU/Part Number*',
      inputName: 'sku',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Brand Name/Manufacturer',
      inputName: 'brand',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Description',
      inputName: 'description',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Wheel Size (Diameter x Width) *',
      inputName: 'size',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Cost*',
      inputName: 'cost',
      validate: function (value) {
        return parseInt(value) > 0;
      },
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },

      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Retail Price*',
      inputName: 'retail',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      validate: function (value) {
        return parseInt(value) > 0;
      },
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Quantity*',
      inputName: 'qty',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      validate: function (value) {
        return parseInt(value) > 0;
      },
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Minimum Quantity*',
      inputName: 'minQty',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      
      optional: true,
    },
    {
      name: 'Centre Bore/Offset',
      inputName: 'centerBor',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      optional: true,
    },
    {
      name: 'Bolt Pattern',
      inputName: 'boltPattern',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      optional: true,
    },
    {
      name: 'Bin Location',
      inputName: 'binLocation',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      optional: true,
    },
    {
      name: 'Vendor Name',
      inputName: 'vendor',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      optional: true,
    },
  ],
  header: true,
  delimiter: ',',
  skipEmptyLines: true,
  worker: false,
  encoding: 'utf-8',
  newline: '\n',
  transform: (value) => {
    return value.trim();
  },
  complete: (results) => {
    return results;
  },
  error: (error) => {
    return error;
  },
};
const MiscConfig = {
  headers: [
    // COLUMN VALIDATION CHECKS
    {
      name: 'SKU/Part Number*',
      inputName: 'sku',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Brand Name/Manufacturer',
      inputName: 'brand',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Description',
      inputName: 'description',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
    },

    {
      name: 'Cost*',
      inputName: 'cost',
      validate: function (value) {
        return parseInt(value) > 0;
      },
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },

      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Retail Price*',
      inputName: 'retail',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      validate: function (value) {
        return parseInt(value) > 0;
      },
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Quantity*',
      inputName: 'qty',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      validate: function (value) {
        return parseInt(value) > 0;
      },
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Minimum Quantity*',
      inputName: 'minQty',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      optional: true,
    },

    {
      name: 'Vendor Name',
      inputName: 'vendor',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      optional: true,
    },
    {
      name: 'Bin Location',
      inputName: 'binLocation',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      optional: true,
    },
  ],
  header: true,
  delimiter: ',',
  skipEmptyLines: true,
  worker: false,
  encoding: 'utf-8',
  newline: '\n',
  transform: (value) => {
    return value.trim();
  },
  complete: (results) => {
    return results;
  },
  error: (error) => {
    return error;
  },
};
const customerConfig = {
  headers: [
    // COLUMN VALIDATION CHECKS
    {
      name: 'First Name',
      inputName: 'firstName',
      validate: function (value) {
        return value ? validStringRegex.test(value) : true;
      },
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Last Name*',
      inputName: 'lastName',
      validate: function (value) {
        return validStringRegex.test(value);
      },
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Phone Number*',
      inputName: 'mobileNumber',
      validate: function (value) {
        return value.length > 9 && value.length < 12;
      },
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Email',
      inputName: 'email',
      validate: function (value) {
        return emailRegex.test(value);
      },
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Alternate Number',
      inputName: 'altNumber',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      validate: function (value) {
        return value ? value.length > 9 && value.length < 12 : true;
      },
    },
  ],
  header: true,
  delimiter: ',',
  skipEmptyLines: true,
  worker: false,
  encoding: 'utf-8',
  newline: '\n',
  transform: (value) => {
    return value.trim();
  },
  complete: (results) => {
    return results;
  },
  error: (error) => {
    return error;
  },
};

const vehicleConfig = {
  headers: [
    // COLUMN VALIDATION CHECKS
    {
      name: 'Make*',
      inputName: 'make',
      validate: function (value) {
        return validStringRegex.test(value);
      },
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Model*',
      inputName: 'model',
      validate: function (value) {
        return validStringRegex.test(value);
      },
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Year*',
      inputName: 'year',
      validate: function (value) {
        return value > 0;
      },
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Licence Plate*',
      inputName: 'licensePlate',
      validate: function (value) {
        return validStringRegex.test(value);
      },
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      required: true,
      requiredError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
      },
    },
    {
      name: 'Displacement',
      inputName: 'engineSize',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      validate: function (value) {
        return value ? regexForDecimalAndAlphabets.test(value) : true;
      },
    },
    {
      name: 'Color',
      inputName: 'color',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      validate: function (value) {
        return value ? validStringRegex.test(value) : true;
      },
    },
    {
      name: 'Vin',
      inputName: 'vin',
      validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`;
      },
      validate: function (value) {
        return value ? validStringRegex.test(value) : true;
      },
    },
  ],
  header: true,
  delimiter: ',',
  skipEmptyLines: true,
  worker: false,
  encoding: 'utf-8',
  newline: '\n',
  transform: (value) => {
    return value.trim();
  },
  complete: (results) => {
    return results;
  },
  error: (error) => {
    return error;
  },
};

module.exports = {
  tireConfig,
  wheelConfig,
  MiscConfig,
  customerConfig,
  vehicleConfig,
};
