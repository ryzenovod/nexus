import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  Plus, 
  Home, 
  ExternalLink,
  Trash2,
  Pencil,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { useNexusStore } from '@/store/useNexusStore';
import { soundEffects } from '@/utils/soundEffects';

export const ShadcnWishlist: React.FC = () => {
  const { 
    wishlist, 
    addWishlistItem, 
    updateWishlistItem,
    voteWishlist, 
    deleteWishlistItem, 
    convertWishlistToTask,
    blueprintPins,
    updatePinStatus
  } = useNexusStore();

  const [selectedFilter, setSelectedFilter] = useState<string>('Все');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('Дом');

  // Edit wish state for full dialog
  const [editingWish, setEditingWish] = useState<any | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editCategory, setEditCategory] = useState('Дом');

  // Filter out non-material plans
  const displayWishlist = useMemo(() => {
    return wishlist.filter((item) => {
      const t = item.title.toLowerCase();
      if (
        t.includes('4 ноября') ||
        t.includes('что делаем') ||
        t.includes('свидани') ||
        t.includes('план на выходные') ||
        t.includes('кинотеатр') ||
        t.includes('поездка')
      ) {
        return false;
      }
      return true;
    });
  }, [wishlist]);

  // Total sums calculation
  const totalApprovedSum = useMemo(() => {
    return displayWishlist
      .filter((it) => it.egorVote === 'yes' && it.anyaVote === 'yes')
      .reduce((sum, it) => sum + (it.estimatedPrice || 0), 0);
  }, [displayWishlist]);

  const totalApprovedCount = useMemo(() => {
    return displayWishlist.filter((it) => it.egorVote === 'yes' && it.anyaVote === 'yes').length;
  }, [displayWishlist]);

  const totalWishlistSum = useMemo(() => {
    return displayWishlist.reduce((sum, it) => sum + (it.estimatedPrice || 0), 0);
  }, [displayWishlist]);

  // Floating filter tabs
  const filterTabs = [
    { id: 'Все', label: 'Все', count: displayWishlist.length },
    { id: 'Одобрено ✨', label: 'Одобрено ✨', count: totalApprovedCount },
    { id: 'Кухня', label: 'Кухня', count: displayWishlist.filter(it => it.category?.toLowerCase().includes('кухн') || it.title.toLowerCase().includes('кухн')).length },
    { id: 'Ванная', label: 'Ванная', count: displayWishlist.filter(it => it.category?.toLowerCase().includes('ванн') || it.title.toLowerCase().includes('ванн')).length },
    { id: 'Комната', label: 'Комната', count: displayWishlist.filter(it => it.category?.toLowerCase().includes('комнат') || it.category?.toLowerCase().includes('спальн') || it.title.toLowerCase().includes('комнат')).length },
    { id: 'Балкон', label: 'Балкон', count: displayWishlist.filter(it => it.category?.toLowerCase().includes('балкон') || it.title.toLowerCase().includes('балкон')).length },
  ];

  const filteredWishlist = useMemo(() => {
    return displayWishlist.filter(item => {
      if (selectedFilter === 'Одобрено ✨') {
        return item.egorVote === 'yes' && item.anyaVote === 'yes';
      }
      if (selectedFilter === 'Кухня') {
        return item.category?.toLowerCase().includes('кухн') || item.title.toLowerCase().includes('кухн');
      }
      if (selectedFilter === 'Ванная') {
        return item.category?.toLowerCase().includes('ванн') || item.title.toLowerCase().includes('ванн');
      }
      if (selectedFilter === 'Комната') {
        return item.category?.toLowerCase().includes('комнат') || item.category?.toLowerCase().includes('спальн') || item.title.toLowerCase().includes('комнат');
      }
      if (selectedFilter === 'Балкон') {
        return item.category?.toLowerCase().includes('балкон') || item.title.toLowerCase().includes('балкон');
      }
      return true;
    });
  }, [displayWishlist, selectedFilter]);

  const getCategoryBadgeClass = (category?: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('кухн')) return 'bg-amber-500/15 text-amber-300';
    if (cat.includes('ванн')) return 'bg-cyan-500/15 text-cyan-300';
    if (cat.includes('комнат') || cat.includes('спальн') || cat.includes('гостин')) return 'bg-indigo-500/15 text-indigo-300';
    if (cat.includes('балкон')) return 'bg-emerald-500/15 text-emerald-300';
    if (cat.includes('уют') || cat.includes('декор')) return 'bg-rose-500/15 text-rose-300';
    return 'bg-white/[0.06] text-zinc-300';
  };

  const handleVote = (itemId: string, voter: 'egor' | 'anya', vote: 'yes' | 'no') => {
    const currentItem = wishlist.find(w => w.id === itemId);
    const currentVote = voter === 'egor' ? currentItem?.egorVote : currentItem?.anyaVote;
    const newVote = currentVote === vote ? (null as any) : vote;
    voteWishlist(itemId, voter, newVote);
    try {
      if (newVote === 'yes') {
        soundEffects.playSuccess();
      } else {
        soundEffects.playClick();
      }
    } catch {}
  };

  const handleStartEdit = (item: any) => {
    setEditingWish(item);
    setEditPrice(item.estimatedPrice ? String(item.estimatedPrice) : '');
    setEditLink(item.link || '');
    setEditCategory(item.category || 'Дом');
    try {
      soundEffects.playClick();
    } catch {}
  };

  const handleSaveEdit = () => {
    if (!editingWish) return;
    updateWishlistItem(editingWish.id, {
      estimatedPrice: parseFloat(editPrice) || 0,
      link: editLink.trim() || undefined,
      category: editCategory,
    });
    setEditingWish(null);
    try {
      soundEffects.playClick();
    } catch {}
  };

  const handleAddWish = () => {
    if (!newTitle.trim()) return;
    addWishlistItem({
      title: newTitle.trim(),
      estimatedPrice: parseFloat(newPrice) || 0,
      link: newUrl.trim() || undefined,
      category: newCategory,
      addedBy: 'together',
    });
    setNewTitle('');
    setNewPrice('');
    setNewUrl('');
    setIsAddModalOpen(false);
    try {
      soundEffects.playSuccess();
    } catch {}
  };

  return (
    <div className="flex-1 flex flex-col space-y-8 max-w-[1400px] mx-auto w-full pb-8">
      {/* ── 1. WISHLIST HEADER & SHOWCASE (No Tables, Google/Family Bento Vitrine) ── */}
      <div className="nexus-surface p-7 sm:p-8 space-y-6">
        {/* Header Strip with Metrics and Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-400 fill-rose-500/20" />
              <h3 className="text-xl font-semibold tracking-tight text-white">
                Вишлист и обустройство дома
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Совместные покупки: если оба проголосовали «За», вещь получает статус «Одобрено парой»
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Automatic Sum of Approved Purchases */}
            <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-1.5 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Одобрено: <b className="tabular-nums font-semibold">{totalApprovedSum.toLocaleString('ru-RU')} ₽</b> ({totalApprovedCount} шт.)</span>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-white/[0.04] text-zinc-300 text-xs flex items-center gap-1.5">
              <span>Всего: <b className="tabular-nums font-semibold">{totalWishlistSum.toLocaleString('ru-RU')} ₽</b> ({displayWishlist.length} шт.)</span>
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-full bg-white text-zinc-950 hover:bg-zinc-100 font-medium px-5 py-2.5 text-xs shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all flex items-center gap-1.5 cursor-pointer border-0"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Добавить желание</span>
            </button>
          </div>
        </div>

        {/* Floating Zone Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {filterTabs.map((tab) => {
            const isActive = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border-0 ${
                  isActive
                    ? 'bg-white text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.2)] font-semibold'
                    : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[11px] tabular-nums ${isActive ? 'text-zinc-600' : 'text-zinc-500'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── 2. MODULAR BENTO CARDS GRID (100% Zero <table>, Zero borders) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          {filteredWishlist.length === 0 ? (
            <div className="col-span-full py-16 text-center text-sm text-zinc-500">
              В этой категории желаний пока нет. Нажмите «+ Добавить желание», чтобы начать список!
            </div>
          ) : (
            filteredWishlist.map((item) => {
              const isApproved = item.egorVote === 'yes' && item.anyaVote === 'yes';

              return (
                <div
                  key={item.id}
                  className={`group relative rounded-[22px] bg-[#10131F]/80 hover:bg-[#151929]/95 p-4 sm:px-5 sm:py-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.04)] transition-all duration-300 hover:-translate-y-0.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-0 ${
                    isApproved 
                      ? 'ring-1 ring-emerald-500/30 bg-gradient-to-r from-emerald-500/[0.07] to-transparent' 
                      : ''
                  }`}
                >
                  {/* Left part: Title, Category Badge, Price pill, Link */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-medium text-white tracking-tight leading-snug">
                        {item.title}
                      </span>
                      {isApproved && (
                        <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 font-medium shrink-0 flex items-center gap-1">
                          <Sparkles className="h-2.5 w-2.5" />
                          <span>Match</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Room Category Pill */}
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getCategoryBadgeClass(item.category)}`}>
                        {item.category || 'Дом'}
                      </span>

                      {/* Price Pill: ONLY when price > 0, NEVER a dash '—' */}
                      {item.estimatedPrice && item.estimatedPrice > 0 ? (
                        <span className="tabular-nums text-xs text-zinc-300 bg-white/[0.05] rounded-full px-2.5 py-0.5 font-medium">
                          {item.estimatedPrice.toLocaleString('ru-RU')} ₽
                        </span>
                      ) : null}

                      {/* Item Store Link */}
                      {item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 rounded-full bg-sky-500/10 px-2.5 py-0.5 transition-all truncate max-w-[130px]"
                          title={item.link}
                        >
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">
                            {item.link.includes('ozon')
                              ? 'Ozon'
                              : item.link.includes('wildberries') || item.link.includes('wb.ru')
                              ? 'Wildberries'
                              : item.link.includes('market.yandex')
                              ? 'Маркет'
                              : 'Ссылка'}
                          </span>
                        </a>
                      ) : null}
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-zinc-400 line-clamp-1">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Right part: Couple Vote Pills + Actions */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                    {/* Egor Vote Pill */}
                    <div className="rounded-full bg-white/[0.04] p-1 flex items-center gap-1">
                      <span className="text-[11px] px-1.5 text-zinc-400 font-medium select-none">Егор</span>
                      <button
                        type="button"
                        onClick={() => handleVote(item.id, 'egor', 'yes')}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer border-0 ${
                          item.egorVote === 'yes'
                            ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40 scale-105'
                            : 'text-zinc-500 hover:text-emerald-400 hover:bg-white/[0.06]'
                        }`}
                        title="Егор: За"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVote(item.id, 'egor', 'no')}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer border-0 ${
                          item.egorVote === 'no'
                            ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/40 scale-105'
                            : 'text-zinc-500 hover:text-rose-400 hover:bg-white/[0.06]'
                        }`}
                        title="Егор: Против"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Anya Vote Pill */}
                    <div className="rounded-full bg-white/[0.04] p-1 flex items-center gap-1">
                      <span className="text-[11px] px-1.5 text-zinc-400 font-medium select-none">Аня</span>
                      <button
                        type="button"
                        onClick={() => handleVote(item.id, 'anya', 'yes')}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer border-0 ${
                          item.anyaVote === 'yes'
                            ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40 scale-105'
                            : 'text-zinc-500 hover:text-emerald-400 hover:bg-white/[0.06]'
                        }`}
                        title="Аня: За"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVote(item.id, 'anya', 'no')}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer border-0 ${
                          item.anyaVote === 'no'
                            ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/40 scale-105'
                            : 'text-zinc-500 hover:text-rose-400 hover:bg-white/[0.06]'
                        }`}
                        title="Аня: Против"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Quick Actions: В задачи, Pencil, Trash */}
                    <div className="flex items-center gap-1 pl-1">
                      <button
                        type="button"
                        onClick={() => {
                          convertWishlistToTask(item.id);
                          try { soundEffects.playSuccess(); } catch {}
                        }}
                        className="rounded-full bg-white/[0.05] hover:bg-white/[0.12] text-xs px-3 py-1.5 text-zinc-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer border-0"
                        title="Создать задачу в еженедельнике"
                      >
                        <span>В задачи</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-all cursor-pointer opacity-40 group-hover:opacity-100 border-0"
                        title="Редактировать"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteWishlistItem(item.id);
                          try { soundEffects.playClick(); } catch {}
                        }}
                        className="p-1.5 rounded-full text-zinc-400 hover:text-rose-400 hover:bg-white/[0.06] transition-all cursor-pointer opacity-40 group-hover:opacity-100 border-0"
                        title="Удалить"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── 3. APARTMENT BLUEPRINT PINS SECTION (.nexus-surface, Zero Nested Borders) ── */}
      <div className="nexus-surface p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-2">
          <div>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-emerald-400" />
              <h3 className="text-xl font-semibold tracking-tight text-white">
                Обустройство и ремонт квартиры (Карта помещений)
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Ключевые точки квартиры: Кухня, Ванная, Спальня, Балкон
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {blueprintPins.map((pin) => {
            return (
              <div
                key={pin.id}
                className="p-4 rounded-2xl bg-white/[0.025] hover:bg-white/[0.045] space-y-2.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-100">{pin.title}</span>
                  <span 
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                      pin.status === 'solved'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : pin.status === 'in_progress'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-white/[0.06] text-zinc-400'
                    }`}
                  >
                    {pin.status === 'solved' ? 'Готово' : pin.status === 'in_progress' ? 'В процессе' : 'Проблема'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {pin.notes || 'Точка обустройства интерьера'}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-zinc-500 font-medium">
                    {pin.room}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = pin.status === 'solved' ? 'problem' : pin.status === 'in_progress' ? 'solved' : 'in_progress';
                      updatePinStatus(pin.id, next);
                      try { soundEffects.playClick(); } catch {}
                    }}
                    className="rounded-full bg-white/[0.05] hover:bg-white/[0.1] px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer border-0"
                  >
                    Сменить статус
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ADD WISHLIST DIALOG ── */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#0D101A]/95 backdrop-blur-2xl border-white/[0.08] text-zinc-100 rounded-[28px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white">Добавить покупку в вишлист</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Добавьте идею для совместного голосования пары.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div>
              <label className="text-xs font-medium text-zinc-300">Название покупки</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Например, робот-пылесос или турка для кофе..."
                className="mt-1 bg-white/[0.04] border-white/[0.08] text-zinc-100 text-xs rounded-full h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300">Ориентировочная цена (₽)</label>
              <Input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="4500"
                className="mt-1 tabular-nums bg-white/[0.04] border-white/[0.08] text-zinc-100 text-xs rounded-full h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300">Ссылка на товар (WB / Ozon)</label>
              <Input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://ozon.ru/..."
                className="mt-1 bg-white/[0.04] border-white/[0.08] text-zinc-100 text-xs rounded-full h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300">Категория</label>
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Кухня, Ванная, Спальня, Дом..."
                className="mt-1 bg-white/[0.04] border-white/[0.08] text-zinc-100 text-xs rounded-full h-9"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} className="text-xs rounded-full text-zinc-400">
              Отмена
            </Button>
            <Button onClick={handleAddWish} className="text-xs rounded-full bg-white text-zinc-950 hover:bg-zinc-100 font-semibold">
              Добавить в вишлист
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT WISH DIALOG ── */}
      <Dialog open={!!editingWish} onOpenChange={(open) => !open && setEditingWish(null)}>
        <DialogContent className="sm:max-w-md bg-[#0D101A]/95 backdrop-blur-2xl border-white/[0.08] text-zinc-100 rounded-[28px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white">Редактировать товар вишлиста</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              {editingWish?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            <div>
              <label className="text-xs font-medium text-zinc-300">Ориентировочная цена (₽)</label>
              <Input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="Цена в рублях"
                className="mt-1 tabular-nums bg-white/[0.04] border-white/[0.08] text-zinc-100 rounded-full h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300">Ссылка на товар</label>
              <Input
                type="url"
                value={editLink}
                onChange={(e) => setEditLink(e.target.value)}
                placeholder="https://..."
                className="mt-1 bg-white/[0.04] border-white/[0.08] text-zinc-100 rounded-full h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300">Категория</label>
              <Input
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                placeholder="Кухня, Ванная, Комната, Дом..."
                className="mt-1 bg-white/[0.04] border-white/[0.08] text-zinc-100 rounded-full h-9"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="ghost" onClick={() => setEditingWish(null)} className="text-xs rounded-full text-zinc-400">
              Отмена
            </Button>
            <Button onClick={handleSaveEdit} className="text-xs rounded-full bg-white text-zinc-950 hover:bg-zinc-100 font-semibold">
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
