import React, { useState, useEffect } from 'react';
import { Clock, Globe, Moon, Sun } from 'lucide-react';

export const DualTimeClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Moscow time (MSK, UTC+3)
  const mskHours = time.getHours();
  const mskMinutes = time.getMinutes();
  const mskSeconds = time.getSeconds();
  const formattedMsk = `${String(mskHours).padStart(2, '0')}:${String(mskMinutes).padStart(2, '0')}`;

  // Vladivostok / DFO time (MSK + 7 hours)
  const dfoDate = new Date(time.getTime() + 7 * 60 * 60 * 1000);
  const dfoHours = dfoDate.getUTCHours() + 3 + 7; // or simply local MSK + 7
  const normalizedDfoHours = (mskHours + 7) % 24;
  const formattedDfo = `${String(normalizedDfoHours).padStart(2, '0')}:${String(mskMinutes).padStart(2, '0')}`;

  // DFO Status for Anya's calls
  const getDfoStatus = (h: number) => {
    if (h >= 9 && h < 18) return { label: 'Рабочие часы ДФО (удобно звонить)', color: '#22c55e' };
    if (h >= 18 && h < 22) return { label: 'Вечер в ДФО (только срочные)', color: '#eab308' };
    return { label: 'Ночь в ДФО (спит Дальний Восток)', color: '#818cf8' };
  };

  const dfoStatus = getDfoStatus(normalizedDfoHours);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-md">
      {/* MSK Clock */}
      <div className="flex items-center gap-1.5">
        <Sun className="h-3.5 w-3.5 text-amber-400" />
        <div className="text-left">
          <div className="font-mono text-xs font-bold text-white">
            {formattedMsk}
          </div>
          <div className="text-[9px] uppercase font-mono tracking-wider text-amber-300/80">
            Москва (МСК)
          </div>
        </div>
      </div>

      <div className="h-4 w-[1px] bg-white/10" />

      {/* DFO Clock for Anya */}
      <div className="flex items-center gap-1.5" title={`ДФО (Владивосток/Хабаровск): ${dfoStatus.label}`}>
        <Globe className="h-3.5 w-3.5 text-purple-400" />
        <div className="text-left">
          <div className="flex items-center gap-1 font-mono text-xs font-bold text-purple-300">
            <span>{formattedDfo}</span>
            <span className="text-[9px] text-zinc-400">(+7ч)</span>
          </div>
          <div className="text-[9px] font-mono tracking-wider text-purple-300/80 flex items-center gap-1">
            <span>ДФО Лидер</span>
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: dfoStatus.color }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
