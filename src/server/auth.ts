import { createClient } from '@supabase/supabase-js';
import type { Request, Response, NextFunction } from 'express';
import { appStore } from './store.ts';
import type { UserRecord } from '../shared/types.ts';

// Supabase server client (if configured)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export const supabaseServer =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;


// Admin emails list - noreply.bascart@gmail.com is permanently designated as super admin
const DEFAULT_ADMINS = [
  'noreply.bascart@gmail.com',
  'satyamkumarmishra2711@gmail.com',
  'admin@bascart.com',
];

const ENV_ADMINS = (process.env.ADMIN_EMAILS || '')
  .toLowerCase()
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

export const ADMIN_EMAILS = Array.from(new Set([...DEFAULT_ADMINS, ...ENV_ADMINS]));

export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
  isAdmin?: boolean;
}

export { OtpService, OTP_SENDER_EMAIL } from './otpService.ts';

/**
 * Checks if an email has administrative privileges
 */
export function checkIsAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

/**
 * Middleware to extract and verify the user.
 * Supports Supabase Auth token, as well as dev/demo bearer tokens.
 */
export async function authenticateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Token missing' });
    return;
  }

  try {
    // 1. If Supabase is active, try verifying via Supabase
    if (supabaseServer && !token.startsWith('dev_')) {
      const { data, error } = await supabaseServer.auth.getUser(token);
      if (error || !data.user) {
        res.status(401).json({ error: 'Invalid or expired Supabase authentication token' });
        return;
      }
      const { user } = await appStore.getOrCreateUser({
        auth_user_id: data.user.id,
        email: data.user.email || '',
        full_name: data.user.user_metadata?.full_name,
        phone: data.user.phone,
      });
      req.user = user;
      req.isAdmin = checkIsAdmin(user.email);
      next();
      return;
    }

    // 2. Demo / Dev Token parsing (Format: dev_<base64_encoded_json>)
    if (token.startsWith('dev_')) {
      const payloadBase64 = token.replace('dev_', '');
      const jsonStr = Buffer.from(payloadBase64, 'base64').toString('utf-8');
      const payload = JSON.parse(jsonStr);

      const { user } = await appStore.getOrCreateUser({
        auth_user_id: payload.auth_user_id || 'dev_user_1',
        email: payload.email || 'customer@bascart.com',
        full_name: payload.full_name || 'Valued Shopper',
        phone: payload.phone || '+91 98765 43210',
        marketing_consent: payload.marketing_consent,
      });
      req.user = user;
      req.isAdmin = checkIsAdmin(user.email) || payload.role === 'admin';
      next();
      return;
    }

    res.status(401).json({ error: 'Unrecognized authentication token' });
  } catch (err: any) {
    console.error('Authentication middleware error:', err);
    res.status(401).json({ error: 'Authentication failed: ' + (err.message || 'Unknown error') });
  }
}

/**
 * Middleware strictly enforcing Admin access.
 * Normal customers are rejected with 403 Forbidden.
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || !req.isAdmin) {
    res.status(403).json({
      error: 'Access denied: Administrative privileges required.',
    });
    return;
  }
  next();
}
