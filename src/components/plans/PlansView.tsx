import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlanTier } from '../../types';
import {
  Check,
  Zap,
  Crown,
  Sparkles,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  HelpCircle,
  X,
  Lock,
  Gift,
  Flame,
} from 'lucide-react';

interface PlanDetails {
  id: PlanTier;
  name: string;
  badge?: string;
  priceMonthUSD: number;
  priceMonthINR: number;
  priceYearUSD: number;
  priceYearINR: number;
  isOneTime?: boolean;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

const PLANS: PlanDetails[] = [
  {
    id: 'free',
    name: 'Free Starter',
    priceMonthUSD: 0,
    priceMonthINR: 0,
    priceYearUSD: 0,
    priceYearINR: 0,
    description: 'Perfect for building a consistent 10-minute daily speaking habit.',
    features: [
      '10-Minute Daily Nexa Robot Voice Call',
      'Basic Grammar & Tense Detection',
      '1 Full Speaking Level Assessment Test',
      'Standard Robot Reactions & Audio Waves',
      'Last 5 Saved Chats Archive',
      'Native Language Hints (Telugu & Hindi)',
    ],
    color: '#6366f1',
  },
  {
    id: 'pro',
    name: 'Pro Fluency',
    badge: 'Most Popular ⭐',
    popular: true,
    priceMonthUSD: 9.99,
    priceMonthINR: 499,
    priceYearUSD: 79.99,
    priceYearINR: 3999,
    description: 'Accelerate fluency with unlimited talking time and advanced drills.',
    features: [
      'Unlimited Speaking Time with Nexa AI',
      'All 5 Certified Speaking Assessment Tests',
      'Smart Chat Title AI Analysis & Unlimited Saved Chats',
      'Deep Native Explanations in 8+ Languages',
      'Instant Phonetic Pronunciation Coaching',
      'Vocabulary Expansion & Synonyms Radar',
      'Audio Waveform & Pitch Modulation Feedback',
      'Ad-free & Priority Voice Synthesis',
    ],
    color: '#8b5cf6',
  },
  {
    id: 'unlimited',
    name: 'Flunexa Unlimited',
    badge: 'Ultimate Fluency 🚀',
    priceMonthUSD: 19.99,
    priceMonthINR: 999,
    priceYearUSD: 149.99,
    priceYearINR: 7499,
    description: 'Master spoken English for corporate interviews, IELTS, and career growth.',
    features: [
      'Everything in Pro Fluency Plan',
      'Mock Job Interview Simulation (Tech, HR, Sales)',
      'IELTS / TOEFL Speaking Band Score Predictor',
      'Personalized Weekly Progress PDF Dossiers',
      'Custom Voice Characters & Persona Unlocks',
      '1-on-1 Dedicated Pronunciation Diagnosis',
      'Early Access to New AI Speaking Models',
      'Priority 24/7 VIP Support',
    ],
    color: '#ec4899',
  },
  {
    id: 'lifetime',
    name: 'Lifetime Founder',
    badge: 'One-Time Payment 👑',
    priceMonthUSD: 99,
    priceMonthINR: 4999,
    priceYearUSD: 99,
    priceYearINR: 4999,
    isOneTime: true,
    description: 'Pay once, keep forever. All current and future AI updates included.',
    features: [
      'Permanent Lifetime Access to Flunexa Unlimited',
      'Zero recurring monthly or annual subscription fees',
      'Founder VIP Profile Badge in Leaderboard',
      'Unlimited AI Voice Practice forever',
      'Exclusive Beta Access to Vision AI Speaking Coach',
      'Direct Discord Channel with the Creators',
    ],
    color: '#f59e0b',
  },
];

export const PlansView: React.FC = () => {
  const { userPlan, upgradeUserPlan, openAuthModal, currentAccount } = useApp();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  // Checkout Modal State
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanDetails | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'FLUENT30' || couponCode.trim().toUpperCase() === 'FLUNEXA') {
      setDiscountPercent(30);
      setCouponMsg('✅ Coupon applied! 30% discount added.');
    } else {
      setDiscountPercent(0);
      setCouponMsg('❌ Invalid coupon code. Try "FLUENT30".');
    }
  };

  const handleOpenCheckout = (plan: PlanDetails) => {
    if (!currentAccount) {
      openAuthModal('signup');
      return;
    }
    setSelectedPlanForCheckout(plan);
    setDiscountPercent(0);
    setCouponCode('');
    setCouponMsg('');
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlanForCheckout) return;
    setIsProcessing(true);
    setTimeout(async () => {
      await upgradeUserPlan(selectedPlanForCheckout.id);
      setIsProcessing(false);
      setSelectedPlanForCheckout(null);
    }, 1200);
  };

  const calculatePrice = (plan: PlanDetails) => {
    if (plan.id === 'free') return '0';
    if (plan.isOneTime) {
      const base = currency === 'INR' ? plan.priceMonthINR : plan.priceMonthUSD;
      const final = discountPercent > 0 ? base * (1 - discountPercent / 100) : base;
      return currency === 'INR' ? `₹${Math.round(final)}` : `$${Math.round(final)}`;
    }

    const base =
      billingCycle === 'yearly'
        ? currency === 'INR'
          ? plan.priceYearINR
          : plan.priceYearUSD
        : currency === 'INR'
        ? plan.priceMonthINR
        : plan.priceMonthUSD;

    const final = discountPercent > 0 ? base * (1 - discountPercent / 100) : base;
    return currency === 'INR' ? `₹${Math.round(final)}` : `$${Math.round(final)}`;
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 18px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(129, 140, 248, 0.35)',
            marginBottom: 16,
          }}
        >
          <Sparkles size={16} color="var(--color-primary-light)" />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary-light)' }}>
            Transparent Plans for Rapid English Fluency
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 900, marginBottom: 14, letterSpacing: '-0.02em' }}>
          Invest in Your Speaking Confidence
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(1rem, 1.8vw, 1.15rem)', maxWidth: 640, margin: '0 auto' }}>
          Practice without judgment. Pick a plan that fits your pace, from daily 10-minute micro-habits to unlimited career coaching.
        </p>

        {/* Toggles: Billing Cycle & Currency */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            marginTop: 32,
          }}
        >
          {/* Monthly / Yearly Switch */}
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: 4,
              borderRadius: 14,
              border: '1px solid var(--border-glass)',
            }}
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                padding: '8px 18px',
                borderRadius: 10,
                border: 'none',
                background: billingCycle === 'monthly' ? 'var(--color-primary)' : 'transparent',
                color: billingCycle === 'monthly' ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              style={{
                padding: '8px 18px',
                borderRadius: 10,
                border: 'none',
                background: billingCycle === 'yearly' ? 'var(--color-primary)' : 'transparent',
                color: billingCycle === 'yearly' ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>Annual Billing</span>
              <span
                style={{
                  background: '#10b981',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: 10,
                }}
              >
                SAVE 30%
              </span>
            </button>
          </div>

          {/* Currency Toggle */}
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: 4,
              borderRadius: 14,
              border: '1px solid var(--border-glass)',
            }}
          >
            <button
              onClick={() => setCurrency('INR')}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: 'none',
                background: currency === 'INR' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: currency === 'INR' ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              INR (₹)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: 'none',
                background: currency === 'USD' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: currency === 'USD' ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              USD ($)
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 22,
          alignItems: 'stretch',
        }}
      >
        {PLANS.map((plan) => {
          const isCurrent = userPlan === plan.id;
          const isPro = plan.id === 'pro';

          return (
            <div
              key={plan.id}
              className="glass-card"
              style={{
                borderRadius: 22,
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                background: isPro
                  ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.16) 0%, rgba(20, 26, 48, 0.95) 100%)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: isPro
                  ? '2px solid rgba(129, 140, 248, 0.6)'
                  : '1px solid var(--border-glass)',
                boxShadow: isPro
                  ? '0 12px 40px rgba(99, 102, 241, 0.25)'
                  : 'var(--shadow-sm)',
                transform: isPro ? 'scale(1.02)' : 'none',
                transition: 'all 0.25s ease',
              }}
            >
              {/* Top Badge */}
              {plan.badge && (
                <div
                  style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: isPro
                      ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
                      : plan.id === 'lifetime'
                      ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
                      : 'var(--color-primary)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '4px 14px',
                    borderRadius: 20,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {plan.badge}
                </div>
              )}

              {/* Plan Title & Desc */}
              <div style={{ marginBottom: 20, marginTop: plan.badge ? 6 : 0 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>
                  {plan.name}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, minHeight: 38 }}>
                  {plan.description}
                </p>
              </div>

              {/* Price display */}
              <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                    {calculatePrice(plan)}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {plan.id === 'free'
                      ? 'forever'
                      : plan.isOneTime
                      ? 'one-time payment'
                      : billingCycle === 'yearly'
                      ? '/year'
                      : '/month'}
                  </span>
                </div>
                {billingCycle === 'yearly' && plan.id !== 'free' && !plan.isOneTime && (
                  <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600, marginTop: 4 }}>
                    Billed annually • Save 30%
                  </div>
                )}
              </div>

              {/* Features List */}
              <div style={{ flex: 1, marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14, letterSpacing: 0.5 }}>
                  What's included:
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {plan.features.map((feat, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#e2e8f0', lineHeight: 1.4 }}>
                      <Check size={16} color={isPro ? '#a855f7' : '#10b981'} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div>
                {isCurrent ? (
                  <button
                    disabled
                    style={{
                      width: '100%',
                      padding: '13px',
                      borderRadius: 12,
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#34d399',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'default',
                    }}
                  >
                    ✓ Current Plan Active
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenCheckout(plan)}
                    className={isPro ? 'btn-primary' : 'btn-secondary'}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      justifyContent: 'center',
                    }}
                  >
                    <span>{plan.id === 'free' ? 'Use Free Plan' : `Upgrade to ${plan.name}`}</span>
                    <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div
        className="glass-card"
        style={{
          marginTop: 48,
          padding: '24px 32px',
          borderRadius: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 24,
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ShieldCheck size={28} color="#10b981" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>14-Day Money Back</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Zero risk. Full refund if not satisfied.</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Lock size={26} color="#818cf8" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Bank-Grade 256-bit SSL</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Encrypted UPI, Cards & NetBanking.</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Zap size={26} color="#f59e0b" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Instant Plan Activation</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Unlocked immediately after checkout.</div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* CHECKOUT MODAL */}
      {/* =================================================================== */}
      {selectedPlanForCheckout && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 8, 18, 0.82)',
            backdropFilter: 'blur(10px)',
            zIndex: 2100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPlanForCheckout(null);
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: 500,
              borderRadius: 24,
              padding: '28px 24px',
              position: 'relative',
              background: 'linear-gradient(180deg, #182035 0%, #0d1222 100%)',
              border: '1px solid rgba(129, 140, 248, 0.3)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedPlanForCheckout(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Crown size={22} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
                  Upgrade to {selectedPlanForCheckout.name}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                  {billingCycle === 'yearly' && !selectedPlanForCheckout.isOneTime
                    ? 'Annual Subscription'
                    : selectedPlanForCheckout.isOneTime
                    ? 'Lifetime Access'
                    : 'Monthly Subscription'}
                </p>
              </div>
            </div>

            {/* Plan Price Summary */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 14,
                padding: '16px 18px',
                marginBottom: 20,
                border: '1px solid var(--border-glass)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Base Price</span>
                <span style={{ fontSize: 16, fontWeight: 700 }}>
                  {calculatePrice(selectedPlanForCheckout)}
                </span>
              </div>
              {discountPercent > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, color: '#10b981' }}>
                  <span style={{ fontSize: 13 }}>Promo Discount (30%)</span>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>-30%</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>Total Payable</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#38bdf8' }}>
                  {calculatePrice(selectedPlanForCheckout)}
                </span>
              </div>
            </div>

            {/* Coupon Code Section */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Promo Code (e.g. FLUENT30)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border-glass)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: '1px solid rgba(129, 140, 248, 0.4)',
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#a5b4fc',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Apply
              </button>
            </form>
            {couponMsg && (
              <div style={{ fontSize: 12, marginBottom: 16, color: discountPercent > 0 ? '#34d399' : '#f87171' }}>
                {couponMsg}
              </div>
            )}

            {/* Payment Method Selector */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#cbd5e1' }}>
                Select Payment Method
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { id: 'upi', label: 'UPI / GPay' },
                  { id: 'card', label: 'Card' },
                  { id: 'netbanking', label: 'NetBanking' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as any)}
                    style={{
                      padding: '10px 6px',
                      borderRadius: 10,
                      border: paymentMethod === pm.id ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
                      background: paymentMethod === pm.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: paymentMethod === pm.id ? '#fff' : 'var(--text-muted)',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm Upgrade Button */}
            <button
              onClick={handleConfirmUpgrade}
              disabled={isProcessing}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 800,
                justifyContent: 'center',
              }}
            >
              {isProcessing ? (
                <span>Activating Your Plan...</span>
              ) : (
                <>
                  <Zap size={16} />
                  <span>Confirm & Activate {selectedPlanForCheckout.name}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
