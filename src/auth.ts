import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from './config.js';

export type UserRole = 'admin' | 'ventas';

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
}

// Extender el Request de Express para inyectar la sesión del usuario
export interface AuthenticatedRequest extends Request {
  user?: UserSession;
}

// -------------------------------------------------------------
// Hashing y Verificación Criptográfica
// -------------------------------------------------------------
export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

// -------------------------------------------------------------
// Emisión y Verificación de Tokens de Sesión (12 Horas)
// -------------------------------------------------------------
export function createSessionToken(user: UserSession): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName
    },
    config.sessionSecret,
    { expiresIn: `${config.sessionDurationHours}h` }
  );
}

export function verifySessionToken(token: string): UserSession | null {
  try {
    const decoded = jwt.verify(token, config.sessionSecret) as UserSession;
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      displayName: decoded.displayName
    };
  } catch (_err) {
    return null;
  }
}

// -------------------------------------------------------------
// Rate Limiter en Memoria: 5 intentos / 15 min por IP
// -------------------------------------------------------------
interface AttemptRecord {
  count: number;
  resetAt: number;
}

const loginAttempts = new Map<string, AttemptRecord>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos

export function isLoginRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) return false;

  if (now > record.resetAt) {
    loginAttempts.delete(ip);
    return false;
  }

  return record.count >= MAX_ATTEMPTS;
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS
    });
  } else {
    record.count += 1;
  }
}

export function clearLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

// -------------------------------------------------------------
// Middlewares de Autenticación y Autorización por Rol
// -------------------------------------------------------------
export function extractToken(req: Request): string | null {
  // 1. Intentar cookie httpOnly
  if (req.cookies && req.cookies[config.sessionCookieName]) {
    return req.cookies[config.sessionCookieName];
  }

  // 2. Intentar Authorization Header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Se requiere inicio de sesión activo para acceder a este recurso.'
    });
    return;
  }

  const session = verifySessionToken(token);
  if (!session) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'La sesión es inválida o ha expirado. Por favor ingrese nuevamente.'
    });
    return;
  }

  req.user = session;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'No autenticado.' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Acceso restringido exclusivamente a la Dirección General (Admin).'
    });
    return;
  }

  next();
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (token) {
    const session = verifySessionToken(token);
    if (session) req.user = session;
  }
  next();
}
