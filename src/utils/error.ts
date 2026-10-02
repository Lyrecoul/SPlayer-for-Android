export function toError(e: unknown): Error {
  if (e instanceof Error) return e;
  return new Error(String(e));
}

/**
 * 提取接口错误信息
 * @param e 异常对象
 * @param fallback 兜底提示
 */
export function getRequestErrorMessage(e: unknown, fallback = "请求失败，请稍后重试"): string {
  const data = (e as { response?: { data?: { msg?: string; message?: string } } })?.response?.data;
  return data?.msg || data?.message || fallback;
}
