const IdeaAnalysis = require('../models/IdeaAnalysis.model');

// @desc    Get all analyses for user
// @route   GET /api/dashboard/analyses
exports.getAllAnalyses = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, verdict, sort = 'newest' } = req.query;
    const query = { userId: req.user._id };

    if (search)  query.title   = { $regex: search, $options: 'i' };
    if (verdict && verdict !== 'all') query.verdict = verdict;

    const sortMap = {
      newest:     { createdAt: -1 },
      oldest:     { createdAt:  1 },
      'score-high': { overallScore: -1 },
      'score-low':  { overallScore:  1 },
    };
    const sortOrder = sortMap[sort] || sortMap.newest;

    const total    = await IdeaAnalysis.countDocuments(query);
    const analyses = await IdeaAnalysis.find(query)
      .sort(sortOrder)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('title competitionScore demandScore originalityScore viralScore overallScore verdict shareToken createdAt');

    res.json({
      success: true,
      data: analyses,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete analysis
// @route   DELETE /api/dashboard/analyses/:id
exports.deleteAnalysis = async (req, res) => {
  try {
    const analysis = await IdeaAnalysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    res.json({ success: true, message: 'Analysis deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    const analyses = await IdeaAnalysis.find({ userId: req.user._id });
    const total = analyses.length;
    const avgOverall = total > 0
      ? Math.round(analyses.reduce((sum, a) => sum + a.overallScore, 0) / total)
      : 0;
    const verdicts = analyses.reduce((acc, a) => {
      acc[a.verdict] = (acc[a.verdict] || 0) + 1;
      return acc;
    }, {});

    res.json({ success: true, data: { total, avgOverall, verdicts } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
