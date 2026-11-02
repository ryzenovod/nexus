import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  ThumbsUp, 
  HelpCircle, 
  X, 
  Plus, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  ShoppingBag,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { WishlistItem, VoteStatus } from '../../types/nexus';

export const WishlistModule: React.FC = () => {
  const {
    wishlist,
    addWishlistItem,
    voteWishlist,
    deleteWishlistItem,
    convertWishlistToTask,
  } = useNexusStore();

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Кухня');
  const [newPrice, setNewPrice] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newAddedBy, setNewAddedBy] = useState<'egor' | 'anya'>('egor');

  const filteredItems = wishlist.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  const approvedItems = wishlist.filter((item) => item.status === 'approved');
  const totalApprovedEstimate = approvedItems.reduce((acc, curr) => acc + curr.estimatedPrice, 0);

  const pendingCount = wishlist.filter((item) => item.status === 'pending').length;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addWishlistItem({
      title: newTitle.trim(),
      category: newCategory,
      estimatedPrice: newPrice ? parseFloat(newPrice) : 0,
      link: newLink.trim() || undefined,
      notes: newNotes.trim() || undefined,
      addedBy: newAddedBy,
    });

    setNewTitle('');
    setNewPrice('');
    setNewLink('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const renderVoteBadge = (vote: VoteStatus, userName: string) => {
    if (vote === 'yes') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
          <ThumbsUp className="h-2.5 w-2.5" />
          {userName}: Берем!
        </span>
      );
    }
    if (vote === 'maybe') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
          <HelpCircle className="h-2.5 w-2.5" />
          {userName}: Подумать
        </span>
      );
    }
    if (vote === 'no') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300 border border-red-500/30">
          <X className="h-2.5 w-2.5" />
          {userName}: Не надо
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-zinc-500 border border-white/[0.06]">
        {userName}: ждет ответа
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Stats & Actions */}
      <div className="rounded-2xl border border-white/10 bg-[#0f1115]/80 backdrop-blur-2xl p-5 shadow-glass">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-white/10 text-amber-400">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Режим «Берем или нет?»</span>
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[11px] font-mono text-amber-300 border border-amber-500/30">
                  Парное согласование
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Голосуйте вдвоем за покупки со знаком вопроса. При двух голосах «Берем» позиция автоматически переходит в план покупок!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Approved Budget Counter */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-right">
              <span className="block text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                Смета одобренных покупок
              </span>
              <span className="font-mono text-lg font-extrabold text-white">
                {totalApprovedEstimate.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 text-xs font-semibold text-black hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/25"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Предложить покупку</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-3 text-xs">
          <span className="text-zinc-500">Фильтр:</span>
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-white/20 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Все ({wishlist.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              filterStatus === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>На обсуждении</span>
            <span className="rounded-full bg-amber-500/30 px-1 text-[10px] font-mono">
              {pendingCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('approved')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              filterStatus === 'approved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Одобрено двоими</span>
            <span className="rounded-full bg-emerald-500/30 px-1 text-[10px] font-mono">
              {approvedItems.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('rejected')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              filterStatus === 'rejected'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Отклонено
          </button>
        </div>
      </div>

      {/* Grid of Wishlist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const isBothApproved = item.egorVote === 'yes' && item.anyaVote === 'yes';

          return (
            <motion.div
              key={item.id}
              layout
              style={{
                borderLeft: isBothApproved
                  ? '3.5px solid #22c55e'
                  : item.status === 'rejected'
                  ? '3.5px solid #ef4444'
                  : '3.5px solid #64748b',
                background: isBothApproved
                  ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.16) 0%, rgba(18, 20, 26, 0.82) 100%)'
                  : 'linear-gradient(90deg, rgba(100, 116, 139, 0.1) 0%, rgba(18, 20, 26, 0.82) 100%)',
              }}
              className="rounded-xl border-y border-r border-white/10 p-4 space-y-3 relative group backdrop-blur-[24px]"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-zinc-400">
                    {item.category}
                  </span>
                  <h3 className="mt-1 text-sm font-bold text-white tracking-tight">
                    {item.title}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-emerald-400">
                    {item.estimatedPrice.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>

              {/* Notes */}
              {item.notes && (
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {item.notes}
                </p>
              )}

              {/* Status Badges Row */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {renderVoteBadge(item.egorVote, 'Егор')}
                {renderVoteBadge(item.anyaVote, 'Аня')}
              </div>

              {/* Interactive Voting Panel */}
              <div className="pt-2 border-t border-white/[0.06] space-y-2">
                {/* Egor's vote buttons */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-mono text-[11px]">Голос Егора:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => voteWishlist(item.id, 'egor', 'yes')}
                      className={`p-1 rounded transition-colors ${
                        item.egorVote === 'yes'
                          ? 'bg-emerald-500 text-black font-bold'
                          : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10'
                      }`}
                      title="Берем"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => voteWishlist(item.id, 'egor', 'maybe')}
                      className={`p-1 rounded transition-colors ${
                        item.egorVote === 'maybe'
                          ? 'bg-amber-500 text-black font-bold'
                          : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10'
                      }`}
                      title="Подумать"
                    >
                      <HelpCircle className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => voteWishlist(item.id, 'egor', 'no')}
                      className={`p-1 rounded transition-colors ${
                        item.egorVote === 'no'
                          ? 'bg-red-500 text-white font-bold'
                          : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10'
                      }`}
                      title="Не надо"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Anya's vote buttons */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-mono text-[11px]">Голос Ани:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => voteWishlist(item.id, 'anya', 'yes')}
                      className={`p-1 rounded transition-colors ${
                        item.anyaVote === 'yes'
                          ? 'bg-rose-500 text-white font-bold'
                          : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10'
                      }`}
                      title="Берем"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => voteWishlist(item.id, 'anya', 'maybe')}
                      className={`p-1 rounded transition-colors ${
                        item.anyaVote === 'maybe'
                          ? 'bg-amber-500 text-black font-bold'
                          : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10'
                      }`}
                      title="Подумать"
                    >
                      <HelpCircle className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => voteWishlist(item.id, 'anya', 'no')}
                      className={`p-1 rounded transition-colors ${
                        item.anyaVote === 'no'
                          ? 'bg-red-500 text-white font-bold'
                          : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10'
                      }`}
                      title="Не надо"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-amber-400 hover:underline"
                  >
                    <span>В магазин</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-zinc-500 text-[11px]">Без ссылки</span>
                )}

                <div className="flex items-center gap-1">
                  {/* Convert to Task if approved */}
                  {isBothApproved && (
                    <button
                      type="button"
                      onClick={() => convertWishlistToTask(item.id)}
                      className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-1 font-mono text-[10px] font-bold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                      title="Перенести в задачи инбокса"
                    >
                      <span>В задачи</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteWishlistItem(item.id)}
                    className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* MODAL: PROPOSE NEW ITEM */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12141a] p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">
              Предложить покупку в дом
            </h3>
            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Что нужно? (со знаком вопроса)
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Например: Скатерть? или Коврик в ванную?"
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Примерная цена (₽)
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="1500"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Категория
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="Кухня">Кухня</option>
                    <option value="Посуда">Посуда</option>
                    <option value="Ванная">Ванная</option>
                    <option value="Спальня">Спальня</option>
                    <option value="Текстиль">Текстиль</option>
                    <option value="Инструменты">Инструменты</option>
                    <option value="Техника">Техника</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Ссылка на Ozon / WB / Яндекс.Маркет
                </label>
                <input
                  type="url"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Зачем / детали
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Размеры, цвет, почему нам это нужно..."
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Кто предлагает
                </label>
                <select
                  value={newAddedBy}
                  onChange={(e) => setNewAddedBy(e.target.value as 'egor' | 'anya')}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="egor">Егор</option>
                  <option value="anya">Аня</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:bg-white/10"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-amber-400"
                >
                  Предложить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
