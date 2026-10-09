import { PlanTier, SubscriptionPlan, UserAccount } from '../types';

const TOKEN_KEY = 'flunexa_auth_token';

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async sendSignupOtp(data: {
    name: string;
    email: string;
    password: string;
    countryCode?: string;
    phoneNumber?: string;
    nativeLanguage?: string;
    englishLevel?: string;
  }) {
    const res = await fetch('/api/auth/send-signup-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to send verification code.');
    return json;
  },

  async verifySignupOtp(email: string, otp: string): Promise<{ user: UserAccount; token: string }> {
    const res = await fetch('/api/auth/verify-signup-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'OTP verification failed.');
    if (json.token) this.setToken(json.token);
    return json;
  },

  async login(email: string, password: string): Promise<{ user: UserAccount; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed.');
    if (json.token) this.setToken(json.token);
    return json;
  },

  async socialLogin(provider: 'google' | 'facebook', profile?: { name?: string; email?: string }): Promise<{ user: UserAccount; token: string }> {
    const res = await fetch('/api/auth/social-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, ...profile }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `${provider} login failed.`);
    if (json.token) this.setToken(json.token);
    return json;
  },

  async sendForgotPasswordOtp(email: string) {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to send password reset code.');
    return json;
  },

  async verifyResetOtp(email: string, otp: string) {
    const res = await fetch('/api/auth/verify-reset-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Invalid code.');
    return json;
  },

  async resetPassword(options: {
    email: string;
    otp: string;
    newPassword?: string;
    skip?: boolean;
  }): Promise<{ user: UserAccount; token: string; skipped: boolean }> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Password reset failed.');
    if (json.token) this.setToken(json.token);
    return json;
  },

  async getCurrentUser(): Promise<UserAccount | null> {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        this.clearToken();
        return null;
      }
      const json = await res.json();
      return json.user;
    } catch {
      return null;
    }
  },

  async fetchPlans(): Promise<SubscriptionPlan[]> {
    try {
      const res = await fetch('/api/plans');
      const json = await res.json();
      return json.plans || [];
    } catch {
      return [];
    }
  },

  async subscribePlan(planId: PlanTier, billingCycle: 'monthly' | 'yearly' = 'monthly') {
    const token = this.getToken();
    const res = await fetch('/api/plans/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ planId, billingCycle }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Subscription upgrade failed.');
    return json;
  },
};
