const db = require('../sequelize/models');
const Sequelize = require('sequelize');
const { whereClauseInventory } = require('../helpers/inventory');
const constants = require('../constants');

const dashboardData = async (branchId) => {
  try {
    //Remove sum of cost from here
    const combinedDataquery = `Select sum(qty) as qty,
    (select count(id) as id from inventories where "branchId" = ${branchId} and "qty" < "minQty" and "qty" > 0 and "deletedAt" is null and show=true ) as lowStock,
    (select count(id) as id from inventories where "branchId" = ${branchId} and "qty" = 0 and "deletedAt" is null and show=true ) as outOfStock
     from inventories where "branchId" = ${branchId} and "deletedAt" is null and show=true  group by "branchId"`;
    const [combinedData, combinedMetaData] = await db.sequelize.query(
      combinedDataquery
    );
    //Added total Cost here as we need total cost as  Sum (Quantity of that product * Cost of that product).
    const categoryWiseDataQuery = `select categories."name",categories."id" as categoryId,sum(inv1."qty") as qty,sum(inv1."qty" * inv1."cost") as "totalCost" ,count(inv2."id") as outOfStock,
    count(inv3."id") as lowStock from categories  
    left join products as pro1
    on pro1."categoryId" = categories."id" 
    left join inventories as inv1 
    on inv1."productId" = pro1."id" and inv1."branchId"=${branchId} and inv1."deletedAt" is null and inv1."show"=true
    left join inventories as inv2 
    on inv2."productId" = pro1."id" and inv2."branchId"=${branchId} and inv2."qty" =0 and inv2."deletedAt" is null and inv2."show"=true
    left join inventories as inv3 
    on inv3."productId" = pro1."id" and inv3."branchId"=${branchId} and inv3."qty" < inv3."minQty" and inv3."qty" > 0 and inv3."deletedAt" is null and inv3."show"=true 
    where categories."branchId"=${branchId} or categories."isGlobal" =true group by categories."name", categories."id" order by categories."id" Asc`;
    const [categoryWiseData, CategoryMetaData] = await db.sequelize.query(
      categoryWiseDataQuery
    );
    return { combinedData: combinedData[0], categoryWiseData };
  } catch (err) {
    return false;
  }
};
const getInventoryProducts = async (
  id,
  type,
  branchId,
  companyId,
  page = 0,
  filterBy,
  searchBy,
  searchQuery,
  allProducts,
  filterByTire
) => {
  try {
    let where = '';
    const limit = constants.LIMIT;
    const offset = page * limit;
    const whereClauseFilter = whereClauseInventory(
      filterBy,
      searchBy,
      searchQuery,
      filterByTire
    );
    if (type == 1) {
      where = `products."categoryId" = ${id}`;
    } else if (type == 2) {
      where = `products."subCategoryId" = ${id}`;
    }
    const aggregateQuery = `select count(inv1."id") as lowStock, 
    (select count(inv1."id") as id from products inner join
    inventories as inv1 on inv1."productId" = products."id" and inv1."branchId" = ${branchId} and inv1."deletedAt" is null and inv1."show"=true and inv1."qty" =0 ${
      where ? 'where ' + where : ''
    }) as outOfStock, 
    (select count(inv1."id") as id from products inner join
    inventories as inv1 on inv1."productId" = products."id" and inv1."branchId" = ${branchId} and inv1."deletedAt" is null and inv1."show"=true ${
      where ? 'where ' + where : ''
    } ${whereClauseFilter ? 'and ' + whereClauseFilter : ''}) as "totalCount"
    from products inner join
    inventories as inv1 on inv1."productId" = products."id" and inv1."deletedAt" is null and inv1."show"=true and inv1."branchId" = ${branchId} and inv1."qty" < inv1."minQty" and inv1."qty" > 0 ${
      where ? 'where ' + where : ''
    }  `;
    const [aggregatedData, AggregatedMetaData] = await db.sequelize.query(
      aggregateQuery
    );

    const productsQuery = `select products.*,inv1."qty" as qty,inv1."minQty",inv1."binLocation",inv1."warranty",inv1."notes",inv1."markup",
    inv1."cost" as cost,inv1."retail" as retail,inv1."vendor" as vendor,inv1."tireCondition",
    CASE
      WHEN inv1."qty" = 0 THEN true
      ELSE false
    END AS outOfStock,
    CASE
      WHEN inv1."qty" < inv1."minQty" and inv1."qty" > 0 THEN true
      ELSE false
    END AS lowStock,
    string_agg(prodFee."feeId"::text, ',') as feeId  
     from products inner join inventories as inv1
    on inv1."branchId" = ${branchId} and inv1."productId" = products."id" and inv1."deletedAt" is null and inv1."show"=true
    left join product_fees as prodFee
    on products."id"= prodFee."productId"  
    where products."companyId" = ${companyId} ${where ? 'and ' + where : ''} ${
      whereClauseFilter ? 'and ' + whereClauseFilter : ''
    } GROUP BY products."id",inv1."qty",inv1."minQty",inv1."cost",inv1."retail",inv1."vendor",inv1."binLocation",inv1."notes", inv1."id" order by inv1."id" desc ${
      allProducts ? '' : `limit ${limit} offset ${offset}`
    } `;

    const [productData, ProductMetaData] = await db.sequelize.query(
      productsQuery
    );
    return { aggregatedData: aggregatedData[0], products: productData };
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  dashboardData,
  getInventoryProducts,
};
