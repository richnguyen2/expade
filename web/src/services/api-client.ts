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
    throw new Error(await extractErrorMessage(res));
  }

  // 204 No Content / DELETE responses have no JSON body.
  if (res.status === 204 || method === 'DELETE') {
    return undefined as TResponse;
  }
  return (await res.json()) as TResponse;
}

/**
 * Pull a human-readable message out of an error response. The backend returns a few shapes:
 * a bare string (`Results.BadRequest("...")`), ProblemDetails (`{ title, detail }`), or a
 * validation problem (`{ errors }`). Falls back to the status text.
 */
async function extractErrorMessage(res: Response): Promise<string> {
  const raw = await res.text().catch(() => '');
  if (raw) {
    try {
      const body = JSON.parse(raw);
      if (typeof body === 'string') return body;
      if (body?.detail) return body.detail;
      if (body?.message) return body.message;
      if (body?.errors && typeof body.errors === 'object') {
        const first = Object.values(body.errors).flat()[0];
        if (typeof first === 'string') return first;
      }
      if (body?.title) return body.title;
    } catch {
      return raw; // plain-text body
    }
  }
  return `Request failed (${res.status})`;
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
