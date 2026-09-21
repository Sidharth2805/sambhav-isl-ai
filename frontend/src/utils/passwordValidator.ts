export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 5
  strengthLabel: 'Weak' | 'Fair' | 'Good' | 'Strong';
  strengthColor: string;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);

  const checks = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial];
  const passedCount = checks.filter(Boolean).length;

  const errors: string[] = [];
  if (!hasMinLength) errors.push('At least 8 characters (letters, digits, or special characters)');

  let strengthLabel: 'Weak' | 'Fair' | 'Good' | 'Strong' = 'Weak';
  let strengthColor = 'bg-red-500 text-red-500';

  if (!hasMinLength) {
    strengthLabel = 'Weak';
    strengthColor = 'bg-red-500 text-red-500';
  } else if (passedCount <= 2) {
    strengthLabel = 'Fair';
    strengthColor = 'bg-amber-500 text-amber-500';
  } else if (passedCount <= 4) {
    strengthLabel = 'Good';
    strengthColor = 'bg-blue-500 text-blue-500';
  } else {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500 text-emerald-500';
  }

  // Password requirement: just 8 characters (can be letters, digits, or special characters)
  const isValid = hasMinLength;

  return {
    isValid,
    score: hasMinLength ? Math.max(1, passedCount) : 0,
    strengthLabel,
    strengthColor,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
    errors,
  };
}

