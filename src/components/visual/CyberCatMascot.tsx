import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [expression, setExpression] = useState<'normal' | 'wink' | 'happy'>('normal');
  const [purring, setPurring] = useState(false);
  const [speechQuote, setSpeechQuote] = useState<string | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  const quotes = [
    'Нексус на связи ♡',
    'Егор + Аня = Дримтим',
    'Муррр... вы молодцы!',
    'Уютный вечер вдвоем',
    'Деплой под контролем 🚀',
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
        x: (deltaX / 16) * factor,
        y: (deltaY / 16) * factor,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Periodic subtle blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        setExpression('wink');
        setTimeout(() => setExpression('normal'), 260);
      }
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  const handleCatClick = () => {
    setPurring(true);
    setExpression('happy');
    try {
      soundEffects.playPurr();
    } catch {}

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setSpeechQuote(randomQuote);

    const newHeart = {
      id: Date.now() + Math.random(),
      x: (Math.random() - 0.5) * 60,
      y: -20,
    };
    setFloatingHearts((prev) => [...prev, newHeart]);

    setTimeout(() => {
      setPurring(false);
      setExpression('normal');
    }, 1400);

    setTimeout(() => {
      setSpeechQuote(null);
    }, 3200);
  };

  return (
    <div className="relative flex flex-col items-center select-none w-full">
      {/* Speech Bubble */}
      <AnimatePresence>
        {speechQuote && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-2 z-30 rounded-xl border border-white/10 bg-zinc-950/90 px-3.5 py-1.5 shadow-xl backdrop-blur-md"
          >
            <p className="font-mono text-xs font-medium text-zinc-100 tracking-tight whitespace-nowrap">
              {speechQuote}
            </p>
            <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-zinc-950" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Hearts */}
      <div className="pointer-events-none absolute inset-0 overflow-visible z-30">
        {floatingHearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 0.9, y: 60, x: heart.x, scale: 0.8 }}
            animate={{ opacity: 0, y: -30, scale: 1.3 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            onAnimationComplete={() => {
              setFloatingHearts((prev) => prev.filter((h) => h.id !== heart.id));
            }}
            className="absolute left-1/2 top-10 text-rose-400 text-sm font-bold"
          >
            ♡
          </motion.div>
        ))}
      </div>

      {/* Mascot Graphic Container */}
      <motion.div
        ref={catRef}
        onClick={handleCatClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="relative cursor-pointer w-full flex justify-center"
        title="Котик Нексус • Нажмите, чтобы погладить и услышать мурчание"
      >
        {compact ? (
          /* Header Avatar (42x40px) */
          <svg
            width="42"
            height="40"
            viewBox="0 0 100 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon points="24,28 32,8 46,24" fill="#18181b" stroke="#71717a" strokeWidth="2.5" strokeLinejoin="round" />
            <polygon points="27,26 33,13 41,23" fill="#27272a" />
            <polygon points="54,24 68,8 76,28" fill="#18181b" stroke="#71717a" strokeWidth="2.5" strokeLinejoin="round" />
            <polygon points="59,23 67,13 73,26" fill="#27272a" />
            <ellipse cx="50" cy="52" rx="34" ry="28" fill="#18181b" stroke="#71717a" strokeWidth="2" />
            <path d="M22 46 C32 38, 68 38, 78 46" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
            {expression === 'normal' ? (
              <>
                <circle cx="37" cy="50" r="4.5" fill="#09090b" stroke="#a1a1aa" strokeWidth="1.5" />
                <circle cx={37 + eyeOffset.x} cy={50 + eyeOffset.y} r="2.5" fill="#f4f4f5" />
                <circle cx="63" cy="50" r="4.5" fill="#09090b" stroke="#a1a1aa" strokeWidth="1.5" />
                <circle cx={63 + eyeOffset.x} cy={50 + eyeOffset.y} r="2.5" fill="#f4f4f5" />
              </>
            ) : (
              <>
                <path d="M32 50 Q37 44 42 50" stroke="#f4f4f5" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M58 50 Q63 44 68 50" stroke="#f4f4f5" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            )}
            <polygon points="50,56 48,54 52,54" fill="#ec4899" />
          </svg>
        ) : (
          /* Wide Panoramic Lofi Anime Scene (400x220px) */
          <svg
            width="100%"
            height="220"
            viewBox="0 0 400 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="rounded-xl overflow-hidden shadow-2xl max-w-[460px]"
          >
            <defs>
              {/* Sunset Twilight Window Gradient */}
              <linearGradient id="lofi-sky-grad" x1="200" y1="0" x2="200" y2="180" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0d091a" />
                <stop offset="0.45" stopColor="#1e1136" />
                <stop offset="0.85" stopColor="#3b134f" />
                <stop offset="1" stopColor="#581c87" />
              </linearGradient>

              {/* Crescent Moon Glow */}
              <radialGradient id="lofi-moon-glow" cx="75" cy="55" r="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fef08a" stopOpacity="0.4" />
                <stop offset="1" stopColor="#fef08a" stopOpacity="0" />
              </radialGradient>

              {/* Lamp Light Glow */}
              <radialGradient id="lamp-light-cone" cx="340" cy="140" r="65" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fef08a" stopOpacity="0.28" />
                <stop offset="0.7" stopColor="#f59e0b" stopOpacity="0.08" />
                <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>

              {/* Neon Kitty Ears Glow */}
              <linearGradient id="kitty-neon-grad" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#c084fc" />
                <stop offset="1" stopColor="#ec4899" />
              </linearGradient>

              {/* Crown Gold Gradient */}
              <linearGradient id="crown-gold-grad" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#fef08a" />
                <stop offset="1" stopColor="#ca8a04" />
              </linearGradient>

              {/* Fluffy Cat Fur Gradient */}
              <linearGradient id="cat-fur-grad" x1="200" y1="95" x2="200" y2="190" gradientUnits="userSpaceOnUse">
                <stop stopColor="#27272a" />
                <stop offset="0.5" stopColor="#18181b" />
                <stop offset="1" stopColor="#09090b" />
              </linearGradient>
            </defs>

            {/* 1. SKY & CITYSCAPE BACKGROUND */}
            <rect width="400" height="180" fill="url(#lofi-sky-grad)" />

            {/* Distant City Skyline Silhouettes */}
            <path
              d="M 0,180 L 0,148 L 22,148 L 22,136 L 45,136 L 45,152 L 68,152 L 68,142 L 95,142 L 95,156 L 130,156 L 130,146 L 160,146 L 160,160 L 250,160 L 250,144 L 285,144 L 285,154 L 320,154 L 320,138 L 350,138 L 350,150 L 380,150 L 380,142 L 400,142 L 400,180 Z"
              fill="#120c22"
              opacity="0.9"
            />
            {/* Tiny City Window Lights */}
            <circle cx="34" cy="142" r="1" fill="#fef08a" opacity="0.6" />
            <circle cx="80" cy="148" r="1" fill="#fef08a" opacity="0.8" />
            <circle cx="145" cy="152" r="1" fill="#f472b6" opacity="0.5" />
            <circle cx="265" cy="150" r="1.2" fill="#fef08a" opacity="0.75" />
            <circle cx="335" cy="146" r="1" fill="#67e8f9" opacity="0.6" />

            {/* Telephone / Power lines cutting through sunset sky */}
            <path d="M 0,110 Q 200,132 400,115" stroke="#3b134f" strokeWidth="1" opacity="0.6" fill="none" />
            <path d="M 0,122 Q 200,144 400,128" stroke="#3b134f" strokeWidth="0.8" opacity="0.5" fill="none" />

            {/* Stars & Constellations */}
            <circle cx="50" cy="30" r="1.2" fill="#ffffff" opacity="0.9" />
            <circle cx="120" cy="42" r="1" fill="#fef08a" opacity="0.85" />
            <circle cx="170" cy="22" r="1.4" fill="#ffffff" opacity="0.75" />
            <circle cx="230" cy="35" r="1.1" fill="#fef08a" opacity="0.9" />
            <circle cx="290" cy="18" r="1.5" fill="#ffffff" opacity="0.8" />
            <circle cx="360" cy="40" r="1" fill="#fef08a" opacity="0.7" />
            <circle cx="315" cy="65" r="1.2" fill="#ffffff" opacity="0.6" />

            {/* Falling Shooting Star Streak */}
            <line x1="270" y1="20" x2="225" y2="42" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
            <circle cx="225" cy="42" r="2" fill="#ffffff" opacity="0.9" />

            {/* Crescent Moon */}
            <circle cx="75" cy="55" r="30" fill="url(#lofi-moon-glow)" />
            <path
              d="M 82,42 A 16,16 0 0,0 68,70 A 13.5,13.5 0 0,1 82,42 Z"
              fill="#fef08a"
              filter="drop-shadow(0 0 6px rgba(254, 240, 138, 0.8))"
            />

            {/* Window Wooden Frame */}
            <rect x="0" y="0" width="400" height="180" fill="none" stroke="#27272a" strokeWidth="4" />
            <line x1="200" y1="0" x2="200" y2="180" stroke="#27272a" strokeWidth="2" strokeOpacity="0.3" />

            {/* 2. COZY WORKSPACE WOODEN DESK */}
            <rect x="0" y="172" width="400" height="48" fill="#18181b" stroke="#27272a" strokeWidth="1.5" />
            <line x1="0" y1="172" x2="400" y2="172" stroke="#3f3f46" strokeWidth="2" />

            {/* Ambient Lamp Glow on Desk (Right side) */}
            <ellipse cx="340" cy="165" rx="55" ry="35" fill="url(#lamp-light-cone)" />

            {/* Left Decor: Monstera Plant in Ceramic Pot */}
            <g transform="translate(18, 125)">
              {/* Pot */}
              <polygon points="12,50 38,50 34,22 16,22" fill="#7c2d12" stroke="#9a3412" strokeWidth="1" />
              {/* Monstera Leaves */}
              <path d="M 14,24 C 5,14 4,-2 18,2 C 18,10 24,18 25,24 Z" fill="#15803d" />
              <path d="M 25,23 C 25,10 38,-4 44,8 C 40,16 34,22 25,23 Z" fill="#16a34a" />
              <path d="M 25,22 C 18,8 24,-12 30,-2 C 32,8 28,18 25,22 Z" fill="#22c55e" />
              {/* Pot details */}
              <ellipse cx="25" cy="22" rx="9" ry="2.5" fill="#451a03" />
            </g>

            {/* Neon LEVEL UP Sign (Above monstera) */}
            <g transform="translate(15, 88)">
              <rect width="66" height="20" rx="4" fill="#18181b" stroke="#ec4899" strokeWidth="1.2" opacity="0.9" />
              <text x="33" y="14" fill="#f472b6" fontSize="8.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle" filter="drop-shadow(0 0 4px #ec4899)">
                LEVEL UP ↑
              </text>
            </g>

            {/* Right Decor: Desk Lamp & Steaming Mug */}
            {/* Warm Desk Lamp */}
            <g transform="translate(330, 110)">
              {/* Stand */}
              <line x1="20" y1="65" x2="20" y2="25" stroke="#52525b" strokeWidth="3" strokeLinecap="round" />
              <circle cx="20" cy="65" r="7" fill="#27272a" stroke="#71717a" strokeWidth="1.5" />
              {/* Lampshade */}
              <path d="M 8,25 L 32,25 L 26,8 L 14,8 Z" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1.2" />
              {/* Bulb Light */}
              <circle cx="20" cy="27" r="4" fill="#fef08a" filter="drop-shadow(0 0 10px #f59e0b)" />
            </g>

            {/* Steaming Mug */}
            <g transform="translate(290, 160)">
              <rect x="0" y="0" width="16" height="15" rx="3" fill="#3b82f6" stroke="#60a5fa" strokeWidth="1" />
              <path d="M 16,3 C 20,3 20,11 16,11" stroke="#60a5fa" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              {/* Animated wisps of steam */}
              <path d="M 5,-2 Q 2,-7 6,-11" stroke="#ffffff" strokeWidth="1" opacity="0.5" fill="none" strokeLinecap="round" />
              <path d="M 11,-2 Q 14,-7 10,-11" stroke="#ffffff" strokeWidth="1" opacity="0.5" fill="none" strokeLinecap="round" />
            </g>

            {/* Center: Glowing Keyboard under Cat's paws */}
            <rect x="150" y="186" width="100" height="24" rx="4" fill="#09090b" stroke="#3f3f46" strokeWidth="1.2" />
            <line x1="156" y1="192" x2="244" y2="192" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" filter="drop-shadow(0 0 3px #a855f7)" />
            <line x1="156" y1="198" x2="244" y2="198" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" filter="drop-shadow(0 0 3px #38bdf8)" />
            <line x1="156" y1="204" x2="244" y2="204" stroke="#ec4899" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" filter="drop-shadow(0 0 3px #ec4899)" />

            {/* 3. FLUFFY LOFI ANIME CAT */}
            {/* Swaying Tail curling on right */}
            <path
              d="M 235,178 C 265,182 280,162 272,142 C 265,128 252,136 256,148"
              stroke="#18181b"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
            />

            {/* Cat Body */}
            <ellipse cx="200" cy="172" rx="42" ry="28" fill="url(#cat-fur-grad)" stroke="#27272a" strokeWidth="1.5" />

            {/* Fluffy Cheeks & Head Silhouette via smooth Bezier curve */}
            <path
              d="M 166,132 C 152,142 152,158 166,166 C 180,174 220,174 234,166 C 248,158 248,142 234,132 C 228,118 172,118 166,132 Z"
              fill="url(#cat-fur-grad)"
              stroke="#27272a"
              strokeWidth="1.8"
            />

            {/* Fluffy Ears */}
            {/* Left Ear */}
            <polygon points="170,122 176,92 194,116" fill="#18181b" stroke="#27272a" strokeWidth="1.8" strokeLinejoin="round" />
            <polygon points="174,120 178,98 189,114" fill="#fda4af" opacity="0.45" />
            {/* Right Ear */}
            <polygon points="206,116 224,92 230,122" fill="#18181b" stroke="#27272a" strokeWidth="1.8" strokeLinejoin="round" />
            <polygon points="211,114 222,98 226,120" fill="#fda4af" opacity="0.45" />

            {/* RAZER KITTY GAMER HEADPHONES OVER HEAD */}
            {/* Headphone Arch */}
            <path
              d="M 162,134 C 162,96 238,96 238,134"
              stroke="#09090b"
              strokeWidth="5"
              fill="none"
            />
            <path
              d="M 164,132 C 164,98 236,98 236,132"
              stroke="url(#kitty-neon-grad)"
              strokeWidth="2.5"
              fill="none"
              filter="drop-shadow(0 0 5px #c084fc)"
            />
            {/* Glowing Neon Kitty Ears on top of headphones */}
            <polygon points="174,104 182,78 194,100" fill="#c084fc" opacity="0.85" filter="drop-shadow(0 0 6px #c084fc)" />
            <polygon points="178,102 183,84 190,98" fill="#fdf4ff" />

            <polygon points="206,100 218,78 226,104" fill="#ec4899" opacity="0.85" filter="drop-shadow(0 0 6px #ec4899)" />
            <polygon points="210,98 217,84 222,102" fill="#fdf4ff" />

            {/* Left Ear-Cup Cushion */}
            <rect x="156" y="126" width="11" height="22" rx="5.5" fill="#18181b" stroke="#a855f7" strokeWidth="1.5" filter="drop-shadow(0 0 4px #a855f7)" />
            {/* Right Ear-Cup Cushion */}
            <rect x="233" y="126" width="11" height="22" rx="5.5" fill="#18181b" stroke="#ec4899" strokeWidth="1.5" filter="drop-shadow(0 0 4px #ec4899)" />

            {/* BIG ANIME GLOSSY CAT EYES */}
            {expression === 'normal' ? (
              <>
                {/* Left Eye */}
                <ellipse cx="184" cy="144" rx="7.5" ry="9" fill="#09090b" stroke="#71717a" strokeWidth="1.2" />
                <ellipse cx={184 + eyeOffset.x} cy={144 + eyeOffset.y} rx="5.5" ry="7" fill="#18181b" />
                {/* Large Glossy Anime Highlights */}
                <ellipse cx={182 + eyeOffset.x} cy={141 + eyeOffset.y} rx="3" ry="4" fill="#ffffff" />
                <circle cx={186 + eyeOffset.x} cy={147 + eyeOffset.y} r="1.5" fill="#ffffff" />

                {/* Right Eye */}
                <ellipse cx="216" cy="144" rx="7.5" ry="9" fill="#09090b" stroke="#71717a" strokeWidth="1.2" />
                <ellipse cx={216 + eyeOffset.x} cy={144 + eyeOffset.y} rx="5.5" ry="7" fill="#18181b" />
                {/* Large Glossy Anime Highlights */}
                <ellipse cx={214 + eyeOffset.x} cy={141 + eyeOffset.y} rx="3" ry="4" fill="#ffffff" />
                <circle cx={218 + eyeOffset.x} cy={147 + eyeOffset.y} r="1.5" fill="#ffffff" />
              </>
            ) : expression === 'wink' ? (
              <>
                {/* Left Eye Winking Arc */}
                <path d="M 176,145 Q 184,136 192,145" stroke="#f4f4f5" strokeWidth="3" strokeLinecap="round" fill="none" />
                {/* Right Eye Open */}
                <ellipse cx="216" cy="144" rx="7.5" ry="9" fill="#09090b" stroke="#71717a" strokeWidth="1.2" />
                <ellipse cx="216" cy="144" rx="5.5" ry="7" fill="#18181b" />
                <ellipse cx="214" cy="141" rx="3" ry="4" fill="#ffffff" />
                <circle cx="218" cy="147" r="1.5" fill="#ffffff" />
              </>
            ) : (
              /* Happy Purring Dual Arcs (^ w ^) */
              <>
                <path d="M 176,145 Q 184,135 192,145" stroke="#f4f4f5" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M 208,145 Q 216,135 224,145" stroke="#f4f4f5" strokeWidth="3" strokeLinecap="round" fill="none" />
                {/* Rosy Anime Cheeks */}
                <ellipse cx="172" cy="153" rx="4" ry="2" fill="#fda4af" opacity="0.75" />
                <ellipse cx="228" cy="153" rx="4" ry="2" fill="#fda4af" opacity="0.75" />
              </>
            )}

            {/* Cute Nose and "w" Mouth */}
            <polygon points="200,150 197.5,147 202.5,147" fill="#fda4af" />
            <path d="M 195,152 Q 197.5,155 200,152 Q 202.5,155 205,152" stroke="#a1a1aa" strokeWidth="1.4" fill="none" strokeLinecap="round" />

            {/* Delicate Cat Whiskers */}
            <line x1="172" y1="148" x2="152" y2="146" stroke="#52525b" strokeWidth="1" strokeLinecap="round" />
            <line x1="172" y1="152" x2="150" y2="154" stroke="#52525b" strokeWidth="1" strokeLinecap="round" />
            <line x1="228" y1="148" x2="248" y2="146" stroke="#52525b" strokeWidth="1" strokeLinecap="round" />
            <line x1="228" y1="152" x2="250" y2="154" stroke="#52525b" strokeWidth="1" strokeLinecap="round" />

            {/* Front Paws resting on desk with Pink Toe Beans */}
            {/* Left Paw */}
            <g transform="translate(172, 174)">
              <ellipse cx="8" cy="8" rx="9" ry="7" fill="#18181b" stroke="#27272a" strokeWidth="1.2" />
              {/* Pink pads */}
              <circle cx="8" cy="10" r="2.8" fill="#fda4af" />
              <circle cx="4" cy="5" r="1.5" fill="#fda4af" />
              <circle cx="8" cy="4" r="1.5" fill="#fda4af" />
              <circle cx="12" cy="5" r="1.5" fill="#fda4af" />
            </g>
            {/* Right Paw */}
            <g transform="translate(212, 174)">
              <ellipse cx="8" cy="8" rx="9" ry="7" fill="#18181b" stroke="#27272a" strokeWidth="1.2" />
              {/* Pink pads */}
              <circle cx="8" cy="10" r="2.8" fill="#fda4af" />
              <circle cx="4" cy="5" r="1.5" fill="#fda4af" />
              <circle cx="8" cy="4" r="1.5" fill="#fda4af" />
              <circle cx="12" cy="5" r="1.5" fill="#fda4af" />
            </g>

            {/* 4. EQUIPPED COSMETICS (Precisely positioned for 400x220 canvas) */}
            {/* Crown */}
            {gamification.equippedCosmetic === 'crown' && (
              <g filter="drop-shadow(0 0 8px rgba(250, 204, 21, 0.8))">
                <path
                  d="M 186,108 L 193,116 L 200,102 L 207,116 L 214,108 L 211,122 L 189,122 Z"
                  fill="url(#crown-gold-grad)"
                  stroke="#fef08a"
                  strokeWidth="1.5"
                />
                <circle cx="186" cy="108" r="2" fill="#ef4444" />
                <circle cx="200" cy="102" r="2.5" fill="#3b82f6" />
                <circle cx="214" cy="108" r="2" fill="#10b981" />
              </g>
            )}

            {/* Cyber Glasses */}
            {gamification.equippedCosmetic === 'glasses' && (
              <g filter="drop-shadow(0 0 6px #38bdf8)">
                <rect x="174" y="137" width="20" height="15" rx="4" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" strokeWidth="2" />
                <rect x="206" y="137" width="20" height="15" rx="4" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" strokeWidth="2" />
                <line x1="194" y1="144" x2="206" y2="144" stroke="#38bdf8" strokeWidth="2.5" />
                <line x1="162" y1="142" x2="174" y2="142" stroke="#38bdf8" strokeWidth="1.8" />
                <line x1="226" y1="142" x2="238" y2="142" stroke="#38bdf8" strokeWidth="1.8" />
              </g>
            )}

            {/* Cozy Knitted Scarf */}
            {gamification.equippedCosmetic === 'scarf' && (
              <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.6))">
                <path
                  d="M 172,164 Q 200,175 228,164 L 225,173 Q 200,183 175,173 Z"
                  fill="#e11d48"
                  stroke="#fda4af"
                  strokeWidth="1.5"
                />
                {/* Scarf hanging end */}
                <path
                  d="M 214,171 L 222,171 L 220,192 L 212,192 Z"
                  fill="#e11d48"
                  stroke="#fda4af"
                  strokeWidth="1.2"
                />
                {/* Fringes */}
                <line x1="213" y1="192" x2="213" y2="197" stroke="#fda4af" strokeWidth="1.5" />
                <line x1="216" y1="192" x2="216" y2="197" stroke="#fda4af" strokeWidth="1.5" />
                <line x1="219" y1="192" x2="219" y2="197" stroke="#fda4af" strokeWidth="1.5" />
              </g>
            )}
          </svg>
        )}
      </motion.div>
    </div>
  );
};
