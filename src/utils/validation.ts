export interface ValidationResult {
    isValid: boolean
    error: string
}

export function validatePasswordStrength(password: string): ValidationResult {
    if (!password) {
        return { isValid: false, error: '' }
    }

    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasDigit = /[0-9]/.test(password)

    if (password.length < minLength) {
        return {
            isValid: false,
            error: 'Le mot de passe doit contenir au moins 8 caractères',
        }
    }

    if (!hasUpperCase) {
        return {
            isValid: false,
            error: 'Le mot de passe doit contenir au moins une majuscule',
        }
    }

    if (!hasDigit) {
        return {
            isValid: false,
            error: 'Le mot de passe doit contenir au moins un chiffre',
        }
    }

    return { isValid: true, error: '' }
}

export function validateMatch(
    value1: string,
    value2: string,
    fieldName = 'Les mots de passe',
): ValidationResult {
    if (!value2) {
        return { isValid: false, error: '' }
    }

    if (value1 !== value2) {
        return {
            isValid: false,
            error: `${fieldName} ne correspondent pas`,
        }
    }

    return { isValid: true, error: '' }
}