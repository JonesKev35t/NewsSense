const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const newsController = require('./controllers/newsController');
const { initializeCache } = require('./services/cacheService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/news', newsController.getAllNews);
app.get('/api/news/search', newsController.searchNews);
app.post('/api/news/search', newsController.searchNews);
app.get('/api/news/fund/:symbol', newsController.getNewsByFundSymbol);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newssense')
    .then(() => {
        console.log('Connected to MongoDB');
        // Initialize cache
        return initializeCache();
    })
    .then(() => {
        // Start server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error starting server:', err);
        process.exit(1);
    }); 