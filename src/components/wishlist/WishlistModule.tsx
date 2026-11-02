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
  ShoppingBag,
  ArrowRight,
  Trash2,
  MapPin,
  Heart
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { WishlistItem, VoteStatus } from '../../types/nexus';
import { ApartmentBlueprint } from '../apartment/ApartmentBlueprint';
import { DateNightPlanner } from '../date-night/DateNightPlanner';

export type WishlistSubTab = 'wishlist' | 'blueprint' | 'dates';

export const WishlistModule: React.FC = () => {
  const {
    wishlist,
    addWishlistItem,
    voteWishlist,
    deleteWishlistItem,
    convertWishlistToTask,
  } = useNexusStore();

  const [activeSubTab, setActiveSubTab] = useState<WishlistSubTab>('wishlist');
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
        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-500/20">
          <ThumbsUp className="h-2.5 w-2.5" />
          {userName}: Да
        </span>
      );
    }
    if (vote === 'maybe') {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono text-amber-300 border border-amber-500/20">
          <HelpCircle className="h-2.5 w-2.5" />
          {userName}: Думаю
        </span>
      );
    }
    if (vote === 'no') {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-mono text-red-300 border border-red-500/20">
          <X className="h-2.5 w-2.5" />
          {userName}: Нет
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 border border-white/[0.06]">
        {userName}: —
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('wishlist')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
              activeSubTab === 'wishlist'
                ? 'bg-white/[0.08] text-zinc-100 border-white/[0.12]'
                : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <Gift className="h-3.5 w-3.5" />
            <span>Вишлист («Берем или нет?»)</span>
            {pendingCount > 0 && (
              <span className="rounded bg-amber-500/20 px-1.5 py-0.2 font-mono text-[10px] text-amber-300 border border-amber-500/30">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('blueprint')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
              activeSubTab === 'blueprint'
                ? 'bg-white/[0.08] text-zinc-100 border-white/[0.12]'
                : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>План квартиры (Ремонт) 📐</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('dates')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
              activeSubTab === 'dates'
                ? 'bg-white/[0.08] text-zinc-100 border-white/[0.12]'
                : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <Heart className="h-3.5 w-3.5 text-rose-400" />
            <span>Свидания 💕</span>
          </button>
        </div>

        {activeSubTab === 'wishlist' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-mono">
              Одобрено: <span className="text-emerald-400 font-semibold">{totalApprovedEstimate.toLocaleString('ru-RU')} ₽</span>
            </span>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 rounded bg-zinc-100 hover:bg-white px-2.5 py-1 text-xs font-medium text-zinc-950 transition-colors"
            >
              <Plus className="h-3 w-3 stroke-[2.5]" />
              <span>Покупка</span>
            </button>
          </div>
        )}
      </div>

      {/* Render Selected Sub-View */}
      {activeSubTab === 'blueprint' && <ApartmentBlueprint />}
      {activeSubTab === 'dates' && <DateNightPlanner />}

      {activeSubTab === 'wishlist' && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-500 mr-1">Фильтр:</span>
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-white/[0.12] text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Все ({wishlist.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('pending')}
              className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-white/[0.12] text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>На обсуждении</span>
              <span className="rounded bg-white/[0.08] px-1 text-[10px] font-mono">
                {pendingCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('approved')}
              className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                filterStatus === 'approved'
                  ? 'bg-white/[0.12] text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Одобрено</span>
              <span className="rounded bg-white/[0.08] px-1 text-[10px] font-mono">
                {approvedItems.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('rejected')}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                filterStatus === 'rejected'
                  ? 'bg-white/[0.12] text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Отклонено
            </button>
          </div>

          {/* Wishlist Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
            <AnimatePresence>
              {filteredItems.map((item) => {
                const isApproved = item.status === 'approved';
                const isRejected = item.status === 'rejected';

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`flex flex-col justify-between rounded-lg border bg-zinc-900/70 backdrop-blur-[20px] p-3 transition-all ${
                      isApproved
                        ? 'border-emerald-500/30'
                        : isRejected
                        ? 'border-red-500/20 opacity-50'
                        : 'border-white/[0.07] hover:border-white/[0.15]'
                    }`}
                  >
                    <div>
                      {/* Top status line */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="rounded bg-white/[0.04] px-1.5 py-0.2 text-[10px] text-zinc-400 border border-white/[0.06]">
                          {item.category}
                        </span>

                        <div className="flex items-center gap-1">
                          {isApproved && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/10 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              БЕРЕМ
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => deleteWishlistItem(item.id)}
                            className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors"
                            title="Удалить позицию"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xs font-semibold text-zinc-100 leading-snug">
                        {item.title}
                      </h3>

                      {/* Price and Notes */}
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="font-mono text-sm font-semibold text-zinc-200">
                          {item.estimatedPrice.toLocaleString('ru-RU')} ₽
                        </span>

                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                          >
                            <span>Магазин</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>

                      {item.notes && (
                        <p className="mt-1 text-[11px] text-zinc-400/80 line-clamp-2">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    {/* Bottom voting controls */}
                    <div className="mt-3 pt-2.5 border-t border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between gap-1 text-[10px]">
                        <div>{renderVoteBadge(item.egorVote, 'Егор')}</div>
                        <div>{renderVoteBadge(item.anyaVote, 'Аня')}</div>
                      </div>

                      {/* Voting buttons */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-zinc-500 font-mono">Е:</span>
                          <button
                            type="button"
                            onClick={() => voteWishlist(item.id, 'egor', 'yes')}
                            className={`flex-1 rounded py-0.5 text-[10px] font-medium transition-colors ${
                              item.egorVote === 'yes'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-white/[0.04] text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            Да
                          </button>
                          <button
                            type="button"
                            onClick={() => voteWishlist(item.id, 'egor', 'maybe')}
                            className={`rounded px-1 py-0.5 text-[10px] font-medium transition-colors ${
                              item.egorVote === 'maybe'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-white/[0.04] text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            ?
                          </button>
                          <button
                            type="button"
                            onClick={() => voteWishlist(item.id, 'egor', 'no')}
                            className={`rounded px-1 py-0.5 text-[10px] font-medium transition-colors ${
                              item.egorVote === 'no'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-white/[0.04] text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            ✕
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-zinc-500 font-mono">А:</span>
                          <button
                            type="button"
                            onClick={() => voteWishlist(item.id, 'anya', 'yes')}
                            className={`flex-1 rounded py-0.5 text-[10px] font-medium transition-colors ${
                              item.anyaVote === 'yes'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-white/[0.04] text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            Да
                          </button>
                          <button
                            type="button"
                            onClick={() => voteWishlist(item.id, 'anya', 'maybe')}
                            className={`rounded px-1 py-0.5 text-[10px] font-medium transition-colors ${
                              item.anyaVote === 'maybe'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-white/[0.04] text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            ?
                          </button>
                          <button
                            type="button"
                            onClick={() => voteWishlist(item.id, 'anya', 'no')}
                            className={`rounded px-1 py-0.5 text-[10px] font-medium transition-colors ${
                              item.anyaVote === 'no'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-white/[0.04] text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Convert to Task CTA when approved */}
                      {isApproved && (
                        <button
                          type="button"
                          onClick={() => convertWishlistToTask(item.id)}
                          className="mt-1 flex w-full items-center justify-center gap-1 rounded bg-zinc-100 hover:bg-white py-1 text-xs font-medium text-zinc-950 transition-colors"
                        >
                          <ShoppingBag className="h-3 w-3" />
                          <span>В задачи покупок</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-white/[0.08] bg-zinc-900 p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/[0.06]">
              <h3 className="text-xs font-semibold text-zinc-100">
                Новая покупка на согласование
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Например: Скатерть? или Коврик в ванную?"
                  className="w-full rounded border border-white/[0.08] bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Примерная цена (₽)
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="1500"
                    className="w-full rounded border border-white/[0.08] bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Категория
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded border border-white/[0.08] bg-zinc-950 px-2 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-400"
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
                <label className="block text-xs text-zinc-400 mb-1">
                  Ссылка на товар (Ozon / WB / Яндекс.Маркет)
                </label>
                <input
                  type="url"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded border border-white/[0.08] bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Зачем / детали
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Размеры, цвет, почему нам это нужно..."
                  className="w-full rounded border border-white/[0.08] bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Кто предлагает
                </label>
                <select
                  value={newAddedBy}
                  onChange={(e) => setNewAddedBy(e.target.value as 'egor' | 'anya')}
                  className="w-full rounded border border-white/[0.08] bg-zinc-950 px-2 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-400"
                >
                  <option value="egor">Егор</option>
                  <option value="anya">Аня</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="rounded bg-zinc-100 hover:bg-white px-3 py-1 text-xs font-medium text-zinc-950"
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
