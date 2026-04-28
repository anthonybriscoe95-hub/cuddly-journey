import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    title: ['Welcome to', 'FitPro'],
    body: 'Personalized workouts, real results.',
    icon: 'welcome',
  },
  {
    title: ['Train at Home'],
    body: 'No gym? No problem. Workouts for every level.',
    icon: 'home',
  },
  {
    title: ['Track Progress'],
    body: 'Stay motivated with insights and goals.',
    icon: 'chart',
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const isLast = step === slides.length - 1;

  const next = () => (isLast ? navigate('/home') : setStep((s) => s + 1));
  const skip = () => navigate('/home');

  const slide = slides[step];

  return (
    <div className="h-[100dvh] flex flex-col bg-bg">
      <div className="status-bar">
        <span>9:41</span>
        <button onClick={skip} className="text-white/70 text-sm font-medium pr-1">
          Skip
        </button>
      </div>

      <div className="px-7 pt-8">
        <h1 className="text-4xl font-extrabold leading-tight">
          {slide.title.map((t, i) => (
            <div key={i} className={i === 1 ? 'text-brand' : 'text-white'}>
              {t}
            </div>
          ))}
        </h1>
        <p className="mt-3 text-white/65 text-base max-w-[280px]">{slide.body}</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <Illustration kind={slide.icon} />
      </div>

      <div className="px-7 pb-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-6 bg-brand' : 'w-2 bg-white/25'
              }`}
            />
          ))}
        </div>
        <button onClick={next} className="btn-primary">
          {isLast ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
}

function Illustration({ kind }: { kind: string }) {
  if (kind === 'chart') {
    return (
      <div className="w-full">
        <div className="card p-6 ring-1 ring-white/5">
          <div className="text-white/80 font-semibold">Progress</div>
          <svg viewBox="0 0 320 160" className="mt-4 w-full">
            <defs>
              <linearGradient id="a" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,120 C40,100 70,90 100,95 C140,100 165,60 200,55 C240,48 270,40 320,15 L320,160 L0,160 Z"
              fill="url(#a)"
            />
            <path
              d="M0,120 C40,100 70,90 100,95 C140,100 165,60 200,55 C240,48 270,40 320,15"
              fill="none"
              stroke="#A78BFA"
              strokeWidth="3"
            />
          </svg>
          <div className="mt-3 text-3xl font-extrabold text-brand-glow">+38%</div>
          <div className="text-white/55 text-sm">This Month</div>
        </div>
      </div>
    );
  }
  return (
    <div
      className="w-64 h-72 rounded-3xl bg-card-purple ring-1 ring-white/5 grid place-items-center"
      aria-hidden
    >
      {kind === 'welcome' ? (
        <PoseWelcome />
      ) : (
        <PoseHome />
      )}
    </div>
  );
}

function PoseWelcome() {
  return (
    <svg viewBox="0 0 200 240" className="w-full h-full p-6">
      <circle cx="100" cy="60" r="28" fill="#A78BFA" />
      <rect x="70" y="92" width="60" height="80" rx="22" fill="#8B5CF6" />
      <rect x="58" y="96" width="20" height="64" rx="10" fill="#A78BFA" />
      <rect x="122" y="96" width="20" height="64" rx="10" fill="#A78BFA" />
      <rect x="78" y="170" width="18" height="50" rx="8" fill="#6D28D9" />
      <rect x="104" y="170" width="18" height="50" rx="8" fill="#6D28D9" />
    </svg>
  );
}
function PoseHome() {
  return (
    <svg viewBox="0 0 240 200" className="w-full h-full p-6">
      <rect x="20" y="150" width="200" height="14" rx="6" fill="#1f1530" />
      <circle cx="60" cy="120" r="18" fill="#A78BFA" />
      <rect x="58" y="135" width="80" height="22" rx="10" fill="#8B5CF6" />
      <rect x="130" y="120" width="60" height="20" rx="8" fill="#6D28D9" />
    </svg>
  );
}
