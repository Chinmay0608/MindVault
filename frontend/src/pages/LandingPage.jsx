import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BookOpen, ArrowRight, Play, Shield, Zap, BarChart3,
  Calendar, DollarSign, Lock, Sparkles, ChevronRight,
  Star, Check, TrendingUp, Brain, Eye, Database,
  Menu, X, Leaf, Sun, Coffee, Feather
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const cursorGlowRef = useRef(null);
  const cardsRef = useRef([]);
  const revealRefs = useRef([]);
  const stepRefs = useRef([]);
  const bentoRefs = useRef([]);
  const statRefs = useRef([]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (cursorGlowRef.current) {
        gsap.to(cursorGlowRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const handleMouseMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      cardsRef.current.forEach((card) => {
        if (!card) return;
        const depth = parseFloat(card.dataset.depth) || 0.03;
        gsap.to(card, {
          x: x * 30 * depth,
          y: y * 30 * depth,
          duration: 0.5,
          ease: 'power2.out'
        });
      });
    };
    const handleMouseLeave = () => {
      cardsRef.current.forEach((card) => {
        if (!card) return;
        gsap.to(card, {
          x: 0,
          y: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.5)'
        });
      });
    };
    hero.addEventListener('mousemove', handleMouseMove);
    hero.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      hero.removeEventListener('mousemove', handleMouseMove);
      hero.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.hero-line-inner', {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.3
      });

      gsap.to('.hero-fade-in', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.8
      });

      statRefs.current.forEach((stat) => {
        if (!stat) return;
        const target = parseFloat(stat.dataset.count);
        const suffix = stat.dataset.suffix || '';
        const isFloat = target % 1 !== 0;
        gsap.to(stat, {
          innerHTML: target,
          duration: 2,
          delay: 1.2,
          snap: { innerHTML: isFloat ? 0.1 : 1 },
          onUpdate: function () {
            const val = parseFloat(stat.innerHTML);
            stat.innerHTML = isFloat
              ? val.toFixed(1) + suffix
              : Math.floor(val).toLocaleString() + suffix;
          }
        });
      });

      revealRefs.current.forEach((el) => {
        if (!el) return;
        gsap.to(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out'
        });
      });

      stepRefs.current.forEach((step, i) => {
        if (!step) return;
        gsap.to(step, {
          scrollTrigger: {
            trigger: step,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: i * 0.15,
          ease: 'power3.out'
        });
      });

      bentoRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.to(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none'
          },
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: 'power3.out'
        });
      });
    });

    return () => ctx.revert();
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Stories', href: '#testimonials' },
    { name: 'Security', href: '#security' }
  ];

  const stats = [
    { value: 50000, suffix: '', label: 'Active Users' },
    { value: 2.4, suffix: 'M+', label: 'Entries Logged' },
    { value: 99.9, suffix: '%', label: 'Uptime' }
  ];

  const features = [
    {
      icon: Brain,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-500/10',
      title: 'AI-Powered Journal Analysis',
      description: 'Our intelligent engine reads between the lines, identifying emotional patterns, mood trends, and suggesting personalized prompts to deepen your self-awareness.',
      large: true,
      visual: 'chart'
    },
    {
      icon: Calendar,
      iconColor: 'text-sky-500',
      iconBg: 'bg-sky-500/10',
      title: 'Smart Agendas',
      description: 'Fluid, interactive to-do lists that adapt to your workflow. Priority scoring, deadline tracking, and habit streaks.'
    },
    {
      icon: DollarSign,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-500/10',
      title: 'Expense Ledger',
      description: 'Log financial diaries with intelligent categorization. Visual spending insights and budget tracking.'
    },
    {
      icon: Lock,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-400/10',
      title: 'AES-256 Encryption',
      description: 'Your data never leaves your device unencrypted. Zero-knowledge architecture with local-first storage.'
    },
    {
      icon: TrendingUp,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-500/10',
      title: 'Habit Analytics Dashboard',
      description: 'Beautiful visualizations of your consistency, mood correlations, and productivity patterns. Export insights as shareable reports.',
      large: true,
      visual: 'bars'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Your Vault',
      description: 'Sign up with just an email. Your vault is generated instantly with a unique encryption key that only you possess. We have zero access to your data — ever.'
    },
    {
      number: '02',
      title: 'Capture Your World',
      description: 'Start journaling, logging expenses, or building agendas. The interface adapts to your workflow. Rich text, voice notes, mood tags, and photo attachments — all encrypted at rest.'
    },
    {
      number: '03',
      title: 'Discover Insights',
      description: 'Watch patterns emerge. AI surfaces emotional trends, spending habits, and productivity correlations you never knew existed. Your data, your insights, your growth.'
    }
  ];

  const testimonials = [
    {
      text: "I've tried every journaling app out there. Mind Vault is the first one that feels like it was built for my brain. The local encryption gives me peace of mind I never knew I needed.",
      author: 'Sarah Kim',
      role: 'Product Designer, Figma',
      initials: 'SK'
    },
    {
      text: "The expense tracking combined with mood journaling helped me realize I spend more when I'm stressed. Game-changing insight that saved me ₹40,000 in three months.",
      author: 'Rahul Patel',
      role: 'Software Engineer, Google',
      initials: 'RP'
    },
    {
      text: "As a therapist, I recommend Mind Vault to clients who want to track their emotional patterns. The AI insights are surprisingly accurate and deeply respectful of privacy.",
      author: 'Dr. Maya Chen',
      role: 'Clinical Psychologist',
      initials: 'DM'
    },
    {
      text: "The local-first approach means my journal entries are truly mine. No cloud, no surveillance, no vendor lock-in. Just a beautiful, fast app that respects my autonomy.",
      author: 'Alex Johnson',
      role: 'Privacy Advocate, EFF',
      initials: 'AJ'
    }
  ];

  const trustLogos = [
    { name: 'Notion', icon: Database },
    { name: 'Obsidian', icon: Eye },
    { name: 'Roam', icon: Brain },
    { name: 'Reflect', icon: Sparkles },
    { name: 'Logseq', icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1c1917] overflow-x-hidden font-sans selection:bg-emerald-200/50 selection:text-emerald-900">
      {/* Warm Ambient Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute w-[700px] h-[700px] rounded-full blur-[140px] opacity-30 animate-orb1 top-[-15%] right-[-15%]"
          style={{ background: 'radial-gradient(circle, #fbbf24, transparent 70%)' }} />
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 animate-orb2 bottom-[-10%] left-[-15%]"
          style={{ background: 'radial-gradient(circle, #34d399, transparent 70%)' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-20 animate-orb3 top-[45%] left-[25%]"
          style={{ background: 'radial-gradient(circle, #f472b6, transparent 70%)' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-15 animate-orb4 top-[10%] left-[60%]"
          style={{ background: 'radial-gradient(circle, #60a5fa, transparent 70%)' }} />
      </div>

      {/* Subtle Grain Texture */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />

      {/* Cursor Glow */}
      <div
        ref={cursorGlowRef}
        className="fixed w-[350px] h-[350px] rounded-full pointer-events-none z-0 transition-opacity duration-300 hidden lg:block"
        style={{
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.12), transparent 70%)',
          transform: `translate(${mousePos.x - 175}px, ${mousePos.y - 175}px)`
        }}
      />

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[1000] px-6 py-4 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#faf9f6]/80 backdrop-blur-xl border-b border-stone-200/60 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 no-underline text-[#1c1917] font-bold text-xl tracking-tight">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #d97706, #059669)' }}>
              <Brain className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span>Mind <span style={{ background: 'linear-gradient(135deg, #d97706, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Vault</span></span>
          </a>

          <ul className="hidden lg:flex items-center gap-10 list-none m-0 p-0">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="text-stone-500 text-base font-semibold no-underline relative inline-block transition-all duration-300 ease-out hover:text-[#1c1917] hover:scale-110 group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 rounded-full transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center gap-3">
            <a href="/login" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-stone-500 border border-stone-200 bg-white/60 transition-all duration-300 hover:bg-white hover:text-stone-800 hover:border-stone-300 no-underline inline-flex items-center gap-2 backdrop-blur-sm">
              Sign In
            </a>
            <a href="/signup" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white no-underline inline-flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                boxShadow: '0 4px 20px rgba(251, 191, 36, 0.35)'
              }}>
              Create Free Vault
            </a>
          </div>

          <button
            className="lg:hidden p-2 text-stone-500 hover:text-stone-800 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-stone-200/60 pt-4 bg-[#faf9f6]/95 backdrop-blur-xl">
            <ul className="flex flex-col gap-4 list-none m-0 p-0">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-stone-500 text-sm font-medium no-underline hover:text-stone-800 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}>
                    {link.name}
                  </a>
                </li>
              ))}
              <li className="flex flex-col gap-3 mt-2">
                <a href="/login" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-stone-500 border border-stone-200 text-center no-underline">Sign In</a>
                <a href="/signup" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white text-center no-underline"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
                  Create Free Vault
                </a>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative px-6 pt-32 pb-16 overflow-hidden">
        <div className="max-w-[1400px] w-full grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-[2] text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-amber-700 mb-8 border border-amber-200 bg-amber-50/80 backdrop-blur-sm">
              <Leaf className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
              Now with AI-Powered Insights
            </div>

            <h1 className="landing-font-serif text-5xl sm:text-6xl lg:text-[5.5rem] font-bold leading-[1.05] tracking-tight mb-6">
              <span className="block overflow-hidden">
                <span className="hero-line-inner block translate-y-full opacity-0">Your Mind's</span>
              </span>
              <span className="block overflow-hidden">
                <span className="hero-line-inner block translate-y-full opacity-0">Sanctuary.</span>
              </span>
              <span className="block overflow-hidden">
                <span className="hero-line-inner block translate-y-full opacity-0"
                  style={{ background: 'linear-gradient(135deg, #d97706, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Organized &amp; Secured.
                </span>
              </span>
            </h1>

            <p className="hero-fade-in text-lg text-stone-500 max-w-[500px] mb-10 leading-relaxed opacity-0 translate-y-5 mx-auto lg:mx-0">
              MindVault is an elegant, multi-purpose workspace built to capture your personal daily journals, track fluid interactive to-do lists, log financial diaries, and analyze personal habits. Zero heavy cloud tracking. Completely personalized, local, and encrypted under your control.
            </p>

            <div className="hero-fade-in flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-12 opacity-0 translate-y-5">
              <a href="/signup" className="px-8 py-4 rounded-2xl text-base font-semibold text-white no-underline inline-flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                  boxShadow: '0 4px 24px rgba(251, 191, 36, 0.4)'
                }}>
                Launch Your Vault
                <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.5} />
              </a>
              <a href="#how-it-works" className="px-8 py-4 rounded-2xl text-base font-semibold text-stone-600 border border-stone-200 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-stone-800 hover:border-stone-300 no-underline inline-flex items-center gap-2">
                <Play className="w-[18px] h-[18px]" strokeWidth={2} />
                Watch Demo
              </a>
            </div>

            <div className="hero-fade-in flex flex-wrap justify-center lg:justify-start gap-10 pt-8 border-t border-stone-200/60 opacity-0 translate-y-5">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span
                    ref={(el) => (statRefs.current[i] = el)}
                    data-count={stat.value}
                    data-suffix={stat.suffix}
                    className="text-3xl font-extrabold text-[#1c1917]"
                  >
                    0
                  </span>
                  <span className="text-xs text-stone-400 uppercase tracking-[0.1em] font-semibold">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual - Floating Cards */}
          <div ref={heroRef} className="relative h-[500px] lg:h-[600px] hidden lg:block" style={{ perspective: '1000px' }}>
            <div
              ref={(el) => (cardsRef.current[0] = el)}
              data-depth="0.03"
              className="absolute top-[5%] left-[10%] w-[280px] rounded-[24px] p-6 backdrop-blur-xl border border-stone-200/80 shadow-[0_20px_60px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] animate-float1 bg-white/70"
              style={{ borderLeft: '4px solid #fbbf24' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1c1917]">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600">
                    <BookOpen className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  Mindful Entry
                </div>
              </div>
              <div className="text-sm text-stone-500 leading-relaxed">
                <p className="italic border-l-2 border-amber-400 pl-4 text-stone-600">"Reflections captured safely. Every thought matters, every memory preserved."</p>
              </div>
            </div>

            <div
              ref={(el) => (cardsRef.current[1] = el)}
              data-depth="0.05"
              className="absolute top-[35%] right-[5%] w-[260px] rounded-[24px] p-6 backdrop-blur-xl border border-stone-200/80 shadow-[0_20px_60px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] animate-float2 bg-white/70"
              style={{ borderLeft: '4px solid #f87171' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1c1917]">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-100 text-red-500">
                    <DollarSign className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  Expense Ledger
                </div>
              </div>
              <div className="text-sm text-stone-500 leading-relaxed">
                <div className="text-2xl font-extrabold text-red-500 my-2">₹8,450.00</div>
                <div className="text-xs text-stone-400">Category: Travel &amp; Relocation</div>
              </div>
            </div>

            <div
              ref={(el) => (cardsRef.current[2] = el)}
              data-depth="0.04"
              className="absolute bottom-[10%] left-[20%] w-[300px] rounded-[24px] p-6 backdrop-blur-xl border border-stone-200/80 shadow-[0_20px_60px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] animate-float3 bg-white/70"
              style={{ borderLeft: '4px solid #34d399' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1c1917]">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-600">
                    <Calendar className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  Daily Agendas
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-500">High</span>
              </div>
              <div className="space-y-2">
                {['Morning meditation routine', 'Placement strategy prep'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0">
                    <div className="w-5 h-5 rounded-full border-2 border-emerald-400 flex items-center justify-center flex-shrink-0 bg-emerald-50">
                      <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-stone-400 line-through">{item}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 py-2">
                  <div className="w-5 h-5 rounded-full border-2 border-stone-300 flex items-center justify-center flex-shrink-0" />
                  <span className="text-sm text-[#1c1917] font-medium">Evening journal reflection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 px-6 border-y border-stone-200/60 bg-white/40 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-8 font-semibold">Trusted by mindful professionals worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-50">
            {trustLogos.map((logo) => (
              <div key={logo.name} className="flex items-center gap-2 text-stone-500 font-bold text-lg tracking-tight">
                <logo.icon className="w-5 h-5" strokeWidth={2} />
                {logo.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-[1200px] mx-auto">
          <div
            ref={(el) => (revealRefs.current[0] = el)}
            className="text-center max-w-[600px] mx-auto mb-16 opacity-0 translate-y-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.1em] text-rose-500 mb-6 border border-rose-200 bg-rose-50/80">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
              Powerful Features
            </div>
            <h2 className="landing-font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.2] mb-4 text-[#1c1917]">
              Everything you need to<br />capture your mind
            </h2>
            <p className="text-lg text-stone-500 leading-relaxed">
              A complete ecosystem for self-reflection, productivity, and personal growth — all in one secure vault.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ gridAutoRows: '280px' }}>
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  ref={(el) => (bentoRefs.current[i] = el)}
                  className={`relative rounded-3xl p-8 border border-stone-200/80 transition-all duration-500 cursor-pointer group hover:-translate-y-1 opacity-0 translate-y-5 ${
                    feature.large ? 'md:col-span-2' : ''
                  }`}
                  style={{ background: 'rgba(255, 255, 255, 0.7)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.4)';
                    e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.06), 0 0 0 1px rgba(251, 191, 36, 0.15)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(231, 229, 228, 0.8)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                  }}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${feature.iconBg} ${feature.iconColor}`}>
                    <Icon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#1c1917]">{feature.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{feature.description}</p>

                  {feature.visual === 'chart' && (
                    <div className="absolute bottom-0 right-0 w-[60%] h-[50%] opacity-50 pointer-events-none">
                      <svg viewBox="0 0 200 100" className="w-full h-full" fill="none">
                        <path d="M0 80 Q25 60 50 70 T100 50 T150 60 T200 30" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="2" />
                        <path d="M0 80 Q25 60 50 70 T100 50 T150 60 T200 30" stroke="url(#gradWarm)" strokeWidth="2" fill="none" strokeDasharray="400" strokeDashoffset="0">
                          <animate attributeName="stroke-dashoffset" from="400" to="0" dur="3s" fill="freeze" />
                        </path>
                        <defs>
                          <linearGradient id="gradWarm" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
                            <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
                            <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  )}
                  {feature.visual === 'bars' && (
                    <div className="absolute bottom-0 right-0 w-[60%] h-[50%] opacity-50 pointer-events-none">
                      <svg viewBox="0 0 200 100" className="w-full h-full" fill="none">
                        {[60, 40, 50, 20, 35, 45, 25].map((y, idx) => (
                          <rect key={idx} x={10 + idx * 25} y={y} width="15" height={100 - y} rx="4" fill={`rgba(52, 211, 153, ${0.15 + idx * 0.04})`} />
                        ))}
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 px-6"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(251, 191, 36, 0.04), transparent)' }}>
        <div className="max-w-[1000px] mx-auto">
          <div
            ref={(el) => (revealRefs.current[1] = el)}
            className="text-center max-w-[600px] mx-auto mb-16 opacity-0 translate-y-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.1em] text-emerald-600 mb-6 border border-emerald-200 bg-emerald-50/80">
              <Shield className="w-3.5 h-3.5" strokeWidth={2.5} />
              Simple Process
            </div>
            <h2 className="landing-font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.2] mb-4 text-[#1c1917]">
              Three steps to<br />mindful clarity
            </h2>
            <p className="text-lg text-stone-500 leading-relaxed">
              Getting started takes less than a minute. No credit card, no cloud signup, no data mining.
            </p>
          </div>

          <div className="flex flex-col">
            {steps.map((step, i) => (
              <div
                key={i}
                ref={(el) => (stepRefs.current[i] = el)}
                className="grid gap-8 py-12 relative opacity-0 -translate-x-8"
                style={{ gridTemplateColumns: '80px 1fr' }}
              >
                {i !== steps.length - 1 && (
                  <div className="absolute left-10 w-0.5"
                    style={{ background: 'linear-gradient(180deg, #fbbf24, transparent)', top: '100px', height: 'calc(100% - 60px)' }} />
                )}
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-extrabold text-amber-600 relative z-[2] flex-shrink-0 border-2 border-amber-200 bg-amber-50/80 backdrop-blur-sm shadow-sm">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-[#1c1917]">{step.title}</h3>
                  <p className="text-base text-stone-500 leading-relaxed max-w-[500px]">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Marquee */}
      <section id="testimonials" className="py-24 overflow-hidden relative">
        <div className="absolute left-0 top-0 w-[200px] h-full z-[2] pointer-events-none"
          style={{ background: 'linear-gradient(90deg, #faf9f6, transparent)' }} />
        <div className="absolute right-0 top-0 w-[200px] h-full z-[2] pointer-events-none"
          style={{ background: 'linear-gradient(-90deg, #faf9f6, transparent)' }} />

        <div
          ref={(el) => (revealRefs.current[2] = el)}
          className="text-center mb-12 opacity-0 translate-y-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.1em] text-sky-600 mb-6 border border-sky-200 bg-sky-50/80">
            <Star className="w-3.5 h-3.5" strokeWidth={2.5} />
            User Stories
          </div>
          <h2 className="landing-font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.2] text-[#1c1917]">
            Loved by thinkers,<br />builders, dreamers
          </h2>
        </div>

        <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused] w-max">
          {[...testimonials, ...testimonials].map((t, i) => (
            <div
              key={i}
              className="w-[380px] flex-shrink-0 rounded-[24px] p-8 border border-stone-200/80 transition-all duration-300 hover:border-amber-300/60 hover:scale-[1.02] bg-white/70 backdrop-blur-sm"
            >
              <div className="flex gap-1 mb-4 text-amber-500">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4" fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="text-sm text-stone-600 leading-relaxed mb-6 italic">"{t.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #34d399)' }}>
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#1c1917]">{t.author}</h4>
                  <span className="text-xs text-stone-400">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section id="security" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2), transparent 70%)' }} />

        <div
          ref={(el) => (revealRefs.current[3] = el)}
          className="max-w-[800px] mx-auto text-center relative z-[2] opacity-0 translate-y-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-rose-500 mb-8 border border-rose-200 bg-rose-50/80">
            <Lock className="w-4 h-4" strokeWidth={2.5} />
            AES-256 ENCRYPTED
          </div>
          <h2 className="landing-font-serif text-4xl sm:text-5xl lg:text-[4rem] font-bold leading-[1.2] mb-6 text-[#1c1917]">
            Ready to claim your<br />mind's sanctuary?
          </h2>
          <p className="text-lg text-stone-500 max-w-[500px] mx-auto mb-10 leading-relaxed">
            Join 50,000+ thinkers who have chosen clarity, privacy, and intention. Your first vault is free forever. No credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/signup" className="px-10 py-4 rounded-2xl text-base font-semibold text-white no-underline inline-flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                boxShadow: '0 4px 24px rgba(251, 191, 36, 0.4)'
              }}>
              Create Free Vault
              <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </a>
            <a href="#" className="px-10 py-4 rounded-2xl text-base font-semibold text-stone-600 border border-stone-200 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-stone-800 hover:border-stone-300 no-underline inline-flex items-center gap-2">
              Download App
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-16 pb-8 px-6 border-t border-stone-200/60 bg-stone-100/50">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
          <div>
            <a href="#" className="flex items-center gap-3 no-underline text-[#1c1917] font-bold text-xl tracking-tight mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #d97706, #059669)' }}>
                <Brain className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <span>Mind <span style={{ background: 'linear-gradient(135deg, #d97706, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Vault</span></span>
            </a>
            <p className="text-sm text-stone-500 leading-relaxed max-w-[300px]">
              Your personal space for daily reflections, goals, and metrics. Encrypted, secure, and built for your peace of mind.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.15em] text-stone-400 mb-6 font-bold">Platform</h4>
            <ul className="space-y-3 list-none m-0 p-0">
              {['Workspace', 'My Profile', 'New Entry'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-stone-500 no-underline transition-colors duration-300 hover:text-amber-600 inline-flex items-center gap-2">
                    <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.15em] text-stone-400 mb-6 font-bold">Security</h4>
            <ul className="space-y-3 list-none m-0 p-0">
              {['Privacy Shield', 'Zero-Knowledge', 'Data Audit'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-stone-500 no-underline transition-colors duration-300 hover:text-amber-600 inline-flex items-center gap-2">
                    <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.15em] text-stone-400 mb-6 font-bold">Company</h4>
            <ul className="space-y-3 list-none m-0 p-0">
              {['About', 'Blog', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-stone-500 no-underline transition-colors duration-300 hover:text-amber-600 inline-flex items-center gap-2">
                    <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto pt-8 border-t border-stone-200/60 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-stone-400">MIND VAULT © 2026 — SECURE ENCRYPTED LEDGER SYSTEM</p>
          <div className="flex gap-8">
            {['Terms', 'Privacy', 'Guidelines'].map((item) => (
              <a key={item} href="#" className="text-xs text-stone-400 no-underline uppercase tracking-[0.1em] font-semibold transition-colors duration-300 hover:text-[#1c1917]">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&display=swap');

        .landing-font-serif {
          font-family: 'Playfair Display', serif;
        }

        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(50px, -30px) scale(1.1); }
          50% { transform: translate(-30px, 50px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-40px, 20px) scale(1.05); }
          50% { transform: translate(30px, -40px) scale(0.95); }
          75% { transform: translate(-20px, -10px) scale(1.08); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, 30px) scale(1.1); }
          66% { transform: translate(-20px, -20px) scale(0.9); }
        }
        @keyframes orbFloat4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 40px) scale(1.15); }
        }
        @keyframes floatCard1 {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-15px) rotate(0deg); }
        }
        @keyframes floatCard2 {
          0%, 100% { transform: translateY(0) rotate(2deg); }
          50% { transform: translateY(-20px) rotate(0deg); }
        }
        @keyframes floatCard3 {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-orb1 { animation: orbFloat1 20s ease-in-out infinite; }
        .animate-orb2 { animation: orbFloat2 22s ease-in-out infinite; animation-delay: -7s; }
        .animate-orb3 { animation: orbFloat3 18s ease-in-out infinite; animation-delay: -14s; }
        .animate-orb4 { animation: orbFloat4 25s ease-in-out infinite; animation-delay: -5s; }
        .animate-float1 { animation: floatCard1 6s ease-in-out infinite; }
        .animate-float2 { animation: floatCard2 7s ease-in-out infinite; }
        .animate-float3 { animation: floatCard3 5s ease-in-out infinite; }
        .animate-marquee { animation: marquee 40s linear infinite; }
      `}</style>
    </div>
  );
};

export default LandingPage;