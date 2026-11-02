import React, { useState } from 'react';
import { 
  GraduationCap, 
  Play, 
  Pause, 
  RotateCcw, 
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNexusStore } from '@/store/useNexusStore';

export const ShadcnStudyWork: React.FC = () => {
  const { 
    studyWorkItems, 
    pomodoroMode, 
    pomodoroTimeLeft, 
    pomodoroIsRunning, 
    pomodoroCompletedSessions,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    setPomodoroMode,
    rudnSubjects
  } = useNexusStore();

  const [activeTab, setActiveTab] = useState<'kanban' | 'pomodoro' | 'brs'>('kanban');

  const minutes = Math.floor(pomodoroTimeLeft / 60);
  const seconds = pomodoroTimeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const spaces = [
    { id: 'hse-egor', label: 'ВШЭ Магистратура (Егор)', color: 'text-sky-400' },
    { id: 'rudn-anya', label: 'РУДН (Аня)', color: 'text-purple-400' },
    { id: 'yaprofi-dfo', label: '«Я-Профи» ДФО', color: 'text-amber-400' },
  ];

  const getFilteredItems = (spaceId: string) => {
    return studyWorkItems.filter(item => item.space === spaceId);
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 max-w-[1600px] mx-auto w-full pb-8">
      {/* ── 1. TOP NAV & POMODORO STRIP ── */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-sky-400" />
              <h3 className="text-base font-semibold leading-none">
                Учеба, Магистратура & «Я-Профессионал»
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              НИУ ВШЭ, РУДН и Координация ДФО ⇄ ЦФО
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'kanban'
                  ? 'bg-secondary text-secondary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Канбан дел
            </button>
            <button
              onClick={() => setActiveTab('pomodoro')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'pomodoro'
                  ? 'bg-secondary text-secondary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Фокус-таймер ({timeFormatted})
            </button>
            <button
              onClick={() => setActiveTab('brs')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'brs'
                  ? 'bg-secondary text-secondary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              БРС & Калькулятор
            </button>
          </div>
        </div>

        {/* Mini Focus Bar */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold font-mono-num tracking-wider">
              {timeFormatted}
            </div>
            <Badge variant="outline" className="text-xs">
              {pomodoroMode === 'work' ? 'Фокус (25 мин)' : 'Отдых'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => pomodoroIsRunning ? pausePomodoro() : startPomodoro()}
              className="h-8 gap-1.5 text-xs font-medium"
            >
              {pomodoroIsRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{pomodoroIsRunning ? 'Пауза' : 'Старт'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => resetPomodoro()}
              className="h-8 w-8 p-0"
              title="Сбросить таймер"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. THREE ACADEMIC SPACES COLUMNS ── */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {spaces.map((sp) => {
            const items = getFilteredItems(sp.id);

            return (
              <div key={sp.id} className="rounded-xl border bg-card text-card-foreground shadow-xs p-5 flex flex-col space-y-4">
                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <BookOpen className={`h-4 w-4 ${sp.color}`} />
                    <span className="text-sm font-semibold">{sp.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {items.length}
                  </Badge>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[460px] [scrollbar-width:thin]">
                  {items.map((it) => {
                    const isDone = it.status === 'done';

                    return (
                      <div
                        key={it.id}
                        className={`p-3 rounded-lg border text-xs transition-colors space-y-2 ${
                          isDone 
                            ? 'bg-muted/30 border-transparent opacity-50 line-through' 
                            : 'bg-muted/10 hover:bg-muted/30 border-border'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-sm leading-tight">{it.title}</span>
                          {it.deadline && (
                            <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                              До {it.deadline}
                            </span>
                          )}
                        </div>
                        {it.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {it.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <Badge variant="outline" className="text-[10px]">
                            {it.priority === 'high' ? 'Срочно' : 'Планово'}
                          </Badge>
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {it.user === 'egor' ? 'Егор' : 'Аня'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 3. POMODORO FULL VIEW ── */}
      {activeTab === 'pomodoro' && (
        <div className="rounded-xl border bg-card text-card-foreground shadow-xs p-10 flex flex-col items-center justify-center space-y-6 text-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPomodoroMode('work')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                pomodoroMode === 'work' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              Фокус 25 мин
            </button>
            <button
              onClick={() => setPomodoroMode('shortBreak')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                pomodoroMode === 'shortBreak' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              Короткий перерыв 5 мин
            </button>
            <button
              onClick={() => setPomodoroMode('longBreak')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                pomodoroMode === 'longBreak' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              Длинный перерыв 15 мин
            </button>
          </div>

          <div className="text-7xl font-bold font-mono tracking-widest text-primary py-4">
            {timeFormatted}
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="lg"
              onClick={() => pomodoroIsRunning ? pausePomodoro() : startPomodoro()}
              className="px-8 font-semibold text-sm"
            >
              {pomodoroIsRunning ? 'Пауза' : 'Запустить сессию'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => resetPomodoro()}
            >
              Сброс
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Завершено сессий сегодня: {pomodoroCompletedSessions}
          </p>
        </div>
      )}

      {/* ── 4. BRS CALCULATOR ── */}
      {activeTab === 'brs' && (
        <div className="rounded-xl border bg-card text-card-foreground shadow-xs p-6 space-y-6">
          <h3 className="text-base font-semibold">
            Балльно-рейтинговая система (БРС) РУДН & ВШЭ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rudnSubjects.map((subj) => {
              const total = subj.currentControl + subj.milestoneControl + subj.finalExam;
              return (
                <div key={subj.id} className="p-4 rounded-lg border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">{subj.subjectName}</span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {total} / 100
                    </Badge>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Текущий контроль (макс. 60)</span>
                      <span className="font-mono">{subj.currentControl}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Рубежный контроль (макс. 20)</span>
                      <span className="font-mono">{subj.milestoneControl}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Экзамен (макс. 20)</span>
                      <span className="font-mono">{subj.finalExam}</span>
                    </div>
                  </div>
                  <Progress value={total} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
