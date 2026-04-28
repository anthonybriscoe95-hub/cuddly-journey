import { ChevronDown, ChevronRight } from 'lucide-react';
import StatusBar from '../components/StatusBar';
import BottomNav from '../components/BottomNav';

const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const values = [40, 65, 50, 70, 30, 90, 60];

export default function ProgressScreen() {
  const max = Math.max(...values);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg">
      <StatusBar />
      <header className="px-6 pt-4 flex items-center justify-between">
        <h1 className="font-bold text-lg">Progress</h1>
        <button className="flex items-center gap-1 text-sm text-white/75 px-3 py-1.5 rounded-full bg-bg-soft">
          This Week <ChevronDown size={14} />
        </button>
      </header>

      <section className="px-6 mt-5 grid grid-cols-3 gap-3">
        <Stat title="Workouts" value="6/10" />
        <Stat title="Calories" value="2,350" />
        <Stat title="Minutes" value="210" />
      </section>

      <section className="px-6 mt-3">
        <div className="bg-bg-card ring-1 ring-white/5 rounded-2xl p-4">
          <div className="text-white/55 text-[12px]">Avg. HR</div>
          <div className="font-bold text-2xl">128</div>
        </div>
      </section>

      <section className="px-6 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Workout Progress</h2>
          <button className="text-brand-glow text-[12px] flex items-center gap-1">
            See All <ChevronRight size={14} />
          </button>
        </div>

        <div className="mt-4 bg-bg-card ring-1 ring-white/5 rounded-2xl p-5">
          <div className="flex items-end gap-4 h-44">
            {values.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-brand-deep to-brand-glow"
                  style={{ height: `${(v / max) * 100}%`, minHeight: 8 }}
                />
                <div className="text-[11px] text-white/55">{days[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 mt-6 mb-4">
        <h2 className="font-semibold">Body Stats</h2>
        <div className="mt-3 bg-bg-card ring-1 ring-white/5 rounded-2xl p-5">
          <div className="text-white/55 text-[12px]">Weight</div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-2xl">72.5</span>
            <span className="text-white/65 text-sm">kg</span>
          </div>
          <div className="text-emerald-400 text-[12px] mt-1">▼ 1.2 kg</div>

          <svg viewBox="0 0 320 90" className="mt-4 w-full">
            <defs>
              <linearGradient id="weight" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,55 C40,60 70,40 110,45 C150,50 180,30 220,20 C260,10 290,30 320,18 L320,90 L0,90 Z"
              fill="url(#weight)"
            />
            <path
              d="M0,55 C40,60 70,40 110,45 C150,50 180,30 220,20 C260,10 290,30 320,18"
              fill="none"
              stroke="#A78BFA"
              strokeWidth="2.5"
            />
          </svg>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-bg-card ring-1 ring-white/5 rounded-2xl p-4">
      <div className="text-white/55 text-[12px]">{title}</div>
      <div className="font-bold text-xl mt-1">{value}</div>
    </div>
  );
}
