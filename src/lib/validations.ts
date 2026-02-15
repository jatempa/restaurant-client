import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
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
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type AddProductInput = z.infer<typeof addProductSchema>;
