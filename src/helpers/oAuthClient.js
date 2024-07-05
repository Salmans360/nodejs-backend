const OAuthClient = require('intuit-oauth');
const baseUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.QUICKBOOK_PRODUCTION_BASE_URL
    : process.env.NODE_ENV === 'development'
    ? process.env.QUICKBOOK_STAGING_BASE_URL
    : process.env.QUICKBOOK_FEATURE_BASE_URL;
const oauthClient = new OAuthClient({
  clientId: process.env.QUICKBOOK_CLIENT_ID,
  clientSecret: process.env.QUICKBOOK_CLIENT_SECRET,
  environment: process.env.QUICKBOOK_ENVIRONMENT,
  redirectUri:
    process.env.NODE_ENV === 'development'
      ? process.env.QUICKBOOK_TEST_OAUTH_CALL_BACK_URL
      : process.env.NODE_ENV === 'production'
      ? process.env.QUICKBOOK_PRODUCTION_OAUTH_CALL_BACK_URL
      : process.env.QUICKBOOK_STAGING_OAUTH_CALL_BACK_URL,
});

module.exports = {
  oauthClient,
  baseUrl,
};
