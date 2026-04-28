import { useState } from 'react';
import { ArrowLeft, Search, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BottomNav from '../components/BottomNav';
import WorkoutThumb from '../components/WorkoutThumb';
import { categories, filters, workouts } from '../data/workouts';

export default function Workouts() {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filtered = workouts.filter((w) => {
    const matchFilter =
      filter === 'All' ||
      w.category.toLowerCase().includes(filter.toLowerCase()) ||
      (filter === 'Strength' && ['Full Body', 'Lower Body', 'Upper Body', 'Abs & Core'].includes(w.category)) ||
      (filter === 'Cardio' && w.category === 'HIIT');
    const matchQuery = w.name.toLowerCase().includes(query.toLowerCase());
    return matchFilter && matchQuery;
  });

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg">
      <StatusBar />

      <header className="px-6 pt-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full grid place-items-center bg-bg-soft" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-bold text-lg">Workouts</h1>
        <button className="w-10 h-10 rounded-full grid place-items-center bg-bg-soft" aria-label="Filter">
          <SlidersHorizontal size={18} />
        </button>
      </header>

      <div className="px-6 mt-4">
        <div className="flex items-center gap-2 bg-bg-card ring-1 ring-white/5 rounded-2xl px-4 py-3">
          <Search size={16} className="text-white/55" />
          <input
            placeholder="Search workouts"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder-white/40"
          />
        </div>
      </div>

      <div className="mt-4 px-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`chip whitespace-nowrap transition ${
                filter === f ? 'bg-brand text-white' : 'bg-bg-card text-white/70'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <section className="px-6 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Categories</h2>
          <button className="text-brand-glow text-[12px] flex items-center gap-1">
            See All <ChevronRight size={14} />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {categories.map((c) => (
            <div key={c.id} className="bg-bg-card ring-1 ring-white/5 rounded-2xl p-3">
              <WorkoutThumb variant="square" category={c.label} />
              <div className="mt-2 text-[12px] font-semibold text-center">{c.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 mt-6 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Popular Workouts</h2>
          <button className="text-brand-glow text-[12px] flex items-center gap-1">
            See All <ChevronRight size={14} />
          </button>
        </div>
        <ul className="mt-3 space-y-3">
          {filtered.map((w) => (
            <li key={w.id}>
              <Link
                to={`/workouts/${w.id}`}
                className="flex items-center gap-3 p-3 bg-bg-card ring-1 ring-white/5 rounded-2xl"
              >
                <div className="w-16 h-16 shrink-0">
                  <WorkoutThumb variant="square" category={w.category} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{w.name}</div>
                  <div className="text-[12px] text-white/55 mt-0.5">
                    {w.duration} min · {w.level}
                  </div>
                </div>
                <ChevronRight size={18} className="text-white/40" />
              </Link>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="text-center text-white/50 py-10">No workouts match your search.</li>
          )}
        </ul>
      </section>

      <BottomNav />
    </div>
  );
}
