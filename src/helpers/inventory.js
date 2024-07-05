const whereClauseInventory = (
  filterBy,
  searchBy,
  searchQuery,
  filterByTire,
) => {
  let whereClauseFilterBy = '';
  if (filterBy === 'lowStock') {
    whereClauseFilterBy = `inv1."qty" < inv1."minQty" and inv1."qty" > 0`;
  } else if (filterBy === 'outOfStock') {
    whereClauseFilterBy = `inv1."qty" = 0`;
  }

  if (filterByTire === 'new' || filterByTire === 'used') {
    whereClauseFilterBy = whereClauseFilterBy
      ? ` ${whereClauseFilterBy} and `
      : '' + `inv1."tireCondition" iLike '%${filterByTire}%'`;
  }

  if (searchQuery && searchBy) {
    let searchClause = '';
    if (searchBy === 'all') {
      // searchClause = `${

      searchClause = `(
      inv1."binLocation" iLike '%${searchQuery}%' or
      inv1.vendor iLike '%${searchQuery}%' or
      products.sku iLike '%${searchQuery}%' or
      products.brand iLike '%${searchQuery}%' or 
      products.description iLike '%${searchQuery}%' or
      products.measurement iLike '%${searchQuery}%' or
      products.seasonality iLike '%${searchQuery}%' or 
      products.condition iLike '%${searchQuery}%')`;
      whereClauseFilterBy = whereClauseFilterBy
        ? `${whereClauseFilterBy} and ${searchClause}`
        : searchClause;
    } else {
      searchClause = `${
        searchBy === 'binLocation' || searchBy === 'vendor'
          ? 'inv1'
          : 'products'
      }."${searchBy}" ilike '%${searchQuery}%'`;
      whereClauseFilterBy = whereClauseFilterBy
        ? `${whereClauseFilterBy} and ${searchClause}`
        : searchClause;
    }
  }

  return whereClauseFilterBy;
};
module.exports = { whereClauseInventory };
