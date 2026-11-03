import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  Check, 
  X, 
  Plus, 
  Home, 
  ExternalLink,
  Trash2,
  Pencil,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('Дом');

  // Inline price editing state
  const [inlinePriceId, setInlinePriceId] = useState<string | null>(null);
  const [inlinePriceVal, setInlinePriceVal] = useState('');

  // Inline link editing state
  const [inlineLinkId, setInlineLinkId] = useState<string | null>(null);
  const [inlineLinkVal, setInlineLinkVal] = useState('');

  const handleStartInlinePrice = (id: string, currentPrice: number) => {
    setInlinePriceId(id);
    setInlinePriceVal(currentPrice > 0 ? String(currentPrice) : '');
  };

  const handleSaveInlinePrice = (id: string) => {
    const cleanStr = inlinePriceVal.replace(/\s+/g, '').replace('₽', '');
    const num = parseFloat(cleanStr);
    const validNum = isNaN(num) || num < 0 ? 0 : num;
    updateWishlistItem(id, { estimatedPrice: validNum });
    setInlinePriceId(null);
    try {
      soundEffects.playClick();
    } catch {}
  };

  const handleStartInlineLink = (id: string, currentLink: string) => {
    setInlineLinkId(id);
    setInlineLinkVal(currentLink || '');
  };

  const handleSaveInlineLink = (id: string) => {
    const cleanLink = inlineLinkVal.trim();
    updateWishlistItem(id, { link: cleanLink || undefined });
    setInlineLinkId(null);
    try {
      soundEffects.playClick();
    } catch {}
  };

  // Filter out "Что делаем 4 ноября?" and any non-material plans
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

  // Edit wish state for full dialog
  const [editingWish, setEditingWish] = useState<any | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editCategory, setEditCategory] = useState('Дом');

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
    <div className="flex-1 flex flex-col space-y-6 max-w-[1600px] mx-auto w-full pb-8 animate-fade-in">
      {/* ── 1. WISHLIST SECTION ── */}
      <div className="rounded-xl border border-white/[0.08] bg-zinc-950/65 backdrop-blur-2xl text-card-foreground shadow-xs">
        {/* Header Strip with Metrics */}
        <div className="p-5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500 fill-rose-500/20" />
              <h3 className="text-base font-semibold leading-none text-zinc-100">
                Вишлист пары («Берем или нет?»)
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Совместные покупки: если оба нажали Check, вещь переходит в статус «Одобрено парой»
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Automatic Sum of Approved Purchases */}
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-mono flex items-center gap-1.5 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Одобрено: <b>{totalApprovedSum.toLocaleString('ru-RU')} ₽</b> ({totalApprovedCount} шт.)</span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-zinc-300 text-xs font-mono flex items-center gap-1.5">
              <span>Всего: <b>{totalWishlistSum.toLocaleString('ru-RU')} ₽</b> ({displayWishlist.length} шт.)</span>
            </div>

            <Button 
              size="sm" 
              onClick={() => setIsAddModalOpen(true)} 
              className="gap-1.5 text-xs bg-zinc-100 text-zinc-950 hover:bg-white font-medium cursor-pointer shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Добавить желание</span>
            </Button>
          </div>
        </div>

        {/* Table of Items (Zero Nested Borders) */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/[0.06] hover:bg-transparent">
                <TableHead className="w-[280px]">Желание / Покупка</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead className="w-[200px]">Ссылка на товар</TableHead>
                <TableHead className="w-[170px]">Ориентировочная цена</TableHead>
                <TableHead>Голос Егора</TableHead>
                <TableHead>Голос Ани</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действие</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayWishlist.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-xs text-zinc-500">
                    Вишлист пуст. Нажмите «+ Добавить желание», чтобы начать список совместных покупок!
                  </TableCell>
                </TableRow>
              ) : (
                displayWishlist.map((item) => {
                  const isApproved = item.egorVote === 'yes' && item.anyaVote === 'yes';

                  return (
                    <TableRow key={item.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      {/* Title & Notes */}
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-zinc-100 leading-snug">{item.title}</span>
                          {item.notes && (
                            <span className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{item.notes}</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] capitalize bg-white/[0.03] text-zinc-300 border-none">
                          {item.category}
                        </Badge>
                      </TableCell>

                      {/* Link (Interactive inline) */}
                      <TableCell>
                        {inlineLinkId === item.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="url"
                              autoFocus
                              value={inlineLinkVal}
                              onChange={(e) => setInlineLinkVal(e.target.value)}
                              onBlur={() => handleSaveInlineLink(item.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveInlineLink(item.id);
                                if (e.key === 'Escape') setInlineLinkId(null);
                              }}
                              placeholder="https://ozon.ru/..."
                              className="h-7 w-40 text-xs bg-zinc-900 border-none px-2 font-mono text-zinc-200"
                            />
                          </div>
                        ) : item.link ? (
                          <div className="flex items-center gap-1.5 group/link">
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 underline underline-offset-2 truncate max-w-[130px]"
                              title={item.link}
                            >
                              <ExternalLink className="h-3 w-3 shrink-0" />
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
                            <button
                              type="button"
                              onClick={() => handleStartInlineLink(item.id, item.link || '')}
                              className="opacity-0 group-hover/link:opacity-100 text-zinc-500 hover:text-zinc-300 transition-opacity p-0.5 cursor-pointer"
                              title="Изменить ссылку"
                            >
                              <Pencil className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartInlineLink(item.id, '')}
                            className="text-xs text-zinc-500 hover:text-zinc-300 py-1 px-2 rounded-md hover:bg-white/[0.04] transition cursor-pointer"
                            title="Нажмите, чтобы ввести ссылку на WB / Ozon"
                          >
                            + Ссылка
                          </button>
                        )}
                      </TableCell>

                      {/* Price (Interactive inline) */}
                      <TableCell className="font-mono-num text-xs">
                        {inlinePriceId === item.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={inlinePriceVal}
                              onChange={(e) => setInlinePriceVal(e.target.value)}
                              onBlur={() => handleSaveInlinePrice(item.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveInlinePrice(item.id);
                                if (e.key === 'Escape') setInlinePriceId(null);
                              }}
                              autoFocus
                              placeholder="0"
                              className="h-7 w-24 text-xs bg-zinc-900 border-none px-2 font-mono text-zinc-100"
                            />
                            <span className="text-zinc-400 text-xs">₽</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartInlinePrice(item.id, item.estimatedPrice)}
                            className="inline-flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-white/[0.06] text-zinc-300 hover:text-zinc-100 transition cursor-pointer group/price font-mono"
                            title="Нажмите, чтобы ввести или изменить цену в ₽"
                          >
                            <span>{item.estimatedPrice > 0 ? `${item.estimatedPrice.toLocaleString('ru-RU')} ₽` : '—'}</span>
                            <Pencil className="h-2.5 w-2.5 opacity-0 group-hover/price:opacity-60 transition-opacity text-zinc-400" />
                          </button>
                        )}
                      </TableCell>

                      {/* Egor Vote (Flat capsule buttons with Check & X, Zero nested borders) */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              voteWishlist(item.id, 'egor', item.egorVote === 'yes' ? null as any : 'yes');
                              try { soundEffects.playClick(); } catch {}
                            }}
                            className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                              item.egorVote === 'yes'
                                ? 'bg-emerald-500/20 text-emerald-300 font-semibold shadow-xs'
                                : 'bg-white/[0.04] text-zinc-400 hover:text-emerald-400 hover:bg-white/[0.08]'
                            }`}
                            title="Одобрить (Егор)"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              voteWishlist(item.id, 'egor', item.egorVote === 'no' ? null as any : 'no');
                              try { soundEffects.playClick(); } catch {}
                            }}
                            className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                              item.egorVote === 'no'
                                ? 'bg-rose-500/20 text-rose-300 font-semibold shadow-xs'
                                : 'bg-white/[0.04] text-zinc-400 hover:text-rose-400 hover:bg-white/[0.08]'
                            }`}
                            title="Отклонить (Егор)"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>

                      {/* Anya Vote (Flat capsule buttons with Check & X, Zero nested borders) */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              voteWishlist(item.id, 'anya', item.anyaVote === 'yes' ? null as any : 'yes');
                              try { soundEffects.playClick(); } catch {}
                            }}
                            className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                              item.anyaVote === 'yes'
                                ? 'bg-emerald-500/20 text-emerald-300 font-semibold shadow-xs'
                                : 'bg-white/[0.04] text-zinc-400 hover:text-emerald-400 hover:bg-white/[0.08]'
                            }`}
                            title="Одобрить (Аня)"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              voteWishlist(item.id, 'anya', item.anyaVote === 'no' ? null as any : 'no');
                              try { soundEffects.playClick(); } catch {}
                            }}
                            className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                              item.anyaVote === 'no'
                                ? 'bg-rose-500/20 text-rose-300 font-semibold shadow-xs'
                                : 'bg-white/[0.04] text-zinc-400 hover:text-rose-400 hover:bg-white/[0.08]'
                            }`}
                            title="Отклонить (Аня)"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {isApproved ? (
                          <Badge variant="default" className="bg-emerald-600/30 text-emerald-300 border-none text-xs">
                            Одобрено парой
                          </Badge>
                        ) : item.egorVote === 'no' || item.anyaVote === 'no' ? (
                          <Badge variant="destructive" className="bg-rose-600/20 text-rose-300 border-none text-xs">
                            Отклонено
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-white/[0.05] text-zinc-400 border-none text-xs">
                            На обсуждении
                          </Badge>
                        )}
                      </TableCell>

                      {/* Action buttons */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartEdit(item)}
                            className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05] cursor-pointer"
                            title="Редактировать цену, ссылку и категорию"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              convertWishlistToTask(item.id);
                              try { soundEffects.playSuccess(); } catch {}
                            }}
                            className="h-7 text-xs text-zinc-400 hover:text-zinc-100 bg-white/[0.03] border-none cursor-pointer"
                            title="Создать задачу в еженедельнике"
                          >
                            В задачи
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              deleteWishlistItem(item.id);
                              try { soundEffects.playClick(); } catch {}
                            }}
                            className="h-7 w-7 p-0 text-zinc-500 hover:text-red-400 hover:bg-white/[0.05] cursor-pointer"
                            title="Удалить из вишлиста"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── 2. APARTMENT BLUEPRINT PINS SECTION (Zero Nested Borders) ── */}
      <div className="rounded-xl border border-white/[0.08] bg-zinc-950/65 backdrop-blur-2xl text-card-foreground shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-emerald-400" />
              <h3 className="text-base font-semibold leading-none text-zinc-100">
                Обустройство и ремонт квартиры (Карта помещений)
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Ключевые точки квартиры: Кухня, Ванная, Спальня, Балкон
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {blueprintPins.map((pin) => {
            return (
              <div
                key={pin.id}
                className="p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] space-y-2 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-100">{pin.title}</span>
                  <span 
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
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
                <p className="text-[11px] text-zinc-400">
                  {pin.notes || 'Точка обустройства интерьера'}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-zinc-500">
                    {pin.room}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const next = pin.status === 'solved' ? 'problem' : pin.status === 'in_progress' ? 'solved' : 'in_progress';
                      updatePinStatus(pin.id, next);
                      try { soundEffects.playClick(); } catch {}
                    }}
                    className="h-6 px-2 text-[10px] hover:bg-white/[0.06] text-zinc-300"
                  >
                    Сменить статус
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ADD WISHLIST DIALOG ── */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-950/95 border-none text-zinc-100 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle>Добавить покупку в вишлист</DialogTitle>
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
                className="mt-1 bg-white/[0.04] border-none text-zinc-100 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300">Ориентировочная цена (₽)</label>
              <Input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="4500"
                className="mt-1 font-mono bg-white/[0.04] border-none text-zinc-100 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300">Ссылка на товар (WB / Ozon)</label>
              <Input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://ozon.ru/..."
                className="mt-1 bg-white/[0.04] border-none text-zinc-100 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300">Категория</label>
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Кухня, Ванная, Спальня, Дом..."
                className="mt-1 bg-white/[0.04] border-none text-zinc-100 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-white/[0.06] pt-3">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} className="text-xs text-zinc-400">
              Отмена
            </Button>
            <Button onClick={handleAddWish} className="text-xs bg-zinc-100 text-zinc-950 hover:bg-white font-medium">
              Добавить в вишлист
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT WISH DIALOG ── */}
      <Dialog open={!!editingWish} onOpenChange={(open) => !open && setEditingWish(null)}>
        <DialogContent className="sm:max-w-md bg-zinc-950/95 border-none text-zinc-100 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать товар вишлиста</DialogTitle>
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
                className="mt-1 font-mono bg-white/[0.04] border-none text-zinc-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300">Ссылка на товар</label>
              <Input
                type="url"
                value={editLink}
                onChange={(e) => setEditLink(e.target.value)}
                placeholder="https://..."
                className="mt-1 bg-white/[0.04] border-none text-zinc-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300">Категория</label>
              <Input
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                placeholder="Кухня, Ванная, Комната, Дом..."
                className="mt-1 bg-white/[0.04] border-none text-zinc-100"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-white/[0.06] pt-3">
            <Button variant="ghost" onClick={() => setEditingWish(null)} className="text-xs text-zinc-400">
              Отмена
            </Button>
            <Button onClick={handleSaveEdit} className="text-xs bg-zinc-100 text-zinc-950 hover:bg-white font-medium">
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
