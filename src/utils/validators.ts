export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  return password.length >= 6
}

export const validateAmount = (amount: number): boolean => {
  return amount > 0 && !isNaN(amount)
}

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0
}
