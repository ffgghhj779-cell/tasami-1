export interface FieldValidation {
  valid: boolean;
  error?: string;
}

export function validateFullName(name: string): FieldValidation {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: 'الاسم الكامل مطلوب' };
  }
  if (trimmed.length < 3) {
    return { valid: false, error: 'أدخل الاسم الكامل (٣ أحرف على الأقل)' };
  }
  if (trimmed.length > 80) {
    return { valid: false, error: 'الاسم طويل جداً' };
  }
  return { valid: true };
}

export function validateEmail(email: string): FieldValidation {
  const trimmed = email.trim();
  if (!trimmed) {
    return { valid: false, error: 'البريد الإلكتروني مطلوب' };
  }
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  if (!ok) {
    return { valid: false, error: 'أدخل بريداً إلكترونياً صحيحاً' };
  }
  return { valid: true };
}

export function validateNationalId(id: string): FieldValidation {
  const trimmed = id.trim();
  if (!trimmed) return { valid: true };
  if (trimmed.length < 4 || trimmed.length > 32) {
    return { valid: false, error: 'رقم الهوية/الجواز غير صالح' };
  }
  return { valid: true };
}
