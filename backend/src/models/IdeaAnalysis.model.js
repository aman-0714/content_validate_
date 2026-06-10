const mongoose = require('mongoose');

const IdeaAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Content idea title is required'],
    trim: true
  },

  // ─── Core scores ───────────────────────────────────────────────────────────
  competitionScore: { type: Number, min: 0, max: 100, default: 0 },
  demandScore:      { type: Number, min: 0, max: 100, default: 0 },
  originalityScore: { type: Number, min: 0, max: 100, default: 0 },
  viralScore:       { type: Number, min: 0, max: 100, default: 0 },
  overallScore:     { type: Number, min: 0, max: 100, default: 0 },
  verdict: {
    type: String,
    enum: ['Excellent', 'Good', 'Average', 'Poor'],
    default: 'Average'
  },

  // ─── Extended scoring fields ───────────────────────────────────────────────
  /**
   * confidenceScore (0–100): how reliable this analysis is.
   * Low when data is sparse (few YouTube results, no Reddit signals).
   * High when both sources returned rich data and AI had real numbers to work with.
   */
  confidenceScore: { type: Number, min: 0, max: 100, default: 0 },

  /**
   * executionDifficulty (0–100): how hard it is to actually execute this idea.
   * Derived from competition saturation + dominant-channel presence + niche depth.
   * 0 = very easy to enter, 100 = extremely hard to compete.
   */
  executionDifficulty: { type: Number, min: 0, max: 100, default: 0 },

  // ─── Structured market intelligence ───────────────────────────────────────
  /**
   * keywords: top search/topic keywords extracted from YouTube titles + Reddit posts.
   * Used for SEO, future filtering, and trend correlation.
   */
  keywords: [{ type: String, trim: true }],

  /**
   * competitors: structured array of top competing channels/creators identified.
   * Pulled from YouTube results, enriched by AI.
   */
  competitors: [
    {
      name:      { type: String },
      views:     { type: Number },
      url:       { type: String },
      dominance: { type: String }  // 'dominant' | 'moderate' | 'minor'
    }
  ],

  /**
   * marketGaps: specific, structured gaps detected in the market.
   * These are structured tags for future filtering/search.
   */
  marketGaps: [
    {
      type:        { type: String },   // 'language' | 'format' | 'audience' | 'depth' | 'platform'
      description: { type: String }
    }
  ],

  /**
   * trendData: snapshot of trend signals at time of analysis.
   * Enables future time-series comparisons.
   */
  trendData: {
    redditSignals:    { type: Number, default: 0 },
    totalUpvotes:     { type: Number, default: 0 },
    totalComments:    { type: Number, default: 0 },
    youtubeVideos:    { type: Number, default: 0 },
    avgViews:         { type: Number, default: 0 },
    recentUploads:    { type: Number, default: 0 },
    avgLikeViewRatio: { type: Number, default: 0 }
  },

  // ─── AI output ─────────────────────────────────────────────────────────────
  recommendations: [String],
  betterAngles:    [String],
  aiReport: {
    competitionAnalysis:      String,
    audienceInterestAnalysis: String,
    originalityAssessment:    String,
    viralPotential:           String,
    suggestedImprovements:    String
  },

  // ─── Raw data ──────────────────────────────────────────────────────────────
  youtubeResults: { type: Array, default: [] },
  redditResults:  { type: Array, default: [] },

  // ─── Score breakdown (transparent reasoning) ──────────────────────────────
  breakdown: {
    competitionFactors: [String],
    demandFactors:      [String],
    weightExplanation:  [String],
    marketGaps:         [String]
  },
  scoreBreakdown: {
    competitionFactors: [String],
    demandFactors:      [String],
    marketGaps:         [String]
  },

  // ─── Export / sharing ──────────────────────────────────────────────────────
  /**
   * shareToken: unique public token for share links.
   * When set, the report is accessible at /shared/:shareToken without auth.
   * null means not shared publicly.
   */
  shareToken: { type: String, default: null, index: true, sparse: true },
  sharedAt:   { type: Date, default: null },

  createdAt: { type: Date, default: Date.now, index: true }
});

// ─── Indexes for common query patterns ────────────────────────────────────────
IdeaAnalysisSchema.index({ userId: 1, createdAt: -1 });
IdeaAnalysisSchema.index({ userId: 1, verdict: 1 });
IdeaAnalysisSchema.index({ userId: 1, overallScore: -1 });
IdeaAnalysisSchema.index({ keywords: 1 });

module.exports = mongoose.model('IdeaAnalysis', IdeaAnalysisSchema);
