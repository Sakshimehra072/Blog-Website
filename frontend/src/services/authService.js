function getBaseUrl() {
  if (typeof window !== 'undefined') {
    if (process.env.NEXT_PUBLIC_API_URL) {
      let clean = process.env.NEXT_PUBLIC_API_URL.replace(/^\/+/, '').replace(/\/+$/, '');
      if (!clean.endsWith('/api')) clean = `${clean}/api`;
      return clean.startsWith('http') ? clean : `https://${clean}`;
    }
    return '/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

const BASE_URL = getBaseUrl();
const API_AUTH_URL = `${BASE_URL}/auth`;

// Local user persistence helper for serverless/offline fallback
function getLocalRegisteredUsers() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('blogverse_local_registered_users');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function saveLocalRegisteredUser(user, password) {
  if (typeof window === 'undefined') return;
  try {
    const users = getLocalRegisteredUsers();
    const cleanEmail = user.email.trim().toLowerCase();
    const cleanName = user.name ? user.name.trim().toLowerCase() : '';
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail || (cleanName && u.name.toLowerCase() === cleanName));
    const entry = { ...user, password };
    if (existingIndex !== -1) {
      users[existingIndex] = entry;
    } else {
      users.push(entry);
    }
    localStorage.setItem('blogverse_local_registered_users', JSON.stringify(users));
  } catch (err) {}
}

async function handleResponse(response) {
  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    throw new Error(`Server returned ${response.status} status.`);
  }

  if (!response.ok) {
    throw new Error(data.message || 'Authentication request failed.');
  }
  return data;
}

export async function registerApi(name, email, password) {
  try {
    const res = await fetch(`${API_AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await handleResponse(res);
    if (data && data.user) {
      saveLocalRegisteredUser(data.user, password);
    }
    return data;
  } catch (err) {
    // If backend is in serverless mode or offline, fallback to local registration
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const localUser = {
      id: Date.now(),
      name: cleanName,
      username: cleanName,
      email: cleanEmail,
      avatar_url: null
    };
    saveLocalRegisteredUser(localUser, password);
    const fakeToken = `local_jwt_${Date.now()}`;
    return {
      success: true,
      message: 'Account created successfully!',
      token: fakeToken,
      user: localUser
    };
  }
}

export async function loginApi(emailOrName, password) {
  const cleanInput = emailOrName.trim().toLowerCase();

  try {
    const res = await fetch(`${API_AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: emailOrName, email: emailOrName, name: emailOrName, password })
    });
    const data = await handleResponse(res);
    if (data && data.user) {
      saveLocalRegisteredUser(data.user, password);
    }
    return data;
  } catch (err) {
    // Fallback: Check local registered users if backend returned error or serverless reset
    const localUsers = getLocalRegisteredUsers();
    const match = localUsers.find(u => 
      u.email.toLowerCase() === cleanInput || u.name.toLowerCase() === cleanInput
    );
    if (match) {
      if (match.password === password) {
        const fakeToken = `local_jwt_${Date.now()}`;
        return {
          success: true,
          message: 'Sign in successful!',
          token: fakeToken,
          user: {
            id: match.id,
            name: match.name,
            username: match.name,
            email: match.email,
            avatar_url: match.avatar_url || null
          }
        };
      } else {
        throw new Error('Incorrect password. Please verify your password and try again.');
      }
    }
    throw err;
  }
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
