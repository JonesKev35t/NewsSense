require('dotenv').config();
const axios = require('axios');

async function testAlphaVantageKey(apiKey, keyName) {
  try {
    if (!apiKey) {
      console.error(`${keyName} is not set`);
      return false;
    }

    console.log(`\nTesting ${keyName}...`);
    console.log('Using API Key:', apiKey);
    
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: 'AAPL',
        apikey: apiKey
      }
    });

    console.log(`${keyName} Response:`, response.data);
    
    // Check if we got a valid response (not rate limited)
    if (response.data && !response.data.Information) {
      console.log(`${keyName} is working properly!`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`${keyName} Error:`, error.response?.data || error.message);
    return false;
  }
}

async function testHuggingFace() {
  try {
    const apiKey = process.env.HUGGING_FACE_API_KEY;
    if (!apiKey) {
      console.error('HUGGING_FACE_API_KEY is not set');
      return;
    }

    console.log('Testing Hugging Face API...');
    console.log('Using API Key:', apiKey);
    
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      {
        inputs: 'This is a test sentence to check if the API is working.'
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Hugging Face Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Hugging Face API Error:', error.response?.data || error.message);
    return null;
  }
}

async function main() {
  console.log('Starting API key tests...');
  
  const keys = {
    'ALPHA_VANTAGE_API_KEY': process.env.ALPHA_VANTAGE_API_KEY,
    'ALPHA_VANTAGE_API_KEY_2': process.env.ALPHA_VANTAGE_API_KEY_2,
    'ALPHA_VANTAGE_API_KEY_3': process.env.ALPHA_VANTAGE_API_KEY_3
  };

  let workingKey = null;
  
  for (const [keyName, apiKey] of Object.entries(keys)) {
    const isWorking = await testAlphaVantageKey(apiKey, keyName);
    if (isWorking) {
      workingKey = { keyName, apiKey };
      break;
    }
  }

  if (workingKey) {
    console.log(`\nFound working API key: ${workingKey.keyName}`);
    console.log('Would you like me to update the .env file to make this the primary key?');
  } else {
    console.log('\nNo working API keys found. All keys are either rate limited or invalid.');
  }
}

main(); 