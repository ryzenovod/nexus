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
            className="absolute top-2 z-30 rounded-2xl border border-white/10 bg-[#0B0D16]/90 px-3.5 py-1.5 shadow-xl backdrop-blur-xl"
          >
            <p className="text-xs font-medium text-zinc-100 tracking-tight whitespace-nowrap">
              {speechQuote}
            </p>
            <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#0B0D16]" />
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
            className="rounded-2xl overflow-hidden shadow-2xl max-w-[460px] border-0"
          >
            <defs>
              {/* Sunset Twilight Window Gradient */}
              <linearGradient id="lofi-sky-grad" x1="200" y1="0" x2="200" y2="168" gradientUnits="userSpaceOnUse">
                <stop stopColor="#070913" />
                <stop offset="0.4" stopColor="#0f132b" />
                <stop offset="0.75" stopColor="#1a1738" />
                <stop offset="1" stopColor="#28173d" />
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
            <rect width="400" height="168" fill="url(#lofi-sky-grad)" />

            {/* Distant Moscow Skyline Silhouettes */}
            <path
              d="M 0,168 L 0,140 L 18,140 L 18,126 L 38,126 L 38,144 L 56,144 L 56,112 L 64,112 L 64,88 L 65,58 L 66,88 L 66,112 L 74,112 L 74,148 L 105,148 L 105,136 L 135,136 L 135,124 L 152,124 L 152,150 L 245,150 L 245,132 L 265,118 L 275,118 L 285,132 L 285,148 L 315,148 L 315,130 L 338,130 L 338,142 L 370,142 L 370,134 L 400,134 L 400,168 Z"
              fill="#0b0d18"
              opacity="0.95"
            />
            {/* Ostankino blinking red beacon */}
            <circle cx="65.5" cy="58" r="1.5" fill="#ef4444" filter="drop-shadow(0 0 5px #ef4444)">
              <animate attributeName="opacity" values="1;0.2;1" dur="1.6s" repeatCount="indefinite" />
            </circle>
            {/* Tiny City Window Lights */}
            <circle cx="28" cy="134" r="1" fill="#fef08a" opacity="0.6" />
            <circle cx="120" cy="142" r="1" fill="#fef08a" opacity="0.75" />
            <circle cx="144" cy="130" r="1" fill="#67e8f9" opacity="0.6" />
            <circle cx="270" cy="126" r="1.2" fill="#fef08a" opacity="0.8" />
            <circle cx="326" cy="137" r="1" fill="#f472b6" opacity="0.5" />

            {/* Telephone / Power lines cutting through sunset sky */}
            <path d="M 0,105 Q 200,126 400,110" stroke="#25163a" strokeWidth="1" opacity="0.6" fill="none" />
            <path d="M 0,117 Q 200,138 400,122" stroke="#25163a" strokeWidth="0.8" opacity="0.5" fill="none" />

            {/* Stars & Constellations with gentle twinkling */}
            <circle cx="50" cy="26" r="1.2" fill="#ffffff" opacity="0.9">
              <animate attributeName="opacity" values="0.9;0.35;0.9" dur="3.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="120" cy="38" r="1" fill="#fef08a" opacity="0.85">
              <animate attributeName="opacity" values="0.4;0.95;0.4" dur="2.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="170" cy="18" r="1.4" fill="#ffffff" opacity="0.75" />
            <circle cx="230" cy="30" r="1.1" fill="#fef08a" opacity="0.9">
              <animate attributeName="opacity" values="0.9;0.25;0.9" dur="3.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="290" cy="16" r="1.5" fill="#ffffff" opacity="0.8" />
            <circle cx="360" cy="35" r="1" fill="#fef08a" opacity="0.7">
              <animate attributeName="opacity" values="0.3;0.85;0.3" dur="2.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="315" cy="58" r="1.2" fill="#ffffff" opacity="0.6">
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="4.2s" repeatCount="indefinite" />
            </circle>

            {/* Falling Shooting Star Streak */}
            <line x1="270" y1="18" x2="225" y2="40" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
            <circle cx="225" cy="40" r="2" fill="#ffffff" opacity="0.9" />

            {/* Crescent Moon with Lunar Glow */}
            <circle cx="75" cy="55" r="30" fill="url(#lofi-moon-glow)" />
            <path
              d="M 82,42 A 16,16 0 0,0 68,70 A 13.5,13.5 0 0,1 82,42 Z"
              fill="#fef08a"
              filter="drop-shadow(0 0 8px rgba(254, 240, 138, 0.7))"
            />

            {/* Window Wooden Frame */}
            <rect x="0" y="0" width="400" height="168" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
            <line x1="200" y1="0" x2="200" y2="168" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />

            {/* 2. COZY WORKSPACE WOODEN DESK WITH PERSPECTIVE */}
            <rect x="0" y="168" width="400" height="52" fill="#111219" stroke="none" />
            <line x1="0" y1="168" x2="400" y2="168" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
            <line x1="0" y1="170" x2="400" y2="170" stroke="#1d1e2a" strokeWidth="1" />

            {/* Ambient Warm Lamp Glow spreading on Desk */}
            <ellipse cx="340" cy="176" rx="60" ry="26" fill="url(#lamp-light-cone)" />

            {/* Left Decor: Monstera Plant in Ceramic Pot resting ON desk */}
            <g transform="translate(18, 118)">
              {/* Pot Base Contact Shadow */}
              <ellipse cx="25" cy="53" rx="15" ry="4" fill="#000000" opacity="0.65" />
              {/* Pot Body */}
              <polygon points="12,53 38,53 34,25 16,25" fill="#2d1b16" stroke="#4a2e26" strokeWidth="1" />
              {/* Monstera Leaves */}
              <path d="M 14,27 C 5,16 4,-2 18,2 C 18,10 24,19 25,27 Z" fill="#15803d" />
              <path d="M 25,26 C 25,12 38,-4 44,8 C 40,17 34,23 25,26 Z" fill="#16a34a" />
              <path d="M 25,25 C 18,10 24,-12 30,-2 C 32,9 28,19 25,25 Z" fill="#22c55e" />
              {/* Pot top soil */}
              <ellipse cx="25" cy="25" rx="9" ry="2.5" fill="#190e0b" />
            </g>

            {/* Sleek Frosted Level Badge */}
            <g transform="translate(18, 76)">
              <rect width="72" height="20" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <circle cx="28" cy="10" r="2.5" fill="#34d399" />
              <text x="51" y="13.5" fill="#f4f4f5" fontSize="9" fontFamily="Inter, system-ui, -apple-system, sans-serif" fontWeight="600" textAnchor="middle" letterSpacing="0.4">
                LVL {gamification.level || 1}
              </text>
            </g>

            {/* Right Decor: Warm Desk Lamp firmly resting ON desk */}
            <g transform="translate(325, 100)">
              {/* Stand Base Shadow */}
              <ellipse cx="20" cy="71" rx="14" ry="4" fill="#000000" opacity="0.6" />
              {/* Stand */}
              <line x1="20" y1="69" x2="20" y2="28" stroke="#3f3f46" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="20" cy="69" rx="11" ry="3.5" fill="#27272a" stroke="#52525b" strokeWidth="1.2" />
              {/* Lampshade */}
              <path d="M 6,28 L 34,28 L 27,9 L 13,9 Z" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1.2" />
              {/* Bulb Light */}
              <circle cx="20" cy="30" r="4.5" fill="#fef08a" filter="drop-shadow(0 0 14px rgba(245, 158, 11, 0.9))" />
            </g>

            {/* Steaming Mug resting ON desk */}
            <g transform="translate(288, 153)">
              {/* Mug Contact Shadow */}
              <ellipse cx="8" cy="18" rx="10" ry="3" fill="#000000" opacity="0.6" />
              <rect x="0" y="3" width="16" height="15" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
              <path d="M 16,6 C 20,6 20,13 16,13" stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              {/* Animated wisps of steam */}
              <path d="M 5,0 Q 2,-5 6,-9" stroke="rgba(255,255,255,0.45)" strokeWidth="1" opacity="0.7" fill="none" strokeLinecap="round">
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.4s" repeatCount="indefinite" />
                <animateTransform attributeName="transform" type="translate" values="0 0; 0 -3; 0 0" dur="2.4s" repeatCount="indefinite" />
              </path>
              <path d="M 11,0 Q 14,-5 10,-9" stroke="rgba(255,255,255,0.45)" strokeWidth="1" opacity="0.7" fill="none" strokeLinecap="round">
                <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.8s" repeatCount="indefinite" />
                <animateTransform attributeName="transform" type="translate" values="0 0; 0 -2.5; 0 0" dur="2.8s" repeatCount="indefinite" />
              </path>
            </g>

            {/* Center: Glowing Keyboard under Cat's paws */}
            <rect x="150" y="186" width="100" height="24" rx="4" fill="#09090b" stroke="#3f3f46" strokeWidth="1.2" />
            <line x1="156" y1="192" x2="244" y2="192" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" filter="drop-shadow(0 0 3px #a855f7)" />
            <line x1="156" y1="198" x2="244" y2="198" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" filter="drop-shadow(0 0 3px #38bdf8)" />
            <line x1="156" y1="204" x2="244" y2="204" stroke="#ec4899" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" filter="drop-shadow(0 0 3px #ec4899)" />

            {/* 3. FLUFFY LOFI ANIME CAT WITH GENTLE BREATHING ANIMATION & SOFT NEON GLOW */}
            <motion.g
              animate={{
                y: [0, -2, 0],
                rotate: [0, 0.35, 0, -0.35, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 4.2,
                ease: 'easeInOut',
              }}
              style={{
                transformOrigin: '200px 172px',
                filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.7)) drop-shadow(0 0 14px rgba(192, 132, 252, 0.22))',
              }}
            >
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
            </motion.g>
          </svg>
        )}
      </motion.div>
    </div>
  );
};
