const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// api-client.ts
const request = async (endpoint: string, method: string, token: string | null, data?: any) => {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
  };

  if (data) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || 'API request failed');
  }

  return res.json();
};

export const apiClient = {
  get: (url: string, token: string | null) => request(url, 'GET', token),
  post: (url: string, data: any, token: string | null) => request(url, 'POST', token, data),
  patch: (url: string, data: any, token: string | null) => request(url, 'PATCH', token, data),
};