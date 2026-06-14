const axios = require('axios');

// ── Pre-validation: checks if the input is a real content idea ────────────────
// Returns { valid: true } or { valid: false, reason: '...' }
exports.validateIdea = async (title) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { valid: true }; // skip validation if no key configured

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        max_tokens: 100,
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: 'You are a strict content idea validator. Respond ONLY with valid raw JSON — no markdown, no backticks, no explanation outside the JSON.'
          },
          {
            role: 'user',
            content: `Is the following a genuine content idea that someone would realistically create a YouTube video, blog post, podcast, or online course about?\n\nIDEA: "${title}"\n\nA VALID content idea must:\n- Describe a real topic, skill, concept, problem, or subject matter\n- Make sense as the title of an educational or informational piece of content\n- Have a clear audience and purpose (to teach, inform, or entertain about a real subject)\n\nINVALID inputs include (reject ALL of these):\n- Random or gibberish text: "asdf ghjk", "zxcvbnm", "aaabbb"\n- Filler / test inputs: "this", "hello", "test", "ok bye", "hi there"\n- Opinions or feelings with no educational topic: "I love pizza", "cats are cute", "sky is blue", "life is good"\n- Random sentences: "this is very beautiful", "I went to the store", "the sun is hot"\n- Single generic words with no context: "nice", "cool", "wow"\n- Statements that are NOT content ideas: "I like this", "this is interesting"\n\nVALID examples: "How Electrical Engineers Can Learn DSA", "Beginner Guide to React Hooks", "Top 10 Python Libraries for Data Science", "How to Start Freelancing as a Student", "Machine Learning for Beginners", "Best Budget Cameras for YouTube"\n\nIMPORTANT: If the idea has a real educational or informational purpose, even if the wording is imperfect, mark it VALID. Only reject clearly nonsensical, off-topic, or non-content inputs.\n\nRespond ONLY with this exact JSON format:\n{ "valid": true }\nor\n{ "valid": false, "reason": "One clear sentence telling the user what to fix and giving an example of a valid idea" }`
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
    if (!jsonMatch) return { valid: true }; // parse failure → let it through

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.warn('Idea validation check failed, skipping:', err.message);
    return { valid: true }; // network/API failure → don't block the user
  }
};
// ─────────────────────────────────────────────────────────────────────────────

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

  // Detect language/regional gaps from titles
  const titles = youtubeResults.map(v => (v.title || '').toLowerCase());
  const hasHindi = titles.some(t => /hindi|हिंदी|हिन्दी/.test(t));
  const hasBeginnerLevel = titles.some(t => /beginner|basics|introduction|for students/.test(t));
  const hasShorts = titles.some(t => /shorts|#shorts/.test(t));
  const langGapNote = !hasHindi ? 'No Hindi-language content detected.' : 'Hindi content exists.';
  const beginnerGapNote = !hasBeginnerLevel ? 'No beginner/student-level content detected.' : 'Beginner content exists.';
  const shortsGapNote = !hasShorts ? 'No YouTube Shorts format detected.' : 'Shorts format exists.';

  // Avg engagement ratio
  const avgLikeViewRatio = youtubeResults.length > 0
    ? (youtubeResults.reduce((s, v) => s + (v.likeCount || 0) / Math.max(v.viewCount || 1, 1), 0) / youtubeResults.length * 100).toFixed(2)
    : 'N/A';

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

CONTENT GAP SIGNALS (pre-detected from titles):
• ${langGapNote}
• ${beginnerGapNote}
• ${shortsGapNote}
• Avg like-to-view ratio: ${avgLikeViewRatio}%

SCORES:
• Competition: ${scores.competitionScore}/100 (higher = more saturated)
• Demand: ${scores.demandScore}/100
• Originality: ${scores.originalityScore}/100
• Viral Potential: ${scores.viralScore}/100
• Overall: ${scores.overallScore}/100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STRICT RULES:
1. NEVER say "there is room for creators", "competition is moderate", "this is a great idea", "the market is ripe" — these are useless filler phrases.
2. Name SPECIFIC channels, specific view counts, specific audience segments from the data above.
3. Identify SPECIFIC gaps: missing languages (Hindi, regional), missing formats (Shorts vs long-form), missing difficulty levels (beginner vs advanced), missing platforms.
4. Every claim must be grounded in the data above — if a number isn't in the data, don't invent it.
5. Think like an investor stress-testing a pitch — poke holes, find real risks.
6. Use bullet points inside text fields where it adds clarity.
7. If the top competitor has >1M views, call it out explicitly as a barrier.
8. If avg like-to-view ratio is below 2%, say the audience is watching but not engaged — quality gap.

Respond ONLY with a valid JSON object (no markdown, no backticks, raw JSON only):
{
  "report": {
    "competitionAnalysis": "Name the top 2-3 actual competitors from the data with their exact view counts. State what angle they own and what angle they leave uncovered. Is this niche owned by one dominant channel or fragmented across many? Call out specific format gaps: e.g. no Hindi content, no beginner-level deep dives, no Shorts, no regional accent coverage.",
    "audienceInterestAnalysis": "Name specific audience segments with real characteristics — e.g. 'engineering students in Tier 2 Indian cities without coaching access' or 'working professionals re-skilling after layoffs'. Cite which demand signals show the highest engagement. Name the platform showing the strongest pull.",
    "originalityAssessment": "State the specific content gap among the ${youtubeResults.length} videos found. What is missing: language? format? depth? niche sub-topic? Give ONE concrete differentiation strategy no existing video uses — be specific enough that a creator could act on it tomorrow.",
    "viralPotential": "Name the exact viral hook for this idea. Specify which platform (YouTube Shorts, Instagram Reels, LinkedIn, Reddit) would amplify it and why. Name the specific content format: e.g. '60-second before/after', 'controversial opinion backed by data', 'story-driven case study with a surprising result'.",
    "suggestedImprovements": "Give 3 brutally specific improvements: (1) change the angle to X targeting Y exact audience, (2) use Z specific format or platform, (3) solve W specific pain point that existing videos ignore. Each must be actionable in 48 hours."
  },
  "recommendations": [
    "Name the exact channel or creator to study and what to copy from their top video",
    "Name the exact format and angle to test first — one sentence pitch for the video",
    "Name the exact underserved audience segment and why they are underserved right now",
    "Name the most viable monetization path: sponsorship niche, course topic, affiliate category",
    "Name one specific risk and one concrete action to de-risk it before publishing"
  ],
  "betterAngles": [
    "Angle #1: niche + audience-specific reframe that no current video covers",
    "Angle #2: different format (Shorts, documentary, challenge, reaction) with the same core topic",
    "Angle #3: regional or language-specific version targeting an underserved audience",
    "Angle #4: contrarian or data-driven take that directly challenges the most-viewed video's premise",
    "Angle #5: collaboration or case study format that borrows credibility from an existing audience"
  ],
  "scoreBreakdown": {
    "competitionFactors": [
      "${youtubeResults.length} YouTube videos found competing for this topic",
      "Top competitor identified and their approximate dominance level",
      "Upload recency — how many new videos were published in the last 90 days"
    ],
    "demandFactors": [
      "Community interest level based on ${redditResults.length} demand signals",
      "Engagement depth — like-to-view ratio and what it signals about audience satisfaction",
      "Search intent — are people looking to learn, compare, or buy?"
    ],
    "marketGaps": [
      "Most specific underserved format gap detected from title analysis",
      "Most specific underserved audience segment with estimated size",
      "Depth or quality gap in existing content based on engagement data"
    ]
  }
}`;

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2500,
      temperature: 0.55,
      messages: [
        {
          role: 'system',
          content: 'You are a sharp startup analyst and YouTube growth strategist. Always respond with valid raw JSON only — no markdown, no backticks, no preamble. Be brutally specific. Reference real data from the prompt. Never use generic AI filler phrases. Name real channels, real gaps, real audiences. If you cannot find specific data for a claim, say "data insufficient" rather than inventing details.'
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
