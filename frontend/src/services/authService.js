const API_AUTH_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/auth` 
  : 'http://localhost:5000/api/auth';

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Authentication request failed.');
  }
  return data;
}

export async function sendOtpApi(phone_number) {
  const res = await fetch(`${API_AUTH_URL}/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number })
  });
  return handleResponse(res);
}

export async function verifyOtpApi(phone_number, otp_code) {
  const res = await fetch(`${API_AUTH_URL}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number, otp_code })
  });
  return handleResponse(res);
}

export async function registerApi(username, phone_number, password) {
  const res = await fetch(`${API_AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, phone_number, password })
  });
  return handleResponse(res);
}

export async function loginApi(phone_number, password) {
  const res = await fetch(`${API_AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number, password })
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
