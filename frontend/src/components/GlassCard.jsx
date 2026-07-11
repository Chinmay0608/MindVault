export default function GlassCard({ children, className = '', onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}
