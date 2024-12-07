const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');

router.get('/', planController.getPlans);
router.post('/create', planController.createPlan);

module.exports = router;