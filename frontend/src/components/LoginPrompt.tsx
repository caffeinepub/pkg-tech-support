import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  ArrowRight,
  Zap,
  Star,
  Laptop,
  Smartphone,
  Printer,
  Wifi,
  CheckCircle,
  Quote,
  Clock,
  MessageCircle,
} from 'lucide-react';

const skills = [
  { icon: Laptop, label: 'Laptop/Desktop troubleshooting & upgrades' },
  { icon: Smartphone, label: 'Mobile repair/setup (Android/iOS)' },
  { icon: Printer, label: 'Printer connectivity & ink issues' },
  { icon: Wifi, label: 'Remote support via chat/video' },
];

const pricingTiers = [
  {
    name: 'Basic Diagnostic',
    price: '₹500',
    description: 'Quick diagnosis of your device issue with a detailed report.',
    color: 'var(--primary)',
    bg: 'oklch(0.52 0.18 195 / 0.08)',
    border: 'oklch(0.52 0.18 195 / 0.25)',
  },
  {
    name: 'Full Laptop/Mobile Fix',
    price: '₹1,500',
    description: 'Complete repair & optimization for laptops or mobile devices.',
    color: 'var(--secondary)',
    bg: 'oklch(0.55 0.16 265 / 0.08)',
    border: 'oklch(0.55 0.16 265 / 0.25)',
    highlight: true,
  },
  {
    name: 'Printer Setup',
    price: '₹800',
    description: 'Full printer installation, connectivity fix & test print.',
    color: 'var(--success)',
    bg: 'oklch(0.58 0.18 145 / 0.08)',
    border: 'oklch(0.58 0.18 145 / 0.25)',
  },
];

const testimonials = [
  {
    quote: 'Fixed my printer in 30 mins!',
    name: 'Ravi S.',
    location: 'Jaipur',
    rating: 5,
  },
  {
    quote: 'Laptop running smooth again — couldn\'t believe how fast the fix was!',
    name: 'Priya M.',
    location: 'Delhi',
    rating: 5,
  },
  {
    quote: 'Phone screen replaced same day! Highly recommend for mobile repairs.',
    name: 'Amit K.',
    location: 'Jaipur',
    rating: 5,
  },
];

const portfolio = [
  {
    image: '/assets/generated/printer-setup-before-after.dim_600x400.png',
    caption: 'Before/After: Printer Setup',
    tag: 'Printer',
    tagColor: 'var(--success)',
    tagBg: 'oklch(0.58 0.18 145 / 0.12)',
  },
  {
    image: '/assets/generated/mobile-repair-demo.dim_600x400.png',
    caption: 'Mobile Screen Repair Demo',
    tag: 'Mobile',
    tagColor: 'var(--secondary)',
    tagBg: 'oklch(0.55 0.16 265 / 0.12)',
  },
  {
    image: '/assets/generated/laptop-fix-demo.dim_600x400.png',
    caption: 'Laptop Upgrade Complete',
    tag: 'Laptop',
    tagColor: 'var(--primary)',
    tagBg: 'oklch(0.52 0.18 195 / 0.12)',
  },
];

const deviceIcons = [
  { image: '/assets/generated/laptop-icon.dim_64x64.png', label: 'Laptop' },
  { image: '/assets/generated/phone-icon.dim_64x64.png', label: 'Mobile' },
  { image: '/assets/generated/printer-icon.dim_64x64.png', label: 'Printer' },
];

export default function LoginPrompt() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>

      {/* ── Banner: Device Fixes Done Right ── */}
      <div className="relative w-full overflow-hidden" style={{ maxHeight: 320 }}>
        <img
          src="/assets/generated/device-fixes-banner.dim_1200x400.png"
          alt="Device Fixes Done Right"
          className="w-full object-cover"
          style={{ maxHeight: 320 }}
        />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, oklch(0.15 0.05 195 / 0.72) 0%, oklch(0.15 0.05 265 / 0.72) 100%)',
          }}
        >
          <h2
            className="text-3xl md:text-5xl font-display font-extrabold tracking-tight text-center px-4"
            style={{ color: '#ffffff', textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
          >
            Device Fixes Done Right
          </h2>
          <p className="mt-3 text-base md:text-lg font-medium text-center px-4" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Laptops · Desktops · Mobiles · Printers
          </p>
        </div>
      </div>

      {/* ── Device Icons Strip ── */}
      <div
        className="flex items-center justify-center gap-8 py-6 border-b"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {deviceIcons.map((d) => (
          <div key={d.label} className="flex flex-col items-center gap-2">
            <img src={d.image} alt={d.label} className="w-12 h-12 object-contain" />
            <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
              {d.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            opacity: 0.07,
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
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
            Jaipur-Based Tech Expert · 10+ Years Experience
          </div>

          <h1
            className="text-3xl md:text-5xl font-display font-bold mb-6 leading-tight"
            style={{ color: 'var(--foreground)' }}
          >
            Tech Support Expert |{' '}
            <span style={{ color: 'var(--primary)' }}>Fast Fixes for Laptops, Desktops, Mobiles & Printers</span>
            {' '}| 10+ Years Experience
          </h1>

          <p className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            Jaipur-based pro fixing your laptops, desktops, mobiles, and printers remotely or on-site.
            Quick, affordable solutions for home/office.{' '}
            <span className="font-semibold" style={{ color: 'var(--primary)' }}>Message for same-day help!</span>
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

      {/* ── Skills / Services Section ── */}
      <div className="max-w-4xl mx-auto px-4 py-14 w-full">
        <h2
          className="text-2xl font-display font-bold text-center mb-8"
          style={{ color: 'var(--foreground)' }}
        >
          What I Fix
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skills.map((skill) => {
            const Icon = skill.icon;
            return (
              <div
                key={skill.label}
                className="flex items-center gap-4 rounded-xl px-5 py-4 border"
                style={{
                  background: 'var(--card)',
                  borderColor: 'var(--border)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'oklch(0.52 0.18 195 / 0.12)', color: 'var(--primary)' }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--success)' }} />
                  <span className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                    {skill.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Pricing / Services Section ── */}
      <div
        className="py-14"
        style={{ background: 'oklch(0.52 0.18 195 / 0.04)' }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <h2
            className="text-2xl font-display font-bold text-center mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            Transparent Pricing
          </h2>
          <p className="text-center text-sm mb-10" style={{ color: 'var(--muted-foreground)' }}>
            All prices in INR · 24–48 hour turnaround guaranteed
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className="rounded-2xl p-6 border-2 flex flex-col gap-3 transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: tier.bg,
                  borderColor: tier.border,
                  boxShadow: tier.highlight ? `0 8px 32px ${tier.border}` : undefined,
                }}
              >
                {tier.highlight && (
                  <span
                    className="self-start text-xs font-bold px-3 py-1 rounded-full mb-1"
                    style={{ background: tier.color, color: '#fff' }}
                  >
                    Most Popular
                  </span>
                )}
                <h3 className="font-display font-bold text-lg" style={{ color: 'var(--foreground)' }}>
                  {tier.name}
                </h3>
                <div className="text-3xl font-extrabold" style={{ color: tier.color }}>
                  {tier.price}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  {tier.description}
                </p>
                <div
                  className="flex items-center gap-2 mt-auto pt-3 border-t text-xs font-semibold"
                  style={{ borderColor: tier.border, color: tier.color }}
                >
                  <Clock className="w-3.5 h-3.5" />
                  24–48 hour turnaround
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Portfolio / Work Samples Section ── */}
      <div className="max-w-5xl mx-auto px-4 py-14 w-full">
        <h2
          className="text-2xl font-display font-bold text-center mb-3"
          style={{ color: 'var(--foreground)' }}
        >
          Work Samples
        </h2>
        <p className="text-center text-sm mb-10" style={{ color: 'var(--muted-foreground)' }}>
          Real fixes, real results
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {portfolio.map((item) => (
            <div
              key={item.caption}
              className="rounded-2xl overflow-hidden border-2 interactive-card"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="relative" style={{ aspectRatio: '3/2' }}>
                <img
                  src={item.image}
                  alt={item.caption}
                  className="w-full h-full object-cover"
                />
                <span
                  className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: item.tagBg, color: item.tagColor, backdropFilter: 'blur(4px)' }}
                >
                  {item.tag}
                </span>
              </div>
              <div className="px-4 py-3">
                <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                  {item.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Testimonials Section ── */}
      <div
        className="py-14"
        style={{ background: 'oklch(0.55 0.16 265 / 0.04)' }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <h2
            className="text-2xl font-display font-bold text-center mb-10"
            style={{ color: 'var(--foreground)' }}
          >
            What Clients Say
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl p-6 border-2 flex flex-col gap-4"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <Quote className="w-6 h-6" style={{ color: 'var(--primary)', opacity: 0.6 }} />
                <p className="text-base font-medium leading-relaxed flex-1" style={{ color: 'var(--foreground)' }}>
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" style={{ color: 'var(--accent)' }} />
                  ))}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>
                    {t.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {t.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center w-full">
        <div
          className="rounded-3xl p-10 border-2"
          style={{
            background: 'linear-gradient(135deg, oklch(0.52 0.18 195 / 0.08) 0%, oklch(0.55 0.16 265 / 0.08) 100%)',
            borderColor: 'oklch(0.52 0.18 195 / 0.2)',
          }}
        >
          <h2 className="text-3xl font-display font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Ready to Fix Your Device?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--muted-foreground)' }}>
            Message now for same-day help — remote or on-site, Jaipur & beyond.
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
