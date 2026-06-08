const axios = require('axios');

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

exports.searchVideos = async (query) => {
  if (!process.env.YOUTUBE_API_KEY) {
    console.warn('⚠️  YOUTUBE_API_KEY not set — using mock data');
    return getMockYouTubeData(query);
  }

  try {
    const searchResponse = await axios.get(`${BASE_URL}/search`, {
      params: {
        key: process.env.YOUTUBE_API_KEY,
        q: query,
        part: 'snippet',
        type: 'video',
        maxResults: 10,
        order: 'relevance'
      }
    });

    const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');
    if (!videoIds) return [];

    const statsResponse = await axios.get(`${BASE_URL}/videos`, {
      params: {
        key: process.env.YOUTUBE_API_KEY,
        id: videoIds,
        part: 'statistics,snippet'
      }
    });

    return statsResponse.data.items.map(video => ({
      videoId: video.id,
      title: video.snippet.title,
      channelName: video.snippet.channelTitle,
      publishDate: video.snippet.publishedAt,
      thumbnail: video.snippet.thumbnails?.medium?.url || '',
      viewCount: parseInt(video.statistics.viewCount || 0),
      likeCount: parseInt(video.statistics.likeCount || 0),
      commentCount: parseInt(video.statistics.commentCount || 0),
      url: `https://www.youtube.com/watch?v=${video.id}`
    }));
  } catch (error) {
    console.error('YouTube API error:', error.response?.data?.error?.message || error.message);
    return getMockYouTubeData(query);
  }
};

function getMockYouTubeData(query) {
  return Array.from({ length: 5 }, (_, i) => ({
    videoId: `mock_${i}`,
    title: `${query} - Complete Guide Part ${i + 1}`,
    channelName: `Tech Channel ${i + 1}`,
    publishDate: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnail: '',
    viewCount: Math.floor(Math.random() * 500000) + 1000,
    likeCount: Math.floor(Math.random() * 10000),
    commentCount: Math.floor(Math.random() * 1000),
    url: `https://www.youtube.com/watch?v=mock_${i}`
  }));
}
