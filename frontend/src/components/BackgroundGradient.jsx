export default function BackgroundGradient() {
  return (
    <div className="fixed inset-0 -z-50 w-full h-full overflow-hidden bg-[#0a0a0f]">
      {/* Dynamic drifting background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#7c6aff]/10 blur-[130px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-[#a78bfa]/8 blur-[160px] animate-pulse" style={{ animationDuration: '8s' }}></div>
    </div>
  );
}
