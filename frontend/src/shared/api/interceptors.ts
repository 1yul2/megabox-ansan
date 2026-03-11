import axios, { type AxiosInstance } from 'axios';

import { useAuthStore } from '../model/authStore';

import { queryClient } from './queryClient';

import type { ErrorResponse } from '../types/apiResponse';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

function appendFormData(formData: FormData, key: string, value: unknown) {
  if (value == null) return;
  if (value instanceof File || value instanceof Blob) {
    formData.append(key, value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v) => appendFormData(formData, `${key}[]`, v));
    return;
  }
  if (typeof value === 'object') {
    formData.append(key, JSON.stringify(value));
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  formData.append(key, String(value));
}

export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const { accessToken } = useAuthStore.getState();
  config.headers = config.headers ?? {};

  if (accessToken) {
    (config.headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
  }

  // multipart/form-data 처리
  const contentType =
    (config.headers as Record<string, string>)['Content-Type'] ||
    (config.headers as Record<string, string>)['content-type'];

  if (contentType && contentType.includes('multipart/form-data')) {
    const formData = new FormData();
    const dataObj = (config.data as Record<string, unknown>) || {};
    Object.entries(dataObj).forEach(([key, value]) => {
      appendFormData(formData, key, value);
    });
    config.data = formData;
  }

  return config;
};

export const responseInterceptor = (response: AxiosResponse) => response;

// 커스텀 에러 클래스
export class ApiError extends Error {
  code: string;
  status?: number;
  details?: unknown;

  constructor(message: string, code: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
}

// 토큰 갱신 중 실패한 요청 큐
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

const clearSession = () => {
  useAuthStore.getState().clearAuth();
  queryClient.clear();
};

export const createRejectInterceptor =
  (axiosInstance: AxiosInstance, baseUrl: string) =>
  async (error: AxiosError<ErrorResponse>): Promise<AxiosResponse> => {
    if (!error.response) {
      return Promise.reject(new ApiError('네트워크 연결을 확인해주세요.', 'NETWORK_ERROR'));
    }

    const { status, data: errorData } = error.response;
    const originalRequest = error.config as RetryConfig;

    switch (status) {
      case 401: {
        // 로그인/근태 엔드포인트는 갱신 없이 즉시 에러 반환
        const skipRefresh =
          error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/workstatus/');

        if (skipRefresh) {
          const msg =
            typeof errorData?.detail === 'string'
              ? errorData.detail
              : '아이디 또는 비밀번호가 올바르지 않습니다.';
          return Promise.reject(new ApiError(msg, 'UNAUTHORIZED', 401));
        }

        const { accessToken } = useAuthStore.getState();

        // Access Token 자체가 없는 경우
        if (!accessToken) {
          clearSession();
          return Promise.reject(
            new ApiError('인증이 만료되었습니다. 다시 로그인해주세요.', 'UNAUTHORIZED', 401),
          );
        }

        // 이미 재시도한 요청 (Refresh Token도 만료)
        if (originalRequest._retry) {
          clearSession();
          return Promise.reject(
            new ApiError('인증이 만료되었습니다. 다시 로그인해주세요.', 'UNAUTHORIZED', 401),
          );
        }

        // 토큰 갱신 중인 경우 — 큐에 추가
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest._retry = true;
              (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err: unknown) =>
              Promise.reject(err instanceof Error ? err : new Error(String(err))),
            );
        }

        // 토큰 갱신 시작 (Cookie의 Refresh Token 사용 — withCredentials로 자동 전송)
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const response = await axios.post<RefreshTokenResponse>(
            `${baseUrl}/api/auth/refresh`,
            null,
            { withCredentials: true }, // httpOnly Cookie 자동 전송
          );

          const { access_token: newAccessToken, expires_in } = response.data;
          useAuthStore.getState().setAccessToken(newAccessToken);

          // expiresAt 갱신
          if (expires_in) {
            const { user } = useAuthStore.getState();
            if (user) {
              useAuthStore.getState().setAuth(newAccessToken, user, expires_in);
            }
          }

          processQueue(null, newAccessToken);

          (originalRequest.headers as Record<string, string>).Authorization =
            `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          clearSession();
          return Promise.reject(
            new ApiError('인증이 만료되었습니다. 다시 로그인해주세요.', 'UNAUTHORIZED', 401),
          );
        } finally {
          isRefreshing = false;
        }
      }

      case 403: {
        const msg =
          typeof errorData?.detail === 'string' ? errorData.detail : '접근 권한이 없습니다.';
        return Promise.reject(new ApiError(msg, 'FORBIDDEN', 403));
      }

      case 404:
        return Promise.reject(new ApiError('요청한 리소스를 찾을 수 없습니다.', 'NOT_FOUND', 404));

      case 422: {
        let validationMessage = '입력값을 확인해주세요.';
        if (Array.isArray(errorData?.detail)) {
          const firstError = errorData.detail[0];
          if (firstError?.msg) validationMessage = firstError.msg;
        } else if (typeof errorData?.detail === 'string') {
          validationMessage = errorData.detail;
        }
        return Promise.reject(new ApiError(validationMessage, 'VALIDATION_ERROR', 422, errorData));
      }

      case 429:
        return Promise.reject(
          new ApiError(
            typeof errorData?.detail === 'string'
              ? errorData.detail
              : '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
            'TOO_MANY_REQUESTS',
            429,
          ),
        );

      case 500:
        return Promise.reject(
          new ApiError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'SERVER_ERROR', 500),
        );

      default: {
        const defaultMessage =
          typeof errorData?.detail === 'string'
            ? errorData.detail
            : '알 수 없는 오류가 발생했습니다.';
        return Promise.reject(new ApiError(defaultMessage, 'UNKNOWN_ERROR', status));
      }
    }
  };
