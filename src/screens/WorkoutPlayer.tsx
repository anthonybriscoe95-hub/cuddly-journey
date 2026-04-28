import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, MoreHorizontal, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import WorkoutThumb from '../components/WorkoutThumb';
import { workouts } from '../data/workouts';

export default function WorkoutPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const w = workouts.find((x) => x.id === id) ?? workouts[0];
  const [index, setIndex] = useState(0);
  const exercise = w.exercises[index];
  const next = w.exercises[index + 1];

  const [running, setRunning] = useState(true);
  const [remaining, setRemaining] = useState(exercise.seconds);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setRemaining(exercise.seconds);
  }, [index, exercise.seconds]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (index < w.exercises.length - 1) {
            setIndex((i) => i + 1);
            return w.exercises[index + 1].seconds;
          }
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running, index, w.exercises]);

  const progress = useMemo(
    () => ((exercise.seconds - remaining) / exercise.seconds) * 100,
    [remaining, exercise.seconds],
  );

  const skipPrev = () => setIndex((i) => Math.max(0, i - 1));
  const skipNext = () =>
    setIndex((i) => {
      const n = Math.min(w.exercises.length - 1, i + 1);
      return n;
    });

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg">
      <StatusBar />
      <header className="px-6 pt-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full grid place-items-center bg-bg-soft" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div className="text-center">
          <div className="text-[12px] text-white/55">Now Playing</div>
          <div className="font-semibold text-sm">{w.name}</div>
        </div>
        <button className="w-10 h-10 rounded-full grid place-items-center bg-bg-soft" aria-label="More">
          <MoreHorizontal size={18} />
        </button>
      </header>

      <div className="px-6 mt-6 text-center">
        <div className="text-3xl font-extrabold">{exercise.name}</div>
        <div className="mt-1 text-white/60 text-sm">{exercise.reps}</div>
      </div>

      <div className="px-6 mt-6">
        <WorkoutThumb variant="square" category={w.category} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center mt-6">
        <div className="relative w-44 h-44">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
            <circle
              cx="50"
              cy="50"
              r="46"
              stroke="#A78BFA"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={2 * Math.PI * 46}
              strokeDashoffset={2 * Math.PI * 46 * (1 - progress / 100)}
              style={{ transition: 'stroke-dashoffset 0.95s linear' }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-5xl font-extrabold">{remaining}</div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-8">
          <button onClick={skipPrev} className="w-12 h-12 rounded-full bg-bg-soft grid place-items-center" aria-label="Previous">
            <SkipBack size={20} />
          </button>
          <button
            onClick={() => setRunning((r) => !r)}
            className="w-16 h-16 rounded-full bg-brand grid place-items-center shadow-glow"
            aria-label={running ? 'Pause' : 'Play'}
          >
            {running ? <Pause size={26} /> : <Play size={26} className="ml-0.5" />}
          </button>
          <button onClick={skipNext} className="w-12 h-12 rounded-full bg-bg-soft grid place-items-center" aria-label="Next">
            <SkipForward size={20} />
          </button>
        </div>
      </div>

      <div className="px-6 pt-4 pb-6">
        <div className="flex items-center gap-3 p-3 bg-bg-card ring-1 ring-white/5 rounded-2xl">
          <div className="w-12 h-12">
            <WorkoutThumb variant="square" category={w.category} />
          </div>
          <div>
            <div className="text-[11px] text-white/55">Next Up</div>
            <div className="font-semibold text-sm">{next ? next.name : 'Workout Complete!'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
