import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/authService';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  RefreshCw,
  FastForward,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import { NativeLanguage, EnglishLevel } from '../../types';

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
];

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.09C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.59H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.41l4.02-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.26 6.59l4.02 3.09c.95-2.83 3.6-4.93 6.72-4.93z"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    setAccountAndLogin,
  } = useApp();

  // Mode: 'login' | 'signup' | 'forgot_password'
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>(authModalMode);

  // Sign-Up Sub-steps: 1 = Form, 2 = Verify OTP
  const [signupStep, setSignupStep] = useState<1 | 2>(1);

  // Forgot Password Sub-steps: 1 = Email, 2 = OTP, 3 = Reset Password / Skip
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState<NativeLanguage>('Telugu');
  const [englishLevel, setEnglishLevel] = useState<EnglishLevel>('B1');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Forgot Password Fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // OTP Fields (6 digits)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Feedback State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Sync mode with context
  useEffect(() => {
    setMode(authModalMode);
    setError(null);
    setSuccessMsg(null);
    setSignupStep(1);
    setForgotStep(1);
    setOtp(['', '', '', '', '', '']);
  }, [authModalMode, isAuthModalOpen]);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isAuthModalOpen) return null;

  // Handle OTP box changes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste handling
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const getEnteredOtp = () => otp.join('');

  // 1. Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await authService.login(email, password);
      setAccountAndLogin(result.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Social Login (Google & Facebook)
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.socialLogin(provider);
      setAccountAndLogin(result.user);
      closeAuthModal();
    } catch (err: any) {
      setError(err.message || `${provider} sign-in failed.`);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Sign-Up Step 1: Send OTP to Email
  const handleSendSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Please accept the Terms & Conditions and Privacy Policy to register.');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await authService.sendSignupOtp({
        name,
        email,
        password,
        countryCode,
        phoneNumber,
        nativeLanguage,
        englishLevel,
      });
      setPreviewCode(res.previewCode || null);
      setSuccessMsg(`Verification code sent to ${email}!`);
      setSignupStep(2);
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      setError(err.message || 'Could not send verification email.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Sign-Up Step 2: Verify OTP
  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = getEnteredOtp();
    if (enteredOtp.length < 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await authService.verifySignupOtp(email, enteredOtp);
      setAccountAndLogin(result.user);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Forgot Password Step 1: Send OTP
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await authService.sendForgotPasswordOtp(email);
      setPreviewCode(res.previewCode || null);
      setSuccessMsg(`Password reset code sent to ${email}!`);
      setForgotStep(2);
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Handle Forgot Password Step 2: Verify OTP
  const handleVerifyForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = getEnteredOtp();
    if (enteredOtp.length < 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await authService.verifyResetOtp(email, enteredOtp);
      setSuccessMsg('Code verified! Choose to set a new password or skip.');
      setForgotStep(3);
    } catch (err: any) {
      setError(err.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  // 6. Handle Forgot Password Step 3: Update Password OR Skip!
  const handleCompleteReset = async (skip: boolean) => {
    setError(null);
    const enteredOtp = getEnteredOtp();

    if (!skip) {
      if (!newPassword || newPassword.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New password and confirmation password do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      const result = await authService.resetPassword({
        email,
        otp: enteredOtp,
        newPassword: skip ? undefined : newPassword,
        skip,
      });

      // User logged directly into interface!
      setAccountAndLogin(result.user);
    } catch (err: any) {
      setError(err.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 18, 0.82)',
        backdropFilter: 'blur(10px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 24,
          padding: '32px 28px',
          position: 'relative',
          background: 'linear-gradient(180deg, rgba(26, 32, 53, 0.95) 0%, rgba(13, 17, 30, 0.98) 100%)',
          border: '1px solid rgba(129, 140, 248, 0.25)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.15)',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(236, 72, 153, 0.25) 100%)',
              border: '1px solid rgba(129, 140, 248, 0.4)',
              marginBottom: 12,
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
            }}
          >
            <img
              src="/assets/flunexa-logo.png"
              alt="Flunexa Talk"
              style={{ width: 38, height: 38, objectFit: 'contain' }}
            />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            {mode === 'login' && 'Welcome Back to Flunexa'}
            {mode === 'signup' && (signupStep === 1 ? 'Create Your Account' : 'Verify Your Email')}
            {mode === 'forgot_password' && 'Password Recovery'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
            {mode === 'login' && 'Speak. Improve. Become Fluent with AI.'}
            {mode === 'signup' && (signupStep === 1 ? 'Start your daily 10-minute spoken English coaching' : `Enter the 6-digit code sent to ${email}`)}
            {mode === 'forgot_password' && 'Recover access to your learning progress'}
          </p>
        </div>



        {/* Alert Notifications */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: 13,
              marginBottom: 18,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: 13,
              marginBottom: 18,
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}



        {/* =================================================================== */}
        {/* MODE: LOG IN */}
        {/* =================================================================== */}
        {mode === 'login' && (
          <div>
            {/* Social Logins: Google & Facebook */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSocialLogin('google')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: '#ffffff',
                  color: '#1f2937',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.2s ease',
                }}
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleSocialLogin('facebook')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: '#1877F2',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(24, 119, 242, 0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                <FacebookIcon />
                <span>Continue with Facebook</span>
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 18px', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-glass)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                or continue with email
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-glass)' }} />
            </div>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#cbd5e1' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: 12,
                      border: '1px solid var(--border-glass)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setForgotStep(1);
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary-light)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 42px 12px 42px',
                      borderRadius: 12,
                      border: '1px solid var(--border-glass)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  marginTop: 6,
                  justifyContent: 'center',
                }}
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Log In to Flunexa Talk</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Bottom small toggle text: Don't have account? Register now */}
            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setSignupStep(1);
                  setError(null);
                  setSuccessMsg(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary-light)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                  fontSize: 13,
                }}
              >
                Register now
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MODE: SIGN UP - STEP 1 (Details Form) */}
        {/* =================================================================== */}
        {mode === 'signup' && signupStep === 1 && (
          <div>
            {/* Social Logins: Google & Facebook */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSocialLogin('google')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: '#ffffff',
                  color: '#1f2937',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.2s ease',
                }}
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleSocialLogin('facebook')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: '#1877F2',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(24, 119, 242, 0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                <FacebookIcon />
                <span>Continue with Facebook</span>
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 18px', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-glass)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                or register with email
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-glass)' }} />
            </div>

            <form onSubmit={handleSendSignupOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: '#cbd5e1' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bhargav or John"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 42px',
                      borderRadius: 12,
                      border: '1px solid var(--border-glass)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: '#cbd5e1' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 42px',
                      borderRadius: 12,
                      border: '1px solid var(--border-glass)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Country Code and Phone Number */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: '#cbd5e1' }}>
                  Phone Number
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    style={{
                      width: 125,
                      padding: '11px 8px',
                      borderRadius: 12,
                      border: '1px solid var(--border-glass)',
                      background: '#1a2035',
                      color: '#fff',
                      fontSize: 13,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>

                  <div style={{ position: 'relative', flex: 1 }}>
                    <Phone
                      size={16}
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                    />
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d\s-+]/g, ''))}
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 42px',
                        borderRadius: 12,
                        border: '1px solid var(--border-glass)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: '#cbd5e1' }}>
                  Create Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 42px 11px 42px',
                      borderRadius: 12,
                      border: '1px solid var(--border-glass)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5, color: '#cbd5e1' }}>
                    Native Language
                  </label>
                  <select
                    value={nativeLanguage}
                    onChange={(e) => setNativeLanguage(e.target.value as NativeLanguage)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 10,
                      border: '1px solid var(--border-glass)',
                      background: '#1a2035',
                      color: '#fff',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  >
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                    <option value="Malayalam">Malayalam (മലയാളം)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                    <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5, color: '#cbd5e1' }}>
                    Current Level
                  </label>
                  <select
                    value={englishLevel}
                    onChange={(e) => setEnglishLevel(e.target.value as EnglishLevel)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 10,
                      border: '1px solid var(--border-glass)',
                      background: '#1a2035',
                      color: '#fff',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  >
                    <option value="A1">A1 - Beginner</option>
                    <option value="A2">A2 - Elementary</option>
                    <option value="B1">B1 - Intermediate</option>
                    <option value="B2">B2 - Upper Intermediate</option>
                    <option value="C1">C1 - Advanced</option>
                  </select>
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ marginTop: 3, width: 16, height: 16, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                />
                <label htmlFor="agreeTerms" style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.45, cursor: 'pointer' }}>
                  I agree to Flunexa Talk's{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary-light)',
                      padding: 0,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Terms & Conditions
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary-light)',
                      padding: 0,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Privacy Policy
                  </button>
                  .
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  marginTop: 6,
                  justifyContent: 'center',
                }}
              >
                {loading ? (
                  <span>Sending Verification Code...</span>
                ) : (
                  <>
                    <span>Send Verification Code ✉️</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Bottom small toggle text: Already have account? Log in */}
            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary-light)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                  fontSize: 13,
                }}
              >
                Log in
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MODE: SIGN UP - STEP 2 (Verify OTP) */}
        {/* =================================================================== */}
        {mode === 'signup' && signupStep === 2 && (
          <form onSubmit={handleVerifySignupOtp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* 6 Digit OTP inputs */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '12px 0 16px' }}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    style={{
                      width: 48,
                      height: 56,
                      fontSize: 22,
                      fontWeight: 800,
                      textAlign: 'center',
                      borderRadius: 12,
                      border: digit ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#38bdf8',
                      outline: 'none',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive email?"}
                </span>
                <button
                  type="button"
                  disabled={resendTimer > 0 || loading}
                  onClick={handleSendSignupOtp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendTimer > 0 ? 'var(--text-muted)' : 'var(--color-primary-light)',
                    fontWeight: 600,
                    cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                    padding: 0,
                  }}
                >
                  Resend Code
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                justifyContent: 'center',
              }}
            >
              {loading ? <span>Verifying...</span> : <span>Verify & Start Speaking 🚀</span>}
            </button>

            <button
              type="button"
              onClick={() => setSignupStep(1)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              ← Change email address
            </button>
          </form>
        )}

        {/* =================================================================== */}
        {/* MODE: FORGOT PASSWORD */}
        {/* =================================================================== */}
        {mode === 'forgot_password' && (
          <div>
            {/* Step 1: Request Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendForgotOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#cbd5e1' }}>
                    Registered Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      size={16}
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                    />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        borderRadius: 12,
                        border: '1px solid var(--border-glass)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    justifyContent: 'center',
                  }}
                >
                  {loading ? <span>Sending Reset Code...</span> : <span>Send OTP to Mail 🔑</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                    cursor: 'pointer',
                    marginTop: 4,
                  }}
                >
                  ← Back to Log In
                </button>
              </form>
            )}

            {/* Step 2: Enter OTP */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyForgotOtp} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>
                  Enter the 6-digit passcode delivered to <strong style={{ color: '#fff' }}>{email}</strong>
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      style={{
                        width: 48,
                        height: 56,
                        fontSize: 22,
                        fontWeight: 800,
                        textAlign: 'center',
                        borderRadius: 12,
                        border: digit ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#38bdf8',
                        outline: 'none',
                        transition: 'all 0.2s',
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Didn't receive code?"}
                  </span>
                  <button
                    type="button"
                    disabled={resendTimer > 0 || loading}
                    onClick={handleSendForgotOtp}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: resendTimer > 0 ? 'var(--text-muted)' : 'var(--color-primary-light)',
                      fontWeight: 600,
                      cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                      padding: 0,
                    }}
                  >
                    Resend Code
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    justifyContent: 'center',
                  }}
                >
                  {loading ? <span>Verifying...</span> : <span>Verify Code & Proceed</span>}
                </button>
              </form>
            )}

            {/* Step 3: Set New Password OR Skip & Log In Directly! */}
            {forgotStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    fontSize: 13,
                    color: '#c7d2fe',
                    lineHeight: 1.5,
                  }}
                >
                  🛡️ You can set a new password below, or click <strong>Skip</strong> to directly access your account without changing your password.
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#cbd5e1' }}>
                    Set New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={16}
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                    />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 42px 12px 42px',
                        borderRadius: 12,
                        border: '1px solid var(--border-glass)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        right: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#cbd5e1' }}>
                    Re-enter New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={16}
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                    />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 42px 12px 42px',
                        borderRadius: 12,
                        border: '1px solid var(--border-glass)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Primary Button: Update Password & Continue */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleCompleteReset(false)}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    justifyContent: 'center',
                    marginTop: 4,
                  }}
                >
                  {loading ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <KeyRound size={16} />
                      <span>Update Password & Enter Flunexa</span>
                    </>
                  )}
                </button>

                {/* Secondary Button: Skip & Enter Directly! */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleCompleteReset(true)}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 700,
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-glass)',
                    color: '#e2e8f0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                  }}
                >
                  <FastForward size={16} color="var(--color-primary-light)" />
                  <span>Skip & Enter App Directly</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Terms & Conditions Pop-up Modal */}
        {showTermsModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              zIndex: 2500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
            onClick={() => setShowTermsModal(false)}
          >
            <div
              className="glass-card"
              style={{
                maxWidth: 480,
                width: '100%',
                maxHeight: '80vh',
                overflowY: 'auto',
                borderRadius: 20,
                padding: 24,
                background: '#13182b',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>Terms & Conditions & Privacy</h3>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                >
                  <X size={18} />
                </button>
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p><strong style={{ color: '#e2e8f0' }}>1. Educational Services:</strong> Flunexa Talk provides interactive spoken English practice, live pronunciation analysis, and multilingual grammar correction.</p>
                <p><strong style={{ color: '#e2e8f0' }}>2. Voice & Audio Data:</strong> Your microphone audio is processed in real time solely to evaluate fluency and detect grammatical mistakes. We do not sell or monetize personal audio recordings.</p>
                <p><strong style={{ color: '#e2e8f0' }}>3. Real Email & Communications:</strong> We use your verified email to deliver security OTPs, login notifications, and weekly learning milestones via dmspark.support@gmail.com.</p>
                <p><strong style={{ color: '#e2e8f0' }}>4. Community Standards:</strong> Learners agree to engage respectfully with AI Nexa and utilize the learning tools in good faith.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAgreeTerms(true);
                  setShowTermsModal(false);
                }}
                className="btn-primary"
                style={{ width: '100%', marginTop: 20, padding: '12px', fontSize: 14, fontWeight: 700, justifyContent: 'center' }}
              >
                I Agree & Accept Terms
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
