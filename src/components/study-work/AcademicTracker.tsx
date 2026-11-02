import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Calendar, 
  Upload, 
  Calculator, 
  FileText, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { IcsScheduleParser } from '../../utils/icsParser';
import { soundEffects } from '../../utils/soundEffects';

export const AcademicTracker: React.FC = () => {
  const {
    hseCalculators,
    rudnSubjects,
    updateHSEComponentScore,
    updateRUDNSubjectScore,
    importCalendarTasks,
  } = useNexusStore();

  const [activeTab, setActiveTab] = useState<'hse' | 'rudn' | 'ics-import'>('hse');
  const [icsTextInput, setIcsTextInput] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Sample real HSE & RUDN ICS file generator for 1-click test
  const loadSampleIcs = () => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = today.getFullYear();
    const m = pad(today.getMonth() + 1);
    const d = pad(today.getDate());

    const sample = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//HSE RUZ & RUDN Online//NONSGML v1.0//EN
BEGIN:VEVENT
UID:hse-event-101
SUMMARY:ВШЭ: Распределенные системы и консенсус (Семинар)
DTSTART:${y}${m}${d}T103000Z
DTEND:${y}${m}${d}T120000Z
LOCATION:Покровский бульвар, д. 11, ауд. R405 / Zoom
DESCRIPTION:Разбор алгоритма Raft и фазы Leader Election
END:VEVENT
BEGIN:VEVENT
UID:rudn-event-202
SUMMARY:РУДН: Клиническая психология и психосоматика
DTSTART:${y}${m}${d}T140000Z
DTEND:${y}${m}${d}T153000Z
LOCATION:Онлайн-платформа РУДН / Teams
DESCRIPTION:Лекция: Диагностика тревожных расстройств и БРС тест
END:VEVENT
END:VCALENDAR`;

    setIcsTextInput(sample);
  };

  const handleParseAndImport = (contentToParse: string) => {
    if (!contentToParse.trim()) return;

    try {
      const parsedEvents = IcsScheduleParser.parseIcs(contentToParse);
      if (parsedEvents.length === 0) {
        setImportStatus('События не найдены. Проверьте формат .ics файла');
        return;
      }

      const tasks = IcsScheduleParser.convertEventsToTasks(parsedEvents);
      importCalendarTasks(tasks);
      soundEffects.playSuccess();
      setImportStatus(`Успешно импортировано ${tasks.length} пар и занятий в календарь недели!`);
      setIcsTextInput('');
      setTimeout(() => setImportStatus(null), 4000);
    } catch (err: any) {
      setImportStatus(`Ошибка парсинга: ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        handleParseAndImport(text);
      }
    };
    reader.readAsText(file);
  };

  // HSE 10-point scale interpretation
  const getHseGradeLabel = (score: number) => {
    const rounded = Math.round(score);
    if (rounded >= 8) return { label: 'Отлично 🌟', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' };
    if (rounded >= 6) return { label: 'Хорошо 👍', color: '#38bdf8', bg: 'rgba(56,189,248,0.15)' };
    if (rounded >= 4) return { label: 'Удовлетворительно ⚖️', color: '#eab308', bg: 'rgba(234,179,8,0.15)' };
    return { label: 'Неудовлетворительно 🚨', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' };
  };

  // RUDN ECTS translation
  const getRudnEcts = (total: number) => {
    if (total >= 95) return { grade: 'A', desc: 'Отлично (95-100)', color: '#22c55e' };
    if (total >= 86) return { grade: 'B', desc: 'Очень хорошо (86-94)', color: '#38bdf8' };
    if (total >= 69) return { grade: 'C', desc: 'Хорошо (69-85)', color: '#a855f7' };
    if (total >= 61) return { grade: 'D', desc: 'Удовлетворительно (61-68)', color: '#eab308' };
    if (total >= 51) return { grade: 'E', desc: 'Посредственно (51-60)', color: '#f97316' };
    return { grade: 'F', desc: 'Не зачтено (до 50)', color: '#ef4444' };
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-[rgba(18,18,21,0.75)] backdrop-blur-[24px] p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
            <GraduationCap className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <span>Академический Хаб & Калькуляторы Оценок</span>
              <span className="rounded bg-white/[0.05] px-2 py-0.5 text-[10px] font-mono text-zinc-300 border border-white/[0.08]">
                ВШЭ x РУДН
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              10-балльная формула ВШЭ Егора, 100-балльная БРС шкала РУДН Ани и импорт расписания .ics
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('hse')}
            className={`rounded-md px-3 py-1 font-medium transition-colors ${
              activeTab === 'hse'
                ? 'bg-white/[0.09] text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ВШЭ (10 баллов)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rudn')}
            className={`rounded-md px-3 py-1 font-medium transition-colors ${
              activeTab === 'rudn'
                ? 'bg-white/[0.09] text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            РУДН (БРС 100 б.)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ics-import')}
            className={`rounded-md px-3 py-1 font-medium transition-colors ${
              activeTab === 'ics-import'
                ? 'bg-white/[0.09] text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Импорт .ics
          </button>
        </div>
      </div>

      {/* TAB 1: HSE 10-POINT SCALE CALCULATOR (EGOR) */}
      {activeTab === 'hse' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hseCalculators.map((calc) => {
            const rawScore = calc.components.reduce((acc, c) => acc + c.score * c.weight, 0);
            const roundedScore = Math.round(rawScore);
            const status = getHseGradeLabel(rawScore);

            return (
              <div
                key={calc.id}
                className="rounded-3xl border border-white/10 bg-[#0d0e19]/90 p-6 shadow-2xl backdrop-blur-2xl space-y-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-indigo-400">
                      ВШЭ Магистратура • Калькулятор
                    </span>
                    <h3 className="text-base font-bold text-zinc-100 mt-0.5">{calc.courseName}</h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-2xl font-extrabold text-indigo-300">
                      {rawScore.toFixed(2)}
                    </span>
                    <span className="block text-xs font-mono font-bold text-zinc-400">
                      Округление: <strong className="text-white">{roundedScore} из 10</strong>
                    </span>
                  </div>
                </div>

                {/* Score Status Badge */}
                <div
                  className="rounded-2xl p-3 flex items-center justify-between border"
                  style={{ backgroundColor: status.bg, borderColor: status.color }}
                >
                  <span className="text-xs font-medium text-zinc-200">
                    Статус по шкале ВШЭ: <strong style={{ color: status.color }}>{status.label}</strong>
                  </span>
                  <span className="font-mono text-xs text-zinc-400">
                    Цель: {calc.targetScore}+ баллов
                  </span>
                </div>

                {/* Components Formula Sliders */}
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase text-zinc-400">
                    Элементы контроля и веса формулы:
                  </span>

                  {calc.components.map((comp) => (
                    <div key={comp.id} className="space-y-1 rounded-xl bg-black/40 p-3 border border-white/5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-200">{comp.name}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-zinc-500">вес {(comp.weight * 100).toFixed(0)}%</span>
                          <span className="font-bold text-indigo-300 text-sm">{comp.score} / 10</span>
                        </div>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={comp.score}
                        onChange={(e) =>
                          updateHSEComponentScore(calc.id, comp.id, parseInt(e.target.value, 10))
                        }
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: RUDN BRS 100-POINT TRACKER (ANYA) */}
      {activeTab === 'rudn' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {rudnSubjects.map((subj) => {
            const totalScore = subj.currentControl + subj.milestoneControl + subj.finalExam;
            const ects = getRudnEcts(totalScore);

            return (
              <div
                key={subj.id}
                className="rounded-3xl border border-white/10 bg-[#0d0e19]/90 p-5 shadow-2xl backdrop-blur-2xl space-y-4"
              >
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-500">
                    РУДН Онлайн • Психология
                  </span>
                  <h3 className="text-sm font-semibold text-zinc-100 mt-0.5 line-clamp-1">{subj.subjectName}</h3>
                </div>

                {/* Total Score & ECTS Grade */}
                <div className="flex items-center justify-between rounded-lg bg-zinc-950/60 p-3.5 border border-white/[0.06]">
                  <div>
                    <span className="text-[11px] text-zinc-500 block">БРС Балл:</span>
                    <span className="font-mono text-2xl font-bold text-zinc-100">
                      {totalScore} <span className="text-sm text-zinc-500">/ 100</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className="font-mono text-xl font-bold px-2 py-0.5 rounded border"
                      style={{ color: ects.color, borderColor: ects.color, backgroundColor: `${ects.color}15` }}
                    >
                      {ects.grade}
                    </span>
                    <span className="block text-[10px] text-zinc-400 mt-1">{ects.desc}</span>
                  </div>
                </div>

                {/* 3 BRS Controls */}
                <div className="space-y-2 text-xs">
                  {/* 1. Текущий контроль (до 60) */}
                  <div className="rounded bg-white/[0.02] p-2 border border-white/[0.05] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Текущий контроль</span>
                      <span className="font-mono font-medium text-zinc-200">{subj.currentControl} / 60</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={subj.currentControl}
                      onChange={(e) =>
                        updateRUDNSubjectScore(subj.id, 'currentControl', parseInt(e.target.value, 10))
                      }
                      className="w-full accent-zinc-300 cursor-pointer"
                    />
                  </div>

                  {/* 2. Рубежный контроль (до 20) */}
                  <div className="rounded bg-white/[0.02] p-2 border border-white/[0.05] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Рубежный контроль</span>
                      <span className="font-mono font-medium text-zinc-200">{subj.milestoneControl} / 20</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={subj.milestoneControl}
                      onChange={(e) =>
                        updateRUDNSubjectScore(subj.id, 'milestoneControl', parseInt(e.target.value, 10))
                      }
                      className="w-full accent-zinc-300 cursor-pointer"
                    />
                  </div>

                  {/* 3. Итоговый экзамен / зачет (до 20) */}
                  <div className="rounded bg-white/[0.02] p-2 border border-white/[0.05] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Экзамен / Зачет</span>
                      <span className="font-mono font-medium text-zinc-200">{subj.finalExam} / 20</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={subj.finalExam}
                      onChange={(e) =>
                        updateRUDNSubjectScore(subj.id, 'finalExam', parseInt(e.target.value, 10))
                      }
                      className="w-full accent-zinc-300 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: .ICS SCHEDULE IMPORTER */}
      {activeTab === 'ics-import' && (
        <div className="rounded-3xl border border-white/10 bg-[#0d0e19]/90 p-6 shadow-2xl backdrop-blur-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-400" />
                <span>Импорт расписания из RUZ ВШЭ и РУДН Онлайн</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Загрузите .ics файл или вставьте текст календаря — события сразу попадут в еженедельник задач
              </p>
            </div>

            <button
              type="button"
              onClick={loadSampleIcs}
              className="flex items-center gap-1.5 rounded-xl bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Загрузить пример ВШЭ + РУДН</span>
            </button>
          </div>

          {importStatus && (
            <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* File Upload Zone */}
          <div className="rounded-2xl border-2 border-dashed border-white/20 bg-black/40 p-6 text-center hover:border-amber-400/50 transition-colors">
            <Upload className="mx-auto h-8 w-8 text-zinc-400 mb-2" />
            <p className="text-xs text-zinc-300 font-medium">
              Перетащите .ics файл сюда или нажмите для выбора с диска
            </p>
            <input
              type="file"
              accept=".ics,text/calendar"
              onChange={handleFileUpload}
              className="mt-2 block mx-auto text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer"
            />
          </div>

          {/* Direct Raw Text Paste */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400">Либо вставьте текст .ics напрямую:</label>
            <textarea
              rows={6}
              value={icsTextInput}
              onChange={(e) => setIcsTextInput(e.target.value)}
              placeholder="BEGIN:VCALENDAR&#10;BEGIN:VEVENT&#10;SUMMARY:Лекция...&#10;END:VEVENT&#10;END:VCALENDAR"
              className="w-full rounded-2xl border border-white/10 bg-black/60 p-3 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="button"
            onClick={() => handleParseAndImport(icsTextInput)}
            disabled={!icsTextInput.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-500/25 hover:brightness-110 disabled:opacity-50 transition-all"
          >
            Распарсить и добавить пары в еженедельник NEXUS
          </button>
        </div>
      )}
    </div>
  );
};
