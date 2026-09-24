'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const cleanDigits = phone.replace(/\D/g, '');
    const virtualEmail = `${cleanDigits}@arvesti.dance`;

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email: virtualEmail, password });
        if (error) throw new Error('Неверный телефон или пароль');
        if (data.user) {
          const { data: prof } = await supabase.from('profiles').select('role, status').eq('id', data.user.id).single();
          if (prof?.status === 'pending') {
            setMsg('Заявка на регистрацию ожидает подтверждения администратором.');
            await supabase.auth.signOut();
            return;
          }
          router.push(prof?.role === 'admin' ? '/admin' : '/student');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({ email: virtualEmail, password });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            phone,
            full_name: fullName,
            role: 'student',
            group_id: 'grp-1',
            account_type: 'subscription',
            payment_status: 'paid',
            status: 'pending',
          });
          setMsg('Заявка отправлена! Ожидайте подтверждения от администратора.');
          setMode('login');
        }
      }
    } catch (err: any) {
      setMsg(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-white">ARVESTI</h1>
        <p className="text-neutral-400 text-xs">Студия кавказских танцев в Пятигорске</p>
      </div>

      <div className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/80 space-y-4">
        <div className="flex p-1 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold">
          <button onClick={() => setMode('login')} className={`flex-1 py-1.5 rounded-lg ${mode === 'login' ? 'bg-amber-500 text-black' : 'text-neutral-400'}`}>Вход</button>
          <button onClick={() => setMode('register')} className={`flex-1 py-1.5 rounded-lg ${mode === 'register' ? 'bg-amber-500 text-black' : 'text-neutral-400'}`}>Регистрация</button>
        </div>

        {msg && <p className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">{msg}</p>}

        <form onSubmit={handleAuth} className="space-y-3 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block text-neutral-300 mb-1">ФИО Ученицы</label>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Залина Бесланеева" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
            </div>
          )}
          <div>
            <label className="block text-neutral-300 mb-1">Номер телефона</label>
            <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 928 000-00-00" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono" />
          </div>
          <div>
            <label className="block text-neutral-300 mb-1">Пароль</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold cursor-pointer transition-colors">
            {loading ? 'Секунду...' : mode === 'login' ? 'Войти в кабинет' : 'Зарегистрироваться'}
          </button>
        </form>
      </div>
    </div>
  );
}
