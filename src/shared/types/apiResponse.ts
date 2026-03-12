// 에러 응답 타입 정의
export interface ErrorResponse {
  detail?: string | ValidationError[];
  [key: string]: unknown;
}

// FastAPI 에러 응답 타입 정의
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}
