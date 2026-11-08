import React, { useEffect, useState } from 'react';
import { KeyRound, LockKeyhole, LogOut, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getSupabaseClient } from '@/services/supabaseClient';
import { useNexusStore } from '@/store/useNexusStore';

/** Supabase Auth email OTP. Credentials and access tokens never pass through NEXUS state. */
export function SupabaseAuthPanel({ url, anonKey }: { url: string; anonKey: string }) {
  const setSupabaseConfig = useNexusStore(state => state.setSupabaseConfig);
  const [email, setEmail] = useState('');
  const [signedIn, setSignedIn] = useState<string | null>(null);
  const [member, setMember] = useState(false);
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!url || !anonKey) return;
    const client = getSupabaseClient(url, anonKey);
    if (!client) return;
    let live = true;
    const inspect = async () => {
      try {
        const { data: { user } } = await client.auth.getUser();
        if (!live) return;
        setSignedIn(user?.email || null);
        if (user) {
          const { data, error } = await client.from('nexus_members')
            .select('user_id').eq('user_id', user.id).maybeSingle();
          if (!live) return;
          setMember(Boolean(data) && !error);
          setSupabaseConfig({ url, anonKey, isConnected: Boolean(data) && !error, autoSync: Boolean(data) && !error });
        } else {
          setMember(false);
          setSupabaseConfig({ isConnected: false, autoSync: false });
        }
      } catch {
        if (live) setMember(false);
      }
    };
    void inspect();
    const { data: { subscription } } = client.auth.onAuthStateChange(() => {
      // Defer the DB check outside the auth callback's internal lock.
      window.setTimeout(() => { if (live) void inspect(); }, 0);
    });
    return () => { live = false; subscription.unsubscribe(); };
  }, [url, anonKey, setSupabaseConfig]);

  const sendLink = async () => {
    const client = getSupabaseClient(url, anonKey);
    if (!client || !email.includes('@')) { setInfo('Укажи корректный email и настройки Supabase'); return; }
    setBusy(true); setInfo('');
    try {
      const { error } = await client.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: window.location.origin + window.location.pathname,
        },
      });
      setInfo(error ? 'Ошибка отправки ссылки: ' + error.message : 'Ссылка для входа отправлена. Проверь почту.');
    } catch {
      setInfo('Не удалось отправить ссылку для входа');
    } finally { setBusy(false); }
  };

  const signOut = async () => {
    const client = getSupabaseClient(url, anonKey);
    if (!client) return;
    await client.auth.signOut();
    setMember(false); setSignedIn(null);
    setSupabaseConfig({ isConnected: false, autoSync: false });
    setInfo('Выход выполнен. Локальные данные остаются на устройстве.');
  };

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-zinc-900/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold"><LockKeyhole className="size-4" /> Безопасный вход</div>
        <Badge variant="outline" className="border-white/10 text-zinc-400">
          {member ? <><ShieldCheck className="mr-1 size-3" /> Член NEXUS</> : 'Облако заблокировано'}
        </Badge>
      </div>
      {signedIn ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-zinc-300">
            <span className="block">{signedIn}</span>
            <span className="text-zinc-500">{member ? 'Доступ подтверждён серверной политикой' : 'Вход выполнен, но нет членства в NEXUS'}</span>
          </div>
          <Button size="sm" variant="outline" onClick={signOut}><LogOut className="mr-2 size-4" /> Выйти</Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-56 flex-1 text-xs text-zinc-400">
            Email зарегистрированного участника
            <Input className="mt-1" type="email" autoComplete="email" value={email}
              onChange={event => setEmail(event.target.value)} placeholder="email@example.com" />
          </label>
          <Button size="sm" disabled={busy} onClick={sendLink}><Mail className="mr-2 size-4" /> {busy ? 'Отправка…' : 'Ссылка для входа'}</Button>
        </div>
      )}
      <p className="flex items-start gap-2 text-xs leading-relaxed text-zinc-500">
        <KeyRound className="mt-0.5 size-4 shrink-0" />
        Синхронизация включается только после входа и подтверждения членства через RLS. SQL-миграцию в Supabase применяет владелец проекта. Вход по ссылке не создаёт нового участника автоматически.
      </p>
      {info && <p role="status" className="text-xs text-zinc-300">{info}</p>}
    </div>
  );
}
