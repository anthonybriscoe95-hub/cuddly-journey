import { Bell, Flame, Droplets, Activity, Heart, Play, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BottomNav from '../components/BottomNav';
import WorkoutThumb from '../components/WorkoutThumb';
import { workouts } from '../data/workouts';

export default function Home() {
  const today = workouts[0];
  const recommended = workouts.slice(3, 6);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg">
      <StatusBar />

      <header className="px-6 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full grid place-items-center bg-bg-soft text-brand-glow font-bold">
            AS
          </div>
          <div>
            <div className="font-semibold text-[17px]">
              Hello, Alex! <span aria-hidden>👋</span>
            </div>
            <div className="text-white/55 text-[12px]">Ready to crush your goals today?</div>
          </div>
        </div>
        <button className="relative w-10 h-10 rounded-full grid place-items-center bg-bg-soft" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
        </button>
      </header>

      <section className="px-6 mt-5">
        <div className="rounded-2xl bg-card-purple ring-1 ring-white/5 p-5 flex items-center gap-4 overflow-hidden relative">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-white/80 text-[12px]">
              <Flame size={14} className="text-orange-400" />
              Let's Keep the Streak Going!
            </div>
            <div className="mt-1 text-3xl font-extrabold">7 Day Streak</div>
            <div className="text-white/65 text-[12px] mt-1">You're doing amazing!</div>
          </div>
          <div className="w-24 h-24 rounded-2xl bg-bg-soft/40 grid place-items-center">
            <Flame size={42} className="text-orange-400" />
          </div>
        </div>
      </section>

      <section className="px-6 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Today Overview</h2>
          <Link to="/progress" className="text-brand-glow text-[12px] flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-3">
          <Stat icon={<Flame size={16} />} value="320" label="Calories" tint="text-orange-400" />
          <Stat icon={<Droplets size={16} />} value="35" label="Minutes" tint="text-sky-400" />
          <Stat icon={<Activity size={16} />} value="6/10" label="Workouts" tint="text-emerald-400" />
          <Stat icon={<Heart size={16} />} value="128" label="Avg. Heart" tint="text-rose-400" />
        </div>
      </section>

      <section className="px-6 mt-6">
        <div className="text-white/65 text-[12px] mb-2">Today's Workout</div>
        <Link
          to={`/workouts/${today.id}`}
          className="block rounded-2xl bg-bg-card ring-1 ring-white/5 p-4 relative overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-lg font-bold">{today.name}</div>
              <div className="mt-1 flex items-center gap-3 text-[12px] text-white/65">
                <Pill>{today.duration} min</Pill>
                <Pill>{today.level}</Pill>
                <Pill>{today.calories} Cal</Pill>
              </div>
            </div>
            <Link
              to={`/workouts/${today.id}/play`}
              onClick={(e) => e.stopPropagation()}
              className="w-12 h-12 rounded-full bg-brand grid place-items-center shadow-glow"
            >
              <Play size={18} className="ml-0.5" />
            </Link>
          </div>
          <Link
            to={`/workouts/${today.id}/play`}
            className="mt-4 block text-center w-full py-3 rounded-xl bg-brand text-white font-semibold"
          >
            Start Workout
          </Link>
        </Link>
      </section>

      <section className="px-6 mt-6 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recommended for You</h2>
          <Link to="/workouts" className="text-brand-glow text-[12px] flex items-center gap-1">
            See All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {recommended.map((w) => (
            <Link key={w.id} to={`/workouts/${w.id}`} className="block">
              <WorkoutThumb variant="square" category={w.category} />
              <div className="mt-2 text-[13px] font-semibold leading-tight">{w.name}</div>
              <div className="text-white/55 text-[11px]">
                {w.duration} min · {w.level}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-0.5 rounded-full bg-white/5">{children}</span>;
}

function Stat({
  icon,
  value,
  label,
  tint,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  tint: string;
}) {
  return (
    <div className="bg-bg-card ring-1 ring-white/5 rounded-2xl py-3 px-2 text-center">
      <div className={`mx-auto ${tint}`}>{icon}</div>
      <div className="mt-1 font-bold text-[15px]">{value}</div>
      <div className="text-white/55 text-[10px]">{label}</div>
    </div>
  );
}
