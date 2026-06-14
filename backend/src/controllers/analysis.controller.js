const youtubeService = require('../services/youtube.service');
const redditService = require('../services/reddit.service');
const geminiService = require('../services/gemini.service');
const scoringService = require('../services/scoring.service');
const IdeaAnalysis = require('../models/IdeaAnalysis.model');
const axios = require('axios');

// @desc    Analyze a content idea
// @route   POST /api/analysis/analyze
exports.analyzeIdea = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Content idea title is required' });
    }

    // ── Layer 1: Static Input Validation ─────────────────────────────────────
    const trimmed = title.trim();

    // Too short
    if (trimmed.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Your idea is too short. Please describe the topic you want to create content about (e.g. "Beginner Guide to React Hooks").'
      });
    }

    // No real letters at all
    if (!/[a-zA-Z]/.test(trimmed)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a content idea using words, not just symbols or numbers.'
      });
    }

    // Single character repeated (aaaaaaa, ........)
    if (/^(.)(\1+\s*)+$/.test(trimmed)) {
      return res.status(400).json({
        success: false,
        message: 'That doesn\'t look like a content idea. Try something like "Python for Data Science Beginners".'
      });
    }

    const STOP = new Set([
      'the','a','an','and','or','but','is','are','was','were','this','that',
      'these','those','it','its','for','to','of','in','on','at','by','with',
      'i','me','my','we','you','he','she','they','do','did','be','been',
      'have','has','had','will','would','could','should','may','might',
      'very','so','just','really','quite','also','too','not','no','yes',
      'hi','hello','hey','test','ok','okay','lol',
    ]);

    const words = trimmed.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    const meaningful = words.filter(w => w.length > 2 && !STOP.has(w));

    if (meaningful.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your input contains only common words with no clear topic. Please describe the subject of your content idea.'
      });
    }

    // High repetition ratio
    const unique = new Set(words);
    if (words.length > 2 && unique.size / words.length < 0.5) {
      return res.status(400).json({
        success: false,
        message: 'Your idea has too many repeated words. Please enter a clear, distinct content topic.'
      });
    }

    // Key-mash detection — long words with no vowels
    const longWords = meaningful.filter(w => w.length >= 4);
    const noVowelWords = longWords.filter(w => !/[aeiou]/.test(w));
    if (longWords.length > 0 && noVowelWords.length / longWords.length > 0.6) {
      return res.status(400).json({
        success: false,
        message: 'That looks like random characters. Please type a real content topic you want to validate.'
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

    // ── Layer 2: AI Semantic Validation ───────────────────────────────────────
    // Catches cases static checks miss: "I love pizza", "sky is blue",
    // "this is very beautiful", single-word celebrities, etc.
    const ideaCheck = await geminiService.validateIdea(trimmed);
    if (!ideaCheck.valid) {
      return res.status(400).json({
        success: false,
        message: ideaCheck.reason || 'This doesn\'t appear to be a content idea someone would create a video or article about. Please enter a real topic.'
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

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

// @desc    Enhance a content idea with AI suggestions (keeps original intent, boosts appeal)
// @route   POST /api/analysis/enhance-idea
exports.enhanceIdea = async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea || idea.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'A content idea is required' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'AI service not configured' });
    }

    const prompt = `You are an expert content strategist and SEO specialist. A creator has a content idea and wants you to suggest 5 improved, high-scoring variants.

ORIGINAL IDEA: "${idea.trim()}"

Your task:
- Keep the SAME core topic and intent as the original idea
- Make each variant more specific, compelling, and search-friendly
- Each variant should have a different creative angle (e.g., beginner guide, case study, comparison, "mistakes to avoid", step-by-step)
- Make titles that people would actually click on YouTube/Google
- Each variant should score higher than the original in terms of search demand and click appeal

Respond ONLY with valid raw JSON (no markdown, no backticks):
{
  "suggestions": [
    {
      "title": "Enhanced idea title 1",
      "reason": "Why this version performs better (1 sentence)"
    },
    {
      "title": "Enhanced idea title 2",
      "reason": "Why this version performs better (1 sentence)"
    },
    {
      "title": "Enhanced idea title 3",
      "reason": "Why this version performs better (1 sentence)"
    },
    {
      "title": "Enhanced idea title 4",
      "reason": "Why this version performs better (1 sentence)"
    },
    {
      "title": "Enhanced idea title 5",
      "reason": "Why this version performs better (1 sentence)"
    }
  ]
}`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        max_tokens: 800,
        messages: [
          {
            role: 'system',
            content: 'You are an expert content strategist. Always respond with valid raw JSON only — no markdown, no backticks, no preamble.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const text = response.data.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    const parsed = JSON.parse(jsonMatch[0]);
    res.json({ success: true, suggestions: parsed.suggestions || [] });

  } catch (error) {
    console.error('Enhance idea error:', error);
    res.status(500).json({ success: false, message: 'Failed to enhance idea. Please try again.' });
  }
};

// @desc    Get AI suggestions & improvements for an existing analysis
// @route   POST /api/analysis/:id/suggestions
exports.getIdeaSuggestions = async (req, res) => {
  try {
    const analysis = await IdeaAnalysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'AI service not configured' });
    }

    const prompt = `You are an expert content strategist. Based on the following analysis data, provide detailed suggestions and improvements to help this content idea score higher and perform better.

CONTENT IDEA: "${analysis.title}"

CURRENT SCORES:
- Competition Score: ${analysis.competitionScore}/100 (higher = more competition)
- Demand Score: ${analysis.demandScore}/100
- Originality Score: ${analysis.originalityScore}/100
- Viral Potential: ${analysis.viralScore}/100
- Overall Score: ${analysis.overallScore}/100
- Verdict: ${analysis.verdict}

Provide actionable, specific suggestions to improve this content idea's performance while keeping the same core topic and intent.

Respond ONLY with valid raw JSON (no markdown, no backticks):
{
  "improvedTitles": [
    {
      "title": "Improved title variant 1",
      "scoreBoost": "Which score this improves and why",
      "angle": "creative angle used (e.g. beginner, advanced, case study, etc.)"
    },
    {
      "title": "Improved title variant 2",
      "scoreBoost": "Which score this improves and why",
      "angle": "creative angle used"
    },
    {
      "title": "Improved title variant 3",
      "scoreBoost": "Which score this improves and why",
      "angle": "creative angle used"
    }
  ],
  "weaknesses": [
    "Specific weakness 1 based on the scores",
    "Specific weakness 2 based on the scores",
    "Specific weakness 3 based on the scores"
  ],
  "strengths": [
    "Specific strength 1 based on the scores",
    "Specific strength 2 based on the scores"
  ],
  "actionPlan": [
    "Concrete action step 1 to improve performance",
    "Concrete action step 2 to improve performance",
    "Concrete action step 3 to improve performance",
    "Concrete action step 4 to improve performance"
  ],
  "targetAudience": "A specific description of the ideal audience for this content",
  "bestPlatform": "The best platform to publish this content and why"
}`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        max_tokens: 1200,
        messages: [
          {
            role: 'system',
            content: 'You are an expert content strategist. Always respond with valid raw JSON only — no markdown, no backticks.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const text = response.data.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    const parsed = JSON.parse(jsonMatch[0]);
    res.json({ success: true, data: parsed });

  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate suggestions. Please try again.' });
  }
};
