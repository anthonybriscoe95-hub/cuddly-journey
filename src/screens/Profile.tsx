import { Camera, ChevronRight, Pencil, Target, Bell, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BottomNav from '../components/BottomNav';

export default function Profile() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg">
      <StatusBar />
      <header className="px-6 pt-4 flex items-center justify-center">
        <h1 className="font-bold text-lg">Profile</h1>
      </header>

      <section className="px-6 mt-5 flex flex-col items-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand to-brand-deep grid place-items-center text-3xl font-extrabold ring-4 ring-bg-card">
            AJ
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-brand grid place-items-center" aria-label="Change avatar">
            <Camera size={14} />
          </button>
        </div>
        <div className="mt-3 font-bold text-lg">Alex Johnson</div>
        <div className="text-white/55 text-sm">alex@email.com</div>
      </section>

      <section className="px-6 mt-5 grid grid-cols-2 gap-3">
        <Stat label="Day Streak" value="7" />
        <Stat label="Workouts" value="23" />
      </section>

      <section className="px-6 mt-6 mb-4">
        <ul className="bg-bg-card ring-1 ring-white/5 rounded-2xl divide-y divide-white/5 overflow-hidden">
          <Row icon={<Pencil size={18} />} label="Edit Profile" />
          <Row icon={<Target size={18} />} label="Goals" />
          <Row icon={<Bell size={18} />} label="Reminders" trailing={<span className="text-brand-glow text-[12px]">On</span>} />
          <Row icon={<Settings size={18} />} label="Settings" />
          <Row icon={<HelpCircle size={18} />} label="Help & Support" />
          <Row
            icon={<LogOut size={18} className="text-rose-400" />}
            label="Sign Out"
            labelClass="text-rose-400"
            onClick={() => navigate('/')}
          />
        </ul>
      </section>

      <BottomNav />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-card ring-1 ring-white/5 rounded-2xl p-4 text-center">
      <div className="font-extrabold text-2xl">{value}</div>
      <div className="text-white/55 text-[12px]">{label}</div>
    </div>
  );
}

function Row({
  icon,
  label,
  trailing,
  labelClass = '',
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  trailing?: React.ReactNode;
  labelClass?: string;
  onClick?: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-4 hover:bg-white/[0.02] active:bg-white/[0.04]"
      >
        <span className="w-9 h-9 rounded-xl bg-bg-soft grid place-items-center">{icon}</span>
        <span className={`flex-1 text-left font-medium ${labelClass}`}>{label}</span>
        {trailing ?? <ChevronRight size={16} className="text-white/40" />}
      </button>
    </li>
  );
}
