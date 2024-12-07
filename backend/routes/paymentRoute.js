const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/stripe', paymentController.stripePayment);
router.post('/stripe/verify', paymentController.stripeVerifyPayment);

module.exports = router;