/**
 * Scoring Service
 * Calculates Competition, Demand, Originality, and Viral Potential scores
 * based on YouTube and Reddit data.
 */

exports.calculateScores = (youtubeResults, redditResults) => {
  const competitionScore = calculateCompetitionScore(youtubeResults);
  const demandScore = calculateDemandScore(redditResults, youtubeResults);
  const originalityScore = calculateOriginalityScore(youtubeResults);
  const viralScore = calculateViralScore(competitionScore, demandScore, originalityScore);
  const overallScore = Math.round((demandScore * 0.35 + originalityScore * 0.30 + viralScore * 0.25 + (100 - competitionScore) * 0.10));

  return { competitionScore, demandScore, originalityScore, viralScore, overallScore };
};

function calculateCompetitionScore(ytResults) {
  if (!ytResults || ytResults.length === 0) return 10;

  const count = ytResults.length;
  const avgViews = ytResults.reduce((sum, v) => sum + (v.viewCount || 0), 0) / count;

  // Higher count + high views = more competition
  let score = 0;
  score += Math.min(count * 5, 40); // Up to 40 pts for number of videos
  if (avgViews > 1000000) score += 40;
  else if (avgViews > 100000) score += 30;
  else if (avgViews > 10000) score += 20;
  else if (avgViews > 1000) score += 10;

  // Recency factor
  const recentVideos = ytResults.filter(v => {
    const daysDiff = (Date.now() - new Date(v.publishDate)) / (1000 * 60 * 60 * 24);
    return daysDiff < 90;
  }).length;
  score += Math.min(recentVideos * 3, 20);

  return Math.min(Math.round(score), 100);
}

function calculateDemandScore(rdResults, ytResults) {
  if ((!rdResults || rdResults.length === 0) && (!ytResults || ytResults.length === 0)) return 20;

  let score = 0;

  // Reddit signals
  if (rdResults && rdResults.length > 0) {
    const totalUpvotes = rdResults.reduce((sum, p) => sum + (p.upvotes || 0), 0);
    const totalComments = rdResults.reduce((sum, p) => sum + (p.commentCount || 0), 0);

    score += Math.min(rdResults.length * 4, 20);
    if (totalUpvotes > 10000) score += 25;
    else if (totalUpvotes > 1000) score += 20;
    else if (totalUpvotes > 100) score += 10;
    score += Math.min(Math.round(totalComments / 50), 15);
  }

  // YouTube engagement as demand proxy
  if (ytResults && ytResults.length > 0) {
    const avgLikes = ytResults.reduce((sum, v) => sum + (v.likeCount || 0), 0) / ytResults.length;
    if (avgLikes > 10000) score += 25;
    else if (avgLikes > 1000) score += 20;
    else if (avgLikes > 100) score += 10;
    else score += 5;
  }

  return Math.min(Math.round(score), 100);
}

function calculateOriginalityScore(ytResults) {
  if (!ytResults || ytResults.length === 0) return 90;

  const count = ytResults.length;
  // Fewer results = more original
  let score = 100;
  score -= Math.min(count * 5, 50); // Deduct for each result

  // Check title diversity (proxy for originality)
  if (count > 0) {
    const titles = ytResults.map(v => v.title.toLowerCase());
    const uniqueWords = new Set(titles.join(' ').split(' ')).size;
    if (uniqueWords > 50) score += 10;
    else if (uniqueWords < 20) score -= 10;
  }

  return Math.max(Math.min(Math.round(score), 100), 5);
}

function calculateViralScore(competitionScore, demandScore, originalityScore) {
  // Sweet spot: high demand, moderate competition, decent originality
  const score = (demandScore * 0.45) + (originalityScore * 0.35) + ((100 - competitionScore) * 0.20);
  return Math.min(Math.round(score), 100);
}

exports.getVerdict = (overallScore) => {
  if (overallScore >= 75) return 'Excellent';
  if (overallScore >= 55) return 'Good';
  if (overallScore >= 35) return 'Average';
  return 'Poor';
};
