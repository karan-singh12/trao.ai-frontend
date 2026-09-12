import { apiClient } from './apiClient';
import { API_ROUTES } from '../constants/apiRoutes';
import { AuthResponseData, LoginPayload, SignupPayload, User } from '../types/auth.types';

const TOKEN_KEY = 'trao_token';
const USER_KEY = 'trao_user';

export const AuthService = {
  async signup(payload: SignupPayload): Promise<AuthResponseData> {
    const res = await apiClient<AuthResponseData>(API_ROUTES.AUTH.SIGNUP, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!res.data) {
      throw new Error(res.message || 'Signup response missing data');
    }

    this.setSession(res.data);
    return res.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponseData> {
    const res = await apiClient<AuthResponseData>(API_ROUTES.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!res.data) {
      throw new Error(res.message || 'Login response missing data');
    }

    this.setSession(res.data);
    return res.data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await apiClient<{ user: User }>(API_ROUTES.AUTH.ME, {
      method: 'GET',
    });

    if (!res.data?.user) {
      throw new Error(res.message || 'Failed to fetch user session');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
    }

    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient(API_ROUTES.AUTH.LOGOUT, { method: 'POST' });
    } catch {
      // Local cleanup occurs regardless of network outcome
    } finally {
      this.clearSession();
    }
  },

  setSession(authData: AuthResponseData): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('active_kit');
    localStorage.removeItem('user_kits');
    localStorage.setItem(TOKEN_KEY, authData.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
  },

  clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('active_kit');
    localStorage.removeItem('user_kits');
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('confidence_') || key.startsWith('kit_notes_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}
  },

  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return Boolean(this.getStoredToken());
  },
};
