const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://blog-website-rccc.vercel.app/api').replace(/\/+$/, '');
const API_AUTH_URL = `${BASE_URL}/auth`;

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Authentication request failed.');
  }
  return data;
}

export async function registerApi(name, email, password) {
  const res = await fetch(`${API_AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return handleResponse(res);
}

export async function loginApi(email, password) {
  const res = await fetch(`${API_AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
}

export async function googleLoginApi(googlePayload) {
  const res = await fetch(`${API_AUTH_URL}/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(googlePayload)
  });
  return handleResponse(res);
}

export async function getMeApi(token) {
  const res = await fetch(`${API_AUTH_URL}/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return handleResponse(res);
}

export async function updateProfileApi(token, profileData) {
  const res = await fetch(`${API_AUTH_URL}/profile`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(profileData)
  });
  return handleResponse(res);
}
