import { z } from 'zod';

/**
 * Shared validation schemas. These mirror the backend FluentValidation rules so the
 * frontend and API agree on what's valid (front = fast feedback, back = source of truth).
 */

/** Email: trimmed, valid format. */
export const emailSchema = z.string().trim().min(1, 'Email is required').email('Enter a valid email address');

/** Phone: accepts common formats; requires 10–15 digits (US-friendly, lenient on punctuation). */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .refine((v) => {
    const digits = v.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
  }, 'Enter a valid phone number');

/** Normalize a US 10-digit phone to "(555) 123-4567"; otherwise return the trimmed input. */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return value.trim();
}

/** Business-signup request form. Address must be a selected/validated suggestion (>= 5 chars). */
export const businessSignupSchema = z.object({
  name: z.string().trim().min(1, 'Business name is required').max(120, 'Name is too long'),
  phone: phoneSchema,
  categoryId: z.string().min(1, 'Select a category'),
  address: z
    .string()
    .trim()
    .min(5, 'Select your address from the suggestions'),
});

export type BusinessSignupValues = z.infer<typeof businessSignupSchema>;

/** Dashboard settings (editable subset). */
export const businessSettingsSchema = z.object({
  phone: phoneSchema,
  description: z.string().trim().max(2000, 'Description is too long'),
  serviceRadiusMiles: z
    .number({ message: 'Enter a service radius' })
    .int('Use a whole number')
    .min(1, 'Radius must be at least 1 mile')
    .max(100, 'Radius can be at most 100 miles'),
});

export type BusinessSettingsValues = z.infer<typeof businessSettingsSchema>;
