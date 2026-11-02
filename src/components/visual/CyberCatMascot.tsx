import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { CoupleGamification } from '../../types/nexus';
import { soundEffects } from '../../utils/soundEffects';

interface CyberCatMascotProps {
  gamification: CoupleGamification;
  onEquipCosmetic: (cosmetic: CoupleGamification['equippedCosmetic']) => void;
  compact?: boolean;
}

export const CyberCatMascot: React.FC<CyberCatMascotProps> = ({
  gamification,
  onEquipCosmetic,
  compact = false,
}) => {
  const catRef = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [expression, setExpression] = useState<'normal' | 'wink' | 'sleepy' | 'happy'>('normal');
  const [purring, setPurring] = useState(false);
  const [speechQuote, setSpeechQuote] = useState<string | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  const quotes = [
    'Нексус на связи ♡',
    'Егор + Аня = Дримтим',
    'ДФО уже на связи (+7ч)',
    'Деплой под контролем',
    'Муррр... вы молодцы',
    'В фокусе и в ритме',
  ];

  // Mouse coordinate tracker for pupils
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!catRef.current) return;
      const rect = catRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 3.5;
      const factor = dist > 0 ? Math.min(maxDistance, dist) / dist : 0;

      setEyeOffset({
        x: (deltaX / 18) * factor,
        y: (deltaY / 18) * factor,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Periodic subtle blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.65) {
        setExpression('wink');
        setTimeout(() => setExpression('normal'), 280);
      }
    }, 4500);
    return () => clearInterval(blinkInterval);
  }, []);

  const handleCatClick = () => {
    setPurring(true);
    setExpression('happy');
    soundEffects.playPurr();

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setSpeechQuote(randomQuote);

    const newHeart = {
      id: Date.now() + Math.random(),
      x: (Math.random() - 0.5) * 30,
      y: -15,
    };
    setFloatingHearts((prev) => [...prev, newHeart]);

    setTimeout(() => {
      setPurring(false);
      setExpression('normal');
    }, 1200);

    setTimeout(() => {
      setSpeechQuote(null);
    }, 3200);
  };

  const xpPercent = Math.min(100, Math.round((gamification.xp / gamification.nextLevelXp) * 100));

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Speech Bubble */}
      <AnimatePresence>
        {speechQuote && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: -4, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute -top-10 z-30 rounded-xl border border-white/10 bg-[#18181b]/95 px-3 py-1 shadow-lg backdrop-blur-md"
          >
            <p className="font-mono text-xs font-medium text-zinc-200 tracking-tight whitespace-nowrap">
              {speechQuote}
            </p>
            <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 border-l-3 border-r-3 border-t-3 border-l-transparent border-r-transparent border-t-[#18181b]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Hearts */}
      <div className="pointer-events-none absolute inset-0 overflow-visible">
        {floatingHearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 0.8, y: 0, x: heart.x, scale: 0.7 }}
            animate={{ opacity: 0, y: -40, scale: 1.1 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            onAnimationComplete={() => {
              setFloatingHearts((prev) => prev.filter((h) => h.id !== heart.id));
            }}
            className="absolute left-1/2 top-0 text-zinc-300 text-xs"
          >
            ♡
          </motion.div>
        ))}
      </div>

      {/* Mascot Graphic */}
      <motion.div
        ref={catRef}
        onClick={handleCatClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative cursor-pointer"
        title="Котик Нексус • Нажмите, чтобы погладить и услышать мурчание"
      >
        {compact ? (
          <svg
            width="42"
            height="40"
            viewBox="0 0 100 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Left Cat Ear */}
            <polygon points="24,28 32,8 46,24" fill="#18181b" stroke="#52525b" strokeWidth="2.5" strokeLinejoin="round" />
            <polygon points="27,26 33,13 41,23" fill="#27272a" />

            {/* Right Cat Ear */}
            <polygon points="54,24 68,8 76,28" fill="#18181b" stroke="#52525b" strokeWidth="2.5" strokeLinejoin="round" />
            <polygon points="59,23 67,13 73,26" fill="#27272a" />

            {/* Head Shape */}
            <ellipse cx="50" cy="52" rx="34" ry="28" fill="#18181b" stroke="#52525b" strokeWidth="2" />

            {/* Cat Eyes */}
            {expression === 'normal' && (
              <>
                <circle cx="37" cy="50" r="5" fill="#09090b" stroke="#a1a1aa" strokeWidth="1.5" />
                <circle cx={37 + eyeOffset.x} cy={50 + eyeOffset.y} r="3" fill="#f4f4f5" />
                <circle cx="63" cy="50" r="5" fill="#09090b" stroke="#a1a1aa" strokeWidth="1.5" />
                <circle cx={63 + eyeOffset.x} cy={50 + eyeOffset.y} r="3" fill="#f4f4f5" />
              </>
            )}
            {expression !== 'normal' && (
              <>
                <path d="M32 50 Q37 44 42 50" stroke="#f4f4f5" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M58 50 Q63 44 68 50" stroke="#f4f4f5" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            )}
            <polygon points="50,56 48,54 52,54" fill="#a1a1aa" />
          </svg>
        ) : (
          /* Large Animated Cozy Desk & Moonlit Window Scene (240x175px) */
          <svg
            width="250"
            height="175"
            viewBox="0 0 250 175"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_16px_36px_rgba(0,0,0,0.65)]"
          >
            <defs>
              <linearGradient id="night-sky-grad" x1="0" y1="0" x2="0" y2="175" gradientUnits="userSpaceOnUse">
                <stop stopColor="#07080e" />
                <stop offset="0.65" stopColor="#0c101c" />
                <stop offset="1" stopColor="#151928" />
              </linearGradient>

              <radialGradient id="moon-glow" cx="54" cy="38" r="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fef08a" stopOpacity="0.45" />
                <stop offset="1" stopColor="#fef08a" stopOpacity="0" />
              </radialGradient>

              <linearGradient id="cat-fur-grad" x1="125" y1="65" x2="125" y2="150" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2c2d35" />
                <stop offset="0.5" stopColor="#202128" />
                <stop offset="1" stopColor="#15161c" />
              </linearGradient>

              <linearGradient id="cyber-neon-band" x1="95" y1="60" x2="155" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f59e0b" />
                <stop offset="1" stopColor="#ec4899" />
              </linearGradient>

              <linearGradient id="crown-gold" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#fde047" />
                <stop offset="1" stopColor="#ca8a04" />
              </linearGradient>
            </defs>

            {/* Window Outer Arch Frame */}
            <rect x="6" y="6" width="238" height="163" rx="18" fill="url(#night-sky-grad)" stroke="#ffffff" strokeOpacity="0.09" strokeWidth="2" />

            {/* Stars in Night Sky */}
            <circle cx="35" cy="24" r="1.3" fill="#ffffff" opacity="0.85" />
            <circle cx="178" cy="28" r="1.5" fill="#fef08a" opacity="0.9" />
            <circle cx="215" cy="55" r="1.1" fill="#ffffff" opacity="0.7" />
            <circle cx="140" cy="18" r="1.4" fill="#ffffff" opacity="0.8" />
            <circle cx="85" cy="48" r="1" fill="#ffffff" opacity="0.5" />
            <circle cx="202" cy="95" r="1.2" fill="#ffffff" opacity="0.65" />
            <circle cx="28" cy="85" r="1" fill="#fef08a" opacity="0.75" />

            {/* Glowing Crescent Moon */}
            <circle cx="54" cy="38" r="26" fill="url(#moon-glow)" />
            <path
              d="M 60,26 A 14,14 0 0,0 48,50 A 12,12 0 0,1 60,26 Z"
              fill="#fef08a"
              filter="drop-shadow(0 0 5px rgba(254, 240, 138, 0.7))"
            />

            {/* Subtle Window Mullions */}
            <line x1="6" y1="75" x2="244" y2="75" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1.5" />
            <line x1="125" y1="6" x2="125" y2="135" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1.5" />

            {/* Cozy Wooden Sill / Workspace Desk */}
            <rect x="6" y="136" width="238" height="33" rx="4" fill="#13141a" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" />
            <line x1="6" y1="136" x2="244" y2="136" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.5" />

            {/* Desk Atmosphere: Cozy Succulent on Left */}
            <rect x="25" y="126" width="16" height="13" rx="2.5" fill="#2d303a" stroke="#4b5060" strokeWidth="1" />
            <circle cx="30" cy="123" r="4.5" fill="#16a34a" opacity="0.9" />
            <circle cx="36" cy="123" r="4.5" fill="#22c55e" opacity="0.9" />
            <circle cx="33" cy="119" r="4" fill="#4ade80" />

            {/* Desk Atmosphere: Ambient Warm Lamp on Right */}
            <ellipse cx="218" cy="136" rx="20" ry="7" fill="#f59e0b" opacity="0.18" />
            <path d="M 212,136 L 218,118 L 224,136 Z" fill="#22232a" stroke="#f59e0b" strokeOpacity="0.5" strokeWidth="1" />
            <circle cx="218" cy="116" r="3.5" fill="#fef08a" filter="drop-shadow(0 0 8px #f59e0b)" />

            {/* Cat Tail Curling on Sill */}
            <path
              d="M 152,140 C 172,140 178,124 173,112 C 168,102 159,107 162,116"
              stroke="#2c2d35"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />

            {/* Cat Body */}
            <ellipse cx="125" cy="128" rx="30" ry="21" fill="url(#cat-fur-grad)" stroke="#444652" strokeWidth="1.5" />

            {/* Left Cat Ear */}
            <polygon points="102,76 106,53 118,70" fill="#202128" stroke="#505360" strokeWidth="1.8" strokeLinejoin="round" />
            <polygon points="105,74 108,58 115,69" fill="#f43f5e" opacity="0.45" />

            {/* Right Cat Ear */}
            <polygon points="132,70 144,53 148,76" fill="#202128" stroke="#505360" strokeWidth="1.8" strokeLinejoin="round" />
            <polygon points="135,69 142,58 145,74" fill="#f43f5e" opacity="0.45" />

            {/* Fluffy Head */}
            <ellipse cx="125" cy="88" rx="27" ry="22" fill="url(#cat-fur-grad)" stroke="#444652" strokeWidth="1.5" />
            <path d="M 98,90 C 94,92 94,96 100,98" stroke="#505360" strokeWidth="1.2" fill="none" />
            <path d="M 152,90 C 156,92 156,96 150,98" stroke="#505360" strokeWidth="1.2" fill="none" />

            {/* Cyber Neon Headphones Over Cat Head */}
            <path
              d="M 101,84 C 101,58 149,58 149,84"
              stroke="url(#cyber-neon-band)"
              strokeWidth="4"
              fill="none"
              filter="drop-shadow(0 0 5px rgba(245, 158, 11, 0.6))"
            />
            {/* Left Neon Ear-Cup */}
            <rect x="97" y="78" width="8" height="16" rx="4" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1" filter="drop-shadow(0 0 4px #f59e0b)" />
            {/* Right Neon Ear-Cup */}
            <rect x="145" y="78" width="8" height="16" rx="4" fill="#ec4899" stroke="#f472b6" strokeWidth="1" filter="drop-shadow(0 0 4px #ec4899)" />

            {/* Reactive Cat Eyes */}
            {expression === 'normal' && (
              <>
                {/* Left Eye */}
                <circle cx="114" cy="86" r="5" fill="#09090b" stroke="#a1a1aa" strokeWidth="1.5" />
                <circle cx={114 + eyeOffset.x} cy={86 + eyeOffset.y} r="3" fill="#f4f4f5" />
                <circle cx={113 + eyeOffset.x} cy={85 + eyeOffset.y} r="1" fill="#ffffff" />

                {/* Right Eye */}
                <circle cx="136" cy="86" r="5" fill="#09090b" stroke="#a1a1aa" strokeWidth="1.5" />
                <circle cx={136 + eyeOffset.x} cy={86 + eyeOffset.y} r="3" fill="#f4f4f5" />
                <circle cx={135 + eyeOffset.x} cy={85 + eyeOffset.y} r="1" fill="#ffffff" />
              </>
            )}

            {expression === 'wink' && (
              <>
                <path d="M 110,87 L 114,82 L 118,87" stroke="#f4f4f5" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="136" cy="86" r="5" fill="#f4f4f5" />
                <circle cx="135" cy="85" r="1.5" fill="#18181b" />
              </>
            )}

            {(expression === 'happy' || purring) && (
              <>
                <path d="M 109,86 Q 114,79 119,86" stroke="#f4f4f5" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M 131,86 Q 136,79 141,86" stroke="#f4f4f5" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            )}

            {expression === 'sleepy' && (
              <>
                <line x1="110" y1="86" x2="118" y2="86" stroke="#71717a" strokeWidth="2" strokeLinecap="round" />
                <line x1="132" y1="86" x2="140" y2="86" stroke="#71717a" strokeWidth="2" strokeLinecap="round" />
              </>
            )}

            {/* Cute Nose and Mouth */}
            <polygon points="125,92 123,90 127,90" fill="#f43f5e" opacity="0.8" />
            <path d="M 122,93 Q 125,96 128,93" stroke="#71717a" strokeWidth="1.2" fill="none" strokeLinecap="round" />

            {/* Whiskers */}
            <line x1="106" y1="91" x2="94" y2="90" stroke="#52525b" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="106" y1="94" x2="93" y2="96" stroke="#52525b" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="144" y1="91" x2="156" y2="90" stroke="#52525b" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="144" y1="94" x2="157" y2="96" stroke="#52525b" strokeWidth="1.2" strokeLinecap="round" />

            {/* Equipped Cosmetic: Crown */}
            {gamification.equippedCosmetic === 'crown' && (
              <path
                d="M 113,67 L 118,74 L 125,62 L 132,74 L 137,67 L 135,78 L 115,78 Z"
                fill="url(#crown-gold)"
                stroke="#fef08a"
                strokeWidth="1.4"
                filter="drop-shadow(0 0 5px rgba(234, 179, 8, 0.7))"
              />
            )}

            {/* Equipped Cosmetic: Glasses */}
            {gamification.equippedCosmetic === 'glasses' && (
              <g stroke="#f4f4f5" strokeWidth="1.8" fill="none">
                <circle cx="114" cy="86" r="7.5" />
                <circle cx="136" cy="86" r="7.5" />
                <line x1="121.5" y1="86" x2="128.5" y2="86" />
              </g>
            )}

            {/* Equipped Cosmetic: Scarf */}
            {gamification.equippedCosmetic === 'scarf' && (
              <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))">
                <path
                  d="M 106,106 Q 125,115 144,106 L 140,113 Q 125,121 110,113 Z"
                  fill="#e11d48"
                  stroke="#fda4af"
                  strokeWidth="1.2"
                />
                <rect x="131" y="112" width="7" height="14" rx="2" fill="#e11d48" stroke="#fda4af" strokeWidth="1" />
              </g>
            )}
          </svg>
        )}
      </motion.div>

      {/* Couple XP Progress Bar & Level (Cleanly Formatted, No Squished Text) */}
      {!compact && (
        <div className="mt-3.5 w-full max-w-[220px] text-center">
          <div className="flex items-center justify-between text-[11px] font-mono-num mb-1.5">
            <span className="font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10.5px]">
              Уровень {gamification.level}
            </span>
            <span className="text-zinc-400 font-semibold">
              {gamification.xp.toLocaleString('ru-RU')} / {gamification.nextLevelXp.toLocaleString('ru-RU')} XP
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80 border border-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
