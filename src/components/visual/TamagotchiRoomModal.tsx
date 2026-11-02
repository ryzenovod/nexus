import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Heart, 
  Zap, 
  Crown, 
  Glasses, 
  Volume2, 
  VolumeX, 
  Award,
  Shirt,
  Utensils
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { CyberCatMascot } from './CyberCatMascot';
import { soundEffects } from '../../utils/soundEffects';

interface TamagotchiRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TamagotchiRoomModal: React.FC<TamagotchiRoomModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    gamification,
    equipCosmetic,
    feedMascot,
    soundMuted,
    setSoundMuted,
  } = useNexusStore();

  if (!isOpen) return null;

  const cosmetics = [
    { id: 'none' as const, label: 'Чистый кибер-котик', icon: '🐾', minLevel: 1 },
    { id: 'glasses' as const, label: 'Очки ботаника ВШЭ', icon: '🤓', minLevel: 1 },
    { id: 'crown' as const, label: 'Золотая корона Лидера', icon: '👑', minLevel: 1 },
    { id: 'scarf' as const, label: 'Тёплый шарфик (Москва)', icon: '🧣', minLevel: 1 },
    { id: 'cat_headphones' as const, label: 'Razer Purple Наушники', icon: '🎧', minLevel: 1 },
    { id: 'wings' as const, label: 'Кибер-крылья', icon: '🦋', minLevel: 1 },
  ];

  const treatsCount = gamification.treats || 0;
  const hungerLevel = gamification.hungerLevel || 80;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-2xl"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-purple-500/30 bg-[#0d091e] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-transparent">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🐱</span>
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                Тамагочи-Комната Котика Нексуса
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300 border border-purple-500/30">
                  Ур. {gamification.level}
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Забота о талисмане пары, примерка гардероба и угощения
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundMuted(!soundMuted)}
              className={`rounded-xl p-2 transition-colors border ${
                !soundMuted
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-white/5 text-zinc-500 border-white/10 hover:text-zinc-200'
              }`}
              title={soundMuted ? 'Включить звуковые эффекты UI' : 'Заглушить звуковые эффекты UI'}
            >
              {soundMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-zinc-400 hover:bg-white/10 hover:text-zinc-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mascot Center Stage */}
        <div className="p-6 flex flex-col items-center justify-center space-y-4 bg-gradient-to-b from-transparent to-black/40">
          <div className="relative">
            <CyberCatMascot
              gamification={gamification}
              onEquipCosmetic={equipCosmetic}
            />
          </div>

          {/* Level Title */}
          <div className="text-center">
            <h4 className="text-sm font-bold text-amber-300 flex items-center justify-center gap-1.5">
              <Zap className="h-4 w-4 fill-current" />
              <span>{gamification.levelTitle}</span>
            </h4>
            <span className="text-xs text-zinc-400 font-mono">
              Опыт пары: {gamification.xp} / {gamification.nextLevelXp} XP
            </span>
          </div>

          {/* Hunger / Happiness Bar */}
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/50 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 flex items-center gap-1.5 font-medium">
                <Heart className="h-3.5 w-3.5 text-rose-400 fill-current" />
                Сытость и счастье котика:
              </span>
              <span className="font-mono font-bold text-rose-300">{hungerLevel}%</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 transition-all duration-300"
                style={{ width: `${hungerLevel}%` }}
              />
            </div>

            {/* Feed Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="font-mono text-xs text-zinc-400">
                Рыбок в запасе: <strong className="text-amber-300">{treatsCount} 🐟</strong>
                <span className="block text-[10px] text-zinc-500">(дается за каждое выполненное дело)</span>
              </span>

              <button
                type="button"
                disabled={treatsCount <= 0}
                onClick={feedMascot}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-1.5 text-xs font-bold text-black shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all"
              >
                <Utensils className="h-3.5 w-3.5" />
                <span>Покормить (+20 XP)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Wardrobe Selector */}
        <div className="border-t border-white/10 p-6 bg-black/30 space-y-3">
          <div className="flex items-center gap-2">
            <Shirt className="h-4 w-4 text-purple-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Гардероб & Аксессуары
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {cosmetics.map((cosmetic) => {
              const isEquipped = gamification.equippedCosmetic === cosmetic.id;

              return (
                <button
                  key={cosmetic.id}
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    equipCosmetic(cosmetic.id);
                  }}
                  className={`flex items-center gap-2.5 rounded-xl p-2.5 text-xs font-medium text-left transition-all border ${
                    isEquipped
                      ? 'border-purple-500/60 bg-purple-500/20 text-purple-200 shadow-md shadow-purple-500/10'
                      : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-xl shrink-0">{cosmetic.icon}</span>
                  <div className="truncate">
                    <span className="block truncate font-semibold">{cosmetic.label}</span>
                    {isEquipped && (
                      <span className="text-[10px] text-amber-300 font-mono">Надето</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
