import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  ShoppingBag, 
  Zap, 
  Key, 
  MessageSquare, 
  X,
  Bell,
  Heart
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { soundEffects } from '../../utils/soundEffects';

interface TelegramBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramBridgeModal: React.FC<TelegramBridgeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    telegramConfig,
    setTelegramConfig,
    syncTelegramMessages,
    sendTelegramPush,
    isTelegramSyncing,
    wishlist,
    utilityBills,
  } = useNexusStore();

  const [activeTab, setActiveTab] = useState<'quick-actions' | 'settings' | 'guide'>('quick-actions');
  const [tokenInput, setTokenInput] = useState(telegramConfig.botToken || '');
  const [chatEgorInput, setChatEgorInput] = useState(telegramConfig.chatIdEgor || '');
  const [chatAnyaInput, setChatAnyaInput] = useState(telegramConfig.chatIdAnya || '');
  const [chatJointInput, setChatJointInput] = useState(telegramConfig.chatIdJoint || '');
  const [pushStatusMessage, setPushStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setTelegramConfig({
      botToken: tokenInput.trim(),
      chatIdEgor: chatEgorInput.trim(),
      chatIdAnya: chatAnyaInput.trim(),
      chatIdJoint: chatJointInput.trim(),
      isConnected: Boolean(tokenInput.trim() && (chatEgorInput.trim() || chatJointInput.trim() || chatAnyaInput.trim())),
    });
    soundEffects.playSuccess();
    setPushStatusMessage({ text: 'Настройки Telegram бота успешно сохранены!' });
    setTimeout(() => setPushStatusMessage(null), 3000);
  };

  const handleSendPush = async (type: 'shopping' | 'utilities' | 'test') => {
    setIsSending(true);
    setPushStatusMessage(null);
    try {
      const res = await sendTelegramPush(type);
      if (res.success) {
        soundEffects.playSuccess();
        setPushStatusMessage({ text: 'Пуш-уведомление успешно доставлено в Telegram!' });
      } else {
        setPushStatusMessage({ text: `Ошибка: ${res.error || 'Не удалось отправить'}`, error: true });
      }
    } catch (err: any) {
      setPushStatusMessage({ text: err.message || 'Сбой сети', error: true });
    } finally {
      setIsSending(false);
      setTimeout(() => setPushStatusMessage(null), 4000);
    }
  };

  const handleSyncInbox = async () => {
    soundEffects.playClick();
    const res = await syncTelegramMessages();
    if (res.addedCount > 0) {
      soundEffects.playAlert();
      setPushStatusMessage({ text: `Импортировано новых задач из Telegram: ${res.addedCount}!` });
    } else {
      setPushStatusMessage({ text: 'Новых сообщений в Telegram нет (все задачи синхронизированы)' });
    }
    setTimeout(() => setPushStatusMessage(null), 4000);
  };

  const approvedWishlistCount = wishlist.filter((w) => w.status === 'approved' || (w.egorVote === 'yes' && w.anyaVote === 'yes')).length;
  const unpaidBillsCount = utilityBills.filter((b) => b.status !== 'paid').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-xl border border-white/[0.08] bg-[#09090b] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                Telegram-Бот Пары (Direct Bridge)
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                    telegramConfig.isConnected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'
                  }`}
                >
                  {telegramConfig.isConnected ? 'Подключен' : 'Не настроен'}
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Прямая отправка пушей и парсинг задач прямо из браузера (без бэкенда)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-white/10 hover:text-zinc-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-black/40 px-6 py-2">
          <button
            type="button"
            onClick={() => setActiveTab('quick-actions')}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'quick-actions'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ⚡️ Быстрые пуши
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🔑 Токены & Чаты
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'guide'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            📖 Инструкция @BotFather
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {/* Status Message Alert */}
          {pushStatusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-3 text-xs flex items-center gap-2 font-medium border ${
                pushStatusMessage.error
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {pushStatusMessage.error ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              <span>{pushStatusMessage.text}</span>
            </motion.div>
          )}

          {/* TAB 1: QUICK ACTIONS */}
          {activeTab === 'quick-actions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Shopping List Push */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-amber-400" />
                      <h4 className="font-semibold text-zinc-100 text-sm">Список покупок</h4>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                      Красивое сообщение с {approvedWishlistCount} одобренными позициями вишлиста и картой с лучшим кэшбэком.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isSending || !telegramConfig.botToken}
                    onClick={() => handleSendPush('shopping')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-2 text-xs font-semibold text-black shadow-md hover:brightness-110 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Отправить список покупок</span>
                  </button>
                </div>

                {/* 2. Utilities Reminder Push */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-emerald-400" />
                      <h4 className="font-semibold text-zinc-100 text-sm">ЖКХ Москвы & Счетчики</h4>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                      Счета Domiland, Мосэнергосбыт (окно 15–26 числа) и ЕПД ({unpaidBillsCount} неоплаченных).
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isSending || !telegramConfig.botToken}
                    onClick={() => handleSendPush('utilities')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-2 text-xs font-semibold text-black shadow-md hover:brightness-110 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Напомнить про коммуналку</span>
                  </button>
                </div>
              </div>

              {/* 3. Inbound Sync: Get Updates & Parse NLP */}
              <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-sky-200 text-sm flex items-center gap-2">
                    <RefreshCw className={`h-4 w-4 text-sky-400 ${isTelegramSyncing ? 'animate-spin' : ''}`} />
                    <span>Забрать новые задачи из Telegram-чата</span>
                  </h4>
                  <p className="mt-0.5 text-xs text-zinc-300">
                    Любое сообщение из чата бота превращается в задачу (поддерживает даты, @егор, @аня, #вшэ, #рудн).
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isTelegramSyncing || !telegramConfig.botToken}
                  onClick={handleSyncInbox}
                  className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-black hover:bg-sky-400 disabled:opacity-50 shrink-0 shadow-lg shadow-sky-500/20"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTelegramSyncing ? 'animate-spin' : ''}`} />
                  <span>Синхронизировать сейчас</span>
                </button>
              </div>

              {/* 4. Test Push */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-zinc-500">
                  Последняя активность: {telegramConfig.lastSyncAt ? new Date(telegramConfig.lastSyncAt).toLocaleTimeString('ru-RU') : 'Никогда'}
                </span>
                <button
                  type="button"
                  onClick={() => handleSendPush('test')}
                  disabled={isSending || !telegramConfig.botToken}
                  className="text-xs font-medium text-zinc-400 hover:text-zinc-200 underline disabled:opacity-40"
                >
                  Отправить тестовый пинг в чат
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SETTINGS (TOKENS & CHAT IDS) */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Telegram Bot Token (@BotFather)
                </label>
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ..."
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-sky-400"
                />
                <span className="block mt-1 text-[11px] text-zinc-500">
                  Токен сохраняется только локально в браузере (LocalStorage / Zustand persist)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Chat ID Егора
                  </label>
                  <input
                    type="text"
                    value={chatEgorInput}
                    onChange={(e) => setChatEgorInput(e.target.value)}
                    placeholder="Например: 123456789"
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Chat ID Ани
                  </label>
                  <input
                    type="text"
                    value={chatAnyaInput}
                    onChange={(e) => setChatAnyaInput(e.target.value)}
                    placeholder="Например: 987654321"
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Общий Chat ID
                  </label>
                  <input
                    type="text"
                    value={chatJointInput}
                    onChange={(e) => setChatJointInput(e.target.value)}
                    placeholder="-1001234567890"
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              {/* Automatic Push Notification Toggles */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Автоматические оповещения
                </h4>

                <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                  <span>Оповещать партнера, когда закрывается задача</span>
                  <input
                    type="checkbox"
                    checked={telegramConfig.autoNotifyTasks}
                    onChange={(e) => setTelegramConfig({ autoNotifyTasks: e.target.checked })}
                    className="rounded border-white/20 bg-black/50 text-sky-500 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                  <span>Оповещать в общий чат при обоюдном лайке в вишлисте 💜</span>
                  <input
                    type="checkbox"
                    checked={telegramConfig.autoNotifyWishlist}
                    onChange={(e) => setTelegramConfig({ autoNotifyWishlist: e.target.checked })}
                    className="rounded border-white/20 bg-black/50 text-sky-500 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                  <span>Напоминания об открытии окна счетчиков ЖКХ (15–26 числа)</span>
                  <input
                    type="checkbox"
                    checked={telegramConfig.autoNotifyUtilities}
                    onChange={(e) => setTelegramConfig({ autoNotifyUtilities: e.target.checked })}
                    className="rounded border-white/20 bg-black/50 text-sky-500 focus:ring-0"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-xs font-bold text-black shadow-lg shadow-sky-500/25 hover:brightness-110 transition-all"
              >
                Сохранить конфигурацию Telegram
              </button>
            </form>
          )}

          {/* TAB 3: GUIDE ON GETTING BOT & CHAT ID */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                <h4 className="font-bold text-sky-300 text-sm flex items-center gap-2">
                  <span>Шаг 1: Создание бота в @BotFather</span>
                  <ExternalLink className="h-3.5 w-3.5 text-sky-400" />
                </h4>
                <p>
                  1. Откройте Telegram и напишите боту <code className="rounded bg-black/60 px-1.5 py-0.5 text-sky-300">@BotFather</code>.
                  <br />
                  2. Отправьте команду <code className="rounded bg-black/60 px-1.5 py-0.5 text-sky-300">/newbot</code>, задайте имя (например, <em>Nexus Couple Bot</em>) и юзернейм (например, <em>nexus_egor_anya_bot</em>).
                  <br />
                  3. Скопируйте полученный HTTP API Token и вставьте его во вкладку <strong>«Токены & Чаты»</strong>.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                <h4 className="font-bold text-amber-300 text-sm">Шаг 2: Узнать Chat ID</h4>
                <p>
                  1. Напишите боту <code className="rounded bg-black/60 px-1.5 py-0.5 text-amber-300">@userinfobot</code> — он моментально вернет ваш персональный числовой <code className="rounded bg-black/60 px-1.5 py-0.5 text-amber-300">Id</code>.
                  <br />
                  2. Чтобы бот мог слать в общий чат двоих: добавьте созданного бота в чат или группу и перешлите любое сообщение из группы в <code className="rounded bg-black/60 px-1.5 py-0.5 text-amber-300">@getmyid_bot</code>.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                <h4 className="font-bold text-emerald-300 text-sm">Шаг 3: Активация</h4>
                <p>
                  Обязательно откройте диалог с вашим созданным ботом в Telegram и нажмите <strong>«Запустить» (/start)</strong>, чтобы разрешить ему отправлять вам сообщения!
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
