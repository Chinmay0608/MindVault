export default function GlassCard({ children, className = '', ...props }) {
  return (
    <div
      className={`card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
