import { ArrowLeft, Heart, Clock, Flame, Dumbbell, GlassWater, BookOpen, type LucideIcon } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import StatusBar from '../components/StatusBar';
import BottomNav from '../components/BottomNav';
import WorkoutThumb from '../components/WorkoutThumb';
import { workouts } from '../data/workouts';

const equipmentIcon: Record<string, LucideIcon> = {
  Mat: BookOpen,
  Dumbbells: Dumbbell,
  'Water Bottle': GlassWater,
};

export default function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const w = workouts.find((x) => x.id === id) ?? workouts[0];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg">
      <div className="relative">
        <div className="aspect-[5/4] w-full">
          <WorkoutThumb variant="wide" category={w.category} className="!rounded-none aspect-auto h-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-bg" />
        <div className="absolute inset-x-0 top-0">
          <StatusBar />
          <div className="px-6 mt-3 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full grid place-items-center bg-black/40 backdrop-blur" aria-label="Back">
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={() => setLiked((l) => !l)}
              className="w-10 h-10 rounded-full grid place-items-center bg-black/40 backdrop-blur"
              aria-label="Favorite"
            >
              <Heart size={18} className={liked ? 'text-rose-500 fill-rose-500' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-2 pb-28">
        <h1 className="text-2xl font-extrabold">{w.name}</h1>
        <div className="mt-2 flex items-center gap-3 text-[12px] text-white/65">
          <Meta icon={<Clock size={12} />} text={`${w.duration} min`} />
          <Meta icon={<Dumbbell size={12} />} text={w.level} />
          <Meta icon={<Flame size={12} className="text-orange-400" />} text={`${w.calories} Cal`} />
        </div>

        <h2 className="mt-6 font-semibold">About Workout</h2>
        <p className="mt-1 text-white/65 text-[13px] leading-relaxed">{w.about}</p>

        <h2 className="mt-6 font-semibold">What You'll Need</h2>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {w.equipment.map((e) => {
            const Icon = equipmentIcon[e] ?? Dumbbell;
            return (
              <div key={e} className="bg-bg-card ring-1 ring-white/5 rounded-2xl py-4 grid place-items-center gap-2">
                <Icon size={22} />
                <div className="text-[12px] text-white/75">{e}</div>
              </div>
            );
          })}
        </div>

        <h2 className="mt-6 font-semibold">Exercises ({w.exercises.length})</h2>
        <ul className="mt-3 space-y-2">
          {w.exercises.map((e, i) => (
            <li key={i} className="flex items-center gap-3 p-3 bg-bg-card ring-1 ring-white/5 rounded-2xl">
              <div className="w-8 h-8 rounded-full bg-brand/20 text-brand-glow grid place-items-center text-sm font-bold">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-[14px]">{e.name}</div>
              </div>
              <div className="text-white/55 text-[12px]">{e.reps}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="sticky bottom-0 px-6 pb-4 pt-3 bg-gradient-to-t from-bg via-bg to-transparent">
        <Link to={`/workouts/${w.id}/play`} className="btn-primary block text-center">
          Start Workout
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}

function Meta({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-bg-card ring-1 ring-white/5">
      {icon}
      {text}
    </span>
  );
}
