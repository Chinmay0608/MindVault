import GlassCard from '../components/GlassCard';
import BackgroundGradient from '../components/BackgroundGradient';
import { Lock, Cpu, ServerCrash, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ZeroKnowledgePage() {
  const navigate = useNavigate();

  const concepts = [
    {
      icon: Lock,
      title: "Client-Side Decryption",
      desc: "All decryption happens inside your local browser memory space. Plaintext content is never sent to the network."
    },
    {
      icon: Cpu,
      title: "Derivation Keys",
      desc: "Vault keys are dynamically derived locally via PBKDF2 algorithms using secure password salts."
    },
    {
      icon: ServerCrash,
      title: "No Plaintext Storage",
      desc: "Our servers only receive, store, and process structural headers and ciphertexts. We hold zero decryption keys."
    }
  ];

  return (
    <div className="min-h-screen pb-12 relative text-[#f1f0ff]">
      <BackgroundGradient />
      
      <main className="max-w-4xl mx-auto flex flex-col gap-6 pt-6">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#9ca3af] hover:text-[#7c6aff] uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Workspace
          </button>
        </div>

        <GlassCard className="p-8 md:p-10 border-white/10 flex flex-col gap-8">
          <div className="border-b border-white/5 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#7c6aff]/10 border border-[#7c6aff]/20 flex items-center justify-center text-[#a78bfa]">
                <Lock size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Zero-Knowledge Architecture</h1>
                <p className="text-xs text-[#9ca3af] font-semibold mt-1">Proof that we cannot read your thoughts, even if we wanted to.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {concepts.map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-3">
                  <div className="text-[#a78bfa]">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-white text-sm">{c.title}</h3>
                  <p className="text-xs text-[#9ca3af] leading-relaxed font-semibold">{c.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 bg-white/5 border border-white/5 p-6 rounded-3xl">
            <h2 className="font-bold text-white text-base">Key Management Safeguards</h2>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2.5 text-xs font-semibold text-[#9ca3af]">
                <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero backend persistence for master passwords or local master salts.</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs font-semibold text-[#9ca3af]">
                <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Authentication tokens are separate and decoupled from cryptographic vault keys.</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs font-semibold text-[#9ca3af]">
                <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Recovery is client-managed; losing decryption passwords means absolute vault lockout.</span>
              </li>
            </ul>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}
