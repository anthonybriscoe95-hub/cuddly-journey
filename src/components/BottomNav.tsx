import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, Sparkles, BarChart3, User } from 'lucide-react';

const items = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/coach', label: 'AI Coach', icon: Sparkles },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  return (
    <nav className="sticky bottom-0 mt-auto pb-[env(safe-area-inset-bottom)] bg-bg/90 backdrop-blur border-t border-white/5">
      <ul className="grid grid-cols-5 px-2 py-2">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition ${
                  isActive ? 'text-brand-glow' : 'text-white/55 hover:text-white/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid place-items-center w-10 h-7 rounded-full transition ${
                      isActive ? 'bg-brand/20' : ''
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="text-[10px] font-medium tracking-wide">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
