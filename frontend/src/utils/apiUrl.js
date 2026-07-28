/**
 * Dynamic API URL resolver
 * Automatically switches between http://localhost:5000/api when developing locally
 * and your production backend URL (or process.env.NEXT_PUBLIC_API_URL) when hosted on Vercel.
 */

export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    let clean = process.env.NEXT_PUBLIC_API_URL.trim().replace(/\/+$/, '');
    if (!clean.endsWith('/api')) clean = `${clean}/api`;
    return clean;
  }

  // Deployed Vercel backend URL
  return 'https://blog-website-liard-alpha.vercel.app/api';
}

export function getSocketBaseUrl() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }

  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL.trim().replace(/\/+$/, '');
  }

  return 'https://blog-website-liard-alpha.vercel.app';
}
