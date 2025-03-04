import { ref } from 'vue';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface ValidationErrors {
  [key: string]: string[];
}

export function useFormValidation(rules: ValidationRules) {
  const errors = ref<ValidationErrors>({});
  const touched = ref<Record<string, boolean>>({});

  function validateField(field: string, value: any): string[] {
    const fieldRules = rules[field];
    if (!fieldRules) return [];

    const fieldErrors: string[] = [];

    if (fieldRules.required && !value) {
      fieldErrors.push(`${field} is required`);
      return fieldErrors;
    }

    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      fieldErrors.push(`${field} must be at least ${fieldRules.minLength} characters`);
    }

    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      fieldErrors.push(`${field} must be at most ${fieldRules.maxLength} characters`);
    }

    if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
      fieldErrors.push(`${field} is invalid`);
    }

    if (fieldRules.custom) {
      const customResult = fieldRules.custom(value);
      if (typeof customResult === 'string') {
        fieldErrors.push(customResult);
      } else if (!customResult) {
        fieldErrors.push(`${field} is invalid`);
      }
    }

    return fieldErrors;
  }

  function validateForm(data: Record<string, any>): boolean {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
      const fieldErrors = validateField(field, data[field]);
      if (fieldErrors.length > 0) {
        newErrors[field] = fieldErrors;
        isValid = false;
      }
    });

    errors.value = newErrors;
    return isValid;
  }

  function validateFieldOnBlur(field: string, value: any) {
    touched.value[field] = true;
    errors.value[field] = validateField(field, value);
  }

  function resetValidation() {
    errors.value = {};
    touched.value = {};
  }

  function hasError(field: string): boolean {
    return !!errors.value[field]?.length;
  }

  function getError(field: string): string | undefined {
    return errors.value[field]?.[0];
  }

  function isFieldTouched(field: string): boolean {
    return !!touched.value[field];
  }

  return {
    errors,
    touched,
    validateForm,
    validateFieldOnBlur,
    resetValidation,
    hasError,
    getError,
    isFieldTouched,
  };
} 