import React, { useState, useEffect } from 'react';

export interface DualTimeClockProps {
  vertical?: boolean;
  compact?: boolean;
}

export const DualTimeClock: React.FC<DualTimeClockProps> = ({ vertical = true, compact = false }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Moscow time (MSK, UTC+3)
  const mskHours = time.getHours();
  const mskMinutes = time.getMinutes();
  const formattedMsk = `${String(mskHours).padStart(2, '0')}:${String(mskMinutes).padStart(2, '0')}`;

  // Vladivostok / DFO time (MSK + 7 hours)
  const normalizedDfoHours = (mskHours + 7) % 24;
  const formattedDfo = `${String(normalizedDfoHours).padStart(2, '0')}:${String(mskMinutes).padStart(2, '0')}`;

  if (vertical && !compact) {
    return (
      <div className="space-y-0.5 text-[11px] font-mono select-none">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-zinc-500 font-sans">Москва</span>
          <span className="text-zinc-300 font-semibold tabular-nums">{formattedMsk}</span>
        </div>
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-zinc-500 font-sans">Владивосток</span>
          <span className="text-zinc-400 tabular-nums">{formattedDfo}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono select-none">
      <span className="text-zinc-500">Москва</span>
      <span className="font-semibold text-zinc-200 tabular-nums">{formattedMsk}</span>
      <span className="text-zinc-700">·</span>
      <span className="text-zinc-500">Владивосток</span>
      <span className="font-semibold text-zinc-300 tabular-nums">{formattedDfo}</span>
    </div>
  );
};
