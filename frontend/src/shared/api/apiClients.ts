import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

import { createRejectInterceptor, requestInterceptor, responseInterceptor } from './interceptors';

const BASE_URL = (import.meta.env.VITE_BASE_URL as string) || 'http://localhost:8000';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(requestInterceptor);
axiosInstance.interceptors.response.use(
  responseInterceptor,
  createRejectInterceptor(axiosInstance, BASE_URL),
);

export const apiClient = {
  get: <T>(config: AxiosRequestConfig) =>
    axiosInstance.get<T>(config.url!, config).then((response) => response.data),

  post: <T>(config: AxiosRequestConfig) =>
    axiosInstance.post<T>(config.url!, config.data, config).then((response) => response.data),
  put: <T>(config: AxiosRequestConfig) =>
    axiosInstance.put<T>(config.url!, config.data, config).then((response) => response.data),
  patch: <T>(config: AxiosRequestConfig) =>
    axiosInstance.patch<T>(config.url!, config.data, config).then((response) => response.data),
  delete: <T>(config: AxiosRequestConfig) =>
    axiosInstance.delete<T>(config.url!, config).then((response) => response.data),
} as const;
