const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
let cleanUrl = rawUrl.replace(/^\/+/, '').replace(/\/+$/, '');
if (!cleanUrl.endsWith('/api')) {
  cleanUrl = `${cleanUrl}/api`;
}
const BASE_URL = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;

const API_AUTH_URL = `${BASE_URL}/auth`;

async function handleResponse(response) {
  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    throw new Error(`Server returned ${response.status} 404. Ensure your backend Node.js server (server.js) is running/deployed and NEXT_PUBLIC_API_URL points to your backend server.`);
  }

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
