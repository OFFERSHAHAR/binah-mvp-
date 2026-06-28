// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation
export const validatePassword = (password: string): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (password.length < 6) {
    errors.push('הסיסמה חייבת להיות לפחות 6 תווים')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('הסיסמה חייבת להכיל אותיות קטנות')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('הסיסמה חייבת להכיל אותיות גדולות')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('הסיסמה חייבת להכיל ספרות')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Name validation
export const validateName = (name: string): {
  isValid: boolean
  error: string | null
} => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'שם הוא שדה חובה' }
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'השם חייב להיות לפחות 2 תווים' }
  }

  if (name.trim().length > 100) {
    return { isValid: false, error: 'השם לא יכול להיות ארוך מ-100 תווים' }
  }

  return { isValid: true, error: null }
}

// Form validation helper
export const validateLoginForm = (
  email: string,
  password: string
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {}

  if (!email) {
    errors.email = 'אימייל הוא שדה חובה'
  } else if (!validateEmail(email)) {
    errors.email = 'אימייל לא תקין'
  }

  if (!password) {
    errors.password = 'סיסמה היא שדה חובה'
  } else if (password.length < 6) {
    errors.password = 'סיסמה חייבת להיות לפחות 6 תווים'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateSignupForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {}

  const nameValidation = validateName(name)
  if (!nameValidation.isValid && nameValidation.error) {
    errors.name = nameValidation.error
  }

  if (!email) {
    errors.email = 'אימייל הוא שדה חובה'
  } else if (!validateEmail(email)) {
    errors.email = 'אימייל לא תקין'
  }

  if (!password) {
    errors.password = 'סיסמה היא שדה חובה'
  } else {
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0]
    }
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'אישור סיסמה הוא שדה חובה'
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'הסיסמאות לא תואמות'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateResetForm = (
  email: string
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {}

  if (!email) {
    errors.email = 'אימייל הוא שדה חובה'
  } else if (!validateEmail(email)) {
    errors.email = 'אימייל לא תקין'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
