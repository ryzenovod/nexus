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

      {/* Minimalist Vector Cat Body (Raycast / Arc aesthetic) */}
      <motion.div
        ref={catRef}
        onClick={handleCatClick}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="relative cursor-pointer"
        title="Котик Нексус • Нажмите, чтобы помурчать"
      >
        <svg
          width={compact ? '42' : '56'}
          height={compact ? '40' : '52'}
          viewBox="0 0 100 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left Cat Ear */}
          <polygon
            points="24,28 32,8 46,24"
            fill="#18181b"
            stroke="#52525b"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <polygon points="27,26 33,13 41,23" fill="#27272a" />

          {/* Right Cat Ear */}
          <polygon
            points="54,24 68,8 76,28"
            fill="#18181b"
            stroke="#52525b"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <polygon points="59,23 67,13 73,26" fill="#27272a" />

          {/* Head Shape */}
          <ellipse
            cx="50"
            cy="52"
            rx="34"
            ry="28"
            fill="#18181b"
            stroke="#52525b"
            strokeWidth="2"
          />

          {/* Cat Eyes */}
          {expression === 'normal' && (
            <>
              {/* Left Eye */}
              <circle cx="37" cy="50" r="5" fill="#09090b" stroke="#a1a1aa" strokeWidth="1.5" />
              <circle
                cx={37 + eyeOffset.x}
                cy={50 + eyeOffset.y}
                r="3"
                fill="#f4f4f5"
              />
              <circle cx={36 + eyeOffset.x} cy={49 + eyeOffset.y} r="1" fill="#ffffff" />

              {/* Right Eye */}
              <circle cx="63" cy="50" r="5" fill="#09090b" stroke="#a1a1aa" strokeWidth="1.5" />
              <circle
                cx={63 + eyeOffset.x}
                cy={50 + eyeOffset.y}
                r="3"
                fill="#f4f4f5"
              />
              <circle cx={62 + eyeOffset.x} cy={49 + eyeOffset.y} r="1" fill="#ffffff" />
            </>
          )}

          {expression === 'wink' && (
            <>
              {/* Wink Left: ^ */}
              <path d="M33 51 L37 46 L41 51" stroke="#f4f4f5" strokeWidth="2.5" strokeLinecap="round" />
              {/* Right Eye Open */}
              <circle cx="63" cy="50" r="5" fill="#f4f4f5" />
              <circle cx="62" cy="49" r="1.5" fill="#18181b" />
            </>
          )}

          {expression === 'happy' && (
            <>
              {/* Happy Arc Eyes */}
              <path d="M32 50 Q37 44 42 50" stroke="#f4f4f5" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M58 50 Q63 44 68 50" stroke="#f4f4f5" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          )}

          {expression === 'sleepy' && (
            <>
              <line x1="33" y1="50" x2="41" y2="50" stroke="#71717a" strokeWidth="2" strokeLinecap="round" />
              <line x1="59" y1="50" x2="67" y2="50" stroke="#71717a" strokeWidth="2" strokeLinecap="round" />
            </>
          )}

          {/* Cute Nose and Mouth */}
          <polygon points="50,56 48,54 52,54" fill="#a1a1aa" />
          <path d="M47 57 Q50 60 53 57" stroke="#71717a" strokeWidth="1.2" fill="none" strokeLinecap="round" />

          {/* Subtle Whiskers */}
          <line x1="28" y1="55" x2="18" y2="54" stroke="#3f3f46" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="28" y1="58" x2="17" y2="60" stroke="#3f3f46" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="72" y1="55" x2="82" y2="54" stroke="#3f3f46" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="72" y1="58" x2="83" y2="60" stroke="#3f3f46" strokeWidth="1.2" strokeLinecap="round" />

          {/* Cosmetic: Minimalist Crown */}
          {gamification.equippedCosmetic === 'crown' && (
            <path
              d="M38 24 L44 31 L50 21 L56 31 L62 24 L60 35 L40 35 Z"
              fill="#27272a"
              stroke="#e4e4e7"
              strokeWidth="1.5"
            />
          )}

          {/* Cosmetic: Minimalist Glasses */}
          {gamification.equippedCosmetic === 'glasses' && (
            <g stroke="#e4e4e7" strokeWidth="1.5" fill="none">
              <circle cx="37" cy="50" r="7" />
              <circle cx="63" cy="50" r="7" />
              <line x1="44" y1="50" x2="56" y2="50" />
            </g>
          )}

          {/* Cosmetic: Minimalist Scarf */}
          {gamification.equippedCosmetic === 'scarf' && (
            <path
              d="M33 70 Q50 78 67 70 L64 77 Q50 84 36 77 Z"
              fill="#27272a"
              stroke="#71717a"
              strokeWidth="1.5"
            />
          )}
        </svg>
      </motion.div>

      {/* Couple XP Progress Bar & Level */}
      {!compact && (
        <div className="mt-1 w-full max-w-[180px] text-center">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="font-medium text-zinc-300 flex items-center gap-1">
              Ур. {gamification.level}
            </span>
            <span className="text-zinc-500">
              {gamification.xp}/{gamification.nextLevelXp} XP
            </span>
          </div>

          <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-zinc-300 transition-all duration-300"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
