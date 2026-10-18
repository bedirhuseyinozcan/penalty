import axios from 'axios';
import { Platform } from 'react-native';

const DEFAULT_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api/v1'
    : 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('API Request Warning:', error.message);
    return Promise.reject(error);
  }
);
