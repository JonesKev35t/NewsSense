const News = require('../models/news');

const newsController = {
  async getAllNews(req, res) {
    try {
      const news = await News.find().sort({ publishedAt: -1 });
      res.json(news);
    } catch (error) {
      console.error('Error getting news:', error);
      res.status(500).json({ error: 'Failed to get news' });
    }
  },

  async searchNews(req, res) {
    try {
      // Check both query parameters and request body for search query
      const query = req.query.q || req.body.q;
      console.log('Search query received:', query);
      
      if (!query) {
        console.log('No search query provided');
        return res.status(400).json({ error: 'Search query is required' });
      }

      // Log the search criteria
      const searchCriteria = {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } }
        ]
      };
      console.log('Searching with criteria:', JSON.stringify(searchCriteria));

      const news = await News.find(searchCriteria).sort({ publishedAt: -1 });
      console.log('Found news articles:', news.length);

      res.json(news);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Failed to search news' });
    }
  },

  async createNews(req, res) {
    try {
      const news = new News(req.body);
      await news.save();
      res.status(201).json(news);
    } catch (error) {
      console.error('Error creating news:', error);
      res.status(500).json({ error: 'Failed to create news' });
    }
  }
};

module.exports = newsController; 