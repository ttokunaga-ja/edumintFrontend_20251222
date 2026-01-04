import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; // Adjust the base URL as needed

// Example function to get data from the backend
export const fetchData = async (endpoint: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

// Example function to post data to the backend
export const postData = async (endpoint: string, data: any) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/${endpoint}`, data);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};

// Add more API functions as needed
