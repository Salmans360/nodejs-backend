const calculateIgnoredRecordsFromCsv = (invalidData) => {
  let ignoredRecords = [];
  invalidData.forEach((invalid) => {
    if (!ignoredRecords.includes(invalid.rowIndex - 2)) {
      ignoredRecords.push(invalid.rowIndex - 2);
    }
  });
  return ignoredRecords;
};

module.exports = {
  calculateIgnoredRecordsFromCsv,
};
