import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Crown, Glasses, Zap } from 'lucide-react';
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
  const [expression, setExpression] = useState<'0_o' | '^_~' | '-_-' | '*_*'>('0_o');
  const [purring, setPurring] = useState(false);
  const [speechQuote, setSpeechQuote] = useState<string | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  const quotes = [
    'don\'t stop now ♡',
    'you got this! ♡',
    'Егор + Аня = Дримтим ✨',
    'one more level. one step closer. 🎮',
    'Аня, ДФО уже проснулись (+7ч)! ⏰',
    'Егор, деплой шлюза под контролем! 🚀',
    'Муррр... вы великолепны! 💜',
    'PLAY. FOCUS. WIN. REPEAT. 🎧',
  ];

  // Mouse coordinate tracker for eyes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!catRef.current) return;
      const rect = catRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Limit pupil motion to +/- 4.5px
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 4.5;
      const factor = dist > 0 ? Math.min(maxDistance, dist) / dist : 0;

      setEyeOffset({
        x: (deltaX / 15) * factor,
        y: (deltaY / 15) * factor,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Periodic random blinking or winking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        setExpression('^_~');
        setTimeout(() => setExpression('0_o'), 350);
      }
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  const handleCatClick = () => {
    // Purr & show floating hearts & trigger cozy purr sound
    setPurring(true);
    setExpression('*_*');
    soundEffects.playPurr();

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setSpeechQuote(randomQuote);

    const newHeart = {
      id: Date.now() + Math.random(),
      x: (Math.random() - 0.5) * 40,
      y: -20,
    };
    setFloatingHearts((prev) => [...prev, newHeart]);

    setTimeout(() => {
      setPurring(false);
      setExpression('0_o');
    }, 1400);

    setTimeout(() => {
      setSpeechQuote(null);
    }, 3800);
  };

  const xpPercent = Math.min(100, Math.round((gamification.xp / gamification.nextLevelXp) * 100));

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Speech Bubble */}
      <AnimatePresence>
        {speechQuote && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: -6, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -top-12 z-30 rounded-xl border border-purple-500/40 bg-[#150f28]/95 px-3 py-1.5 shadow-xl backdrop-blur-md"
          >
            <p className="font-mono text-xs font-semibold text-purple-200 tracking-tight whitespace-nowrap">
              {speechQuote}
            </p>
            {/* Arrow down */}
            <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#150f28]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Pixel Hearts */}
      <div className="pointer-events-none absolute inset-0 overflow-visible">
        {floatingHearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 1, y: 0, x: heart.x, scale: 0.6 }}
            animate={{ opacity: 0, y: -50, scale: 1.2 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            onAnimationComplete={() => {
              setFloatingHearts((prev) => prev.filter((h) => h.id !== heart.id));
            }}
            className="absolute left-1/2 top-0 text-purple-400"
          >
            💜
          </motion.div>
        ))}
      </div>

      {/* Cat SVG Body */}
      <motion.div
        ref={catRef}
        onClick={handleCatClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        className="relative cursor-pointer"
        title="Кликни на котика Нексуса, чтобы помурчать и получить заряд мотивации!"
      >
        <svg
          width={compact ? '52' : '72'}
          height={compact ? '50' : '68'}
          viewBox="0 0 100 95"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Neon Headphone Band */}
          <path
            d="M20 48 C 20 18, 80 18, 80 48"
            stroke="#a855f7"
            strokeWidth="5"
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
          />

          {/* Left Cat-Ear on Headphone */}
          <motion.polygon
            points="22,25 32,5 42,22"
            fill="#120c22"
            stroke="#ec4899"
            strokeWidth="2.5"
            animate={{ rotate: purring ? [-3, 3, -3] : [0, 2, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          <polygon points="26,22 32,10 38,20" fill="#ec4899" opacity="0.6" />

          {/* Right Cat-Ear on Headphone */}
          <motion.polygon
            points="58,22 68,5 78,25"
            fill="#120c22"
            stroke="#ec4899"
            strokeWidth="2.5"
            animate={{ rotate: purring ? [3, -3, 3] : [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          <polygon points="62,20 68,10 74,22" fill="#ec4899" opacity="0.6" />

          {/* Head Shape */}
          <ellipse cx="50" cy="52" rx="34" ry="28" fill="#0d0e15" stroke="#2e1065" strokeWidth="2" />

          {/* Headphone Earcups with Pulsing LED Ring */}
          <circle cx="17" cy="52" r="11" fill="#18112e" stroke="#a855f7" strokeWidth="2.5" className="drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
          <circle cx="17" cy="52" r="5" fill="#ec4899" />

          <circle cx="83" cy="52" r="11" fill="#18112e" stroke="#a855f7" strokeWidth="2.5" className="drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
          <circle cx="83" cy="52" r="5" fill="#ec4899" />

          {/* Cat Eyes */}
          {expression === '0_o' && (
            <>
              {/* Left Eye */}
              <ellipse cx="38" cy="50" rx="6.5" ry="7" fill="#0b0717" stroke="#38bdf8" strokeWidth="2" />
              <circle
                cx={38 + eyeOffset.x}
                cy={50 + eyeOffset.y}
                r="3.5"
                fill="#38bdf8"
                className="drop-shadow-[0_0_6px_rgba(56,189,248,0.9)]"
              />
              <circle cx={36.5 + eyeOffset.x} cy={48.5 + eyeOffset.y} r="1.2" fill="#ffffff" />

              {/* Right Eye */}
              <ellipse cx="62" cy="50" rx="6.5" ry="7" fill="#0b0717" stroke="#38bdf8" strokeWidth="2" />
              <circle
                cx={62 + eyeOffset.x}
                cy={50 + eyeOffset.y}
                r="3.5"
                fill="#38bdf8"
                className="drop-shadow-[0_0_6px_rgba(56,189,248,0.9)]"
              />
              <circle cx={60.5 + eyeOffset.x} cy={48.5 + eyeOffset.y} r="1.2" fill="#ffffff" />
            </>
          )}

          {expression === '^_~' && (
            <>
              {/* Wink Left: ^ */}
              <path d="M33 52 L38 46 L43 52" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              {/* Open Right: O */}
              <ellipse cx="62" cy="50" rx="6" ry="6.5" fill="#38bdf8" />
              <circle cx="60.5" cy="48.5" r="1.5" fill="#ffffff" />
            </>
          )}

          {expression === '-_-' && (
            <>
              <line x1="33" y1="50" x2="43" y2="50" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
              <line x1="57" y1="50" x2="67" y2="50" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
            </>
          )}

          {expression === '*_*' && (
            <>
              {/* Star Eyes Excited */}
              <text x="32" y="55" fill="#facc15" fontSize="16" fontWeight="bold">✦</text>
              <text x="56" y="55" fill="#facc15" fontSize="16" fontWeight="bold">✦</text>
            </>
          )}

          {/* Cute Nose and Mouth */}
          <polygon points="50,57 47,54 53,54" fill="#f43f5e" />
          <path d="M47 58 Q50 61 53 58" stroke="#f43f5e" strokeWidth="1.6" fill="none" strokeLinecap="round" />

          {/* Whiskers */}
          <line x1="26" y1="56" x2="16" y2="54" stroke="#4c1d95" strokeWidth="1.5" />
          <line x1="26" y1="59" x2="15" y2="61" stroke="#4c1d95" strokeWidth="1.5" />
          <line x1="74" y1="56" x2="84" y2="54" stroke="#4c1d95" strokeWidth="1.5" />
          <line x1="74" y1="59" x2="85" y2="61" stroke="#4c1d95" strokeWidth="1.5" />

          {/* Cosmetic: Crown */}
          {gamification.equippedCosmetic === 'crown' && (
            <path
              d="M38 24 L44 32 L50 20 L56 32 L62 24 L60 36 L40 36 Z"
              fill="#facc15"
              stroke="#ca8a04"
              strokeWidth="1.5"
              className="drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"
            />
          )}

          {/* Cosmetic: Glasses */}
          {gamification.equippedCosmetic === 'glasses' && (
            <g stroke="#38bdf8" strokeWidth="2" fill="rgba(56,189,248,0.2)">
              <circle cx="38" cy="50" r="8" />
              <circle cx="62" cy="50" r="8" />
              <line x1="46" y1="50" x2="54" y2="50" />
            </g>
          )}

          {/* Cosmetic: Scarf */}
          {gamification.equippedCosmetic === 'scarf' && (
            <path
              d="M32 72 Q50 82 68 72 L65 80 Q50 88 35 80 Z"
              fill="#ec4899"
              className="drop-shadow-[0_0_6px_rgba(236,72,153,0.7)]"
            />
          )}

          {/* Cosmetic: Cyber Wings */}
          {gamification.equippedCosmetic === 'wings' && (
            <g opacity="0.85">
              <path
                d="M18 45 Q-10 20 8 70 Q16 55 22 50 Z"
                fill="rgba(56,189,248,0.4)"
                stroke="#38bdf8"
                strokeWidth="1.5"
                className="drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]"
              />
              <path
                d="M82 45 Q110 20 92 70 Q84 55 78 50 Z"
                fill="rgba(56,189,248,0.4)"
                stroke="#38bdf8"
                strokeWidth="1.5"
                className="drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]"
              />
            </g>
          )}

          {/* Cosmetic: Razer Purple Cat Headphones Pulsing Aura */}
          {gamification.equippedCosmetic === 'cat_headphones' && (
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#a855f7"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="animate-spin drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]"
              style={{ animationDuration: '8s' }}
            />
          )}
        </svg>
      </motion.div>

      {/* Couple XP Progress Bar & Level */}
      {!compact && (
        <div className="mt-1 w-full max-w-[200px] text-center">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <Zap className="h-2.5 w-2.5" />
              Ур. {gamification.level}
            </span>
            <span className="text-zinc-400">
              {gamification.xp}/{gamification.nextLevelXp} XP
            </span>
          </div>

          <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-black/60 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-300"
              style={{ width: `${xpPercent}%` }}
            />
          </div>

          <span className="block mt-0.5 text-[9px] font-medium text-purple-300/80 truncate">
            {gamification.levelTitle}
          </span>
        </div>
      )}
    </div>
  );
};
