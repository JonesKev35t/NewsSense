import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = {
  searchNews: async (query) => {
    try {
      // Try GET request first
      const response = await axios.get(`${API_BASE_URL}/news/search`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      // If GET fails, try POST
      if (error.response && error.response.status === 405) {
        const response = await axios.post(`${API_BASE_URL}/news/search`, {
          q: query
        });
        return response.data;
      }
      throw error;
    }
  },
  getAllNews: async () => {
    const response = await axios.get(`${API_BASE_URL}/news`);
    return response.data;
  },
  getNewsByFundSymbol: async (symbol) => {
    const response = await axios.get(`${API_BASE_URL}/news/fund/${symbol}`);
    return response.data;
  }
};

// Funds API endpoints
export const getFunds = async () => {
  try {
    const response = await axios.get('/funds');
    return response.data;
  } catch (error) {
    console.error('Error fetching funds:', error);
    throw error;
  }
};

export const getFundBySymbol = async (symbol) => {
  try {
    const response = await axios.get(`/funds/${symbol}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching fund:', error);
    throw error;
  }
};

export const updateFund = async (symbol, data) => {
  try {
    const response = await axios.put(`/funds/${symbol}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating fund:', error);
    throw error;
  }
};

export default api; 