import GlassCard from '../components/GlassCard';
import BackgroundGradient from '../components/BackgroundGradient';
import { Eye, ShieldCheck, Database, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DataAuditPage() {
  const navigate = useNavigate();

  const details = [
    {
      icon: Eye,
      title: "Verifiable Operations",
      desc: "Every database write and state modification is tracked with immutable transactional indexes."
    },
    {
      icon: ShieldCheck,
      title: "Cryptographic Auditing",
      desc: "Ensure data records are intact and have not been altered in transit or modified by external databases."
    },
    {
      icon: Database,
      title: "Self-Hosted Databases",
      desc: "We prioritize standalone data infrastructure so you always retain full custody of database backups."
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
                <Eye size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Data Audit Log</h1>
                <p className="text-xs text-[#9ca3af] font-semibold mt-1">Review internal transaction verification processes and database integrity standards.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {details.map((d, i) => {
              const Icon = d.icon;
              return (
                <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-3">
                  <div className="text-[#a78bfa]">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-white text-sm">{d.title}</h3>
                  <p className="text-xs text-[#9ca3af] leading-relaxed font-semibold">{d.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 bg-white/5 border border-white/5 p-6 rounded-3xl">
            <h2 className="font-bold text-white text-base">Local Integrity Assertions</h2>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2.5 text-xs font-semibold text-[#9ca3af]">
                <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Deterministic hash check algorithms validating collection consistency.</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs font-semibold text-[#9ca3af]">
                <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Real-time indexing that immediately identifies corrupt or unparseable JSON nodes.</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs font-semibold text-[#9ca3af]">
                <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Audit reports displaying timestamps of analyzed sentiment parameters.</span>
              </li>
            </ul>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}
