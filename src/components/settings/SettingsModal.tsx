import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Cloud, 
  Database, 
  Copy, 
  Check, 
  Upload, 
  Download, 
  RotateCcw, 
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { 
  SUPABASE_SQL_SCHEMA, 
  testSupabaseConnection 
} from '../../services/supabaseClient';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    supabaseConfig,
    setSupabaseConfig,
    syncWithSupabase,
    syncWithLivePipeline,
    pushCloudState,
    saveSupabaseToLocalEnv,
    isSyncing,
    isSyncingLive,
    resetToDefaultData,
    tasks,
    budget,
    transactions,
    wishlist,
    studyWorkItems,
    addTask,
  } = useNexusStore();

  const [url, setUrl] = useState(supabaseConfig.url || '');
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);
  const [envSaveStatus, setEnvSaveStatus] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // TickTick Import State
  const [ticktickText, setTicktickText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({ success: false, message: 'Укажите URL и Anon Key проекта Supabase' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(url.trim(), anonKey.trim());
    setIsTesting(false);

    if (res.success) {
      setTestResult({ success: true, message: 'Успешное подключение к Supabase!' });
      setSupabaseConfig({
        url: url.trim(),
        anonKey: anonKey.trim(),
        isConnected: true,
      });
    } else {
      setTestResult({ success: false, message: `Ошибка: ${res.error || 'Не удалось подключиться'}` });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSaveToLocalEnv = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setEnvSaveStatus('Сначала укажите URL и Anon Key выше');
      setTimeout(() => setEnvSaveStatus(null), 3000);
      return;
    }
    const res = await saveSupabaseToLocalEnv(url.trim(), anonKey.trim());
    setEnvSaveStatus(res.message || 'Ключи сохранены!');
    // Also copy bash command
    navigator.clipboard.writeText(`echo "SUPABASE_URL=\\"${url.trim()}\\"\\nSUPABASE_KEY=\\"${anonKey.trim()}\\"" > ~/.config/ubersicht-dashboard/.env`);
    setTimeout(() => setEnvSaveStatus(null), 6000);
  };

  // Export all state to JSON
  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      tasks,
      budget,
      transactions,
      wishlist,
      studyWorkItems,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `nexus-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(downloadUrl);
  };

  // TickTick CSV / JSON Parser
  const handleImportTickTick = () => {
    if (!ticktickText.trim()) return;

    try {
      let importedCount = 0;

      // Try JSON first
      if (ticktickText.trim().startsWith('[') || ticktickText.trim().startsWith('{')) {
        const parsed = JSON.parse(ticktickText);
        const items = Array.isArray(parsed) ? parsed : [parsed];

        items.forEach((item: any) => {
          if (item.title || item.Title) {
            addTask({
              title: item.title || item.Title,
              notes: item.content || item.notes || undefined,
              completed: !!(item.status === 2 || item.completed),
              bracketColor: 'active',
              category: 'Дом',
              room: 'Все',
              assignee: 'together',
              date: item.dueDate ? item.dueDate.slice(0, 10) : 'inbox',
            });
            importedCount++;
          }
        });
      } else {
        // Fallback to CSV format: Title, Date, Content, Priority, etc.
        const lines = ticktickText.split('\n').filter((l) => l.trim().length > 0);
        lines.forEach((line, index) => {
          if (index === 0 && line.toLowerCase().includes('title')) return; // skip header
          const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols[0]) {
            addTask({
              title: cols[0],
              notes: cols[2] || undefined,
              completed: false,
              bracketColor: 'active',
              category: 'Дом',
              room: 'Все',
              assignee: 'together',
              date: cols[1] && cols[1].includes('-') ? cols[1].slice(0, 10) : 'inbox',
            });
            importedCount++;
          }
        });
      }

      setImportStatus(`Успешно импортировано ${importedCount} задач из TickTick!`);
      setTicktickText('');
    } catch (e) {
      setImportStatus('Ошибка при парсинге данных. Проверьте формат CSV или JSON.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#12141a] p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Настройки & Облачная синхронизация NEXUS
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* 1. SUPABASE CLOUD SYNC */}
          <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Подключение к Supabase (Синхронизация для двоих)
                </h3>
              </div>
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold border ${
                  supabaseConfig.isConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-white/[0.04] text-zinc-400 border-white/[0.08]'
                }`}
              >
                {supabaseConfig.isConnected ? 'Подключено' : 'Offline-first (Локально)'}
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              NEXUS работает на 100% автономно без облака. Для мгновенной синхронизации между MacBook, iPhone, Windows-ноутбуком и Samsung создайте бесплатный проект в Supabase и вставьте ключи ниже:
            </p>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-mono text-zinc-300 mb-1">
                  SUPABASE_PROJECT_URL:
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-300 mb-1">
                  SUPABASE_ANON_KEY:
                </label>
                <input
                  type="password"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {testResult && (
              <div
                className={`rounded-lg p-2.5 text-xs border ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                {testResult.message}
              </div>
            )}

            {envSaveStatus && (
              <div className="rounded-lg p-2.5 text-xs bg-sky-500/10 border border-sky-500/30 text-sky-300 font-mono whitespace-pre-line">
                {envSaveStatus}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  {isTesting ? 'Проверка...' : 'Проверить и сохранить'}
                </button>

                <button
                  type="button"
                  onClick={handleSaveToLocalEnv}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 px-3 py-1.5 text-xs font-semibold text-amber-200 transition-colors cursor-pointer"
                  title="Записать ключи в ~/.config/ubersicht-dashboard/.env для автоматического пуша из Übersicht"
                >
                  <span>⚡️ Прописать ключи в fetch_data.py</span>
                </button>
              </div>

              {/* One Click SQL Migration Copy */}
              <button
                type="button"
                onClick={handleCopySql}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.06] hover:bg-white/[0.12] px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>SQL-скрипт скопирован!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-amber-400" />
                    <span>📋 Скопировать готовый SQL для Supabase</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2. TICKTICK IMPORT */}
          <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Импорт задач из TickTick (CSV или JSON)
              </h3>
            </div>

            <p className="text-xs text-zinc-400">
              Экспортируйте задачи из настроек TickTick (Backup) и вставьте текст CSV или JSON в поле ниже:
            </p>

            <textarea
              rows={3}
              value={ticktickText}
              onChange={(e) => setTicktickText(e.target.value)}
              placeholder="Вставьте содержимое CSV или JSON из TickTick..."
              className="w-full rounded-lg border border-white/10 bg-black/50 p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
            />

            {importStatus && (
              <div className="text-xs text-emerald-400 font-medium">
                {importStatus}
              </div>
            )}

            <button
              type="button"
              onClick={handleImportTickTick}
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-amber-400 transition-colors"
            >
              Импортировать в NEXUS
            </button>
          </div>

          {/* 3. BACKUP & SYSTEM RESET */}
          <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Резервная копия и управление данными
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/10 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Скачать бэкап (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Восстановить исходные данные со всеми задачами из скриншота?')) {
                    resetToDefaultData();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Сбросить к задачам из скриншота</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
