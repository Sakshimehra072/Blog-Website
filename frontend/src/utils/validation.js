/**
 * Form Validation Utilities for BlogVerse Auth
 */

export function validatePhone(phone) {
  if (!phone || !phone.trim()) {
    return 'Phone number is required.';
  }
  const cleanPhone = phone.replace(/\s+/g, '');
  const phoneRegex = /^\+?[1-9]\d{7,14}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return 'Please enter a valid phone number with country code (e.g. +1234567890).';
  }
  return null;
}

export function validateUsername(username) {
  if (!username || !username.trim()) {
    return 'Username is required.';
  }
  if (username.trim().length < 3) {
    return 'Username must be at least 3 characters long.';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
    return 'Username can only contain letters, numbers, and underscores.';
  }
  return null;
}

export function validatePassword(password) {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  return null;
}
