import { z } from 'zod';

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: passwordSchema.optional(),
  bio: z.string().max(250, "Bio must be at most 250 characters").optional().nullable(),
  location: z.string().max(100, "Location must be at most 100 characters").optional().nullable(),
  image: z.string().optional().nullable(),
});

export const createTripSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  destination: z.string().min(2, "Destination must be at least 2 characters"),
  days: z.number().int().min(1).max(30),
  budget: z.number().min(0),
  itinerary: z.any().optional().default({})
});

export const updateTripSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  destination: z.string().min(2).optional(),
  days: z.number().int().min(1).max(30).optional(),
  budget: z.number().min(0).optional(),
  itinerary: z.object({
    totalCost: z.number().optional(),
    days: z.array(z.any()).optional()
  }).optional()
});

export const aiGenerateSchema = z.object({ 
  prompt: z.string().min(3).max(500),
  groupType: z.enum(["solo", "couple", "family", "friends"]).optional(),
  interests: z.union([z.string(), z.array(z.string())]).optional() 
});
