const crypto = require('crypto');
const OAuthClient = require('intuit-oauth');

const { oauthClient, baseUrl } = require('../helpers/oAuthClient');
const {
  quickbook_config: quickbookConfigs,
  users: UserModel,
} = require('../sequelize/models');

const findConfiguration = async (userId) => {
  try {
    const configFound = await quickbookConfigs?.findOne({
      where: { userId },
    });

    return configFound;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const logInQuickBook = async () => {
  try {
    const state = crypto.randomBytes(16).toString('hex');

    const authUri = oauthClient.authorizeUri({
      scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
      state: state,
    });
    return authUri;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const getAuthToken = async (userId) => {
  const userConfig = await quickbookConfigs.findOne({
    where: {
      userId,
    },
  });
  if (userConfig) {
    const accessToken = userConfig.accessToken;
    const refreshToken = userConfig.refreshToken;
    return {
      accessToken,
      refreshToken,
      sandboxCompanyId: userConfig.sandboxCompanyId,
      partsSuppliesId: userConfig.partsSuppliesId,
      miscellaneousId: userConfig.miscellaneousId,
      laborId: userConfig.laborId,
      taxId: userConfig.taxId,
      feeId: userConfig.feeId,
      fetId: userConfig.fetId,
      discountId: userConfig.discountId,
      laborDiscountId: userConfig.laborDiscountId,
    };
  } else return false;
};

const generateAuthToken = async (url, userId, companyId, branchId) => {
  try {
    const parseRedirect = url;
    const sandboxId = parseRedirect.split('realmId')[1]?.split('=')[1];
    // Exchange the auth code retrieved from the **req.url** on the redirectUri
    const authResponse = await oauthClient.createToken(parseRedirect);

    const token = authResponse.getJson();

    await quickbookConfigs.create({
      userId: userId,
      accessToken: token,
      refreshToken: token.refresh_token,
      sandboxCompanyId: sandboxId,
      companyId,
      branchId,
    });

    await UserModel.update(
      { qbAccessToken: token.access_token },
      { where: { id: userId } },
    );
    console.log('>>>>>>>>', token);
    return token;
  } catch (err) {
    return false;
  }
};

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
      { where: { userId: userId } },
    );
  } catch (err) {
    console.error(err);
    return false;
  }
};

const getItems = async (userId) => {
  try {
    const {
      refreshToken,
      accessToken,
      sandboxCompanyId,
      partsSuppliesId,
      miscellaneousId,
      laborId,
      taxId,
      fetId,
      feeId,
      discountId,
      laborDiscountId,
    } = await getAuthToken(userId);

    await refreshOauthToken(refreshToken, JSON.parse(accessToken), userId);
    console.log('>>>>>>>da2,', laborDiscountId);
    const response = await oauthClient.makeApiCall({
      url: `${baseUrl}/v3/company/${sandboxCompanyId}/query?query=select * from Item`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const taxResponse = await oauthClient.makeApiCall({
      url: `${baseUrl}/v3/company/${sandboxCompanyId}/query?query=select * from TaxCode`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const tax = taxResponse.json?.QueryResponse?.TaxCode;

    return {
      items: { items: response?.json?.QueryResponse?.Item, tax },
      configValues: {
        partsSuppliesId,
        miscellaneousId,
        laborId,
        taxId,
        fetId,
        feeId,
        discountId,
        laborDiscountId,
      },
    };
  } catch (err) {
    console.error('>>errrrrr', err);
    return false;
  }
};

const saveConfig = async (
  partsSuppliesId,
  laborId,
  taxId,
  feeId,
  fetId,
  discountId,
  laborDiscountId,
  userId,
) => {
  try {
    const config = await quickbookConfigs.update(
      {
        partsSuppliesId,
        laborId,
        taxId,
        feeId,
        fetId,
        discountId,
        laborDiscountId,
      },
      {
        where: {
          userId: userId,
        },
      },
    );
    return config;
  } catch (err) {
    console.error(err);
    return false;
  }
};

module.exports = {
  findConfiguration,
  logInQuickBook,
  generateAuthToken,
  getItems,
  saveConfig,
};
