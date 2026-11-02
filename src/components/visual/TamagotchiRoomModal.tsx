import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Utensils, 
  Shirt, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Crown,
  Glasses,
  Check,
  CircleDot
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { CyberCatMascot } from './CyberCatMascot';
import { CoupleGamification } from '../../types/nexus';
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
    feedMascot, 
    equipCosmetic, 
    soundMuted, 
    setSoundMuted,
  } = useNexusStore();

  if (!isOpen) return null;

  // Real reactive treat count from gamification store
  const treatsCount = gamification.treats !== undefined ? gamification.treats : 18;

  const cosmetics: { 
    id: CoupleGamification['equippedCosmetic']; 
    label: string; 
    icon: typeof Sparkles;
  }[] = [
    { id: 'none', label: 'Обычный', icon: CircleDot },
    { id: 'crown', label: 'Корона', icon: Crown },
    { id: 'glasses', label: 'Очки', icon: Glasses },
    { id: 'scarf', label: 'Шарфик', icon: Sparkles },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
      />

      {/* Modal Surface */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-white/[0.08] bg-[#09090b] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <span>Маскот пары: Кот Нексус</span>
                <span className="font-mono text-xs text-zinc-400">
                  Lv. {gamification.level}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500">
                Талисман уюта, прогресс заботы и угощения
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundMuted(!soundMuted)}
              className={`rounded-lg p-1.5 transition-colors border ${
                !soundMuted
                  ? 'bg-white/[0.08] text-zinc-200 border-white/[0.12]'
                  : 'bg-white/[0.02] text-zinc-500 border-white/[0.06] hover:text-zinc-200'
              }`}
              title={soundMuted ? 'Включить звуковые эффекты UI' : 'Заглушить звуковые эффекты UI'}
            >
              {soundMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-zinc-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mascot Center Stage */}
        <div className="p-5 flex flex-col items-center justify-center space-y-3.5 bg-zinc-950/40">
          <div className="relative">
            <CyberCatMascot
              gamification={gamification}
              onEquipCosmetic={equipCosmetic}
            />
          </div>

          {/* Level Title without emoji */}
          <div className="text-center">
            <span className="font-mono text-xs font-semibold text-zinc-200">
              «{gamification.levelTitle.replace(/✨|🐱|🐾/g, '').trim()}»
            </span>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Нажмите на котика, чтобы погладить и услышать мурчание
            </p>
          </div>

          {/* Feeding Action Panel */}
          <div className="w-full rounded-lg border border-white/[0.06] bg-zinc-900/60 p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-400">
                Рыбок в запасе: <strong className="text-zinc-100 font-semibold">{treatsCount}</strong>
                <span className="block text-[10px] text-zinc-500">(+1 рыбка за каждую выполненную задачу)</span>
              </span>

              <button
                type="button"
                disabled={treatsCount <= 0}
                onClick={feedMascot}
                className="flex items-center gap-1.5 rounded-md bg-white hover:bg-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-950 disabled:opacity-30 transition-colors shadow-sm cursor-pointer"
              >
                <Utensils className="h-3.5 w-3.5 stroke-[2]" />
                <span>Покормить (+20 XP)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Wardrobe Selector without emojis */}
        <div className="border-t border-white/[0.06] p-5 bg-zinc-950/80 space-y-2.5">
          <div className="flex items-center gap-2">
            <Shirt className="h-3.5 w-3.5 text-zinc-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Гардероб & Аксессуары
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {cosmetics.map((cosmetic) => {
              const Icon = cosmetic.icon;
              const isEquipped = gamification.equippedCosmetic === cosmetic.id;

              return (
                <button
                  key={cosmetic.id}
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    equipCosmetic(cosmetic.id);
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-lg p-2.5 text-xs font-medium text-center transition-colors border ${
                    isEquipped
                      ? 'border-white/30 bg-white/[0.1] text-zinc-100'
                      : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/[0.12] hover:text-zinc-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[11px] leading-tight line-clamp-1">{cosmetic.label}</span>
                  {isEquipped && (
                    <span className="text-[9px] text-zinc-400 font-mono">Надето</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
