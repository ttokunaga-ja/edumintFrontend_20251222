import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default('http://localhost:3000/api'),
});

/**
 * Environment Variables Configuration
 * 
 * Validates environment variables at startup using Zod.
 * If validation fails, it throws an error to prevent runtime issues.
 */
const parseEnv = () => {
  // Check if we are in a browser/vite environment
  const envVars = import.meta.env || {};
  
  const parsed = envSchema.safeParse(envVars);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
};

export const env = parseEnv();
