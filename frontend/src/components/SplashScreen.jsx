import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Brain, Feather, Lock, Sparkles } from 'lucide-react';

export default function SplashScreen() {
  const containerRef = useRef(null);
  const bookRef = useRef(null);
  const leftPageRef = useRef(null);
  const rightPageRef = useRef(null);
  const inkRefs = useRef([]);
  const textRefs = useRef([]);
  const progressRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tl = gsap.timeline();

    // Phase 1: Ink blots bloom
    tl.to(inkRefs.current, {
      scale: 1,
      opacity: 1,
      duration: 1.2,
      stagger: 0.15,
      ease: 'elastic.out(1, 0.5)'
    });

    // Phase 2: Book materializes from ink
    tl.to(bookRef.current, {
      scale: 1,
      opacity: 1,
      rotateY: 0,
      duration: 1,
      ease: 'power3.out'
    }, '-=0.6');

    // Phase 3: Pages spread open
    tl.to(leftPageRef.current, {
      rotateY: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.4');

    tl.to(rightPageRef.current, {
      rotateY: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out'
    }, '<');

    // Phase 4: Text reveals line by line
    tl.to(textRefs.current, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.12,
      ease: 'power3.out'
    }, '-=0.3');

    // Phase 5: Progress bar fills
    tl.to(progressRef.current, {
      width: '100%',
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: function () {
        setProgress(Math.round(this.progress() * 100));
      }
    }, '-=0.8');

    // Phase 6: Sparkle burst
    tl.to('.splash-sparkle-dot', {
      scale: 1,
      opacity: 1,
      duration: 0.4,
      stagger: 0.05,
      ease: 'back.out(2)'
    }, '-=0.5');

    return () => tl.kill();
  }, []);

  const inkBlots = [
    { size: 300, x: '20%', y: '30%', color: 'rgba(251, 191, 36, 0.15)' },
    { size: 200, x: '70%', y: '20%', color: 'rgba(52, 211, 153, 0.12)' },
    { size: 250, x: '50%', y: '70%', color: 'rgba(251, 191, 36, 0.10)' },
    { size: 180, x: '80%', y: '60%', color: 'rgba(52, 211, 153, 0.10)' },
    { size: 150, x: '15%', y: '65%', color: 'rgba(16, 185, 129, 0.10)' },
  ];

  const sparkles = Array.from({ length: 12 }, (_, i) => ({
    angle: (i * 30) * (Math.PI / 180),
    distance: 120 + (i % 3) * 15,
    size: 4 + (i % 3) * 2,
    color: ['#fbbf24', '#34d399', '#f472b6', '#60a5fa'][i % 4]
  }));

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #faf9f6 0%, #f5f0e8 40%, #fef3c7 70%, #ecfdf5 100%)' }}
    >
      {/* Subtle grain texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Animated Ink Blots */}
      {inkBlots.map((ink, i) => (
        <div
          key={i}
          ref={(el) => (inkRefs.current[i] = el)}
          className="absolute rounded-full"
          style={{
            width: ink.size,
            height: ink.size,
            left: ink.x,
            top: ink.y,
            background: `radial-gradient(circle, ${ink.color}, transparent 70%)`,
            filter: 'blur(40px)',
            transform: 'scale(0)',
            opacity: 0,
            transformOrigin: 'center'
          }}
        />
      ))}

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 rounded-full splash-float-particle"
            style={{
              left: `${(i * 5.3 + 3) % 100}%`,
              top: `${(i * 7.1 + 8) % 100}%`,
              background: ['#fbbf24', '#34d399', '#f472b6', '#60a5fa'][i % 4],
              opacity: 0.3 + (i % 3) * 0.15,
              animationDelay: `${(i % 5) * 1.1}s`,
              animationDuration: `${4 + (i % 4)}s`
            }}
          />
        ))}
      </div>

      {/* Main Book Container */}
      <div
        ref={bookRef}
        className="relative"
        style={{
          perspective: '1200px',
          transform: 'scale(0.5) rotateY(-15deg)',
          opacity: 0
        }}
      >
        {/* Book shadow */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[320px] h-[20px] rounded-full blur-xl"
          style={{ background: 'rgba(0,0,0,0.08)' }} />

        {/* Book spine */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-4 h-full rounded-full z-10"
          style={{ background: 'linear-gradient(90deg, #d97706, #f59e0b, #d97706)' }} />

        {/* Pages container */}
        <div className="flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>

          {/* Left Page */}
          <div
            ref={leftPageRef}
            className="relative w-[280px] h-[380px] rounded-l-2xl border-r border-stone-200/50"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #faf9f6 100%)',
              transform: 'rotateY(90deg)',
              transformOrigin: 'right center',
              opacity: 0,
              boxShadow: '-10px 10px 40px rgba(0,0,0,0.06), inset 2px 0 4px rgba(0,0,0,0.02)'
            }}
          >
            {/* Page texture lines */}
            <div className="absolute inset-4 flex flex-col gap-3 opacity-20">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-2 rounded-full"
                  style={{
                    width: `${60 + (i % 4) * 8}%`,
                    background: 'linear-gradient(90deg, #d6d3d1, transparent)'
                  }}
                />
              ))}
            </div>

            {/* Left page content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                <Feather className="w-8 h-8 text-amber-700" strokeWidth={1.5} />
              </div>
              <div className="w-12 h-0.5 bg-amber-200 rounded-full mb-3" />
              <p className="text-xs text-stone-400 text-center italic leading-relaxed"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                "The unexamined life<br />is not worth living."
              </p>
              <p className="text-[10px] text-stone-300 mt-2">— Socrates</p>
            </div>
          </div>

          {/* Right Page */}
          <div
            ref={rightPageRef}
            className="relative w-[280px] h-[380px] rounded-r-2xl border-l border-stone-200/50"
            style={{
              background: 'linear-gradient(225deg, #ffffff 0%, #faf9f6 100%)',
              transform: 'rotateY(-90deg)',
              transformOrigin: 'left center',
              opacity: 0,
              boxShadow: '10px 10px 40px rgba(0,0,0,0.06), inset -2px 0 4px rgba(0,0,0,0.02)'
            }}
          >
            {/* Page texture lines */}
            <div className="absolute inset-4 flex flex-col gap-3 opacity-20">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-2 rounded-full ml-auto"
                  style={{
                    width: `${60 + (i % 4) * 8}%`,
                    background: 'linear-gradient(270deg, #d6d3d1, transparent)'
                  }}
                />
              ))}
            </div>

            {/* Right page content — Logo & Brand */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              {/* Logo mark */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #d97706, #059669)',
                    boxShadow: '0 8px 32px rgba(5, 150, 105, 0.3)'
                  }}>
                  <Brain className="w-10 h-10 text-white" strokeWidth={1.75} />
                </div>

                {/* Sparkle ring */}
                {sparkles.map((s, i) => (
                  <div
                    key={i}
                    className="splash-sparkle-dot absolute rounded-full"
                    style={{
                      width: s.size,
                      height: s.size,
                      background: s.color,
                      left: `calc(50% + ${Math.cos(s.angle) * s.distance}px)`,
                      top: `calc(50% + ${Math.sin(s.angle) * s.distance}px)`,
                      transform: 'translate(-50%, -50%) scale(0)',
                      opacity: 0,
                      boxShadow: `0 0 ${s.size * 2}px ${s.color}80`
                    }}
                  />
                ))}
              </div>

              {/* Brand text */}
              <div className="text-center overflow-hidden">
                <h1
                  ref={(el) => (textRefs.current[0] = el)}
                  className="text-3xl font-bold tracking-tight"
                  style={{
                    transform: 'translateY(100%)',
                    opacity: 0,
                    fontFamily: "'Playfair Display', serif",
                    background: 'linear-gradient(135deg, #1c1917, #059669)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Mind Vault
                </h1>
              </div>

              <div className="text-center overflow-hidden mt-1">
                <p
                  ref={(el) => (textRefs.current[1] = el)}
                  className="text-sm text-stone-500 tracking-wide"
                  style={{ transform: 'translateY(100%)', opacity: 0 }}
                >
                  Your Mind's Sanctuary
                </p>
              </div>

              <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent my-4" />

              <div className="text-center overflow-hidden">
                <div
                  ref={(el) => (textRefs.current[2] = el)}
                  className="flex items-center gap-2 text-xs text-stone-400"
                  style={{ transform: 'translateY(100%)', opacity: 0 }}
                >
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span>Encrypted &amp; Local</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full mt-6">
                <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    ref={progressRef}
                    className="h-full rounded-full"
                    style={{
                      width: '0%',
                      background: 'linear-gradient(90deg, #d97706, #fbbf24, #34d399)'
                    }}
                  />
                </div>
                <p className="text-center text-[10px] text-stone-400 mt-2 font-medium tracking-wider uppercase">
                  Loading {progress}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 flex items-center gap-2 text-stone-400">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span className="text-xs font-medium tracking-wider uppercase">v2.0</span>
      </div>

      <div className="absolute bottom-8 right-8 text-stone-400">
        <span className="text-xs font-medium tracking-wider uppercase">Secure Encrypted Ledger</span>
      </div>

      {/* Bottom ink wash */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(5, 150, 105, 0.05), transparent)' }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');

        @keyframes splashFloatParticle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-40px) translateX(-5px); opacity: 0.3; }
          75% { transform: translateY(-15px) translateX(15px); opacity: 0.5; }
        }
        .splash-float-particle {
          animation: splashFloatParticle linear infinite;
        }
      `}</style>
    </motion.div>
  );
}
