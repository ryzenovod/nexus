import React, { useState } from 'react';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Check, 
  Receipt, 
  Zap, 
  Droplet, 
  Flame, 
  Wifi, 
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const ShadcnFinances: React.FC = () => {
  const { 
    budget, 
    transactions, 
    utilityBills, 
    updateBudgetBalance,
    updateBudgetContributions,
    claimGpbCashback,
    gpbCashbackClaimed,
    toggleTaskCompletion,
    tasks
  } = useNexusStore();

  const [isGpbModalOpen, setIsGpbModalOpen] = useState(false);
  const [gpbAmount, setGpbAmount] = useState('3000');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositUser, setDepositUser] = useState<'egor' | 'anya'>('egor');
  const [depositAmount, setDepositAmount] = useState('10000');

  const budgetCollected = budget.currentBalance;
  const budgetTarget = budget.totalTarget || 80000;
  const budgetProgress = Math.min(100, Math.round((budgetCollected / budgetTarget) * 100));

  const egorTarget = 40000;
  const anyaTarget = 40000;
  const egorProgress = Math.min(100, Math.round((budget.egorContribution / egorTarget) * 100));
  const anyaProgress = Math.min(100, Math.round((budget.anyaContribution / anyaTarget) * 100));

  // 5 real banks of Egor & Anya
  const bankCards = [
    {
      id: 'sber',
      name: 'СБЕРБАНК',
      owner: 'Аня (Belousova)',
      digits: '•••• 7714',
      type: 'MIR',
      program: 'СберСпасибо',
      accentColor: 'border-emerald-500/30 text-emerald-400',
      categories: ['ВкусВилл 5%', 'Супермаркеты 3%', 'Аптеки 4%', 'Транспорт 3%'],
    },
    {
      id: 'tbank',
      name: 'Т-БАНК BLACK',
      owner: 'Егор & Аня (Общий счет)',
      digits: '•••• 5529',
      type: 'MIR',
      program: 'Titanium Cashback',
      accentColor: 'border-yellow-500/30 text-yellow-400',
      categories: ['Супермаркеты 5%', 'Рестораны 5%', 'Дом & Ремонт 5%', '1% на всё'],
    },
    {
      id: 'wb',
      name: 'WB БАНК',
      owner: 'Егор (Кошелек)',
      digits: '•••• 8831',
      type: 'MIR',
      program: 'Wildberries Discount',
      accentColor: 'border-purple-500/30 text-purple-400',
      categories: ['Скидки WB до 10%', 'Супермаркеты 3%'],
    },
    {
      id: 'alfa',
      name: 'АЛЬФА-БАНК',
      owner: 'Егор (Альфа-Карта)',
      digits: '•••• 1409',
      type: 'MIR',
      program: 'Альфа-Выгода',
      accentColor: 'border-red-500/30 text-red-400',
      categories: ['Супермаркеты 5%', 'АЗС 5%', 'Кафе & Фастфуд 5%'],
    },
    {
      id: 'gpb',
      name: 'ГАЗПРОМБАНК',
      owner: 'Егор (Сапфир)',
      digits: '•••• 9276',
      type: 'MIR',
      program: 'Акция 25% Сапфир',
      accentColor: 'border-blue-500/30 text-blue-400',
      categories: ['Супермаркеты 25%', 'АЗС & Топливо 25%', 'Аптеки 25%'],
      isSpecial: true,
    },
  ];

  const handleConfirmGpbClaim = () => {
    const val = parseFloat(gpbAmount) || 3000;
    claimGpbCashback(val);

    // Find and complete the GPB task in TickTick
    const gpbTask = tasks.find(t => 
      t.id === '6ad8cacebf00032b8b10c84f' || 
      t.title.toLowerCase().includes('газпром')
    );
    if (gpbTask) {
      toggleTaskCompletion(gpbTask.id);
    }
    setIsGpbModalOpen(false);
  };

  const handleConfirmDeposit = () => {
    const val = parseFloat(depositAmount) || 0;
    if (depositUser === 'egor') {
      updateBudgetContributions(budget.egorContribution + val, budget.anyaContribution, budgetTarget);
    } else {
      updateBudgetContributions(budget.egorContribution, budget.anyaContribution + val, budgetTarget);
    }
    setIsDepositModalOpen(false);
  };

  // Recharts demo data for budget dynamics
  const chartData = [
    { name: 'Июл', balance: 52000, utilities: 2100 },
    { name: 'Авг', balance: 64000, utilities: 1850 },
    { name: 'Сен', balance: 78000, utilities: 2400 },
    { name: 'Окт', balance: 80000, utilities: 1950 },
    { name: 'Ноя', balance: budgetCollected, utilities: 1685 },
  ];

  return (
    <div className="flex-1 flex flex-col space-y-6 max-w-[1600px] mx-auto w-full pb-8">
      {/* ── 1. JOINT BUDGET HEADER CARD ── */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Совместный бюджет пары
              </span>
              <Badge variant="secondary" className="text-xs">
                Ноябрь 2026
              </Badge>
            </div>
            <div className="text-3xl font-bold tracking-tight mt-1 font-mono-num">
              {budgetCollected.toLocaleString('ru-RU')} ₽
              <span className="text-base font-normal text-muted-foreground ml-2">
                / {budgetTarget.toLocaleString('ru-RU')} ₽ цель
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Взносы: 10 и 25 числа каждого месяца. Аренда, супермаркеты, ЖКХ и быт.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDepositUser('egor');
                setIsDepositModalOpen(true);
              }}
              className="text-xs"
            >
              + Внести вклад Егора
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDepositUser('anya');
                setIsDepositModalOpen(true);
              }}
              className="text-xs"
            >
              + Внести вклад Ани
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const amount = prompt('Сумма расхода (₽):', '1500');
                if (amount) {
                  const val = parseFloat(amount);
                  if (val > 0) updateBudgetBalance(budgetCollected - val);
                }
              }}
              className="text-xs"
            >
              Записать операцию
            </Button>
          </div>
        </div>

        {/* Contributions breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Вклад Егора</span>
              <span className="font-mono-num font-medium">
                {budget.egorContribution.toLocaleString('ru-RU')} ₽ / {egorTarget.toLocaleString('ru-RU')} ₽ ({egorProgress}%)
              </span>
            </div>
            <Progress value={egorProgress} className="h-2" />
            <p className="text-[11px] text-muted-foreground">
              Аренда, интернет, техника, сантехника, Леруа Мерлен
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Вклад Ани</span>
              <span className="font-mono-num font-medium">
                {budget.anyaContribution.toLocaleString('ru-RU')} ₽ / {anyaTarget.toLocaleString('ru-RU')} ₽ ({anyaProgress}%)
              </span>
            </div>
            <Progress value={anyaProgress} className="h-2" />
            <p className="text-[11px] text-muted-foreground">
              Совместные продукты (ВкусВилл по Сберу 5%), уют, текстиль, посуда
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. APPLE WALLET / 5 BANK CARDS ROW ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold leading-none">
              Банковские карты Егора и Ани (Ноябрь 2026)
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              5 реальных карт с повышенным кэшбэком месяца
            </p>
          </div>
          <Badge variant="outline" className="text-xs text-amber-400 border-amber-400/30">
            Экономия по матрице кэшбэка: ~4 850 ₽/мес
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {bankCards.map((card) => {
            const isGpb = card.id === 'gpb';

            return (
              <div
                key={card.id}
                className="rounded-xl border bg-card text-card-foreground p-4 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-tight">{card.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{card.type}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{card.owner}</div>
                  <div className="text-xs font-mono mt-2 tracking-wider">{card.digits}</div>
                </div>

                <div className="space-y-2 border-t pt-3">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                    Категории кэшбэка
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {card.categories.map((cat, cIdx) => (
                      <span
                        key={cIdx}
                        className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  {isGpb && (
                    <div className="pt-2">
                      {gpbCashbackClaimed ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                          <Check className="h-3.5 w-3.5" />
                          <span>Кэшбэк получен (+3 000 ₽)</span>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsGpbModalOpen(true)}
                          className="w-full h-7 text-xs text-amber-400 border-amber-400/30 hover:bg-amber-400/10 font-medium gap-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Забрать кэшбэк ГПБ</span>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. ЖКХ МОСКВЫ И СЧЕТА TABLE ── */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-xs">
        <div className="p-5 border-b">
          <h3 className="text-base font-semibold leading-none">
            ЖКХ Москвы и регулярные счета квартиры
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Мосэнергосбыт, управляющая компания Домиленд, ЕПД mos.ru и интернет
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Услуга / Поставщик</TableHead>
              <TableHead>Лицевой счет / Сервис</TableHead>
              <TableHead>Период и статус</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
              <TableHead className="text-right w-[140px]">Действие</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>Мосэнергосбыт</span>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">
                ЛС: 84392-104-55 (lk.mosenergosbyt.ru)
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-xs">
                  Показания переданы (день: 1420 / ночь: 680)
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono-num text-xs">0 ₽</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => alert('Показания за текущий месяц уже успешно переданы!')}
                  className="h-7 text-xs"
                >
                  Квитанция
                </Button>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-sky-400" />
                  <span>Домиленд (УК)</span>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">
                Вода гор, хол, отопление, комм. услуги
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-xs">
                  К оплате до 10-го числа
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono-num font-semibold text-xs text-amber-400">
                1 685 ₽
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    alert('Открытие ЛК Домиленд для оплаты...');
                    window.open('https://domiland.ru', '_blank');
                  }}
                  className="h-7 text-xs"
                >
                  Оплатить
                </Button>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-purple-400" />
                  <span>ЕПД mos.ru</span>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">
                Кап.ремонт, ТКО (вывоз мусора)
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  Оплачено (сентябрь 779,86 ₽)
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono-num text-xs">0 ₽</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('https://www.mos.ru', '_blank')}
                  className="h-7 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  mos.ru
                </Button>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-emerald-400" />
                  <span>Wi-Fi (Формула Связи)</span>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">
                Личный кабинет lk.formula-start.ru
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  Оплачено до 15 ноября (550 ₽/мес)
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono-num text-xs">550 ₽</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('http://lk.formula-start.ru', '_blank')}
                  className="h-7 text-xs"
                >
                  ЛК Wi-Fi
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* ── 4. RECHARTS DYNAMICS GRAPH ── */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-xs p-6">
        <h3 className="text-base font-semibold leading-none">
          Динамика бюджета и расходов
        </h3>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Соотношение баланса и коммунальных расходов по месяцам
        </p>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  borderColor: '#27272a', 
                  borderRadius: '8px', 
                  fontSize: '12px',
                  color: '#f4f4f5' 
                }} 
              />
              <Area type="monotone" dataKey="balance" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} name="Баланс" />
              <Area type="monotone" dataKey="utilities" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} name="ЖКХ" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── DIALOG 1: CLAIM GPB CASHBACK ── */}
      <Dialog open={isGpbModalOpen} onOpenChange={setIsGpbModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span>Забрать кэшбэк Газпромбанк</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Акция 25% по карте «Сапфир». Полученная сумма пополнит совместный баланс пары, а задача в TickTick будет автоматически выполнена.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Сумма начисленного кэшбэка (₽)
              </label>
              <Input
                type="number"
                value={gpbAmount}
                onChange={(e) => setGpbAmount(e.target.value)}
                className="mt-1 font-mono text-base"
              />
            </div>
            <div className="p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground space-y-1">
              <p>• Начисление поступит на совместный счет пары.</p>
              <p>• Задача «Получить кэшбек с газпромбанка» закроется в TickTick.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGpbModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleConfirmGpbClaim} className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold">
              Зачислить в бюджет
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG 2: DEPOSIT CONTRIBUTION ── */}
      <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Внести вклад в бюджет: {depositUser === 'egor' ? 'Егор' : 'Аня'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Пополнение общего фонда пары на текущий месяц.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Сумма вклада (₽)</label>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="mt-1 font-mono text-base"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDepositModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleConfirmDeposit}>
              Подтвердить вклад
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
