import { ref } from 'vue'
import type { ValidationResult } from '@/utils/validation'

// Use this for individual fields without full form management
export function useFieldValidation(
    validationFn: (value: string) => ValidationResult
) {
    const error = ref('')

    const validate = (value: string): boolean => {
        const result = validationFn(value)
        error.value = result.error
        return result.isValid
    }

    const clear = () => {
        error.value = ''
    }

    return {
        error,
        validate,
        clear
    }
}