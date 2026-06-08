const express = require('express');
const router = express.Router();
const { analyzeIdea, getAnalysis } = require('../controllers/analysis.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/analyze', protect, analyzeIdea);
router.get('/:id', protect, getAnalysis);

module.exports = router;
