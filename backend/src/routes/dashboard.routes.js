const express = require('express');
const router = express.Router();
const { getAllAnalyses, deleteAnalysis, getStats } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/analyses', protect, getAllAnalyses);
router.delete('/analyses/:id', protect, deleteAnalysis);
router.get('/stats', protect, getStats);

module.exports = router;
