const express = require('express');
const router = express.Router();
const authRoute = require('./authRoute');
const planRoute = require('./planRoute');
const workspaceRoute = require('./workspaceRoute');
const paymentRoute = require('./paymentRoute');
const middleware = require('../middleware');

router.use('/auth', authRoute);
router.use('/plans', middleware.verifyToken, planRoute);
router.use('/workspaces', middleware.verifyToken, workspaceRoute);
router.use('/payment', middleware.verifyToken, paymentRoute);

module.exports = router;