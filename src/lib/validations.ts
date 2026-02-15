import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.email('Invalid email'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(60, 'Name must be at most 60 characters'),
  firstLastName: z
    .string()
    .min(1, 'First last name is required')
    .max(60, 'First last name must be at most 60 characters'),
  secondLastName: z.string().max(60, 'Second last name must be at most 60 characters').optional(),
  cellphoneNumber: z.string().min(1, 'Cellphone number is required').max(30, 'Cellphone number is too long'),
  role: z.enum(['ROLE_USER', 'ROLE_ADMIN']),
});

export const createAccountSchema = z.object({
  name: z.string().max(20, 'Name must be at most 20 characters').optional(),
});

export const addProductSchema = z.object({
  productId: z.number().int().positive('Select a product'),
  amount: z.number().int().min(1, 'Amount must be at least 1'),
});

export const productAmountSchema = z.object({
  amount: z.number().int().min(1, 'Amount must be at least 1'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type AddProductInput = z.infer<typeof addProductSchema>;
