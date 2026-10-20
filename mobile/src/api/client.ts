import axios from 'axios';
import { Platform, NativeModules } from 'react-native';

function resolveBaseUrl(): string {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api/v1';
  }

  const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/^https?:\/\/(\d+\.\d+\.\d+\.\d+):\d+/);
    if (match?.[1] && match[1] !== '127.0.0.1') {
      return `http://${match[1]}:5000/api/v1`;
    }
  }

  return 'http://192.168.1.3:5000/api/v1';
}

const DEFAULT_BASE_URL = resolveBaseUrl();

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
