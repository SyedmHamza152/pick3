'use strict';

/**
 * Shared API helper — dynamically resolves the backend location.
 * Prevents Next.js SSR build errors by validating window availability.
 */
function resolveApiBase(): string {
  // Use direct backend URL in development to avoid rewrite header issues
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://127.0.0.1:8000';
  }
  // In production, use empty string to leverage Next.js API rewrites
  return '';
}

export const API_BASE = resolveApiBase();
export const TOKEN_KEY = 'lottery_token';
export const USER_KEY = 'lottery_user';

export interface UserSession {
  user_id: number;
  public_id: string;
  username: string;
  phone: string;
  is_admin: boolean;
  account_balance: number;
}

export interface CurrencyConfig {
  pkr_per_riyal: number;
  straight_prize_multiplier: number;
  rumble_prize_multiplier: number;
}

// ── AUTHENTICATION MANAGEMENT STORAGE OBJECT ──
export const auth = {
  get token(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  get user(): UserSession | null {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },
  set(token: string, user: UserSession): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// ── CACHED SYSTEM CURRENCY HANDLERS ──
let _currency: CurrencyConfig | null = null;

export async function getCurrency(): Promise<CurrencyConfig> {
  if (_currency) return _currency;
  try {
    _currency = await api('/api/deposits/currency', { auth: false });
  } catch {
    _currency = {
      pkr_per_riyal: 75,
      straight_prize_multiplier: 400,
      rumble_prize_multiplier: 80,
    };
  }
  return _currency!;
}

// ── CORE CENTRAL NETWORK REQUEST INTERFACE ──
interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  form?: FormData;
  auth?: boolean;
}

export async function api(path: string, { method = 'GET', body, form, auth: needAuth = true }: ApiOptions = {}): Promise<any> {
  const headers: Record<string, string> = {};

  if (needAuth && auth.token) {
    headers['Authorization'] = `Bearer ${auth.token}`;
  }

  let payload: any;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, { method, headers, body: payload });
    const text = await res.text();
    let data: any;
    
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const msg = (data && (data.detail || data.message)) || `Request failed (${res.status})`;
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }

    return data;
  } catch (error: any) {
    if (error.message && !error.message.includes('Cannot reach the server')) {
      throw error;
    }
    throw new Error(
      'Cannot reach the server. Start the backend, then open the app at http://127.0.0.1:8000/login.html (do not double-click the HTML file).'
    );
  }
}

// ── SESSION AND ROUTING AUTHORIZATION ENFORCERS ──
export function requireAuth(adminOnly = false): boolean {
  if (typeof window === 'undefined') return false;
  
  if (!auth.token || !auth.user) {
    window.location.href = '/login';
    return false;
  }
  if (adminOnly && !auth.user.is_admin) {
    window.location.href = '/dashboard';
    return false;
  }
  return true;
}

export function logout(): void {
  auth.clear();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

// ── STRING AND MONEY CURRENCY FORMATTING UTILITIES ──
export function fmtRiyal(n: number | string): string {
  return `SAR ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export interface UserSession {
  user_id: number;
  public_id: string;
  username: string;
  phone: string;
  is_admin: boolean;
  account_balance: number;
}

export function fmtPkr(n: number | string): string {
  return `PKR ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function pkrToRiyal(pkr: number | string, rate = 75): number {
  return Math.round((Number(pkr) / rate) * 100) / 100;
}

export function fmtDate(s: string | number | Date): string {
  return new Date(s).toLocaleString();
}

export function fmtMoney(n: number | string): string {
  return fmtRiyal(n);
}
