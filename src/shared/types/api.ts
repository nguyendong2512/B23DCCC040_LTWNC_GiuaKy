// Generic API Response Type: { ok: true, data: T } | { ok: false, error: string }
export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;

// ==========================================
// Type Guards (Kiến thức Buổi 1: TypeScript nâng cao)
// ==========================================

/**
 * Type guard kiểm tra kết quả API có thành công hay không
 */
export function isSuccess<T>(res: ApiResult<T>): res is ApiSuccess<T> {
  return res.ok === true && 'data' in res;
}

/**
 * Type guard kiểm tra kết quả API có thất bại hay không
 */
export function isError<T>(res: ApiResult<T>): res is ApiError {
  return res.ok === false && 'error' in res;
}
