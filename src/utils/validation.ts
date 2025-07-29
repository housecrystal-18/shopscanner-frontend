// Form validation utilities
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export class FormValidator {
  private rules: Record<string, ValidationRule> = {};
  private errors: Record<string, string> = {};

  setRules(rules: Record<string, ValidationRule>) {
    this.rules = rules;
    return this;
  }

  validate(data: Record<string, any>): ValidationError[] {
    this.errors = {};
    const errorList: ValidationError[] = [];

    for (const [field, rule] of Object.entries(this.rules)) {
      const value = data[field];
      const error = this.validateField(field, value, rule);
      
      if (error) {
        this.errors[field] = error;
        errorList.push({ field, message: error });
      }
    }

    return errorList;
  }

  private validateField(field: string, value: any, rule: ValidationRule): string | null {
    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      return `${this.formatFieldName(field)} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `${this.formatFieldName(field)} must be at least ${rule.minLength} characters`;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return `${this.formatFieldName(field)} must be no more than ${rule.maxLength} characters`;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return this.getPatternErrorMessage(field, rule.pattern);
      }
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }

  private formatFieldName(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private getPatternErrorMessage(field: string, pattern: RegExp): string {
    const fieldName = this.formatFieldName(field);
    
    // Common pattern error messages
    if (pattern.source.includes('@')) {
      return `${fieldName} must be a valid email address`;
    }
    
    if (pattern.source.includes('\\d')) {
      return `${fieldName} must contain at least one number`;
    }
    
    if (pattern.source.includes('[A-Z]')) {
      return `${fieldName} must contain at least one uppercase letter`;
    }
    
    if (pattern.source.includes('[a-z]')) {
      return `${fieldName} must contain at least one lowercase letter`;
    }
    
    return `${fieldName} format is invalid`;
  }

  getError(field: string): string | null {
    return this.errors[field] || null;
  }

  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  getErrors(): Record<string, string> {
    return { ...this.errors };
  }
}

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  url: /^https?:\/\/.+\..+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  postalCode: /^\d{5}(-\d{4})?$/,
  creditCard: /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/,
  cvv: /^\d{3,4}$/,
  expiryDate: /^(0[1-9]|1[0-2])\/\d{2}$/
};

// Predefined validation rules
export const CommonValidationRules = {
  email: {
    required: true,
    pattern: ValidationPatterns.email,
    maxLength: 255
  },
  password: {
    required: true,
    minLength: 8,
    pattern: ValidationPatterns.password
  },
  confirmPassword: (password: string) => ({
    required: true,
    custom: (value: string) => 
      value !== password ? 'Passwords do not match' : null
  }),
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s]+$/
  },
  phone: {
    pattern: ValidationPatterns.phone,
    minLength: 10,
    maxLength: 20
  },
  company: {
    maxLength: 200
  },
  address: {
    required: true,
    minLength: 5,
    maxLength: 500
  },
  city: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-\']+$/
  },
  postalCode: {
    required: true,
    pattern: ValidationPatterns.postalCode
  },
  creditCard: {
    required: true,
    pattern: ValidationPatterns.creditCard
  },
  cvv: {
    required: true,
    pattern: ValidationPatterns.cvv
  },
  expiryDate: {
    required: true,
    pattern: ValidationPatterns.expiryDate,
    custom: (value: string) => {
      if (!value || !ValidationPatterns.expiryDate.test(value)) {
        return null; // Pattern validation will handle this
      }
      
      const [month, year] = value.split('/').map(Number);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return 'Card has expired';
      }
      
      return null;
    }
  },
  url: {
    pattern: ValidationPatterns.url
  },
  subject: {
    required: true,
    minLength: 5,
    maxLength: 200
  },
  message: {
    required: true,
    minLength: 10,
    maxLength: 2000
  }
};

// Utility functions for real-time validation
export function validateEmail(email: string): string | null {
  const validator = new FormValidator().setRules({ email: CommonValidationRules.email });
  const errors = validator.validate({ email });
  return errors.length > 0 ? errors[0].message : null;
}

export function validatePassword(password: string): string | null {
  const validator = new FormValidator().setRules({ password: CommonValidationRules.password });
  const errors = validator.validate({ password });
  return errors.length > 0 ? errors[0].message : null;
}

export function validateRequired(value: any, fieldName: string): string | null {
  if (value === undefined || value === null || value === '') {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateLength(value: string, min: number, max: number, fieldName: string): string | null {
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  if (value.length > max) {
    return `${fieldName} must be no more than ${max} characters`;
  }
  return null;
}

// Credit card validation utilities
export function formatCreditCard(value: string): string {
  return value
    .replace(/\s/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim()
    .substring(0, 19);
}

export function formatExpiryDate(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .substring(0, 5);
}

export function getCreditCardType(cardNumber: string): string {
  const number = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(number)) return 'visa';
  if (/^5[1-5]/.test(number)) return 'mastercard';
  if (/^3[47]/.test(number)) return 'amex';
  if (/^6011/.test(number)) return 'discover';
  
  return 'unknown';
}