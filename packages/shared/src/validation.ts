import { z } from 'zod';

/**
 * Validation schemas shared by client forms and server handlers.
 *
 * The same schema runs in both places: the browser uses it for instant feedback,
 * the server re-runs it because client-side validation is a convenience, never a
 * security control.
 */

/** Indian mobile numbers: 10 digits starting 6-9, with optional +91 / 0 prefix. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s\-()]/g, ''))
  .refine((v) => /^(?:\+?91|0)?[6-9]\d{9}$/.test(v), {
    message: 'Enter a valid 10-digit Indian mobile number',
  })
  .transform((v) => v.replace(/^(?:\+?91|0)/, ''));

/** Indian PIN codes: exactly 6 digits, cannot start with 0. */
export const pincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit PIN code');

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .max(254, 'That email is too long');

export const addressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Enter the full name')
    .max(100, 'Name is too long')
    .regex(/^[\p{L}\s.'-]+$/u, 'Name contains unexpected characters'),
  phone: phoneSchema,
  line1: z.string().trim().min(5, 'Enter the flat, building and street').max(200),
  line2: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().min(2, 'Enter the city').max(80),
  state: z.string().trim().min(2, 'Select the state').max(80),
  pincode: pincodeSchema,
  country: z.string().trim().default('India'),
  label: z.enum(['Home', 'Work', 'Other']).optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const cartLineInputSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
});

export const checkoutSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  shippingAddress: addressSchema,
  billingSameAsShipping: z.boolean().default(true),
  billingAddress: addressSchema.optional(),
  paymentMethod: z.enum(['RAZORPAY', 'COD']),
  couponCode: z.string().trim().toUpperCase().max(32).optional().or(z.literal('')),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(100),
  email: emailSchema,
  phone: z.string().trim().optional().or(z.literal('')),
  subject: z.string().trim().min(3, 'Enter a subject').max(150),
  message: z.string().trim().min(10, 'Tell us a little more').max(2000),
  // Spam controls: a field humans never see, and a minimum time-to-submit.
  honeypot: z.string().max(0).optional(),
  renderedAt: z.number().optional(),
});

export const newsletterSchema = z.object({
  email: emailSchema,
  honeypot: z.string().max(0).optional(),
});

/** Public order tracking: order number plus one matching contact detail. */
export const trackOrderSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^BE[0-9A-Z]{6,12}$/, 'Order numbers look like BE2A4F9K'),
  contact: z.string().trim().min(4, 'Enter the email or phone used on the order'),
});

export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  totp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit code')
    .optional()
    .or(z.literal('')),
});

export const productFormSchema = z.object({
  title: z.string().trim().min(3, 'Enter a product title').max(160),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words separated by hyphens'),
  summary: z.string().trim().min(10, 'Write a short summary').max(300),
  description: z.string().trim().min(20, 'Write a description').max(5000),
  categorySlug: z.string().min(1, 'Choose a category'),
  fabric: z.string().trim().min(2, 'Enter the fabric').max(80),
  workType: z.string().trim().max(80).optional().or(z.literal('')),
  occasions: z.array(z.enum(['wedding', 'festive', 'eid', 'party', 'daily'])).min(1, 'Pick at least one occasion'),
  basePriceRupees: z.number().positive('Price must be greater than zero').max(1_000_000),
  compareAtRupees: z.number().positive().max(1_000_000).nullable().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
  isNewArrival: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

/** Indian states and union territories, for the address dropdown. */
export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;
