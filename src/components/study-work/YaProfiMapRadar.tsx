import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Radio, 
  Clock, 
  Copy, 
  Check, 
  MapPin, 
  Users, 
  Calendar, 
  Sparkles, 
  Send, 
  Globe2, 
  ShieldAlert
} from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface RegionHub {
  id: string;
  name: string;
  shortName: string;
  role: string;
  utcOffset: number; // UTC+X
  mskOffset: number; // MSK+X
  mapX: number; // percentage on SVG
  mapY: number; // percentage on SVG
  color: string;
}

const REGION_HUBS: RegionHub[] = [
  {
    id: 'moscow',
    name: 'Москва (Центральный ФО)',
    shortName: 'Москва (ЦФО)',
    role: 'Командный центр Ани (Региональный Лидер ЦФО)',
    utcOffset: 3,
    mskOffset: 0,
    mapX: 180,
    mapY: 260,
    color: '#ec4899',
  },
  {
    id: 'yakutsk',
    name: 'Якутск (Республика Саха)',
    shortName: 'Якутск',
    role: 'Опорный вуз СВФУ им. Аммосова',
    utcOffset: 9,
    mskOffset: 6,
    mapX: 620,
    mapY: 200,
    color: '#38bdf8',
  },
  {
    id: 'vladivostok',
    name: 'Владивосток (Приморский край)',
    shortName: 'Владивосток',
    role: 'ДВФУ (Федеральный Округ ДФО)',
    utcOffset: 10,
    mskOffset: 7,
    mapX: 740,
    mapY: 340,
    color: '#a855f7',
  },
  {
    id: 'khabarovsk',
    name: 'Хабаровск (Хабаровский край)',
    shortName: 'Хабаровск',
    role: 'ТОГУ / ДВГУПС',
    utcOffset: 10,
    mskOffset: 7,
    mapX: 730,
    mapY: 270,
    color: '#22c55e',
  },
  {
    id: 'sakhalin',
    name: 'Южно-Сахалинск (Сахалинская обл.)',
    shortName: 'Сахалин',
    role: 'СахГУ',
    utcOffset: 11,
    mskOffset: 8,
    mapX: 810,
    mapY: 260,
    color: '#f59e0b',
  },
  {
    id: 'kamchatka',
    name: 'Петропавловск-Камчатский',
    shortName: 'Камчатка',
    role: 'КамГУ им. Беринга',
    utcOffset: 12,
    mskOffset: 9,
    mapX: 870,
    mapY: 170,
    color: '#f43f5e',
  },
];

export const YaProfiMapRadar: React.FC = () => {
  const [selectedMskHour, setSelectedMskHour] = useState<number>(10); // default 10:00 MSK
  const [copiedAnnouncement, setCopiedAnnouncement] = useState(false);
  const [webinarTopic, setWebinarTopic] = useState('Организационный созвон кураторов вузов «Я-Профессионал»');
  const [webinarDate, setWebinarDate] = useState('Вторник, 5 ноября');

  // Humane time status calculator
  const getHumaneStatus = (mskHour: number, mskOffset: number) => {
    const localHour = (mskHour + mskOffset) % 24;

    if (localHour >= 9 && localHour < 18) {
      return {
        label: 'Гуманно звонить ✨',
        color: '#22c55e',
        bgColor: 'rgba(34, 197, 94, 0.15)',
        borderColor: 'rgba(34, 197, 94, 0.35)',
        badge: 'РАБОЧЕЕ ВРЕМЯ',
        localHour,
      };
    } else if (localHour >= 18 && localHour < 21) {
      return {
        label: 'Вечерний созвон ☕️',
        color: '#eab308',
        bgColor: 'rgba(234, 179, 8, 0.15)',
        borderColor: 'rgba(234, 179, 8, 0.35)',
        badge: 'ВЕЧЕР (КРАЙ)',
        localHour,
      };
    } else {
      return {
        label: 'Ночь, регион спит 😴',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.15)',
        borderColor: 'rgba(239, 68, 68, 0.35)',
        badge: 'НЕ БЕСПОКОИТЬ',
        localHour,
      };
    }
  };

  const padHour = (h: number) => `${String(h).padStart(2, '0')}:00`;

  const generateAnnouncementText = () => {
    const mskFormatted = padHour(selectedMskHour);
    const yakutsk = padHour((selectedMskHour + 6) % 24);
    const vladivostok = padHour((selectedMskHour + 7) % 24);
    const sakhalin = padHour((selectedMskHour + 8) % 24);
    const kamchatka = padHour((selectedMskHour + 9) % 24);

    return `📢 *Всероссийская олимпиада «Я-Профессионал»*\n` +
      `Координация ЦФО ⇄ ДФО\n\n` +
      `📌 *Тема:* ${webinarTopic}\n` +
      `📅 *Дата:* ${webinarDate}\n\n` +
      `⏰ *Время подключения по часовым поясам:*\n` +
      `• *${mskFormatted}* — Москва (ЦФО / МСК)\n` +
      `• *${yakutsk}* — Якутск (МСК+6)\n` +
      `• *${vladivostok}* — Владивосток & Хабаровск (МСК+7)\n` +
      `• *${sakhalin}* — Южно-Сахалинск (МСК+8)\n` +
      `• *${kamchatka}* — Петропавловск-Камчатский (МСК+9)\n\n` +
      `💻 Подключение по ссылке: https://telemost.yandex.ru/j/...\n` +
      `_Федеральный Лидер ДФО & Региональный Лидер ЦФО: Анна_`;
  };

  const handleCopyAnnouncement = () => {
    const text = generateAnnouncementText();
    navigator.clipboard.writeText(text);
    soundEffects.playSuccess();
    setCopiedAnnouncement(true);
    setTimeout(() => setCopiedAnnouncement(false), 2500);
  };

  const moscowHub = REGION_HUBS[0];
  const dfoHubs = REGION_HUBS.slice(1);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-purple-500/30 bg-[#0d0a1f]/85 p-5 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/30">
            <Radio className="h-5 w-5 animate-pulse" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              Радар Командования ЦФО ⇄ ДФО
              <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-pink-300 border border-pink-500/30">
                «Я-Профессионал» Ани
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Синхронизация Москвы со всеми часовыми поясами Дальнего Востока (от МСК+6 до МСК+9)
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3.5 py-1.5 text-xs font-mono">
          <Globe2 className="h-4 w-4 text-sky-400" />
          <span className="text-zinc-400">Охват:</span>
          <span className="font-bold text-amber-300">11 часовых поясов РФ</span>
        </div>
      </div>

      {/* Main Grid: Interactive Map with Flight Arcs & Timezones Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Vector Map SVG (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#070814]/90 p-5 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Карта опорных узлов связи (Москва ⇄ Дальний Восток)
            </span>
            <span className="text-[11px] font-mono text-purple-300">
              МСК: {padHour(selectedMskHour)}
            </span>
          </div>

          <div className="relative aspect-[950/480] w-full max-h-[460px]">
            <svg viewBox="0 0 950 480" className="w-full h-full select-none">
              <defs>
                {/* Glowing flight arc gradient */}
                <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#a855f7" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
                </linearGradient>

                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Stylized Russia Landmass Silhouette */}
              <path
                d="M 120 230 Q 180 180 260 210 T 400 180 T 520 150 T 680 170 T 820 140 T 890 200 Q 860 270 820 310 T 730 350 T 620 380 T 480 370 T 320 360 T 180 340 Z"
                fill="rgba(255,255,255,0.025)"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />

              {/* Glowing Flight Arcs from Moscow to DFO Hubs */}
              {dfoHubs.map((hub) => {
                const midX = (moscowHub.mapX + hub.mapX) / 2;
                const midY = Math.min(moscowHub.mapY, hub.mapY) - 60; // curve upwards

                return (
                  <g key={`arc-${hub.id}`}>
                    {/* Background Arc Shadow */}
                    <path
                      d={`M ${moscowHub.mapX} ${moscowHub.mapY} Q ${midX} ${midY} ${hub.mapX} ${hub.mapY}`}
                      fill="none"
                      stroke="url(#arcGrad)"
                      strokeWidth="2"
                      opacity="0.4"
                    />
                    {/* Animated Pulsing Arc */}
                    <path
                      d={`M ${moscowHub.mapX} ${moscowHub.mapY} Q ${midX} ${midY} ${hub.mapX} ${hub.mapY}`}
                      fill="none"
                      stroke={hub.color}
                      strokeWidth="2"
                      strokeDasharray="6 8"
                      className="animate-pulse"
                      filter="url(#neonGlow)"
                    />
                  </g>
                );
              })}

              {/* HUB NODES */}
              {REGION_HUBS.map((hub) => {
                const status = getHumaneStatus(selectedMskHour, hub.mskOffset);
                const isMoscow = hub.id === 'moscow';

                return (
                  <g key={hub.id} className="cursor-pointer">
                    {/* Beacon Ring */}
                    <circle
                      cx={hub.mapX}
                      cy={hub.mapY}
                      r="16"
                      fill={status.color}
                      opacity="0.2"
                      className="animate-ping"
                    />

                    {/* Node Circle */}
                    <circle
                      cx={hub.mapX}
                      cy={hub.mapY}
                      r={isMoscow ? 9 : 7}
                      fill="#0e0f1a"
                      stroke={hub.color}
                      strokeWidth="2.5"
                      style={{ filter: `drop-shadow(0 0 8px ${hub.color})` }}
                    />
                    <circle cx={hub.mapX} cy={hub.mapY} r="3" fill="#ffffff" />

                    {/* Node Text Label */}
                    <g transform={`translate(${hub.mapX - 35}, ${hub.mapY + (isMoscow ? -24 : 18)})`}>
                      <rect
                        x="0"
                        y="0"
                        width="80"
                        height="20"
                        rx="6"
                        fill="#0b0a17"
                        stroke={hub.color}
                        strokeWidth="1"
                        opacity="0.9"
                      />
                      <text
                        x="40"
                        y="14"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="ui-sans-serif, system-ui"
                      >
                        {hub.shortName}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Time Slider */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-400" />
                <span>Планировщик гуманного времени: <strong>{padHour(selectedMskHour)} МСК</strong></span>
              </label>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Гуманно
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="h-2 w-2 rounded-full bg-amber-400" /> Вечер
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="h-2 w-2 rounded-full bg-rose-400" /> Ночь
                </span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="23"
              value={selectedMskHour}
              onChange={(e) => setSelectedMskHour(parseInt(e.target.value, 10))}
              className="w-full accent-purple-500 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>00:00</span>
              <span>06:00</span>
              <span>10:00 (Идеал)</span>
              <span>14:00</span>
              <span>18:00</span>
              <span>23:00</span>
            </div>
          </div>
        </div>

        {/* Right: Real-time Hub Statuses & Announcement Generator (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Real-time Hub Status Cards */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e19]/90 p-5 shadow-xl backdrop-blur-2xl space-y-3">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center justify-between">
              <span>Местное время в опорных хабах</span>
              <span className="font-mono text-xs text-purple-300">при {padHour(selectedMskHour)} МСК</span>
            </h3>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {REGION_HUBS.map((hub) => {
                const status = getHumaneStatus(selectedMskHour, hub.mskOffset);
                const isMoscow = hub.id === 'moscow';

                return (
                  <div
                    key={hub.id}
                    className="flex items-center justify-between rounded-xl p-2.5 border transition-all text-xs"
                    style={{
                      backgroundColor: status.bgColor,
                      borderColor: status.borderColor,
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-zinc-100">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: hub.color }} />
                        <span>{hub.name}</span>
                        {isMoscow && <span className="text-[10px] text-pink-400 font-mono">(Штаб)</span>}
                      </div>
                      <span className="text-[10px] text-zinc-400 block">{hub.role}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-sm text-zinc-100">
                        {padHour(status.localHour)}
                      </span>
                      <span
                        className="block font-mono text-[9px] font-extrabold uppercase mt-0.5"
                        style={{ color: status.color }}
                      >
                        {status.badge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 1-Click Telegram Broadcast Announcement Generator */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e19]/90 p-5 shadow-xl backdrop-blur-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Send className="h-4 w-4 text-sky-400" />
                <span>Генератор анонсов для чатов ДФО</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Тема встречи / вебинара:</label>
                <input
                  type="text"
                  value={webinarTopic}
                  onChange={(e) => setWebinarTopic(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">День недели & дата:</label>
                <input
                  type="text"
                  value={webinarDate}
                  onChange={(e) => setWebinarDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            {/* Generated Preview Box */}
            <div className="rounded-xl border border-white/10 bg-black/70 p-3 font-mono text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto">
              {generateAnnouncementText()}
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyAnnouncement}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-purple-600 py-2.5 text-xs font-bold text-black shadow-lg shadow-sky-500/25 hover:brightness-110 active:scale-98 transition-all"
            >
              {copiedAnnouncement ? (
                <>
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Текст скопирован в буфер!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Скопировать готовый анонс для Telegram</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
