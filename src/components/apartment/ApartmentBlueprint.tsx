import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Sparkles, 
  Wrench, 
  Droplet, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ChevronRight, 
  Flame, 
  ShieldCheck, 
  ShoppingBag, 
  Layers
} from 'lucide-react';
import { useNexusStore } from '../../store/useNexusStore';
import { RoomArea, BlueprintPin, NexusTask } from '../../types/nexus';
import { soundEffects } from '../../utils/soundEffects';

interface RoomMeta {
  id: RoomArea;
  label: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  catTargetX: number;
  catTargetY: number;
  color: string;
  description: string;
}

const ROOMS_CONFIG: RoomMeta[] = [
  {
    id: 'Ванная',
    label: 'Ванная комната',
    icon: '🚿',
    x: 40,
    y: 40,
    width: 250,
    height: 250,
    catTargetX: 165,
    catTargetY: 165,
    color: '#06b6d4',
    description: 'Душевая кабина, стиральная машина, инсталляция и полотенцесушитель.',
  },
  {
    id: 'Кухня',
    label: 'Кухня & Столовая',
    icon: '🍳',
    x: 320,
    y: 40,
    width: 360,
    height: 250,
    catTargetX: 500,
    catTargetY: 165,
    color: '#f59e0b',
    description: 'Кухонный гарнитур, фильтр питьевой воды, обеденный стол для двоих.',
  },
  {
    id: 'Балкон',
    label: 'Балкон / Лоджия',
    icon: '🌿',
    x: 710,
    y: 40,
    width: 220,
    height: 250,
    catTargetX: 820,
    catTargetY: 165,
    color: '#10b981',
    description: 'Панорамные стеклопакеты, зона хранения коробок и уютный релакс.',
  },
  {
    id: 'Коридор',
    label: 'Прихожая / Коридор',
    icon: '🚪',
    x: 40,
    y: 320,
    width: 250,
    height: 340,
    catTargetX: 165,
    catTargetY: 490,
    color: '#8b5cf6',
    description: 'Входная дверь, зеркало в полный рост, обувница и щиток автоматов.',
  },
  {
    id: 'Комната',
    label: 'Комната (Спальня & Дримтим Офис)',
    icon: '💻',
    x: 320,
    y: 320,
    width: 610,
    height: 340,
    catTargetX: 625,
    catTargetY: 490,
    color: '#ec4899',
    description: 'Двойное рабочее место (ВШЭ Егора x РУДН/ДФО Ани), диван, кровать и шкаф.',
  },
];

export const ApartmentBlueprint: React.FC = () => {
  const {
    tasks,
    wishlist,
    blueprintPins,
    selectedBlueprintRoom,
    setSelectedBlueprintRoom,
    updatePinStatus,
    toggleTaskCompletion,
    addTask,
  } = useNexusStore();

  const [activePin, setActivePin] = useState<BlueprintPin | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const currentRoomMeta = ROOMS_CONFIG.find((r) => r.id === selectedBlueprintRoom) || ROOMS_CONFIG[0];

  // Calculate live room completion stats
  const getRoomStats = (roomName: RoomArea) => {
    const roomTasks = tasks.filter((t) => t.room === roomName);
    const completedTasks = roomTasks.filter((t) => t.completed);
    const roomPins = blueprintPins.filter((p) => p.room === roomName);
    const solvedPins = roomPins.filter((p) => p.status === 'solved');

    const totalItems = roomTasks.length + roomPins.length;
    const finishedItems = completedTasks.length + solvedPins.length;
    const percent = totalItems > 0 ? Math.round((finishedItems / totalItems) * 100) : 100;

    const roomWishlist = wishlist.filter(
      (w) => w.category.toLowerCase().includes(roomName.toLowerCase()) || (roomName === 'Кухня' && w.category.includes('Посуда'))
    );

    return {
      totalTasks: roomTasks.length,
      openTasks: roomTasks.length - completedTasks.length,
      completedTasks: completedTasks.length,
      totalPins: roomPins.length,
      unsolvedPins: roomPins.filter((p) => p.status !== 'solved').length,
      wishlistCount: roomWishlist.length,
      percent,
    };
  };

  const handleRoomClick = (roomName: RoomArea) => {
    soundEffects.playClick();
    setSelectedBlueprintRoom(roomName);
    setActivePin(null);
  };

  const handlePinClick = (e: React.MouseEvent, pin: BlueprintPin) => {
    e.stopPropagation();
    soundEffects.playClick();
    setActivePin(pin);
    setSelectedBlueprintRoom(pin.room);
  };

  const handleAddNewRoomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle.trim(),
      completed: false,
      bracketColor: 'active',
      category: '📦 Для дома!',
      room: selectedBlueprintRoom,
      assignee: 'together',
      date: 'inbox',
      tags: ['ремонт', selectedBlueprintRoom.toLowerCase()],
    });

    setNewTaskTitle('');
    setIsAddingTask(false);
    soundEffects.playSuccess();
  };

  const roomTasks = tasks.filter((t) => t.room === selectedBlueprintRoom);
  const roomWishlist = wishlist.filter(
    (w) =>
      w.category.toLowerCase().includes(selectedBlueprintRoom.toLowerCase()) ||
      (selectedBlueprintRoom === 'Кухня' && w.category.includes('Посуда'))
  );
  const roomPins = blueprintPins.filter((p) => p.room === selectedBlueprintRoom);

  const roomEstimatedRepairCost = roomPins.reduce((acc, p) => acc + (p.estimatedCost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Room Switcher Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0d0e19]/80 p-5 backdrop-blur-2xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                Интерактивный Архитектурный План Квартиры
                <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 px-2.5 py-0.5 text-[11px] font-mono text-amber-300 border border-amber-500/30">
                  Starry Cozy Blueprint
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Кликай по комнатам — Котик Нексус перебегает в выбранную зону, зажигая тёплый свет `#f59e0b`!
              </p>
            </div>
          </div>
        </div>

        {/* Room Switcher Pills with Live Percent */}
        <div className="flex flex-wrap items-center gap-2">
          {ROOMS_CONFIG.map((room) => {
            const stats = getRoomStats(room.id);
            const isSelected = selectedBlueprintRoom === room.id;
            return (
              <button
                key={room.id}
                type="button"
                onClick={() => handleRoomClick(room.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-white/[0.04] text-zinc-400 border border-white/10 hover:bg-white/[0.08] hover:text-zinc-200'
                }`}
              >
                <span>{room.icon}</span>
                <span>{room.label.split(' ')[0]}</span>
                <span
                  className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold"
                  style={{
                    backgroundColor: stats.percent >= 75 ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)',
                    color: stats.percent >= 75 ? '#86efac' : '#fde047',
                  }}
                >
                  {stats.percent}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Blueprint SVG Canvas (Left 7 cols) & Room Control Drawer (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Isometric SVG Map */}
        <div className="lg:col-span-8 overflow-hidden rounded-3xl border border-white/10 bg-[#070812]/90 p-4 shadow-2xl backdrop-blur-2xl relative">
          {/* Blueprint Grid Lines Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          {/* SVG Map Container */}
          <div className="relative w-full aspect-[970/700] max-h-[640px]">
            <svg
              viewBox="0 0 970 700"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))' }}
            >
              <defs>
                {/* Cozy Amber Warm Glow Filter */}
                <radialGradient id="warmLightGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#d97706" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="wallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
                </linearGradient>

                <pattern id="blueprintGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                </pattern>
              </defs>

              {/* Apartment Outer Boundaries */}
              <rect
                x="25"
                y="25"
                width="920"
                height="650"
                rx="24"
                fill="#0b0d1b"
                stroke="url(#wallGradient)"
                strokeWidth="4"
              />

              {/* ROOMS RENDER */}
              {ROOMS_CONFIG.map((room) => {
                const isSelected = selectedBlueprintRoom === room.id;
                const stats = getRoomStats(room.id);

                return (
                  <g
                    key={room.id}
                    onClick={() => handleRoomClick(room.id)}
                    className="cursor-pointer transition-all duration-300"
                  >
                    {/* Room Floor Plane */}
                    <rect
                      x={room.x}
                      y={room.y}
                      width={room.width}
                      height={room.height}
                      rx="16"
                      fill={isSelected ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.02)'}
                      stroke={isSelected ? '#f59e0b' : 'rgba(255, 255, 255, 0.12)'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      strokeDasharray={isSelected ? 'none' : '4 2'}
                    />

                    {/* Warm Ambient Lamp when Selected */}
                    {isSelected && (
                      <ellipse
                        cx={room.x + room.width / 2}
                        cy={room.y + room.height / 2}
                        rx={room.width * 0.45}
                        ry={room.height * 0.45}
                        fill="url(#warmLightGlow)"
                        className="animate-pulse"
                      />
                    )}

                    {/* Room Interior Architectural Furniture Accents */}
                    {room.id === 'Ванная' && (
                      <g opacity="0.6">
                        {/* Shower Cabin */}
                        <rect x={room.x + 15} y={room.y + 15} width="85" height="85" rx="8" fill="rgba(6,182,212,0.15)" stroke="#06b6d4" strokeWidth="1.5" />
                        <path d={`M ${room.x + 15} ${room.y + 100} Q ${room.x + 100} ${room.y + 100} ${room.x + 100} ${room.y + 15}`} fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" />
                        {/* Toilet */}
                        <rect x={room.x + 15} y={room.y + 150} width="45" height="60" rx="14" fill="rgba(255,255,255,0.08)" stroke="#94a3b8" strokeWidth="1" />
                        {/* Washing Machine */}
                        <rect x={room.x + 160} y={room.y + 15} width="70" height="70" rx="8" fill="rgba(255,255,255,0.08)" stroke="#94a3b8" strokeWidth="1" />
                        <circle cx={room.x + 195} cy={room.y + 50} r="20" stroke="#94a3b8" strokeWidth="1" fill="none" />
                      </g>
                    )}

                    {room.id === 'Кухня' && (
                      <g opacity="0.6">
                        {/* Countertop */}
                        <rect x={room.x + 15} y={room.y + 15} width="220" height="50" rx="6" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth="1.5" />
                        {/* Sink */}
                        <rect x={room.x + 140} y={room.y + 22} width="45" height="36" rx="6" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                        {/* Dining Table */}
                        <rect x={room.x + 80} y={room.y + 120} width="160" height="80" rx="12" fill="rgba(255,255,255,0.06)" stroke="#f59e0b" strokeWidth="1" />
                        <circle cx={room.x + 160} cy={room.y + 100} r="14" fill="rgba(255,255,255,0.1)" />
                        <circle cx={room.x + 160} cy={room.y + 220} r="14" fill="rgba(255,255,255,0.1)" />
                      </g>
                    )}

                    {room.id === 'Балкон' && (
                      <g opacity="0.6">
                        {/* Panoramic Window Railing */}
                        <line x1={room.x + 200} y1={room.y + 15} x2={room.x + 200} y2={room.y + 235} stroke="#10b981" strokeWidth="3" strokeDasharray="8 4" />
                        {/* Storage Boxes */}
                        <rect x={room.x + 20} y={room.y + 20} width="65" height="55" rx="4" fill="rgba(234,179,8,0.2)" stroke="#eab308" strokeWidth="1.2" />
                        <rect x={room.x + 95} y={room.y + 20} width="65" height="55" rx="4" fill="rgba(234,179,8,0.2)" stroke="#eab308" strokeWidth="1.2" />
                        {/* Chill Bench */}
                        <rect x={room.x + 20} y={room.y + 140} width="140" height="60" rx="8" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="1" />
                      </g>
                    )}

                    {room.id === 'Комната' && (
                      <g opacity="0.6">
                        {/* Dual Workspace Desks */}
                        <rect x={room.x + 20} y={room.y + 20} width="220" height="60" rx="8" fill="rgba(168,85,247,0.15)" stroke="#a855f7" strokeWidth="1.5" />
                        <rect x={room.x + 60} y={room.y + 35} width="60" height="15" rx="3" fill="#38bdf8" />
                        <rect x={room.x + 140} y={room.y + 35} width="60" height="15" rx="3" fill="#ec4899" />
                        {/* Cozy Bed / Sofa */}
                        <rect x={room.x + 360} y={room.y + 120} width="220" height="180" rx="16" fill="rgba(236,72,153,0.12)" stroke="#ec4899" strokeWidth="1.5" />
                        <rect x={room.x + 380} y={room.y + 135} width="80" height="40" rx="6" fill="rgba(255,255,255,0.15)" />
                        <rect x={room.x + 480} y={room.y + 135} width="80" height="40" rx="6" fill="rgba(255,255,255,0.15)" />
                        {/* Wardrobe */}
                        <rect x={room.x + 20} y={room.y + 240} width="260" height="70" rx="8" fill="rgba(255,255,255,0.06)" stroke="#94a3b8" strokeWidth="1" />
                        {/* Center Chandelier */}
                        <circle cx={room.x + 280} cy={room.y + 160} r="18" fill="rgba(245,158,11,0.3)" stroke="#f59e0b" strokeWidth="2" />
                        <circle cx={room.x + 280} cy={room.y + 160} r="6" fill="#f59e0b" />
                      </g>
                    )}

                    {/* Room Label & Percent Badge */}
                    <g transform={`translate(${room.x + 18}, ${room.y + 30})`}>
                      <text
                        fill={isSelected ? '#fde047' : '#e4e4e7'}
                        fontSize="14"
                        fontWeight="bold"
                        fontFamily="ui-sans-serif, system-ui"
                      >
                        {room.icon} {room.label}
                      </text>
                      <text
                        y="18"
                        fill="rgba(255,255,255,0.6)"
                        fontSize="10"
                        fontFamily="ui-monospace, monospace"
                      >
                        Уют: {stats.percent}% ({stats.completedTasks}/{stats.totalTasks} задач)
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* PROBLEM PINS RENDER */}
              {blueprintPins.map((pin) => {
                const room = ROOMS_CONFIG.find((r) => r.id === pin.room);
                if (!room) return null;

                const pinX = room.x + (room.width * pin.x) / 100;
                const pinY = room.y + (room.height * pin.y) / 100;
                const isSolved = pin.status === 'solved';
                const isInProgress = pin.status === 'in_progress';

                const pinColor = isSolved ? '#22c55e' : isInProgress ? '#eab308' : '#ef4444';

                return (
                  <g
                    key={pin.id}
                    onClick={(e) => handlePinClick(e, pin)}
                    className="cursor-pointer transition-transform hover:scale-125"
                  >
                    {/* Pulsing beacon if not solved */}
                    {!isSolved && (
                      <circle
                        cx={pinX}
                        cy={pinY}
                        r="18"
                        fill={pinColor}
                        opacity="0.25"
                        className="animate-ping"
                      />
                    )}

                    {/* Pin Outer Circle */}
                    <circle
                      cx={pinX}
                      cy={pinY}
                      r="12"
                      fill="#0e0f1a"
                      stroke={pinColor}
                      strokeWidth="2.5"
                      style={{ filter: `drop-shadow(0 0 6px ${pinColor})` }}
                    />

                    {/* Pin Inner Dot */}
                    <circle cx={pinX} cy={pinY} r="5" fill={pinColor} />

                    {/* Pin Tag Label */}
                    <g transform={`translate(${pinX + 16}, ${pinY + 4})`}>
                      <rect
                        x="-4"
                        y="-12"
                        width={pin.title.length * 7 + 14}
                        height="18"
                        rx="6"
                        fill="#0b0d1b"
                        stroke={pinColor}
                        strokeWidth="1"
                        opacity="0.9"
                      />
                      <text
                        fill="#ffffff"
                        fontSize="9.5"
                        fontWeight="600"
                        fontFamily="ui-sans-serif, system-ui"
                      >
                        {pin.title}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* CYBER-CAT MASCOT RELOCATION ON SVG */}
              <motion.g
                animate={{
                  x: currentRoomMeta.catTargetX,
                  y: currentRoomMeta.catTargetY,
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 120 }}
                style={{ pointerEvents: 'none' }}
              >
                {/* Cat Glow Aura */}
                <circle cx="0" cy="0" r="28" fill="rgba(168,85,247,0.25)" className="animate-pulse" />

                {/* Cyber Cat Mini SVG Avatar */}
                <ellipse cx="0" cy="0" rx="18" ry="15" fill="#120c22" stroke="#a855f7" strokeWidth="2" />
                {/* Ears */}
                <polygon points="-12,-8 -16,-20 -6,-12" fill="#ec4899" />
                <polygon points="12,-8 16,-20 6,-12" fill="#ec4899" />
                {/* Glowing Eyes */}
                <circle cx="-6" cy="-2" r="2.5" fill="#38bdf8" />
                <circle cx="6" cy="-2" r="2.5" fill="#38bdf8" />
                {/* Smile */}
                <path d="M-3 4 Q0 6 3 4" stroke="#f43f5e" strokeWidth="1.2" fill="none" />
                {/* Speech Bubble */}
                <g transform="translate(-40, -42)">
                  <rect x="0" y="0" width="80" height="20" rx="8" fill="#1a1130" stroke="#a855f7" strokeWidth="1" />
                  <text x="40" y="14" fill="#fde047" fontSize="9" fontWeight="bold" textAnchor="middle">
                    Нексус здесь! 🐾
                  </text>
                </g>
              </motion.g>
            </svg>
          </div>
        </div>

        {/* Right: Detailed Room Control & Problem Solving Drawer */}
        <div className="lg:col-span-4 space-y-5">
          {/* Active Room Header Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e19]/90 p-5 shadow-xl backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentRoomMeta.icon}</span>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">{currentRoomMeta.label}</h3>
                  <p className="text-xs text-zinc-400">{currentRoomMeta.description}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-xl font-extrabold text-amber-400">
                  {getRoomStats(currentRoomMeta.id).percent}%
                </span>
                <span className="block text-[10px] uppercase font-mono text-zinc-400">Готовность уюта</span>
              </div>
            </div>

            {/* Room Repair Budget Summary */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-white/[0.04] p-3 border border-white/[0.06] text-xs">
              <span className="text-zinc-400">Оценка бюджета на устранение дефектов:</span>
              <span className="font-mono font-bold text-emerald-400">
                {roomEstimatedRepairCost.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>

          {/* Active Problem Pin Details (if selected) */}
          <AnimatePresence>
            {activePin && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 shadow-lg backdrop-blur-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-amber-400" />
                    <h4 className="font-semibold text-amber-200 text-sm">{activePin.title}</h4>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                      activePin.status === 'solved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : activePin.status === 'in_progress'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {activePin.status === 'solved'
                      ? 'Решено'
                      : activePin.status === 'in_progress'
                      ? 'В процессе'
                      : 'Проблема'}
                  </span>
                </div>

                <p className="mt-2 text-xs text-zinc-300 leading-relaxed">{activePin.notes}</p>

                {activePin.estimatedCost && (
                  <p className="mt-2 text-xs font-mono text-zinc-400">
                    Бюджет материалов: <strong className="text-amber-300">{activePin.estimatedCost} ₽</strong>
                  </p>
                )}

                {/* Status Toggle Buttons */}
                <div className="mt-3 flex items-center gap-2">
                  {activePin.status !== 'solved' && (
                    <button
                      type="button"
                      onClick={() => updatePinStatus(activePin.id, 'solved')}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Отметить решенным! (+30 XP)</span>
                    </button>
                  )}
                  {activePin.status === 'solved' && (
                    <button
                      type="button"
                      onClick={() => updatePinStatus(activePin.id, 'problem')}
                      className="rounded-lg bg-white/10 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/20"
                    >
                      Вернуть в проблемы
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Room Tasks Section */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e19]/90 p-5 shadow-xl backdrop-blur-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <span>Задачи по зоне: {currentRoomMeta.label.split(' ')[0]}</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                  {roomTasks.length}
                </span>
              </h4>

              <button
                type="button"
                onClick={() => setIsAddingTask(!isAddingTask)}
                className="flex items-center gap-1 rounded-lg bg-white/[0.06] px-2 py-1 text-xs font-medium text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>Добавить</span>
              </button>
            </div>

            {/* Quick Add Task Form */}
            {isAddingTask && (
              <form onSubmit={handleAddNewRoomTask} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder={`Новая задача для ${currentRoomMeta.label}...`}
                  autoFocus
                  className="flex-1 rounded-xl border border-white/15 bg-black/60 px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-amber-400"
                >
                  OK
                </button>
              </form>
            )}

            {/* Tasks List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {roomTasks.length === 0 ? (
                <p className="text-xs text-zinc-500 py-3 text-center">Все дела в этой комнате завершены! 🌟</p>
              ) : (
                roomTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleTaskCompletion(t.id)}
                    className={`flex items-center justify-between gap-3 rounded-xl p-2.5 text-xs transition-all cursor-pointer border ${
                      t.completed
                        ? 'border-emerald-500/20 bg-emerald-950/20 text-zinc-400 opacity-60'
                        : 'border-white/10 bg-black/40 text-zinc-200 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          t.completed
                            ? 'border-emerald-500 bg-emerald-500 text-black'
                            : 'border-zinc-500 hover:border-amber-400'
                        }`}
                      >
                        {t.completed && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                      </span>
                      <span className={`truncate ${t.completed ? 'line-through' : 'font-medium'}`}>
                        {t.title}
                      </span>
                    </div>

                    <span className="font-mono text-[10px] text-zinc-400 shrink-0">
                      {t.assignee === 'egor' ? 'Егор' : t.assignee === 'anya' ? 'Аня' : 'Вместе'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Room Wishlist Section */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e19]/90 p-5 shadow-xl backdrop-blur-2xl space-y-3">
            <h4 className="text-sm font-bold text-zinc-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-pink-400" />
                <span>Товары в вишлисте для зоны</span>
              </span>
              <span className="rounded-full bg-pink-500/20 px-2 py-0.5 font-mono text-[10px] text-pink-300">
                {roomWishlist.length}
              </span>
            </h4>

            <div className="space-y-2">
              {roomWishlist.length === 0 ? (
                <p className="text-xs text-zinc-500 py-2">Нет ожидающих покупок для этой комнаты</p>
              ) : (
                roomWishlist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-white/[0.04] p-2.5 text-xs border border-white/10"
                  >
                    <div>
                      <span className="font-medium text-zinc-200">{item.title}</span>
                      <span className="block font-mono text-[10px] text-zinc-400">
                        {item.estimatedPrice.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>

                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold ${
                        item.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {item.status === 'approved' ? 'Одобрено' : 'Голосуем'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
