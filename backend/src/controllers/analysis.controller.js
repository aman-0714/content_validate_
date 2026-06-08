const youtubeService = require('../services/youtube.service');
const redditService = require('../services/reddit.service');
const geminiService = require('../services/gemini.service');
const scoringService = require('../services/scoring.service');
const IdeaAnalysis = require('../models/IdeaAnalysis.model');

// @desc    Analyze a content idea
// @route   POST /api/analysis/analyze
exports.analyzeIdea = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Content idea title is required' });
    }

    // Fetch data in parallel
    const [youtubeResults, redditResults] = await Promise.allSettled([
      youtubeService.searchVideos(title),
      redditService.searchPosts(title)
    ]);

    const ytData = youtubeResults.status === 'fulfilled' ? youtubeResults.value : [];
    const rdData = redditResults.status === 'fulfilled' ? redditResults.value : [];

    // Calculate scores
    const scores = scoringService.calculateScores(ytData, rdData);

    // Generate AI report
    let aiReport = {};
    let recommendations = [];
    let betterAngles = [];

    try {
      const geminiResponse = await geminiService.generateReport(title, ytData, rdData, scores);
      aiReport = geminiResponse.report;
      recommendations = geminiResponse.recommendations;
      betterAngles = geminiResponse.betterAngles;
    } catch (aiError) {
      console.warn('Gemini API error, continuing without AI report:', aiError.message);
      recommendations = ['Unable to generate AI recommendations at this time.'];
      betterAngles = [];
    }

    // Determine verdict
    const verdict = scoringService.getVerdict(scores.overallScore);

    // Save to DB
    const analysis = await IdeaAnalysis.create({
      userId: req.user._id,
      title,
      ...scores,
      verdict,
      recommendations,
      betterAngles,
      youtubeResults: ytData,
      redditResults: rdData,
      aiReport
    });

    res.status(201).json({ success: true, data: analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single analysis
// @route   GET /api/analysis/:id
exports.getAnalysis = async (req, res) => {
  try {
    const analysis = await IdeaAnalysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
