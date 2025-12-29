import axios from 'axios';

const API_URL = 'http://localhost:8080/api/medecins';

export const dashboardService = {
  getStats: async (userId) => {
    const response = await axios.get(`${API_URL}/dashboard/stats`, {
      params: { userId }
    });
    return response.data;
  },

  getChartData: async (userId) => {
    const response = await axios.get(`${API_URL}/dashboard/chart-data`, {
      params: { userId }
    });
    return response.data;
  }
};