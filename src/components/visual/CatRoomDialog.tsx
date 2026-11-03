import React, { useState } from 'react';
import { 
  Sparkles, 
  Crown, 
  Glasses, 
  CircleDot, 
  Volume2, 
  VolumeX, 
  Fish
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { useNexusStore } from '@/store/useNexusStore';
import { CyberCatMascot } from './CyberCatMascot';
import { CoupleGamification } from '@/types/nexus';
import { soundEffects } from '@/utils/soundEffects';

interface CatRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CatRoomDialog: React.FC<CatRoomDialogProps> = ({
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

  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);

  const treatsCount = gamification.treats !== undefined ? gamification.treats : 18;

  const cosmetics: { 
    id: CoupleGamification['equippedCosmetic']; 
    label: string; 
    icon: any;
  }[] = [
    { id: 'none', label: 'Обычный', icon: CircleDot },
    { id: 'crown', label: 'Корона', icon: Crown },
    { id: 'glasses', label: 'Очки', icon: Glasses },
    { id: 'scarf', label: 'Шарфик', icon: Sparkles },
  ];

  const handleFeed = () => {
    feedMascot();
    try {
      soundEffects.playPurr();
    } catch {}
    const newH = { id: Date.now() + Math.random(), x: (Math.random() - 0.5) * 40 };
    setHearts(prev => [...prev, newH]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newH.id));
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-[#0B0D16]/95 backdrop-blur-2xl rounded-[32px] ring-1 ring-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.85)] border-0 text-zinc-100">
        <DialogTitle className="sr-only">Комната Котика Нексуса</DialogTitle>
        <DialogDescription className="sr-only">Маскот пары Егора & Ани</DialogDescription>

        {/* Header Strip: Zero bottom border, clean typography */}
        <div className="flex items-center justify-between p-5 px-6 border-0 bg-transparent">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-semibold text-white tracking-tight">Комната Котика Нексуса</h3>
                <span className="rounded-full bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/30 text-xs px-2.5 py-0.5 tabular-nums font-medium">
                  Уровень {gamification.level} · {gamification.xp} XP
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Маскот пары Егора & Ани · уют и совместные достижения
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSoundMuted(!soundMuted)}
            className="h-8 w-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border-0"
            title={soundMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {soundMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Room Illustration Viewport */}
        <div className="relative px-6 py-2 flex flex-col items-center justify-center bg-transparent">
          {/* Floating Hearts Container */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {hearts.map((h) => (
              <div
                key={h.id}
                style={{ left: `calc(50% + ${h.x}px)` }}
                className="absolute top-1/2 text-rose-400 text-sm animate-bounce"
              >
                ♡
              </div>
            ))}
          </div>

          <CyberCatMascot
            gamification={gamification}
            onEquipCosmetic={equipCosmetic}
            compact={false}
          />
        </div>

        {/* Stats & Actions */}
        <div className="p-6 pt-3 space-y-4">
          {/* Treats & Feeding: Seamless capsule WITHOUT crude borders */}
          <div className="rounded-2xl bg-white/[0.035] p-4 flex items-center justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] border-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-amber-500/10 text-amber-400 shrink-0">
                <Fish className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-200">Угощения котика</div>
                <p className="text-[11px] text-zinc-400">
                  За каждую выполненную задачу дается 1 рыбка
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFeed}
              disabled={treatsCount <= 0}
              className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950 font-semibold px-5 py-2.5 shadow-[0_0_25px_rgba(251,191,36,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span className="text-xs">Покормить</span>
              <span className="rounded-full bg-black/30 text-white px-2 py-0.5 text-[10px] font-bold tabular-nums">
                {treatsCount}
              </span>
            </button>
          </div>

          {/* Wardrobe Cosmetics: 4 tactile glass cards without crude white borders */}
          <div className="space-y-2.5">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Гардероб Котика
            </span>
            <div className="grid grid-cols-4 gap-2.5">
              {cosmetics.map((item) => {
                const Icon = item.icon;
                const isEquipped = gamification.equippedCosmetic === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      equipCosmetic(item.id);
                      try { soundEffects.playClick(); } catch {}
                    }}
                    className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer border-0 ${
                      isEquipped
                        ? 'bg-indigo-500/15 text-white ring-1 ring-indigo-400/40 shadow-[0_0_25px_rgba(99,102,241,0.2)] font-semibold'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isEquipped ? 'text-indigo-400' : 'text-zinc-400'}`} />
                    <span className="text-xs leading-none">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
