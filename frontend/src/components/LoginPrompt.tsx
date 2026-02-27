import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { MessageCircle, Shield, CreditCard, Bot, ArrowRight, Zap, Star } from 'lucide-react';

export default function LoginPrompt() {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageCircle,
      title: 'Real-Time Chat',
      description: 'Connect instantly with certified IT experts for immediate assistance.',
      color: 'var(--primary)',
      bg: 'oklch(0.52 0.18 195 / 0.1)',
    },
    {
      icon: Shield,
      title: 'Expert Technicians',
      description: 'Certified professionals ready to solve your technical challenges.',
      color: 'var(--secondary)',
      bg: 'oklch(0.55 0.16 265 / 0.1)',
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Safe and transparent billing with multiple payment options.',
      color: 'var(--success)',
      bg: 'oklch(0.58 0.18 145 / 0.1)',
    },
    {
      icon: Bot,
      title: 'AI Assistant',
      description: '24/7 AI-powered support for instant answers to common issues.',
      color: 'var(--accent)',
      bg: 'oklch(0.72 0.18 55 / 0.1)',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            opacity: 0.08,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 border"
            style={{
              background: 'oklch(0.52 0.18 195 / 0.12)',
              borderColor: 'oklch(0.52 0.18 195 / 0.3)',
              color: 'var(--primary)',
            }}
          >
            <Star className="w-4 h-4" />
            Professional IT Support Platform
          </div>

          <h1
            className="text-5xl md:text-6xl font-display font-bold mb-6 leading-tight"
            style={{ color: 'var(--foreground)' }}
          >
            Expert Tech Support
            <br />
            <span style={{ color: 'var(--primary)' }}>When You Need It</span>
          </h1>

          <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--muted-foreground)' }}>
            Connect with certified IT professionals for instant, reliable technical assistance.
            Fast, secure, and always available.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => navigate({ to: '/customer-login' })}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-primary"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              boxShadow: '0 8px 32px oklch(0.52 0.18 195 / 0.35)',
            }}
          >
            <Zap className="w-5 h-5" />
            Get Support Now
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="mt-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            No account needed to browse · Secure login with Internet Identity
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2
          className="text-3xl font-display font-bold text-center mb-12"
          style={{ color: 'var(--foreground)' }}
        >
          Everything You Need
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="interactive-card rounded-2xl p-6 border-2"
                style={{
                  background: 'var(--card)',
                  borderColor: 'var(--border)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: feature.bg, color: feature.color }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-6xl mx-auto px-4 pb-16 text-center">
        <div
          className="rounded-3xl p-10 border-2"
          style={{
            background: 'linear-gradient(135deg, oklch(0.52 0.18 195 / 0.08) 0%, oklch(0.55 0.16 265 / 0.08) 100%)',
            borderColor: 'oklch(0.52 0.18 195 / 0.2)',
          }}
        >
          <h2 className="text-3xl font-display font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--muted-foreground)' }}>
            Join thousands of customers who trust PKG Tech Support for their IT needs.
          </p>
          <button
            onClick={() => navigate({ to: '/customer-login' })}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              boxShadow: '0 8px 32px oklch(0.52 0.18 195 / 0.35)',
            }}
          >
            <MessageCircle className="w-5 h-5" />
            Start a Chat
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
