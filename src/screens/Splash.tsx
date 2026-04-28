import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(100, p + 4));
    }, 60);
    const timeout = setTimeout(() => navigate('/onboarding'), 2000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div
      className="relative h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #1a0b3a 0%, #2a0f5e 35%, #0f0820 100%)',
      }}
    >
      <div
        className="absolute inset-0 opacity-30 mix-blend-screen"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 30%, rgba(167, 139, 250, 0.55), transparent 55%), radial-gradient(circle at 70% 70%, rgba(109, 40, 217, 0.45), transparent 55%)',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="relative z-10 text-center px-8">
        <h1 className="text-6xl font-extrabold tracking-tight text-white drop-shadow">
          FitPro
        </h1>
        <p className="mt-3 text-white/75 text-sm">Your Fitness. Your Way.</p>
      </div>

      <div className="absolute bottom-12 left-10 right-10 z-10">
        <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-glow to-brand"
            style={{ width: `${progress}%`, transition: 'width 60ms linear' }}
          />
        </div>
      </div>
    </div>
  );
}
