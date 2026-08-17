import { createContext, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          cardBg: 'bg-[#10b981]/10 border-[#10b981]/30 text-[var(--text-primary)]',
          icon: <CheckCircle2 className="text-[#10b981] shrink-0 mt-0.5" size={18} />,
          badge: 'bg-[#10b981]/20 text-[#10b981]'
        };
      case 'error':
        return {
          cardBg: 'bg-[#f43f5e]/10 border-[#f43f5e]/30 text-[var(--text-primary)]',
          icon: <AlertCircle className="text-[#f43f5e] shrink-0 mt-0.5" size={18} />,
          badge: 'bg-[#f43f5e]/20 text-[#f43f5e]'
        };
      case 'warning':
        return {
          cardBg: 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[var(--text-primary)]',
          icon: <AlertTriangle className="text-[#f59e0b] shrink-0 mt-0.5" size={18} />,
          badge: 'bg-[#f59e0b]/20 text-[#f59e0b]'
        };
      default:
        return {
          cardBg: 'bg-[#6366f1]/10 border-[#6366f1]/30 text-[var(--text-primary)]',
          icon: <Info className="text-[#818cf8] shrink-0 mt-0.5" size={18} />,
          badge: 'bg-[#6366f1]/20 text-[#818cf8]'
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 md:px-0">
        <AnimatePresence>
          {toasts.map((toast) => {
            const styles = getToastStyles(toast.type);
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 24, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -12 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.35)] ${styles.cardBg}`}
              >
                {styles.icon}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold leading-relaxed break-words">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-lg hover:bg-white/10 cursor-pointer shrink-0"
                  aria-label="Dismiss toast"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
