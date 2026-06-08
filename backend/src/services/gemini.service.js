const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.generateReport = async (title, youtubeResults, redditResults, scores) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  // Lazy-init: only create the client when actually called
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const ytSummary = youtubeResults.slice(0, 5).map(v =>
    `- "${v.title}" by ${v.channelName} | Views: ${v.viewCount?.toLocaleString()}`
  ).join('\n');

  const rdSummary = redditResults.slice(0, 5).map(p =>
    `- "${p.title}" in r/${p.subreddit} | Upvotes: ${p.upvotes}`
  ).join('\n');

  const prompt = `You are an expert content strategist. Analyze this content idea and provide a detailed JSON report.

Content Idea: "${title}"

Scores:
- Competition Score: ${scores.competitionScore}/100 (higher = more competition)
- Demand Score: ${scores.demandScore}/100
- Originality Score: ${scores.originalityScore}/100
- Viral Potential: ${scores.viralScore}/100
- Overall Score: ${scores.overallScore}/100

Top YouTube Videos on this topic:
${ytSummary || 'No YouTube data available'}

Reddit Discussions:
${rdSummary || 'No Reddit data available'}

Respond ONLY with a valid JSON object in this exact format (no markdown, no backticks, raw JSON only):
{
  "report": {
    "competitionAnalysis": "2-3 sentences about competition landscape",
    "audienceInterestAnalysis": "2-3 sentences about audience interest and demand",
    "originalityAssessment": "2-3 sentences about content originality",
    "viralPotential": "2-3 sentences about viral potential",
    "suggestedImprovements": "2-3 sentences with actionable improvements"
  },
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2",
    "Specific recommendation 3",
    "Specific recommendation 4"
  ],
  "betterAngles": [
    "Improved angle 1",
    "Improved angle 2",
    "Improved angle 3",
    "Improved angle 4",
    "Improved angle 5"
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const cleaned = text.replace(/```json|```/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid AI response format');

  return JSON.parse(jsonMatch[0]);
};
