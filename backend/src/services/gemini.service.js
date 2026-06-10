const axios = require('axios');

// Using Groq API — llama-3.3-70b-versatile for sharper, more specific analysis
exports.generateReport = async (title, youtubeResults, redditResults, scores) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const ytSummary = youtubeResults.slice(0, 10).map(v =>
    `- "${v.title}" by ${v.channelName} | Views: ${v.viewCount?.toLocaleString()} | Likes: ${v.likeCount?.toLocaleString() || 'N/A'} | Published: ${v.publishDate ? new Date(v.publishDate).toLocaleDateString() : 'Unknown'}`
  ).join('\n');

  const rdSummary = redditResults.slice(0, 8).map(p =>
    `- "${p.title}" in ${p.subreddit || p.source} | Interest Score: ${p.upvotes} | Discussions: ${p.commentCount || 0}`
  ).join('\n');

  // Top 3 channels by views for competitor naming
  const topCompetitors = youtubeResults
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 3)
    .map(v => `${v.channelName} (${v.viewCount?.toLocaleString()} views)`)
    .join(', ');

  const prompt = `You are a venture-backed startup analyst, YouTube growth strategist, and content market researcher with 10 years of experience helping creators find breakout niches.

Analyze this content idea with surgical precision:
"${title}"

REAL DATA (use this — do not invent numbers):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUTUBE COMPETITION: ${youtubeResults.length} videos found
${ytSummary || 'No YouTube data available'}

TOP COMPETITORS BY VIEWS: ${topCompetitors || 'None identified'}

DEMAND SIGNALS: ${redditResults.length} sources found
${rdSummary || 'No demand data available'}

SCORES:
• Competition: ${scores.competitionScore}/100 (higher = more saturated)
• Demand: ${scores.demandScore}/100
• Originality: ${scores.originalityScore}/100
• Viral Potential: ${scores.viralScore}/100
• Overall: ${scores.overallScore}/100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STRICT RULES:
1. NEVER say "there is room for creators", "competition is moderate", "this is a great idea" — these are useless.
2. Name SPECIFIC channels, specific view counts, specific audience segments.
3. Identify SPECIFIC gaps: missing languages, missing formats (shorts vs long-form), missing difficulty levels, missing platforms.
4. Every claim must be grounded in the data above.
5. Think like an investor stress-testing a pitch.
6. Use bullet points inside text fields where it adds clarity.

Respond ONLY with a valid JSON object (no markdown, no backticks, raw JSON only):
{
  "report": {
    "competitionAnalysis": "Name the top 2-3 actual competitors from the data with their view counts. State exactly what angle they own and what angle they DON'T cover. Is this niche owned by one dominant channel or fragmented? What format gap exists (e.g. no Hindi content, no beginner-level deep dives, no Shorts)?",
    "audienceInterestAnalysis": "Name specific audience segments with characteristics (e.g. 'engineering students in Tier 2 Indian cities without coaching access'). Cite which demand signals show the highest engagement. Which platform shows the strongest pull — YouTube, Reddit, search trends?",
    "originalityAssessment": "What specific content gap exists among the ${youtubeResults.length} videos found? Missing: language? format? depth? platform? niche sub-topic? Give one concrete differentiation strategy that no existing video uses.",
    "viralPotential": "Name the exact viral hook for this idea. Which platform (YouTube Shorts, Instagram Reels, LinkedIn, Reddit) would make this explode and why. Give a specific content format (e.g. '60-second before/after', 'controversial opinion + data', 'story-driven case study').",
    "suggestedImprovements": "Give 3 brutally specific improvements: (1) change the angle to X, (2) target Y exact niche audience, (3) use Z specific format or platform. Each must be actionable in 48 hours."
  },
  "recommendations": [
    "Specific actionable step #1 — name the exact channel, platform, or tool",
    "Specific actionable step #2 — name the exact format or angle to test first",
    "Specific actionable step #3 — name the exact underserved audience to target",
    "Specific actionable step #4 — name the monetization path most viable for this idea",
    "Specific actionable step #5 — name one risk and how to de-risk it"
  ],
  "betterAngles": [
    "Rewritten angle #1 — niche + compelling, references a specific audience",
    "Rewritten angle #2 — different format (e.g. Shorts, documentary, challenge)",
    "Rewritten angle #3 — underserved language or regional audience",
    "Rewritten angle #4 — contrarian or data-driven take that challenges assumptions",
    "Rewritten angle #5 — collaboration or case study format for credibility"
  ],
  "scoreBreakdown": {
    "competitionFactors": [
      "${youtubeResults.length} YouTube videos found competing for this topic",
      "Top competitor and their approximate dominance",
      "Upload recency — how actively new content is being published"
    ],
    "demandFactors": [
      "Community interest level based on ${redditResults.length} demand signals",
      "Engagement depth — are people watching and interacting or just scrolling past?",
      "Search trend direction — rising, stable, or declining?"
    ],
    "marketGaps": [
      "Most specific underserved format gap detected",
      "Most specific underserved audience segment detected",
      "Depth or quality gap in existing content"
    ]
  }
}`;

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2500,
      temperature: 0.6,
      messages: [
        {
          role: 'system',
          content: 'You are a sharp startup analyst and YouTube growth strategist. Always respond with valid raw JSON only — no markdown, no backticks, no preamble, no explanations outside the JSON. Be brutally specific. Reference real data. Never use generic AI filler. Name real channels, real gaps, real audiences.'
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

  return JSON.parse(jsonMatch[0]);
};
