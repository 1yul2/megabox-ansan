import axios, { type AxiosInstance } from 'axios';

import { useAuthStore } from '../model/authStore';

import { queryClient } from './queryClient';

import type { ErrorResponse } from '../types/apiResponse';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

function appendFormData(formData: FormData, key: string, value: unknown) {
  if (value == null) return;

  // File 또는 Blob
  if (value instanceof File || value instanceof Blob) {
    formData.append(key, value);
    return;
  }

  // 배열이면 key[] 형식으로 append
  if (Array.isArray(value)) {
    value.forEach((v) => appendFormData(formData, `${key}[]`, v));
    return;
  }

  // 객체면 JSON 문자열로 append (서버에서 JSON을 기대하면 이 방식을 사용)
  if (typeof value === 'object') {
    formData.append(key, JSON.stringify(value));
    return;
  }

  // 그 외 기본값은 문자열로 append (object/array/Blob은 위에서 처리됨)
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  formData.append(key, String(value));
}

export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const { accessToken, refreshToken } = useAuthStore.getState();
  config.headers = config.headers ?? {};
  const url = config.url ?? '';

  if (url.includes('/api/auth/logout')) {
    if (refreshToken) {
      (config.headers as Record<string, string>).Authorization = `Bearer ${refreshToken}`;
    }
    return config;
  }

  if (accessToken) {
    (config.headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
  }

  // multipart/form-data 처리: content-type 비교는 좀 더 안전하게 검사
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

// 응답 성공 인터셉터
export const responseInterceptor = (response: AxiosResponse) => {
  return response;
};

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

// 재시도 플래그용 타입
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 리프레시 응답 타입
interface RefreshTokenResponse {
  access_token: string;
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

// 응답 에러 인터셉터 팩토리
// axiosInstance와 baseUrl을 직접 참조해야 원본 요청 재시도 및 refresh 호출이 가능하므로 팩토리 패턴 사용
export const createRejectInterceptor =
  (axiosInstance: AxiosInstance, baseUrl: string) =>
  async (error: AxiosError<ErrorResponse>): Promise<AxiosResponse> => {
    // 네트워크 에러
    if (!error.response) {
      return Promise.reject(new ApiError('네트워크 연결을 확인해주세요.', 'NETWORK_ERROR'));
    }

    const status = error.response.status;
    const errorData = error.response.data;
    const originalRequest = error.config as RetryConfig;

    switch (status) {
      case 401: {
        // 로그인/근태 API는 토큰 만료와 무관한 401 → 갱신 시도 없이 바로 에러 반환
        const isAuthRequest = error.config?.url?.includes('/auth/login');
        const isWorkStatusRequest = error.config?.url?.includes('/workstatus/');

        if (isAuthRequest || isWorkStatusRequest) {
          const msg =
            typeof errorData?.detail === 'string'
              ? errorData.detail
              : '아이디 또는 비밀번호가 올바르지 않습니다.';
          return Promise.reject(new ApiError(msg, 'UNAUTHORIZED', 401));
        }

        const { accessToken, refreshToken } = useAuthStore.getState();

        // 토큰 자체가 없는 경우 — 미인증 상태
        if (!accessToken || !refreshToken) {
          if (accessToken) clearSession();
          return Promise.reject(
            new ApiError('인증이 만료되었습니다. 다시 로그인해주세요.', 'UNAUTHORIZED', 401),
          );
        }

        // 이미 재시도한 요청 — refreshToken도 만료된 경우
        if (originalRequest._retry) {
          clearSession();
          return Promise.reject(
            new ApiError('인증이 만료되었습니다. 다시 로그인해주세요.', 'UNAUTHORIZED', 401),
          );
        }

        // 토큰 갱신 중인 경우 — 이 요청은 큐에 추가하여 갱신 완료 후 재시도
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

        // 토큰 갱신 시작
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // 인터셉터 루프 방지를 위해 raw axios 사용 (axiosInstance 인터셉터 우회)
          const response = await axios.post<RefreshTokenResponse>(
            `${baseUrl}/api/auth/refresh`,
            null,
            { params: { refresh_token: refreshToken } },
          );

          const newAccessToken = response.data.access_token;
          useAuthStore.getState().setAccessToken(newAccessToken);
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

      case 403:
        return Promise.reject(new ApiError('접근 권한이 없습니다.', 'FORBIDDEN', 403));

      case 404:
        return Promise.reject(new ApiError('요청한 리소스를 찾을 수 없습니다.', 'NOT_FOUND', 404));

      case 422: {
        // Validation 에러 - FastAPI 형식 처리
        let validationMessage = '입력값을 확인해주세요.';

        if (Array.isArray(errorData?.detail)) {
          const firstError = errorData.detail[0];
          if (firstError?.msg) {
            validationMessage = firstError.msg;
          }
        } else if (typeof errorData?.detail === 'string') {
          validationMessage = errorData.detail;
        }

        return Promise.reject(new ApiError(validationMessage, 'VALIDATION_ERROR', 422, errorData));
      }

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
