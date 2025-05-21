# 21QUANTUMRIZZLERS

A real-time market data and news analysis platform that connects financial news to market performance.

## Features

- Real-time market data processing
- News sentiment analysis
- Technical indicators calculation
- Interactive stock visualization
- News-to-market correlation analysis

## Tech Stack

- Frontend: React.js with Material-UI
- Backend: Node.js with Express
- Database: MongoDB
- Data Processing: Custom market data processor
- Caching: Node-cache for efficient data retrieval

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kevinjones/21QUANTUMRIZZLERS.git
cd 21QUANTUMRIZZLERS
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
MONGODB_URI=mongodb://localhost:27017/newssense
PORT=3001
```

4. Start the development servers:
```bash
npm start
```

This will start both the frontend (port 3000) and backend (port 3001) servers.

## Project Structure

```
21QUANTUMRIZZLERS/
├── packages/
│   ├── frontend/          # React frontend application
│   └── backend/           # Node.js backend server
├── src/
│   ├── services/          # Backend services
│   ├── models/            # Database models
│   └── utils/             # Utility functions
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Alpha Vantage API for market data
- News API for news articles
- MongoDB for database
- Node.js and React communities
