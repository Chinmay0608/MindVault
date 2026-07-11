import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import BackgroundGradient from './BackgroundGradient';

export default function SplashScreen() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { 
      opacity: 0, 
      scale: shouldReduceMotion ? 1 : 0.96 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    },
    exit: { 
      opacity: 0, 
      scale: shouldReduceMotion ? 1 : 1.04,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 select-none"
    >
      <BackgroundGradient />

      {/* Main Glass Orb & App Logo */}
      <div className="relative flex flex-col items-center">
        {/* Pulsing Outer Glow Orb */}
        <motion.div 
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-28 h-28 rounded-full bg-teal-400/25 blur-xl -z-10"
        />

        {/* Centered Glass Card Icon Container */}
        <div className="w-24 h-24 rounded-3xl backdrop-blur-xl bg-white/45 border border-white/60 shadow-xl shadow-slate-200/30 flex items-center justify-center text-teal-600 mb-6">
          <BookOpen size={40} strokeWidth={1.5} />
        </div>

        {/* Brand Name & Calm Microcopy */}
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-3xl font-extrabold text-teal-800 tracking-tight font-sans">MindVault</h2>
          <p className="text-sm font-semibold text-teal-700/80 tracking-wide max-w-xs leading-relaxed">
            Take a breath. Your thoughts are waiting.
          </p>
        </div>

        {/* Thin Soft-Colored Loading Line */}
        <div className="w-16 h-0.5 bg-teal-100 rounded-full mt-8 overflow-hidden relative">
          <motion.div 
            animate={shouldReduceMotion ? { opacity: [0.4, 1, 0.4] } : {
              left: ['-100%', '100%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 bottom-0 w-1/2 bg-teal-500 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
