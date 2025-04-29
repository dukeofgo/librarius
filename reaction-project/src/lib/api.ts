import axios from 'axios';

export const apiBase = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_REQUEST_BASEAPI_ENDPOINT,
    headers: {'Authorization': ''}
  });

///adding Authorization containing access_token to headers before apiBase makes request
apiBase.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('access_token');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});