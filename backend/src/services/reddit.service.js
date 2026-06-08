const axios = require('axios');

let redditToken = null;
let tokenExpiry = null;

async function getRedditToken() {
  if (redditToken && tokenExpiry && Date.now() < tokenExpiry) {
    return redditToken;
  }

  if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
    throw new Error('Reddit API credentials not configured');
  }

  const response = await axios.post(
    'https://www.reddit.com/api/v1/access_token',
    'grant_type=client_credentials',
    {
      auth: {
        username: process.env.REDDIT_CLIENT_ID,
        password: process.env.REDDIT_CLIENT_SECRET
      },
      headers: {
        'User-Agent': process.env.REDDIT_USER_AGENT || 'ContentValidator/1.0',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  redditToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
  return redditToken;
}

exports.searchPosts = async (query) => {
  if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
    console.warn('⚠️  Reddit API credentials not set — using mock data');
    return getMockRedditData(query);
  }

  try {
    const token = await getRedditToken();

    const response = await axios.get('https://oauth.reddit.com/search', {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': process.env.REDDIT_USER_AGENT || 'ContentValidator/1.0'
      },
      params: { q: query, sort: 'relevance', limit: 15, type: 'link' }
    });

    return response.data.data.children.map(post => ({
      id: post.data.id,
      title: post.data.title,
      subreddit: post.data.subreddit,
      upvotes: post.data.ups,
      commentCount: post.data.num_comments,
      score: post.data.score,
      url: `https://reddit.com${post.data.permalink}`,
      createdAt: new Date(post.data.created_utc * 1000).toISOString(),
      upvoteRatio: post.data.upvote_ratio
    }));
  } catch (error) {
    console.error('Reddit API error:', error.message);
    return getMockRedditData(query);
  }
};

function getMockRedditData(query) {
  const subreddits = ['learnprogramming', 'webdev', 'cscareerquestions', 'programming', 'technology'];
  return Array.from({ length: 5 }, (_, i) => ({
    id: `mock_${i}`,
    title: `Discussion: ${query} — thoughts?`,
    subreddit: subreddits[i % subreddits.length],
    upvotes: Math.floor(Math.random() * 2000) + 10,
    commentCount: Math.floor(Math.random() * 200) + 5,
    score: Math.floor(Math.random() * 2000) + 10,
    url: `https://reddit.com/r/${subreddits[i % subreddits.length]}/mock_${i}`,
    createdAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
    upvoteRatio: 0.85 + Math.random() * 0.1
  }));
}
