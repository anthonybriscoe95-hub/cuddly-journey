type Props = {
  variant?: 'square' | 'wide' | 'tile';
  className?: string;
  category?: string;
};

const palettes: Record<string, [string, string]> = {
  default: ['#5B21B6', '#A78BFA'],
  'Full Body': ['#5B21B6', '#A78BFA'],
  'Upper Body': ['#312E81', '#818CF8'],
  'Lower Body': ['#7C2D12', '#FB923C'],
  'Abs & Core': ['#0F766E', '#34D399'],
  Yoga: ['#9D174D', '#F472B6'],
  HIIT: ['#7F1D1D', '#F87171'],
  Stretching: ['#1E3A8A', '#60A5FA'],
};

export default function WorkoutThumb({
  variant = 'tile',
  className = '',
  category = 'default',
}: Props) {
  const [from, to] = palettes[category] || palettes.default;
  const ratio =
    variant === 'wide' ? 'aspect-[16/9]' : variant === 'square' ? 'aspect-square' : 'aspect-[4/3]';

  return (
    <div
      className={`relative ${ratio} w-full overflow-hidden rounded-2xl ${className}`}
      style={{
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.5), transparent 40%), radial-gradient(circle at 20% 80%, rgba(0,0,0,0.4), transparent 40%)',
        }}
      />
      <svg
        viewBox="0 0 200 160"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <circle cx="135" cy="55" r="14" fill="rgba(255,255,255,0.85)" />
        <rect x="118" y="68" width="34" height="44" rx="14" fill="rgba(255,255,255,0.92)" />
        <rect x="105" y="72" width="14" height="38" rx="6" fill="rgba(255,255,255,0.75)" />
        <rect x="151" y="72" width="14" height="38" rx="6" fill="rgba(255,255,255,0.75)" />
        <rect x="123" y="110" width="12" height="34" rx="5" fill="rgba(255,255,255,0.78)" />
        <rect x="139" y="110" width="12" height="34" rx="5" fill="rgba(255,255,255,0.78)" />
      </svg>
    </div>
  );
}
