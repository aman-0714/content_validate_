const express = require('express');
const router = express.Router();
const { analyzeIdea, getAnalysis, enhanceIdea, getIdeaSuggestions } = require('../controllers/analysis.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/analyze', protect, analyzeIdea);
router.post('/enhance-idea', protect, enhanceIdea);
router.get('/:id', protect, getAnalysis);
router.post('/:id/suggestions', protect, getIdeaSuggestions);

module.exports = router;
