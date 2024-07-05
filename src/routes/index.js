const express = require('express');
const { verifyToken } = require('../services/token.service');

const authRoutes = require('./auth');
const companyRoutes = require('./company');
const userRoutes = require('./user');
const customerRoutes = require('./customer');
const vehicleRoutes = require('./vehicle');
const categoryRoutes = require('./category');
const productRoutes = require('./product');
const laborRoutes = require('./labor');
const orderRoutes = require('./order');
const feeRoutes = require('./fee');
const inventoryRoutes = require('./inventory');
const stripeRoutes = require('./stripe');
const subscriptioRoutes = require('./subscription');
const termConditionsRoutes = require('./terms-condition');
const contactSupportRoutes = require('./support');
const taxClassRoutes = require('./taxClass');
const laborClassRoutes = require('./laborClass');
const payPalRoutes = require('./paypal');
const reportRoutes = require('./report');
const quickBookRoutes = require('./quickbook');
const servicePackageRoutes = require('./servicePackage');
const paymentTermsRoutes = require('./paymentTerms');
const onAccountRoutes = require('./onAccount');
const depositRoutes = require('./deposit');


const app = express();

app.use('/auth', authRoutes);
app.use('/company', verifyToken, companyRoutes);
app.use('/user', verifyToken, userRoutes);
app.use('/customer', verifyToken, customerRoutes);
app.use('/vehicle', verifyToken, vehicleRoutes);
app.use('/category', verifyToken, categoryRoutes);
app.use('/product', verifyToken, productRoutes);
app.use('/labor', verifyToken, laborRoutes);
app.use('/order', verifyToken, orderRoutes);
app.use('/fee', verifyToken, feeRoutes);
app.use('/inventory', verifyToken, inventoryRoutes);
app.use('/stripe', verifyToken, stripeRoutes);
app.use('/paypal', verifyToken, payPalRoutes);
app.use('/subscription', verifyToken, subscriptioRoutes);
app.use('/terms-conditions', verifyToken, termConditionsRoutes);
app.use('/support', verifyToken, contactSupportRoutes);
app.use('/report', verifyToken, reportRoutes);
app.use('/tax-class', verifyToken, taxClassRoutes);
app.use('/labor-class', verifyToken, laborClassRoutes);
app.use('/quickbook', verifyToken, quickBookRoutes);
app.use('/service-package', verifyToken, servicePackageRoutes);
app.use('/payment-terms', verifyToken, paymentTermsRoutes);
app.use('/on-account', verifyToken, onAccountRoutes);
app.use('/deposit', verifyToken, depositRoutes);

module.exports = app;
