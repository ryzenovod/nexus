import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  Check, 
  X, 
  Plus, 
  Home, 
  ExternalLink,
  Trash2,
  Pencil
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
  };

  // Filter out any unwanted non-purchase tasks (e.g. "Что делаем 4 ноября?")
  const displayWishlist = useMemo(() => {
    return wishlist.filter(item => !item.title.toLowerCase().includes('4 ноября'));
  }, [wishlist]);

  // Edit wish state
  const [editingWish, setEditingWish] = useState<any | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editCategory, setEditCategory] = useState('Дом');

  const handleStartEdit = (item: any) => {
    setEditingWish(item);
    setEditPrice(item.estimatedPrice ? String(item.estimatedPrice) : '');
    setEditLink(item.link || '');
    setEditCategory(item.category || 'Дом');
  };

  const handleSaveEdit = () => {
    if (!editingWish) return;
    updateWishlistItem(editingWish.id, {
      estimatedPrice: parseFloat(editPrice) || 0,
      link: editLink.trim() || undefined,
      category: editCategory,
    });
    setEditingWish(null);
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
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 max-w-[1600px] mx-auto w-full pb-8">
      {/* ── 1. WISHLIST SECTION ── */}
      <div className="rounded-xl border border-white/[0.08] bg-zinc-950/65 backdrop-blur-2xl text-card-foreground shadow-xs">
        <div className="p-5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500 fill-rose-500/20" />
              <h3 className="text-base font-semibold leading-none">
                Вишлист пары («Берем или нет?»)
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Голосование за покупки: если оба нажали 👍, вещь переходит в статус «Одобрено»
            </p>
          </div>

          <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>Добавить желание</span>
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Желание / Покупка</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Ориентировочная цена</TableHead>
              <TableHead>Голос Егора</TableHead>
              <TableHead>Голос Ани</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действие</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayWishlist.map((item) => {
              const isApproved = item.egorVote === 'yes' && item.anyaVote === 'yes';

              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.title}</span>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground mt-0.5"
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                          <span>Ссылка на товар</span>
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs capitalize">
                      {item.category}
                    </Badge>
                  </TableCell>
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
                          className="h-7 w-24 text-xs bg-zinc-900 border-zinc-700 px-2 font-mono"
                        />
                        <span className="text-zinc-400 text-xs">₽</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartInlinePrice(item.id, item.estimatedPrice)}
                        className="inline-flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-white/[0.06] text-zinc-300 hover:text-zinc-100 transition cursor-pointer group/price"
                        title="Нажмите, чтобы ввести или изменить цену в ₽"
                      >
                        <span>{item.estimatedPrice > 0 ? `${item.estimatedPrice.toLocaleString('ru-RU')} ₽` : '—'}</span>
                        <Pencil className="h-2.5 w-2.5 opacity-0 group-hover/price:opacity-60 transition-opacity text-zinc-400" />
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => voteWishlist(item.id, 'egor', item.egorVote === 'yes' ? null as any : 'yes')}
                        className={`h-7 w-7 p-0 transition-all ${
                          item.egorVote === 'yes'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                            : 'bg-white/[0.04] text-zinc-400 hover:text-emerald-400 hover:bg-white/[0.08]'
                        }`}
                        title="Одобрить (Егор)"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => voteWishlist(item.id, 'egor', item.egorVote === 'no' ? null as any : 'no')}
                        className={`h-7 w-7 p-0 transition-all ${
                          item.egorVote === 'no'
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs'
                            : 'bg-white/[0.04] text-zinc-400 hover:text-rose-400 hover:bg-white/[0.08]'
                        }`}
                        title="Отклонить (Егор)"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => voteWishlist(item.id, 'anya', item.anyaVote === 'yes' ? null as any : 'yes')}
                        className={`h-7 w-7 p-0 transition-all ${
                          item.anyaVote === 'yes'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                            : 'bg-white/[0.04] text-zinc-400 hover:text-emerald-400 hover:bg-white/[0.08]'
                        }`}
                        title="Одобрить (Аня)"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => voteWishlist(item.id, 'anya', item.anyaVote === 'no' ? null as any : 'no')}
                        className={`h-7 w-7 p-0 transition-all ${
                          item.anyaVote === 'no'
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs'
                            : 'bg-white/[0.04] text-zinc-400 hover:text-rose-400 hover:bg-white/[0.08]'
                        }`}
                        title="Отклонить (Аня)"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isApproved ? (
                      <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600 text-xs">
                        Одобрено парой
                      </Badge>
                    ) : item.egorVote === 'no' || item.anyaVote === 'no' ? (
                      <Badge variant="destructive" className="text-xs">
                        Отклонено
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs text-muted-foreground">
                        На обсуждении
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(item)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title="Редактировать цену, ссылку и категорию"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => convertWishlistToTask(item.id)}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                        title="Создать задачу в плане"
                      >
                        В задачи
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWishlistItem(item.id)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ── 2. APARTMENT BLUEPRINT PINS ── */}
      <div className="rounded-xl border border-white/[0.08] bg-zinc-950/65 backdrop-blur-2xl text-card-foreground shadow-xs p-6">
        <div className="flex items-center justify-between pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-emerald-400" />
              <h3 className="text-base font-semibold leading-none">
                Обустройство и ремонт квартиры (Карта помещений)
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ключевые точки квартиры: Кухня, Ванная, Спальня, Балкон
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {blueprintPins.map((pin) => {
            return (
              <div
                key={pin.id}
                className="p-3.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] space-y-2 transition-colors"
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
                <p className="text-[11px] text-muted-foreground">
                  {pin.notes || 'Точка обустройства интерьера'}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {pin.room}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const next = pin.status === 'solved' ? 'problem' : pin.status === 'in_progress' ? 'solved' : 'in_progress';
                      updatePinStatus(pin.id, next);
                    }}
                    className="h-6 px-2 text-[10px]"
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить пункт в вишлист</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Добавьте идею для совместного голосования.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Название покупки</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Например, робот-пылесос или турка для кофе..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Ориентировочная цена (₽)</label>
              <Input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="4500"
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Ссылка на товар</label>
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddWish}>
              Добавить в вишлист
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Wish Dialog ── */}
      <Dialog open={!!editingWish} onOpenChange={(open) => !open && setEditingWish(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать товар вишлиста</DialogTitle>
            <DialogDescription>
              {editingWish?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Ориентировочная цена (₽)</label>
              <Input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="Цена в рублях"
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Ссылка на товар</label>
              <Input
                type="url"
                value={editLink}
                onChange={(e) => setEditLink(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Категория</label>
              <Input
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                placeholder="Кухня, Ванная, Комната, Дом..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingWish(null)}>
              Отмена
            </Button>
            <Button onClick={handleSaveEdit}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
