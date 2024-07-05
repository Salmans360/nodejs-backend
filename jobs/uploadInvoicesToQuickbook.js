const { agendaInstance } = require('../config/agendaJobs');
const { oauthClient, baseUrl } = require('../src/helpers/oAuthClient');
require('dotenv').config();
const {
  invoice_queue: invoiceQue,
  quickbook_config: quickbookConfigs,
  invoice: InvoiceModel,
} = require('../src/sequelize/models');

(async () => {
  const refreshOauthToken = async (refreshToken, accessToken, userId) => {
    try {
      oauthClient.setToken(accessToken);
      const newToken = await oauthClient.refreshUsingToken(refreshToken);
      const token = newToken.getJson();
      oauthClient.setToken(token);

      await quickbookConfigs.update(
        {
          accessToken: token,
          refreshToken: token.refresh_token,
        },
        { where: { userId } },
      );
    } catch (err) {
      console.error('>>err123,', err);
    }
  };

  const findOrCreateCustomer = async (sandboxCompanyId, email, invoice) => {
    try {
      const customer = await oauthClient.makeApiCall({
        url: `${baseUrl}/v3/company/${sandboxCompanyId}/query?query=select * from Customer Where DisplayName='${email}'`,
        method: 'GET',
      });
      // console.log('>>>>', sandboxCompanyId, email, '>>', customer);
      if (customer?.json?.QueryResponse?.Customer?.length > 0) {
        const existingCustomer = customer?.json?.QueryResponse.Customer[0];
        return existingCustomer.Id;
      } else {
        const body = {
          DisplayName: email,
        };
        const newCustomer = await oauthClient.makeApiCall({
          url: `${baseUrl}/v3/company/${sandboxCompanyId}/customer`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        // console.log('>>>newCustomer', newCustomer);
        return newCustomer?.json?.Customer?.Id;
      }
    } catch (err) {
      console.error('>>>>e', err);
      return false;
    }
  };

  await agendaInstance.define('UPLOAD_INVOICES_TO_QUICKBOOK', async (job) => {
    console.log(
      `\n\n******* UPLOAD INVOICES TO QUICKBOOK Job Start At ${new Date()} *******`,
    );

    const invoices = await invoiceQue.findAll({ limit: 100 });
    for (const invoice of invoices) {
      try {
        const { authToken, refreshToken, sandboxCompanyId } = invoice;

        const userConfig = await quickbookConfigs.findOne({
          where: {
            branchId: invoice.branchId,
            companyId: invoice.companyId,
          },
        });

        await refreshOauthToken(
          refreshToken,
          JSON.parse(authToken),
          invoice?.userId,
        );

        const invoiceData = invoice.invoiceData;

        const customerId = await findOrCreateCustomer(
          sandboxCompanyId,
          invoiceData?.customerName,
          invoice,
        );
        let lineItemsArray = [];
        const taxId = userConfig?.taxId;
        let productDiscount = 0;
        let laborDiscount = 0;
        invoiceData.lineItems.forEach((item) => {
          const jobItems = [];
          // console.log('>>>item', item);
          const itemRefId =
            item.type === 'labor'
              ? userConfig?.laborId
              : item.type === 'product'
              ? userConfig?.partsSuppliesId
              : '';

          const obj = {
            DetailType: 'SalesItemLineDetail',
            Description: item?.description || item?.name || '',
            Amount: item?.retailPrice || 0,
            SalesItemLineDetail: {
              ItemRef: {
                value: itemRefId,
              },
              ...(item.type !== 'labor' && {
                TaxCodeRef: {
                  value: 'TAX',
                },
              }),
              Qty: item?.qty,
              UnitPrice: item?.price || 0,
            },
          };
          jobItems.push(obj);
          if (item?.fet && item?.fet > 0) {
            // console.log('>>>userConfig?.fetId', userConfig?.fetId);
            const fetObj = {
              DetailType: 'SalesItemLineDetail',
              Description: 'FET',
              // UnitPrice: fee?.amount || 0,
              Amount: item?.fet || 0,
              SalesItemLineDetail: {
                ItemRef: {
                  value: userConfig?.fetId,
                },
                // TaxCodeRef: {
                //   value: 'TAX',
                // },
                Qty: 1,
                UnitPrice: item?.fet || 0,
              },
            };
            jobItems.push(fetObj);
          }
          if (item?.ProductFee?.length > 0) {
            item?.ProductFee?.forEach((fee) => {
              const feeObj = {
                DetailType: 'SalesItemLineDetail',
                Description: fee?.name,
                // UnitPrice: fee?.amount || 0,
                Amount: fee?.total || 0,
                SalesItemLineDetail: {
                  ItemRef: {
                    value: userConfig?.feeId,
                  },
                  // TaxCodeRef: {
                  //   value: 'TAX',
                  // },
                  Qty: fee?.qty,
                  UnitPrice: fee?.amount || 0,
                },
              };
              jobItems.push(feeObj);
            });
          }

          if (item.type === 'labor') {
            laborDiscount = +item?.calculatedDiscount || 0;
          } else {
            productDiscount = +item?.calculatedDiscount || 0;
          }

          // console.log('>>>>>jobItems', jobItems);
          lineItemsArray = [...lineItemsArray, ...jobItems];
        });

        if (productDiscount > 0) {
          const discountObj = {
            DetailType: 'SalesItemLineDetail',
            Description: 'Product Discount',

            Amount: -productDiscount || 0,
            SalesItemLineDetail: {
              ItemRef: {
                value: userConfig?.discountId,
              },
              Qty: 1,
              UnitPrice: -productDiscount || 0,
            },
          };
          lineItemsArray.push(discountObj);
        }
        if (laborDiscount > 0) {
          const discountObj = {
            DetailType: 'SalesItemLineDetail',
            Description: 'Labor Discount',

            Amount: -laborDiscount || 0,
            SalesItemLineDetail: {
              ItemRef: {
                value: userConfig?.laborDiscountId,
              },
              Qty: 1,
              UnitPrice: -laborDiscount || 0,
            },
          };
          lineItemsArray.push(discountObj);
        }

        // lineItemsArray.push({
        //   DetailType: 'DiscountLineDetail',
        //   Amount: invoiceData?.totalDiscount || 0,
        //   DiscountLineDetail: {
        //     PercentBased: false,
        //   },
        // });
        const body = {
          Line: [...lineItemsArray],
          TxnTaxDetail: {
            TotalTax: invoiceData.totalTax || 0,
            TxnTaxCodeRef: {
              value: taxId || '',
            },
          },
          CustomerRef: {
            value: customerId,
          },
        };

        const response = await oauthClient.makeApiCall({
          url: `${baseUrl}/v3/company/${sandboxCompanyId}/invoice?minorversion=${process.env.QUICKBOOK_MINOR_VERSION}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        // console.log('>>>response', response);
        await invoiceQue.destroy({
          where: { id: invoice.id },
        });
        // console.log('>>>>res', invoice.invoiceId);
        await InvoiceModel.update(
          { qbSynced: true },
          {
            where: {
              id: invoice.invoiceId,
            },
          },
        );
      } catch (err) {
        await InvoiceModel.update(
          { qbResponse: err?.authResponse?.response?.body || err },
          {
            where: {
              id: invoice.invoiceId,
            },
          },
        );
        console.error('>>>>>Ssss', err);
        await invoiceQue.destroy({
          where: { id: invoice.id },
        });
      }
    }
  });

  await agendaInstance.start();

  await agendaInstance.every('2 minutes', 'UPLOAD_INVOICES_TO_QUICKBOOK');
})();
