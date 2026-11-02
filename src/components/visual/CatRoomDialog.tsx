import React, { useState } from 'react';
import { 
  Sparkles, 
  Crown, 
  Glasses, 
  CircleDot, 
  Volume2, 
  VolumeX, 
  Heart,
  Fish
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  const xpPercent = Math.min(100, Math.round((gamification.xp / gamification.nextLevelXp) * 100));

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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card border-border">
        {/* Header Strip */}
        <div className="flex items-center justify-between p-4 px-6 border-b bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">Комната Котика Нексуса</h3>
                <Badge variant="outline" className="text-amber-400 border-amber-400/30 text-[10px] font-mono">
                  Уровень {gamification.level}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Маскот пары Егора & Ани · уют и совместные достижения
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundMuted(!soundMuted)}
            className="h-8 w-8 p-0 mr-8 text-muted-foreground hover:text-foreground cursor-pointer"
            title={soundMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {soundMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Room Illustration Viewport */}
        <div className="relative p-6 pt-4 flex flex-col items-center justify-center bg-black/40">
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
        <div className="p-5 space-y-4 bg-card">
          {/* Couple XP Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Прогресс заботы пары</span>
              <span className="font-mono text-muted-foreground">
                {gamification.xp} / {gamification.nextLevelXp} XP ({xpPercent}%)
              </span>
            </div>
            <Progress value={xpPercent} className="h-2" />
          </div>

          {/* Treats & Feeding */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="text-lg">🐟</span>
              <div>
                <span className="text-xs font-semibold">Угощения котика</span>
                <p className="text-[10px] text-muted-foreground">
                  За каждую выполненную задачу дается 1 рыбка
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleFeed}
              disabled={treatsCount <= 0}
              className="h-8 text-xs gap-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold"
            >
              <span>Покормить</span>
              <Badge variant="secondary" className="h-4 px-1.5 text-[10px] bg-zinc-900/40 text-zinc-100">
                {treatsCount}
              </Badge>
            </Button>
          </div>

          {/* Wardrobe Cosmetics */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Гардероб Котика
            </span>
            <div className="grid grid-cols-4 gap-2">
              {cosmetics.map((item) => {
                const Icon = item.icon;
                const isEquipped = gamification.equippedCosmetic === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => equipCosmetic(item.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs gap-1.5 transition-all cursor-pointer ${
                      isEquipped
                        ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                        : 'border-border bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px]">{item.label}</span>
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
