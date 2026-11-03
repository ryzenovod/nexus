import React, { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';

interface InlineTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  emptyText?: string;
  disabled?: boolean;
  showIcon?: boolean;
}

export const InlineText: React.FC<InlineTextProps> = ({
  value,
  onChange,
  placeholder = 'Нажмите для ввода...',
  className = '',
  inputClassName = '',
  emptyText,
  disabled = false,
  showIcon = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value || '');
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== value) {
      onChange(trimmed);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDraft(value || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing && !disabled) {
    return (
      <span className="inline-block" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={`bg-white/[0.1] text-white px-2 py-0.5 rounded-lg outline-none ring-1 ring-white/30 font-inherit text-inherit ${inputClassName}`}
        />
      </span>
    );
  }

  const displayContent = value || emptyText || placeholder;
  const isPlaceholder = !value && (emptyText || placeholder);

  return (
    <span
      onClick={(e) => {
        if (disabled) return;
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={`group relative inline-flex items-center gap-1.5 transition-colors cursor-text rounded-lg px-1.5 -mx-1.5 hover:bg-white/[0.06] ${className}`}
      title={disabled ? undefined : 'Нажмите для редактирования прямо на месте'}
    >
      <span className={isPlaceholder ? 'text-zinc-500 italic' : ''}>
        {displayContent}
      </span>
      {showIcon && !disabled && (
        <Pencil className="h-3 w-3 shrink-0 text-zinc-400 opacity-0 group-hover:opacity-60 transition-opacity" />
      )}
    </span>
  );
};

interface InlineNumberProps {
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  showIcon?: boolean;
  formatValue?: (val: number) => string;
}

export const InlineNumber: React.FC<InlineNumberProps> = ({
  value,
  onChange,
  prefix = '',
  suffix = ' ₽',
  placeholder = '0',
  className = '',
  inputClassName = '',
  disabled = false,
  min = 0,
  max,
  showIcon = true,
  formatValue,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? 0));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(String(value ?? 0));
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    // Parse cleaned number (supporting spaces or commas)
    const cleaned = draft.replace(/[^\d.-]/g, '').replace(',', '.');
    let parsed = parseFloat(cleaned);
    if (isNaN(parsed)) parsed = 0;
    if (min !== undefined && parsed < min) parsed = min;
    if (max !== undefined && parsed > max) parsed = max;

    if (parsed !== value) {
      onChange(parsed);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDraft(String(value ?? 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing && !disabled) {
    return (
      <span className="inline-block" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={`bg-white/[0.1] text-white px-2 py-0.5 rounded-lg outline-none ring-1 ring-white/30 font-inherit text-inherit tabular-nums ${inputClassName}`}
        />
      </span>
    );
  }

  const formatted = formatValue 
    ? formatValue(value ?? 0) 
    : (value ?? 0).toLocaleString('ru-RU');

  return (
    <span
      onClick={(e) => {
        if (disabled) return;
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={`group relative inline-flex items-center gap-1.5 transition-colors cursor-text rounded-lg px-1.5 -mx-1.5 hover:bg-white/[0.06] tabular-nums ${className}`}
      title={disabled ? undefined : 'Нажмите для изменения суммы'}
    >
      <span>
        {prefix}{formatted}{suffix}
      </span>
      {showIcon && !disabled && (
        <Pencil className="h-3 w-3 shrink-0 text-zinc-400 opacity-0 group-hover:opacity-60 transition-opacity" />
      )}
    </span>
  );
};
