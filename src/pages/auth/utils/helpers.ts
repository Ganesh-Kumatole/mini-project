const getLoginPageErrorMsg = (code: string): string => {
  const messages: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return messages[code] || 'Sign-in failed. Please try again.';
};

const getSignupPageErrorMsg = (code: string): string => {
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return map[code] || 'Failed to create account. Please try again.';
};

const getPasswordStrength = (
  password: string,
): { score: number; label: string; color: string } => {
  // validate password
  if (!password) return { score: 0, label: '', color: '' };

  // assign score for password
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { score: 1, label: 'Weak', color: 'bg-red-500' },
    { score: 2, label: 'Fair', color: 'bg-amber-400' },
    { score: 3, label: 'Strong', color: 'bg-emerald-500' },
    { score: 4, label: 'Very Strong', color: 'bg-emerald-600' },
  ];

  return levels[Math.min(score, 4) - 1] ?? { score: 0, label: '', color: '' };
};

export { getLoginPageErrorMsg, getSignupPageErrorMsg, getPasswordStrength };
