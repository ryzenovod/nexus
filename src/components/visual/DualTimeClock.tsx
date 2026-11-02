import React, { useState, useEffect } from 'react';

interface DualTimeClockProps {
  compact?: boolean;
}

export const DualTimeClock: React.FC<DualTimeClockProps> = ({ compact = true }) => {
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

  return (
    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono select-none">
      <span className="text-zinc-500">МСК</span>
      <span className="font-semibold text-zinc-200 tabular-nums">{formattedMsk}</span>
      <span className="text-zinc-700">·</span>
      <span className="text-zinc-500">ДФО</span>
      <span className="font-semibold text-zinc-200 tabular-nums">{formattedDfo}</span>
    </div>
  );
};
