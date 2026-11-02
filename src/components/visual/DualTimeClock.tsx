import React, { useState, useEffect } from 'react';

export interface DualTimeClockProps {
  vertical?: boolean;
  compact?: boolean;
}

export const DualTimeClock: React.FC<DualTimeClockProps> = () => {
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

  const isMskDay = mskHours >= 7 && mskHours < 22;
  const isDfoDay = normalizedDfoHours >= 7 && normalizedDfoHours < 22;

  return (
    <div className="space-y-1 text-[11.5px] font-mono select-none">
      <div className="flex items-center justify-between">
        <span className="text-[#8a8f98] font-sans flex items-center gap-1.5 text-[11px]">
          <span>{isMskDay ? '☀️' : '🌙'}</span>
          <span>Москва</span>
        </span>
        <span className="text-[#ededef] font-semibold tabular-nums tracking-tight">
          {formattedMsk}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[#5e636e] font-sans flex items-center gap-1.5 text-[11px]">
          <span>{isDfoDay ? '☀️' : '🌙'}</span>
          <span>Владивосток <span className="text-[9.5px] text-[#5e636e] font-mono">+7ч</span></span>
        </span>
        <span className="text-[#8a8f98] tabular-nums tracking-tight">
          {formattedDfo}
        </span>
      </div>
    </div>
  );
};
