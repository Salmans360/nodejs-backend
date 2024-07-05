const asyncHandler = require('express-async-handler');
const sequelize = require('sequelize');
const db = require('../sequelize/models');

const { getResponse } = require('../helpers/response');
const {
  order: Order,
  order_item: OrderItem,
  order_item_fee: OrderItemFee,
  product: Product,
  category: Category,
  tax_class: TaxClass,
  fee: Fee,
} = require('../sequelize/models');

const getDayEnd = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId, userId, email },
      query: { start = false, end = false },
    } = req;
    let now = new Date();
    now = now.setUTCHours(0, 0, 0, 0);

    let from = new Date(start);
    from.setUTCHours(0, 0, 0, 0);
    let to = new Date(end);
    to.setUTCHours(23, 59, 59, 999);
    let rawFrom = start + ' 00:00:00';
    let rawTo = end + ' 23:59:59';

    const getCategoryWise = await OrderItem.findAll({
      attributes: [
        [sequelize.literal('SUM(price * qty)'), 'totalAmount'],
        // 'order_items."type"',
      ],
      group: ['order_item."type"'],
      // order: [['"order_item"."type"', 'DESC']],
      include: [
        {
          model: Order,
          as: 'order',
          where: {
            // isDraft: false,
            type: 3,
            companyId: companyId,

            ...(start && {
              createdAt: {
                [sequelize.Op.between]: [from, to],
              },
            }),
          },
          required: true,
          attributes: [],
        },
      ],
    });
    // console.log('yahoooo',getCategoryWise[0].type,getCategoryWise[1])
    const totals = await Order.findAll({
      where: {
        // isDraft: false,
        type: 3,
        companyId: companyId,

        ...(start && {
          createdAt: {
            [sequelize.Op.between]: [from, to],
          },
        }),
      },
      attributes: [
        [sequelize.literal('SUM("totalFee")'), 'totalFee'],
        [sequelize.literal('SUM("totalTax")'), 'totalTax'],
        [sequelize.literal('SUM("totalDiscount")'), 'totalDiscount'],
        [sequelize.literal('SUM("totalPayAble")'), 'totalPayAble'],
        [sequelize.literal('SUM("totalProfit")'), 'totalProfit'],
        [sequelize.literal('SUM("totalPayAble" - "totalTax")'), 'subTotal'],
        [sequelize.literal('COUNT(id)'), 'totalInvoices'],
      ],
    });

    let dateWhereRaw = start
      ? `and "orders"."createdAt" >= '${rawFrom}' AND "orders"."createdAt" <= '${rawTo}'`
      : '';

    const fetQuery = `select sum(fet) as Amount from order_items 
    left join products on products."companyId"=${companyId} and products."id" = "modelId" and order_items."type"='product'
    inner join orders on orders."id" = order_items."orderId" 
    left join categories on categories."id"= products."categoryId" where orders."type"=3 and orders."companyId"=${companyId} ${dateWhereRaw};`;
    const [fetData, fetMetaData] = await db.sequelize.query(fetQuery);
    console.log('fet', fetData);
    let headerCards,
      otherCards = [];
    const fetAmt = fetData[0].amount ? fetData[0].amount : 0;
    if (getCategoryWise.length) {
      headerCards = [
        { label: 'Today Invoices', value: totals[0].dataValues.totalInvoices },
        { label: 'Today Sales', value: totals[0].dataValues.totalPayAble },
        { label: 'Today Profit', value: totals[0].dataValues.totalProfit },
      ];
      otherCards = [
        {
          label: 'Total Products',
          value:
            getCategoryWise[1] && getCategoryWise[1].dataValues.totalAmount
              ? getCategoryWise[1].dataValues.totalAmount
              : 0,
          percentage:
            getCategoryWise[1] && getCategoryWise[1].dataValues.totalAmount
              ? (getCategoryWise[1].dataValues.totalAmount /
                  totals[0].dataValues.totalPayAble) *
                100
              : 0,
        },
        {
          label: 'Total Labor',
          value: getCategoryWise?.[0]
            ? getCategoryWise[0].dataValues.totalAmount
            : 0,
        },
        {
          label: 'Total Tax',
          value: totals[0]?.dataValues?.totalTax,
        },
        {
          label: 'Total FET',
          value: fetAmt,
        },
        {
          label: 'Total Fees',
          value: totals[0]?.dataValues?.totalFee,
        },
      ];
      let subValue =
        otherCards[0]?.value +
        otherCards[1]?.value +
        otherCards[2]?.value +
        otherCards[3]?.value +
        otherCards[4]?.value;
      otherCards[0].percentage = (otherCards[0]?.value / subValue) * 100;
      otherCards[1].percentage = (otherCards[1]?.value / subValue) * 100;
      otherCards[2].percentage = (otherCards[2]?.value / subValue) * 100;
      otherCards[3].percentage = (otherCards[3]?.value / subValue) * 100;
      otherCards[4].percentage = (otherCards[4]?.value / subValue) * 100;
      otherCards.push(
        {
          label: 'Sub Total',
          value: subValue,
          percentage: 100,
        },
        {
          label: 'Total Discount',
          value: totals[0].dataValues.totalDiscount,
          percentage:
            (totals[0].dataValues.totalDiscount /
              totals[0].dataValues.totalPayAble) *
            100,
        },
      );
    }

    const graphData = [];
    otherCards.map((item) => {
      if (item.label === 'Sub Total' || item.label === 'Total Discount') return;
      graphData.push(Math.round((+item.value || 0) * 100) / 100);
    });

    return getResponse(
      res,
      1,
      'Data retrieved',
      200,
      { headerCards, otherCards, graphData },
      {},
    );
  } catch (error) {
    console.log(error);
    return getResponse(res, 0, error?.message, 400, { error }, {});
  }
});

const getCardDetails = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId, userId, email },
      query: { type = false, start = false, end = false },
    } = req;

    let query = '';

    let from = new Date(start);
    from.setUTCHours(0, 0, 0, 0);
    let to = new Date(end);
    to.setUTCHours(23, 59, 59, 999);
    let rawFrom = start + ' 00:00:00';
    let rawTo = end + ' 23:59:59';

    let dateWhereRaw = start
      ? `AND "orders"."createdAt" >= '${rawFrom}' AND "orders"."createdAt" <= '${rawTo}'`
      : '';

    let dateWherSubTotaleRaw = start
      ? `"order_items"."createdAt" >= '${rawFrom}' AND "order_items"."createdAt" <= '${rawTo}' and`
      : '';

    switch (type) {
      case 'product':
        query = `select sum(price * qty) as Amount, max(categories."name") as category from order_items 
          left join products on products."companyId"=${companyId} and products."id" = "modelId" and order_items."type"='product'
          inner join orders on orders."id" = order_items."orderId" 
          left join categories on categories."id"= products."categoryId" where  orders."type"=3 and orders."companyId"=${companyId} ${dateWhereRaw} and order_items."type"='product' group by products."categoryId";`;
        break;
      case 'labor':
        query = `select sum(order_items.price * qty) as Amount, max(categories."name") as category from order_items 
        inner join orders on orders."id" = order_items."orderId" 
        left join labors on labors."companyId"=${companyId} and labors."id" = "modelId" and order_items."type"='labor' 
        left join categories on categories."id"= labors."categoryId" where orders."type"=3 and orders."companyId"=${companyId} ${dateWhereRaw} and order_items."type"='labor' group by labors."categoryId";`;
        break;
      case 'tax':
        query = `select sum(sub."tax") as amount,max(sub."cname") as category from
          (select sum(((order_items.price * "qty")-"calculatedDiscount")*("tax"/100)) as tax, 
          CASE WHEN order_items."type" = 'product' THEN max(c2."name") ELSE max(categories."name") END AS cname,max(order_items."type")
          from order_items 
                    left join labors on labors."companyId"=${companyId} and labors."id" = "modelId" 
                and order_items."type"='labor'
                inner join orders on orders."id" = order_items."orderId" 
                left join products on products."companyId"=${companyId} and products."id" = "modelId" 
                and order_items."type"='product'
                    left join categories on categories."id"= labors."categoryId"
                left join categories c2 on c2."id"= products."categoryId" where orders."type"=3 and orders."companyId"=${companyId} ${dateWhereRaw}
                group by labors."categoryId",products."categoryId",order_items."type") sub group by cname;`;
        break;
      case 'discount':
        query = `select sum(sub."disc") as amount,max(sub."cname") as category from
          (select sum(order_items."calculatedDiscount") as Disc, 
          CASE WHEN order_items."type" = 'product' THEN max(c2."name") ELSE max(categories."name") END AS cname,max(order_items."type")
          from order_items 
                    left join labors on labors."companyId"=${companyId} and labors."id" = "modelId" 
                and order_items."type"='labor'
                inner join orders on orders."id" = order_items."orderId" 
                left join products on products."companyId"=${companyId} and products."id" = "modelId" 
                and order_items."type"='product'
                    left join categories on categories."id"= labors."categoryId"
                left join categories c2 on c2."id"= products."categoryId"
                where orders."type"=3 and orders."companyId"=${companyId} ${dateWhereRaw}
                group by labors."categoryId",products."categoryId",order_items."type") sub group by cname `;
        break;
      case 'subTotal':
        query = `select sum(sub."subTotal") as amount,max(sub."cname") as category from
          (select sum((order_items.price * "qty")-"calculatedDiscount") as subTotal, 
          CASE WHEN order_items."type" = 'product' THEN max(c2."name") ELSE max(categories."name") END AS cname,max(order_items."type")
          from order_items 
                    left join labors on labors."companyId"=${companyId} and labors."id" = "modelId" 
                and order_items."type"='labor'
                inner join orders on orders."id" = order_items."orderId" 
                left join products on products."companyId"=${companyId} and products."id" = "modelId" 
                and order_items."type"='product'
                    left join categories on categories."id"= labors."categoryId"
                left join categories c2 on c2."id"= products."categoryId" where ${dateWherSubTotaleRaw} orders."type"=3 and orders."companyId"=${companyId}
                group by labors."categoryId",products."categoryId",orders."type") sub group by cname;`;
        break;
      case 'fee':
        query = `select sum(order_item_fees."total") as amount, 
            max(categories."name") AS category,max(order_items."type") as type
            from order_item_fees
                  inner join order_items on "orderItemId" = order_items."id"
                  inner join orders on orders."id" = order_items."orderId" 
                  left join products on products."companyId"=${companyId} and products."id" = "modelId" 
                  and order_items."type"='product'
                  left join categories on categories."id"= products."categoryId" where orders."type"=3 and order_items."type"='product' and orders."companyId"=${companyId} ${dateWhereRaw}
                  group by products."categoryId",order_items."type";`;
      default:
        break;
    }

    const [categoryWiseData, categoryWiseMetaData] = await db.sequelize.query(
      query,
    );

    return getResponse(res, 1, 'Data retrieved', 200, { categoryWiseData }, {});
  } catch (err) {
    console.log(err);
    return getResponse(res, 0, err?.message, 400, {}, {});
  }
});

const getBreakDownData = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId, userId, email },
      query: { start = false, end = false },
    } = req;

    let from = new Date(start);
    from.setUTCHours(0, 0, 0, 0);
    let to = new Date(end);
    to.setUTCHours(23, 59, 59, 999);
    let rawFrom = start + ' 00:00:00';
    let rawTo = end + ' 23:59:59';

    let dateWhereRaw = start
      ? `and "orders"."createdAt" between '${rawFrom}' and '${rawTo}'`
      : '';

    const productQuery = `select sum(price * qty) as Amount, max(categories."name") as category,sum(qty) as qty from order_items 
    left join products on products."companyId"=${companyId} and products."id" = "modelId" and order_items."type"='product' 
    left join categories on categories."id"= products."categoryId" inner join orders on orders."id" = order_items."orderId" 
        where orders."type"=3 and orders."companyId"=${companyId} ${dateWhereRaw} and order_items."type"='product'  group by products."categoryId" ;`;
    const laborQuery = `select sum(order_items.price * qty) as Amount, max(categories."name") as category,sum(duration) as hrs from order_items 
    left join labors on labors."companyId"=${companyId} and labors."id" = "modelId" and order_items."type"='labor' 
    left join categories on categories."id"= labors."categoryId" inner join orders on orders."id" = order_items."orderId" 
        where orders."companyId"=${companyId} ${dateWhereRaw} and orders."type"=3 and order_items."type"='labor' group by labors."categoryId";`;
    const productTaxQuery = `select sum(((order_items.price * "qty")-"calculatedDiscount")*("tax"/100)) as amount, 
        max(categories."name") category,max(order_items."type") as type,sum(qty) as qty
        from order_items 
        left join products on products."companyId"=${companyId} and products."id" = "modelId" 
            and order_items."type"='product'
          inner join orders on orders."id" = order_items."orderId" 
          left join categories on categories."id"= products."categoryId" where orders."type"=3 and order_items."type"='product' and orders."companyId"=${companyId} ${dateWhereRaw}
        group by products."categoryId",order_items."type";`;
    const laborTaxQuery = `select sum(((order_items.price * "qty")-"calculatedDiscount")*("tax"/100)) as amount, 
        max(categories."name") AS category,max(order_items."type") as type,sum(duration) as hrs
        from order_items 
        left join labors on labors."companyId"=${companyId} and labors."id" = "modelId" 
            and order_items."type"='labor'
          inner join orders on orders."id" = order_items."orderId" 
          left join categories on categories."id"= labors."categoryId" where orders."type"=3 and order_items."type"='labor' and orders."companyId"=${companyId} ${dateWhereRaw}
        group by labors."categoryId",order_items."type";`;
    const feeQuery = `select sum(order_item_fees."total") as amount, 
    max(categories."name") AS category,max(order_items."type") as type,sum(order_item_fees."qty") as qty
    from order_item_fees
      inner join order_items on "orderItemId" = order_items."id"
      inner join orders on orders."id" = order_items."orderId" 
      left join products on products."companyId"=${companyId} and products."id" = "modelId" 
          and order_items."type"='product'
          left join categories on categories."id"= products."categoryId" where orders."type"=3 and order_items."type"='product' and orders."companyId"=${companyId} ${dateWhereRaw}
          group by products."categoryId",order_items."type";`;

    const [productData, productMetaData] = await db.sequelize.query(
      productQuery,
    );
    const [laborData, laborMetaData] = await db.sequelize.query(laborQuery);
    const [productTaxData, productTaxMetaData] = await db.sequelize.query(
      productTaxQuery,
    );
    const [laborTaxData, laborTaxMetaData] = await db.sequelize.query(
      laborTaxQuery,
    );
    const [feeData, feeMetaData] = await db.sequelize.query(feeQuery);
    return getResponse(
      res,
      1,
      'Data retrieved',
      200,
      { productData, laborData, productTaxData, laborTaxData, feeData },
      {},
    );
  } catch (err) {
    return getResponse(res, 0, err?.message, 400, {}, {});
  }
});

const getSalesTax = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId, userId, email },
      query: { start = false, end = false },
    } = req;
    let from = new Date(start);
    from.setUTCHours(0, 0, 0, 0);
    let to = new Date(end);
    to.setUTCHours(23, 59, 59, 999);
    let rawFrom = start + ' 00:00:00';
    let rawTo = end + ' 23:59:59';

    const getProductTax = await OrderItem.findAll({
      attributes: [
        [
          sequelize.literal(
            'SUM(((price * qty)-"calculatedDiscount")*(order_item."tax"/100))',
          ),
          'totalTax',
        ],
        [sequelize.literal('SUM(price * qty)'), 'totalAmount'],
        'taxId',
      ],
      group: ['taxId', 'taxClass.id'],
      order: [['taxId', 'DESC']],
      where: {
        type: 'product',
        taxId: {
          [sequelize.Op.ne]: null,
        },
      },
      include: [
        {
          model: Order,
          as: 'order',
          where: {
            isDraft: false,
            companyId: companyId,
            ...(start && {
              createdAt: {
                [sequelize.Op.between]: [from, to],
              },
            }),
          },
          required: true,
          attributes: [],
        },
        {
          model: TaxClass,
          as: 'taxClass',
          attributes: ['id', 'name'],
        },
      ],
    });
    const getLaborTax = await OrderItem.findAll({
      attributes: [
        [
          sequelize.literal(
            'SUM(((price * qty)-"calculatedDiscount")*(order_item."tax"/100))',
          ),
          'totalTax',
        ],
        [sequelize.literal('SUM(price * qty)'), 'totalAmount'],
        'taxId',
      ],
      group: ['taxId', 'taxClass.id'],
      order: [['taxId', 'DESC']],
      where: {
        type: 'labor',
        taxId: {
          [sequelize.Op.ne]: null,
        },
      },
      include: [
        {
          model: Order,
          as: 'order',
          where: {
            isDraft: false,
            companyId: companyId,
            ...(start && {
              createdAt: {
                [sequelize.Op.between]: [from, to],
              },
            }),
          },
          required: true,
          attributes: [],
        },
        {
          model: TaxClass,
          as: 'taxClass',
          attributes: ['id', 'name'],
        },
      ],
    });

    let dateWhereRaw = start
      ? `AND "order"."createdAt" >= '${rawFrom}' AND "order"."createdAt" <= '${rawTo}'`
      : '';

    const totalTaxquery = `SELECT  SUM(((price * qty)-"calculatedDiscount")*(order_item."tax"/100)) AS "totalTax", 
    SUM(price * qty) AS "totalAmount" FROM "order_items" AS "order_item" INNER JOIN "orders" AS "order" 
    ON "order_item"."orderId" = "order"."id" AND "order"."isDraft" = false AND "order"."companyId" = ${companyId} WHERE "order_item"."taxId" IS NOT NULL ${dateWhereRaw};`;
    const [totalData, totalMetaData] = await db.sequelize.query(totalTaxquery);
    // const getTotalTax = await OrderItem.findAll({
    //   attributes: [
    //     [sequelize.literal('COUNT(order_item.id)'), 'id'],
    //     [sequelize.literal('SUM(((price * qty)-"calculatedDiscount")*(order_item."tax"/100))'), 'totalTax'],
    //     [sequelize.literal('SUM(price * qty)'), 'totalAmount'],
    //  ],
    //   where: { taxId:{
    //     [sequelize.Op.ne]:null
    //   }},
    //   include: [
    //     {
    //       model: Order,
    //       as: 'order',
    //       where: { isDraft: false, companyId: companyId,
    //         // createdAt: {
    //         //       [sequelize.Op.gt]: now,
    //         //     },
    //       },
    //       required: true,
    //       attributes: [],
    //     },

    //   ],
    // });

    const getFet = await OrderItem.findAll({
      attributes: [
        [sequelize.literal('SUM(fet)'), 'totalFet'],
        [sequelize.literal('SUM(price * qty)'), 'totalAmount'],
      ],
      group: ['order_item.type'],
      where: {
        type: 'product',
        fet: {
          [sequelize.Op.ne]: null,
        },
        fet: {
          [sequelize.Op.ne]: 0,
        },
      },
      include: [
        {
          model: Order,
          as: 'order',
          where: {
            isDraft: false,
            companyId: companyId,
            ...(start && {
              createdAt: {
                [sequelize.Op.between]: [from, to],
              },
            }),
          },
          required: true,
          attributes: [],
        },
      ],
    });
    totalData[0].totalTax =
      totalData[0].totalTax + (getFet[0] ? getFet[0]?.dataValues?.totalFet : 0);

    const getNonTaxable = await OrderItem.findAll({
      attributes: [
        [sequelize.literal('SUM(price*qty)'), 'totalAmount'],
        'order_item.type',
      ],
      group: ['order_item.type'],
      // order: [['order_item.type', 'DESC']],
      where: { taxId: null },
      include: [
        {
          model: Order,
          as: 'order',
          where: {
            isDraft: false,
            companyId: companyId,
            ...(start && {
              createdAt: {
                [sequelize.Op.between]: [from, to],
              },
            }),
          },
          required: true,
          attributes: [],
        },
      ],
    });
    return getResponse(
      res,
      1,
      'Data retrieved',
      200,
      {
        getProductTax,
        getLaborTax,
        getFet,
        getNonTaxable,
        getTotalTax: totalData[0],
      },
      {},
    );
  } catch (error) {
    console.log(error);
    return getResponse(res, 0, error?.message, 400, { error }, {});
  }
});

const getfeeData = asyncHandler(async (req, res) => {
  try {
    const {
      user: { branchId, companyId, userId, email },
      query: { start = false, end = false },
    } = req;

    let from = new Date(start);
    from.setUTCHours(0, 0, 0, 0);
    let to = new Date(end);
    to.setUTCHours(23, 59, 59, 999);
    let rawFrom = start + ' 00:00:00';
    let rawTo = end + ' 23:59:59';

    const getFee = await OrderItemFee.findAll({
      attributes: [
        [sequelize.literal('SUM(order_item_fee.total)'), 'totalFee'],
        [sequelize.literal('SUM(order_item_fee.qty)'), 'qty'],
        'feeId',
        'fee.name',
      ],
      group: ['feeId', 'fee.id', 'fee.name'],
      order: [['feeId', 'DESC']],
      // where: { type: 'product',taxId:{
      //   [sequelize.Op.ne]:null
      // }},
      include: [
        {
          model: OrderItem,
          as: 'orderItem',
          required: true,
          attributes: [],
          include: [
            {
              model: Order,
              as: 'order',
              where: {
                isDraft: false,
                companyId: companyId,
                ...(start && {
                  createdAt: {
                    [sequelize.Op.between]: [from, to],
                  },
                }),
              },
              required: true,
              attributes: [],
            },
          ],
        },

        {
          model: Fee,
          as: 'fee',
          attributes: ['id', 'name'],
        },
      ],
    });

    let dateWhereRaw = start
      ? `AND "order"."createdAt" >= '${rawFrom}' AND "order"."createdAt" <= '${rawTo}'`
      : '';

    const totalFeequery = `SELECT  SUM(order_item_fee.total) AS "totalFee" 
    FROM "order_item_fees" AS "order_item_fee" INNER JOIN "order_items" AS "order_item" 
    ON "order_item"."id" = "order_item_fee"."orderItemId" INNER JOIN "orders" AS "order" 
    ON "order_item"."orderId" = "order"."id" AND "order"."isDraft" = false AND "order"."companyId" = ${companyId} ${dateWhereRaw};`;
    const [totalData, totalMetaData] = await db.sequelize.query(totalFeequery);
    return getResponse(
      res,
      1,
      'Data retrieved',
      200,
      { fee: getFee, totalFee: totalData[0].totalFee },
      {},
    );
  } catch (error) {
    console.log(error);
    return getResponse(res, 0, error?.message, 400, { error }, {});
  }
});
module.exports = {
  getDayEnd,
  getCardDetails,
  getBreakDownData,
  getSalesTax,
  getfeeData,
};
