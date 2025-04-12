const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY_3;
const BASE_URL = 'https://www.alphavantage.co/query';

async function testAPI() {
  try {
    console.log('Testing Alpha Vantage API with third key...');
    console.log('Using API key:', API_KEY.substring(0, 4) + '...');

    // Test with a simple TIME_SERIES_DAILY endpoint for RELIANCE.BSE
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: 'RELIANCE.BSE',
        apikey: API_KEY,
        outputsize: 'compact'
      },
      timeout: 10000
    });

    console.log('\nResponse:', JSON.stringify(response.data, null, 2));

    if (response.data['Time Series (Daily)']) {
      console.log('\nAPI is working! Found daily time series data.');
      const dates = Object.keys(response.data['Time Series (Daily)']);
      const latestDate = dates[0];
      const latestData = response.data['Time Series (Daily)'][latestDate];
      
      console.log('\nLatest data for RELIANCE.BSE:');
      console.log('Date:', latestDate);
      console.log('Open:', latestData['1. open']);
      console.log('High:', latestData['2. high']);
      console.log('Low:', latestData['3. low']);
      console.log('Close:', latestData['4. close']);
      console.log('Volume:', latestData['5. volume']);
    } else if (response.data['Error Message']) {
      console.error('API Error:', response.data['Error Message']);
    } else if (response.data['Note']) {
      console.warn('Rate limit note:', response.data['Note']);
    } else {
      console.error('Unexpected response format:', response.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testAPI().catch(console.error); 