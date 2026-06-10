/**
 * Scoring Service
 * Calculates Competition, Demand, Originality, and Viral Potential scores
 * based on YouTube and Reddit/Trends data.
 * Returns transparent score breakdown + market gap analysis for UI display.
 */

exports.calculateScores = (youtubeResults, redditResults) => {
  const competitionScore = calculateCompetitionScore(youtubeResults);
  const demandScore = calculateDemandScore(redditResults, youtubeResults);
  const originalityScore = calculateOriginalityScore(youtubeResults);
  const viralScore = calculateViralScore(competitionScore, demandScore, originalityScore);

  // Weighted overall: demand matters most, low competition is a bonus
  const overallScore = Math.round(
    demandScore * 0.35 +
    originalityScore * 0.30 +
    viralScore * 0.25 +
    (100 - competitionScore) * 0.10
  );

  const breakdown = buildBreakdown(youtubeResults, redditResults, {
    competitionScore, demandScore, originalityScore, viralScore, overallScore
  });

  return { competitionScore, demandScore, originalityScore, viralScore, overallScore, breakdown };
};

// ─── COMPETITION ─────────────────────────────────────────────────────────────

function calculateCompetitionScore(ytResults) {
  if (!ytResults || ytResults.length === 0) return 10;

  const count = ytResults.length;
  const avgViews = ytResults.reduce((sum, v) => sum + (v.viewCount || 0), 0) / count;
  const maxViews = Math.max(...ytResults.map(v => v.viewCount || 0));

  let score = 0;

  // Volume of competing content
  score += Math.min(count * 4, 35);

  // Average view depth (how well existing content performs)
  if (avgViews > 1_000_000)    score += 35;
  else if (avgViews > 500_000) score += 28;
  else if (avgViews > 100_000) score += 20;
  else if (avgViews > 10_000)  score += 12;
  else if (avgViews > 1_000)   score += 6;

  // Recency pressure — fresh uploads signal active creators
  const recentVideos = ytResults.filter(v => {
    const daysDiff = (Date.now() - new Date(v.publishDate)) / (1000 * 60 * 60 * 24);
    return daysDiff < 90;
  }).length;
  score += Math.min(recentVideos * 3, 20);

  // Dominant channel penalty — one channel owning the niche = hard to break in
  if (maxViews > 5_000_000) score += 10;

  return Math.min(Math.round(score), 100);
}

// ─── DEMAND ──────────────────────────────────────────────────────────────────

function calculateDemandScore(rdResults, ytResults) {
  if ((!rdResults || rdResults.length === 0) && (!ytResults || ytResults.length === 0)) return 20;

  let score = 0;

  if (rdResults && rdResults.length > 0) {
    const totalUpvotes = rdResults.reduce((sum, p) => sum + (p.upvotes || 0), 0);
    const totalComments = rdResults.reduce((sum, p) => sum + (p.commentCount || 0), 0);

    // Community signal count
    score += Math.min(rdResults.length * 4, 20);

    // Upvote depth — indicates real audience pull
    if (totalUpvotes > 50_000)     score += 30;
    else if (totalUpvotes > 10_000) score += 25;
    else if (totalUpvotes > 1_000)  score += 18;
    else if (totalUpvotes > 100)    score += 10;

    // Comment engagement — people caring enough to discuss
    score += Math.min(Math.round(totalComments / 40), 15);
  }

  if (ytResults && ytResults.length > 0) {
    const avgLikes = ytResults.reduce((sum, v) => sum + (v.likeCount || 0), 0) / ytResults.length;
    const avgViews = ytResults.reduce((sum, v) => sum + (v.viewCount || 0), 0) / ytResults.length;
    const likeToViewRatio = avgViews > 0 ? avgLikes / avgViews : 0;

    // Like count = audience enthusiasm
    if (avgLikes > 50_000)     score += 25;
    else if (avgLikes > 10_000) score += 20;
    else if (avgLikes > 1_000)  score += 14;
    else if (avgLikes > 100)    score += 8;
    else                        score += 3;

    // Like-to-view ratio bonus — signals highly engaged niche
    if (likeToViewRatio > 0.08) score += 5;
  }

  return Math.min(Math.round(score), 100);
}

// ─── ORIGINALITY ─────────────────────────────────────────────────────────────

function calculateOriginalityScore(ytResults) {
  if (!ytResults || ytResults.length === 0) return 90;

  const count = ytResults.length;
  let score = 100;

  // More existing videos = less original space
  score -= Math.min(count * 4, 50);

  if (count > 0) {
    const titles = ytResults.map(v => (v.title || '').toLowerCase());
    const allWords = titles.join(' ').split(/\s+/).filter(w => w.length > 3);
    const uniqueWords = new Set(allWords).size;
    const totalWords = allWords.length;
    const diversityRatio = totalWords > 0 ? uniqueWords / totalWords : 0;

    // High title diversity = angles haven't been exhausted
    if (diversityRatio > 0.6)      score += 12;
    else if (diversityRatio > 0.4) score += 6;
    else if (diversityRatio < 0.2) score -= 10; // very repetitive titles = saturated

    // Channel diversity bonus — many different channels = open field
    const uniqueChannels = new Set(ytResults.map(v => v.channelName)).size;
    const channelDiversity = uniqueChannels / count;
    if (channelDiversity > 0.8) score += 8; // no dominant channel
  }

  return Math.max(Math.min(Math.round(score), 100), 5);
}

// ─── VIRAL ───────────────────────────────────────────────────────────────────

function calculateViralScore(competitionScore, demandScore, originalityScore) {
  // Viral = high demand + unique angle + not already dominated
  const score = (demandScore * 0.45) + (originalityScore * 0.35) + ((100 - competitionScore) * 0.20);
  return Math.min(Math.round(score), 100);
}

// ─── BREAKDOWN (transparent reasoning for UI) ────────────────────────────────

function buildBreakdown(ytResults, rdResults, scores) {
  const yt = ytResults || [];
  const rd = rdResults || [];

  // Competition factors
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
  if (topChannel) competitionFactors.push(`Top creator: "${topChannel.channelName}" (${formatNum(topChannel.viewCount || 0)} views)`);
  competitionFactors.push(`${recentCount} video${recentCount !== 1 ? 's' : ''} uploaded in last 90 days`);
  if (uniqueChannelCount > 1) competitionFactors.push(`${uniqueChannelCount} different channels active in this niche`);

  // Demand factors
  const totalUpvotes = rd.reduce((s, p) => s + (p.upvotes || 0), 0);
  const totalComments = rd.reduce((s, p) => s + (p.commentCount || 0), 0);
  const avgYtLikes = yt.length
    ? Math.round(yt.reduce((s, v) => s + (v.likeCount || 0), 0) / yt.length)
    : 0;
  const avgViews2 = yt.length
    ? Math.round(yt.reduce((s, v) => s + (v.viewCount || 0), 0) / yt.length)
    : 0;
  const likeRatio = avgViews2 > 0 ? ((avgYtLikes / avgViews2) * 100).toFixed(1) : null;

  const demandFactors = [];
  demandFactors.push(`${rd.length} demand signal${rd.length !== 1 ? 's' : ''} found (Google Trends / Wikipedia)`);
  if (totalUpvotes > 0) demandFactors.push(`Total community interest score: ${formatNum(totalUpvotes)}`);
  if (totalComments > 0) demandFactors.push(`Total discussions & comments: ${formatNum(totalComments)}`);
  if (avgYtLikes > 0) demandFactors.push(`Avg likes per YouTube video: ${formatNum(avgYtLikes)}`);
  if (likeRatio) demandFactors.push(`Like-to-view ratio: ${likeRatio}% (${parseFloat(likeRatio) > 5 ? 'above average engagement' : 'typical engagement'})`);

  // Market gap detection
  const marketGaps = detectMarketGaps(yt, rd, scores);

  // Weight explanation
  const weightExplanation = [
    `Demand ×0.35 → contributes ${Math.round(scores.demandScore * 0.35)} pts`,
    `Originality ×0.30 → contributes ${Math.round(scores.originalityScore * 0.30)} pts`,
    `Viral Potential ×0.25 → contributes ${Math.round(scores.viralScore * 0.25)} pts`,
    `Low Competition ×0.10 → contributes ${Math.round((100 - scores.competitionScore) * 0.10)} pts`
  ];

  return { competitionFactors, demandFactors, marketGaps, weightExplanation };
}

// ─── MARKET GAP DETECTOR ─────────────────────────────────────────────────────

function detectMarketGaps(yt, rd, scores) {
  const gaps = [];

  // Gap 1: High demand but low video count
  if (scores.demandScore > 60 && yt.length < 5) {
    gaps.push(`High audience demand (score: ${scores.demandScore}) but only ${yt.length} videos exist — wide open niche`);
  }

  // Gap 2: All videos from same channel
  const uniqueChannels = new Set(yt.map(v => v.channelName)).size;
  if (yt.length >= 3 && uniqueChannels <= 2) {
    const dominantChannel = yt[0]?.channelName || 'one creator';
    gaps.push(`Niche dominated by ${uniqueChannels === 1 ? 'a single creator' : '2 creators'} — audience waiting for alternatives to "${dominantChannel}"`);
  }

  // Gap 3: Old content, no recent uploads
  const recentCount = yt.filter(v => {
    const d = (Date.now() - new Date(v.publishDate)) / (1000 * 60 * 60 * 24);
    return d < 180;
  }).length;
  if (yt.length >= 3 && recentCount === 0) {
    gaps.push(`No videos published in last 6 months — existing content is stale, audience needs fresh takes`);
  }

  // Gap 4: Low engagement despite views (content isn't satisfying the audience)
  if (yt.length > 0) {
    const avgViews = yt.reduce((s, v) => s + (v.viewCount || 0), 0) / yt.length;
    const avgLikes = yt.reduce((s, v) => s + (v.likeCount || 0), 0) / yt.length;
    const ratio = avgViews > 0 ? avgLikes / avgViews : 0;
    if (avgViews > 50_000 && ratio < 0.02) {
      gaps.push(`Existing videos get views (avg ${formatNum(Math.round(avgViews))}) but low likes — audience is watching but not satisfied. Quality gap exists.`);
    }
  }

  // Gap 5: High originality = untapped angles remain
  if (scores.originalityScore > 65) {
    gaps.push(`High originality score (${scores.originalityScore}/100) — many unexplored angles remain; first-mover advantage available`);
  }

  // Gap 6: Strong community discussion but weak YouTube presence
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
