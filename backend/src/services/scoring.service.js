/**
 * Scoring Service
 * Calculates Competition, Demand, Originality, Viral Potential,
 * Confidence, and Execution Difficulty scores.
 * Also extracts structured keywords, competitors, marketGaps, and trendData.
 */

exports.calculateScores = (youtubeResults, redditResults) => {
  const competitionScore  = calculateCompetitionScore(youtubeResults);
  const demandScore       = calculateDemandScore(redditResults, youtubeResults);
  const originalityScore  = calculateOriginalityScore(youtubeResults);
  const viralScore        = calculateViralScore(competitionScore, demandScore, originalityScore);

  // Weighted overall: demand matters most, low competition is a bonus
  const overallScore = Math.round(
    demandScore      * 0.35 +
    originalityScore * 0.30 +
    viralScore       * 0.25 +
    (100 - competitionScore) * 0.10
  );

  const confidenceScore     = calculateConfidenceScore(youtubeResults, redditResults);
  const executionDifficulty = calculateExecutionDifficulty(competitionScore, youtubeResults);

  const breakdown   = buildBreakdown(youtubeResults, redditResults, {
    competitionScore, demandScore, originalityScore, viralScore, overallScore
  });

  // Structured fields for the DB
  const keywords    = extractKeywords(youtubeResults, redditResults);
  const competitors = extractCompetitors(youtubeResults);
  const marketGaps  = extractStructuredGaps(youtubeResults, redditResults, {
    competitionScore, demandScore, originalityScore
  });
  const trendData   = buildTrendData(youtubeResults, redditResults);

  return {
    competitionScore,
    demandScore,
    originalityScore,
    viralScore,
    overallScore,
    confidenceScore,
    executionDifficulty,
    breakdown,
    keywords,
    competitors,
    marketGaps,
    trendData
  };
};

// ─── COMPETITION ─────────────────────────────────────────────────────────────

function calculateCompetitionScore(ytResults) {
  if (!ytResults || ytResults.length === 0) return 10;

  const count   = ytResults.length;
  const avgViews = ytResults.reduce((sum, v) => sum + (v.viewCount || 0), 0) / count;
  const maxViews = Math.max(...ytResults.map(v => v.viewCount || 0));

  let score = 0;
  score += Math.min(count * 4, 35);

  if (avgViews > 1_000_000)    score += 35;
  else if (avgViews > 500_000) score += 28;
  else if (avgViews > 100_000) score += 20;
  else if (avgViews > 10_000)  score += 12;
  else if (avgViews > 1_000)   score += 6;

  const recentVideos = ytResults.filter(v => {
    const daysDiff = (Date.now() - new Date(v.publishDate)) / (1000 * 60 * 60 * 24);
    return daysDiff < 90;
  }).length;
  score += Math.min(recentVideos * 3, 20);

  if (maxViews > 5_000_000) score += 10;

  return Math.min(Math.round(score), 100);
}

// ─── DEMAND ──────────────────────────────────────────────────────────────────

function calculateDemandScore(rdResults, ytResults) {
  if ((!rdResults || rdResults.length === 0) && (!ytResults || ytResults.length === 0)) return 20;

  let score = 0;

  if (rdResults && rdResults.length > 0) {
    const totalUpvotes  = rdResults.reduce((sum, p) => sum + (p.upvotes || 0), 0);
    const totalComments = rdResults.reduce((sum, p) => sum + (p.commentCount || 0), 0);

    score += Math.min(rdResults.length * 4, 20);

    if (totalUpvotes > 50_000)      score += 30;
    else if (totalUpvotes > 10_000) score += 25;
    else if (totalUpvotes > 1_000)  score += 18;
    else if (totalUpvotes > 100)    score += 10;

    score += Math.min(Math.round(totalComments / 40), 15);
  }

  if (ytResults && ytResults.length > 0) {
    const avgLikes        = ytResults.reduce((sum, v) => sum + (v.likeCount || 0), 0) / ytResults.length;
    const avgViews        = ytResults.reduce((sum, v) => sum + (v.viewCount || 0), 0) / ytResults.length;
    const likeToViewRatio = avgViews > 0 ? avgLikes / avgViews : 0;

    if (avgLikes > 50_000)      score += 25;
    else if (avgLikes > 10_000) score += 20;
    else if (avgLikes > 1_000)  score += 14;
    else if (avgLikes > 100)    score += 8;
    else                        score += 3;

    if (likeToViewRatio > 0.08) score += 5;
  }

  return Math.min(Math.round(score), 100);
}

// ─── ORIGINALITY ─────────────────────────────────────────────────────────────

function calculateOriginalityScore(ytResults) {
  if (!ytResults || ytResults.length === 0) return 90;

  const count = ytResults.length;
  let score   = 100;

  score -= Math.min(count * 4, 50);

  if (count > 0) {
    const titles       = ytResults.map(v => (v.title || '').toLowerCase());
    const allWords     = titles.join(' ').split(/\s+/).filter(w => w.length > 3);
    const uniqueWords  = new Set(allWords).size;
    const totalWords   = allWords.length;
    const diversityRatio = totalWords > 0 ? uniqueWords / totalWords : 0;

    if (diversityRatio > 0.6)      score += 12;
    else if (diversityRatio > 0.4) score += 6;
    else if (diversityRatio < 0.2) score -= 10;

    const uniqueChannels   = new Set(ytResults.map(v => v.channelName)).size;
    const channelDiversity = uniqueChannels / count;
    if (channelDiversity > 0.8) score += 8;
  }

  return Math.max(Math.min(Math.round(score), 100), 5);
}

// ─── VIRAL ───────────────────────────────────────────────────────────────────

function calculateViralScore(competitionScore, demandScore, originalityScore) {
  const score = (demandScore * 0.45) + (originalityScore * 0.35) + ((100 - competitionScore) * 0.20);
  return Math.min(Math.round(score), 100);
}

// ─── CONFIDENCE ──────────────────────────────────────────────────────────────
/**
 * How trustworthy is this analysis?
 * Penalised when we have little data; boosted when both YouTube and trend data are rich.
 */
function calculateConfidenceScore(ytResults, rdResults) {
  const yt = ytResults || [];
  const rd = rdResults || [];
  let score = 40; // baseline

  // YouTube data richness
  if (yt.length >= 8)       score += 25;
  else if (yt.length >= 4)  score += 15;
  else if (yt.length >= 1)  score += 8;

  // Trend / Reddit data richness
  if (rd.length >= 6)       score += 20;
  else if (rd.length >= 3)  score += 12;
  else if (rd.length >= 1)  score += 6;

  // Videos with real engagement (not 0 likes) = API returned real data
  const withLikes = yt.filter(v => (v.likeCount || 0) > 0).length;
  if (withLikes >= 5)       score += 15;
  else if (withLikes >= 2)  score += 8;

  return Math.min(Math.round(score), 100);
}

// ─── EXECUTION DIFFICULTY ────────────────────────────────────────────────────
/**
 * How hard is it for a new creator to actually break into this niche?
 * High competition + dominant channels + very recent uploads = very hard.
 */
function calculateExecutionDifficulty(competitionScore, ytResults) {
  const yt = ytResults || [];
  let score = competitionScore * 0.5; // start from competition as a base

  // Dominant channel check: if one channel has >50% of total views, very hard
  if (yt.length > 0) {
    const totalViews = yt.reduce((s, v) => s + (v.viewCount || 0), 0);
    const maxViews   = Math.max(...yt.map(v => v.viewCount || 0));
    const dominance  = totalViews > 0 ? maxViews / totalViews : 0;

    if (dominance > 0.5)      score += 25;
    else if (dominance > 0.3) score += 12;

    // Very active niche (many recent uploads) = hard to get noticed
    const recentUploads = yt.filter(v => {
      const d = (Date.now() - new Date(v.publishDate)) / (1000 * 60 * 60 * 24);
      return d < 30;
    }).length;

    if (recentUploads >= 5)      score += 20;
    else if (recentUploads >= 2) score += 10;
  }

  return Math.min(Math.round(score), 100);
}

// ─── KEYWORD EXTRACTION ───────────────────────────────────────────────────────
/**
 * Extract the most meaningful words from YouTube titles and Reddit post titles.
 * Returns top 15 keywords, filtered of stop words.
 */
const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with',
  'is','are','was','were','be','been','being','have','has','had','do','does',
  'did','will','would','could','should','may','might','this','that','these',
  'those','i','you','he','she','it','we','they','what','which','who','how',
  'your','my','our','their','its','from','by','as','up','out','if','about',
  'into','through','during','before','after','above','below','between',
  'each','more','most','other','some','such','no','not','only','same','so',
  'than','too','very','just','can','vs','vs.','like','get','make','use',
  '2024','2025','2026','new','best','top','free','full','part','amp'
]);

function extractKeywords(ytResults, rdResults) {
  const yt = ytResults || [];
  const rd = rdResults || [];

  const allTitles = [
    ...yt.map(v => v.title || ''),
    ...rd.map(p => p.title || '')
  ];

  const freq = {};
  allTitles.forEach(title => {
    title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !STOP_WORDS.has(w))
      .forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);
}

// ─── COMPETITOR EXTRACTION ────────────────────────────────────────────────────

function extractCompetitors(ytResults) {
  if (!ytResults || ytResults.length === 0) return [];

  const totalViews = ytResults.reduce((s, v) => s + (v.viewCount || 0), 0);

  // Deduplicate by channel name, keeping the highest-viewed video per channel
  const byChannel = {};
  ytResults.forEach(v => {
    const ch = v.channelName || 'Unknown';
    if (!byChannel[ch] || (v.viewCount || 0) > (byChannel[ch].viewCount || 0)) {
      byChannel[ch] = v;
    }
  });

  return Object.values(byChannel)
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5)
    .map(v => {
      const share = totalViews > 0 ? (v.viewCount || 0) / totalViews : 0;
      return {
        name:      v.channelName || 'Unknown',
        views:     v.viewCount   || 0,
        url:       v.url         || '',
        dominance: share > 0.4 ? 'dominant' : share > 0.2 ? 'moderate' : 'minor'
      };
    });
}

// ─── STRUCTURED MARKET GAPS ──────────────────────────────────────────────────

function extractStructuredGaps(ytResults, rdResults, scores) {
  const yt   = ytResults || [];
  const rd   = rdResults || [];
  const gaps = [];

  const titles = yt.map(v => (v.title || '').toLowerCase());

  // Language gaps
  const hasHindi    = titles.some(t => /hindi|हिंदी|हिन्दी/.test(t));
  const hasTamil    = titles.some(t => /tamil|தமிழ்/.test(t));
  const hasSpanish  = titles.some(t => /español|spanish/.test(t));

  if (!hasHindi)   gaps.push({ type: 'language', description: 'No Hindi-language content detected' });
  if (!hasTamil)   gaps.push({ type: 'language', description: 'No Tamil-language content detected' });
  if (!hasSpanish) gaps.push({ type: 'language', description: 'No Spanish-language content detected' });

  // Format gaps
  const hasShorts   = titles.some(t => /#shorts|shorts/.test(t));
  const hasBeginner = titles.some(t => /beginner|basics|introduction|for students|getting started/.test(t));
  const hasAdvanced = titles.some(t => /advanced|deep dive|mastery|expert/.test(t));

  if (!hasShorts)   gaps.push({ type: 'format',   description: 'No YouTube Shorts format content detected' });
  if (!hasBeginner) gaps.push({ type: 'audience',  description: 'No beginner/student-level content detected' });
  if (!hasAdvanced) gaps.push({ type: 'depth',     description: 'No advanced/expert-level content detected' });

  // Platform gap: strong demand but weak YouTube presence
  const totalUpvotes = rd.reduce((s, p) => s + (p.upvotes || 0), 0);
  if (totalUpvotes > 500 && yt.length < 8) {
    gaps.push({ type: 'platform', description: 'Strong community demand but thin YouTube coverage' });
  }

  // Engagement quality gap
  if (yt.length > 0) {
    const avgViews = yt.reduce((s, v) => s + (v.viewCount || 0), 0) / yt.length;
    const avgLikes = yt.reduce((s, v) => s + (v.likeCount || 0), 0) / yt.length;
    const ratio    = avgViews > 0 ? avgLikes / avgViews : 0;
    if (avgViews > 50_000 && ratio < 0.02) {
      gaps.push({ type: 'depth', description: 'High views but low engagement — audience not satisfied with existing content' });
    }
  }

  return gaps;
}

// ─── TREND DATA SNAPSHOT ─────────────────────────────────────────────────────

function buildTrendData(ytResults, rdResults) {
  const yt = ytResults || [];
  const rd = rdResults || [];

  const totalUpvotes  = rd.reduce((s, p) => s + (p.upvotes || 0), 0);
  const totalComments = rd.reduce((s, p) => s + (p.commentCount || 0), 0);

  const avgViews = yt.length
    ? Math.round(yt.reduce((s, v) => s + (v.viewCount || 0), 0) / yt.length)
    : 0;

  const recentUploads = yt.filter(v => {
    const d = (Date.now() - new Date(v.publishDate)) / (1000 * 60 * 60 * 24);
    return d < 90;
  }).length;

  const avgLikes = yt.length
    ? yt.reduce((s, v) => s + (v.likeCount || 0), 0) / yt.length
    : 0;
  const avgLikeViewRatio = avgViews > 0
    ? parseFloat((avgLikes / avgViews).toFixed(4))
    : 0;

  return {
    redditSignals:    rd.length,
    totalUpvotes,
    totalComments,
    youtubeVideos:    yt.length,
    avgViews,
    recentUploads,
    avgLikeViewRatio
  };
}

// ─── BREAKDOWN (transparent reasoning for UI) ────────────────────────────────

function buildBreakdown(ytResults, rdResults, scores) {
  const yt = ytResults || [];
  const rd = rdResults || [];

  const avgViews = yt.length
    ? Math.round(yt.reduce((s, v) => s + (v.viewCount || 0), 0) / yt.length)
    : 0;

  const recentCount = yt.filter(v => {
    const d = (Date.now() - new Date(v.publishDate)) / (1000 * 60 * 60 * 24);
    return d < 90;
  }).length;

  const topChannel = yt.length
    ? yt.reduce((top, v) => (v.viewCount || 0) > (top.viewCount || 0) ? v : top, yt[0])
    : null;

  const uniqueChannelCount = new Set(yt.map(v => v.channelName)).size;

  const competitionFactors = [];
  competitionFactors.push(`${yt.length} competing YouTube video${yt.length !== 1 ? 's' : ''} found`);
  if (avgViews > 0) competitionFactors.push(`Average views per video: ${formatNum(avgViews)}`);
  if (topChannel)   competitionFactors.push(`Top creator: "${topChannel.channelName}" (${formatNum(topChannel.viewCount || 0)} views)`);
  competitionFactors.push(`${recentCount} video${recentCount !== 1 ? 's' : ''} uploaded in last 90 days`);
  if (uniqueChannelCount > 1) competitionFactors.push(`${uniqueChannelCount} different channels active in this niche`);

  const totalUpvotes  = rd.reduce((s, p) => s + (p.upvotes || 0), 0);
  const totalComments = rd.reduce((s, p) => s + (p.commentCount || 0), 0);
  const avgYtLikes    = yt.length ? Math.round(yt.reduce((s, v) => s + (v.likeCount || 0), 0) / yt.length) : 0;
  const avgViews2     = yt.length ? Math.round(yt.reduce((s, v) => s + (v.viewCount || 0), 0) / yt.length) : 0;
  const likeRatio     = avgViews2 > 0 ? ((avgYtLikes / avgViews2) * 100).toFixed(1) : null;

  const demandFactors = [];
  demandFactors.push(`${rd.length} demand signal${rd.length !== 1 ? 's' : ''} found (Google Trends / Wikipedia)`);
  if (totalUpvotes > 0)  demandFactors.push(`Total community interest score: ${formatNum(totalUpvotes)}`);
  if (totalComments > 0) demandFactors.push(`Total discussions & comments: ${formatNum(totalComments)}`);
  if (avgYtLikes > 0)    demandFactors.push(`Avg likes per YouTube video: ${formatNum(avgYtLikes)}`);
  if (likeRatio)         demandFactors.push(`Like-to-view ratio: ${likeRatio}% (${parseFloat(likeRatio) > 5 ? 'above average engagement' : 'typical engagement'})`);

  const marketGaps = detectMarketGaps(yt, rd, scores);

  const weightExplanation = [
    `Demand ×0.35 → contributes ${Math.round(scores.demandScore * 0.35)} pts`,
    `Originality ×0.30 → contributes ${Math.round(scores.originalityScore * 0.30)} pts`,
    `Viral Potential ×0.25 → contributes ${Math.round(scores.viralScore * 0.25)} pts`,
    `Low Competition ×0.10 → contributes ${Math.round((100 - scores.competitionScore) * 0.10)} pts`
  ];

  return { competitionFactors, demandFactors, marketGaps, weightExplanation };
}

// ─── MARKET GAP DETECTOR (narrative, for score breakdown UI) ─────────────────

function detectMarketGaps(yt, rd, scores) {
  const gaps = [];

  if (scores.demandScore > 60 && yt.length < 5) {
    gaps.push(`High audience demand (score: ${scores.demandScore}) but only ${yt.length} videos exist — wide open niche`);
  }

  const uniqueChannels    = new Set(yt.map(v => v.channelName)).size;
  if (yt.length >= 3 && uniqueChannels <= 2) {
    const dominantChannel = yt[0]?.channelName || 'one creator';
    gaps.push(`Niche dominated by ${uniqueChannels === 1 ? 'a single creator' : '2 creators'} — audience waiting for alternatives to "${dominantChannel}"`);
  }

  const recentCount = yt.filter(v => {
    const d = (Date.now() - new Date(v.publishDate)) / (1000 * 60 * 60 * 24);
    return d < 180;
  }).length;
  if (yt.length >= 3 && recentCount === 0) {
    gaps.push(`No videos published in last 6 months — existing content is stale, audience needs fresh takes`);
  }

  if (yt.length > 0) {
    const avgViews = yt.reduce((s, v) => s + (v.viewCount || 0), 0) / yt.length;
    const avgLikes = yt.reduce((s, v) => s + (v.likeCount || 0), 0) / yt.length;
    const ratio    = avgViews > 0 ? avgLikes / avgViews : 0;
    if (avgViews > 50_000 && ratio < 0.02) {
      gaps.push(`Existing videos get views (avg ${formatNum(Math.round(avgViews))}) but low likes — audience is watching but not satisfied. Quality gap exists.`);
    }
  }

  if (scores.originalityScore > 65) {
    gaps.push(`High originality score (${scores.originalityScore}/100) — many unexplored angles remain; first-mover advantage available`);
  }

  const totalUpvotes = rd.reduce((s, p) => s + (p.upvotes || 0), 0);
  if (totalUpvotes > 500 && yt.length < 8) {
    gaps.push(`Strong community discussion (${formatNum(totalUpvotes)} upvotes/interest) but thin YouTube coverage — demand exceeds supply`);
  }

  if (gaps.length === 0) {
    gaps.push('Market is competitive — success requires a highly differentiated angle or underserved sub-audience');
  }

  return gaps;
}

function formatNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

exports.getVerdict = (overallScore) => {
  if (overallScore >= 75) return 'Excellent';
  if (overallScore >= 55) return 'Good';
  if (overallScore >= 35) return 'Average';
  return 'Poor';
};
