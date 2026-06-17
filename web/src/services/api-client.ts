const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function request<TResponse>(
  endpoint: string,
  method: string,
  token: string | null,
  data?: unknown,
): Promise<TResponse> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (data !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || 'API request failed');
  }

  // 204 No Content / DELETE responses have no JSON body.
  if (res.status === 204 || method === 'DELETE') {
    return undefined as TResponse;
  }
  return (await res.json()) as TResponse;
}

export const apiClient = {
  get: <TResponse>(url: string, token: string | null) =>
    request<TResponse>(url, 'GET', token),
  post: <TResponse>(url: string, data: unknown, token: string | null) =>
    request<TResponse>(url, 'POST', token, data),
  patch: <TResponse>(url: string, data: unknown, token: string | null) =>
    request<TResponse>(url, 'PATCH', token, data),
  put: <TResponse>(url: string, data: unknown, token: string | null) =>
    request<TResponse>(url, 'PUT', token, data),
  delete: <TResponse = void>(url: string, token: string | null) =>
    request<TResponse>(url, 'DELETE', token),
};
