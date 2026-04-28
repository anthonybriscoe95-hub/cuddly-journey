import { Signal, Wifi, BatteryFull } from 'lucide-react';

export default function StatusBar({ time = '9:41', dark = false }: { time?: string; dark?: boolean }) {
  const cls = dark ? 'text-white/90' : 'text-white/90';
  return (
    <div className={`status-bar ${cls}`}>
      <span>{time}</span>
      <div className="flex items-center gap-1.5">
        <Signal size={14} />
        <Wifi size={14} />
        <BatteryFull size={16} />
      </div>
    </div>
  );
}
