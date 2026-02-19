const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

router.get('/summary/:projectType', dataController.getAnalytics);
router.get('/id/:id', dataController.getAnalyticsById);
router.get('/dashboards', dataController.getAllDashboards);
router.get('/status/:id', dataController.getProcessingStatus);

module.exports = router;
