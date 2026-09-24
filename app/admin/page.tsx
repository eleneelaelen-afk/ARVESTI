'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { AttendanceCharts } from '../../components/AttendanceCharts';
import { ProfileRow } from '../../types/database';

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [students, setStudents] = useState<ProfileRow[]>([]);
  const [tab, setTab] = useState<'requests' | 'charts' | 'students'>('requests');

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/'); return; }
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (prof?.role !== 'admin') { router.push('/student'); return; }

    const { data } = await supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false });
    if (data) setStudents(data as ProfileRow[]);
  };

  useEffect(() => { loadData(); }, []);

  const approve = async (id: string) => {
    await supabase.from('profiles').update({ status: 'active' }).eq('id', id);
    loadData();
  };

  const reject = async (id: string) => {
    await supabase.from('profiles').update({ status: 'rejected' }).eq('id', id);
    loadData();
  };

  const pending = students.filter(s => s.status === 'pending');

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-black text-white">Админ-панель ARVESTI</h1>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500 text-black font-bold">Линда Азизян</span>
      </div>

      <div className="flex gap-2 text-xs">
        <button onClick={() => setTab('requests')} className={`py-2 px-3 rounded-xl font-bold cursor-pointer ${tab === 'requests' ? 'bg-amber-500 text-black' : 'bg-neutral-900 text-neutral-400'}`}>
          Заявки ({pending.length})
        </button>
        <button onClick={() => setTab('charts')} className={`py-2 px-3 rounded-xl font-bold cursor-pointer ${tab === 'charts' ? 'bg-amber-500 text-black' : 'bg-neutral-900 text-neutral-400'}`}>
          Посещаемость (Recharts)
        </button>
        <button onClick={() => setTab('students')} className={`py-2 px-3 rounded-xl font-bold cursor-pointer ${tab === 'students' ? 'bg-amber-500 text-black' : 'bg-neutral-900 text-neutral-400'}`}>
          Ученицы ({students.filter(s => s.status === 'active').length})
        </button>
      </div>

      {tab === 'requests' && (
        <div className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/60 space-y-3">
          <h2 className="font-bold text-white text-sm">Новые заявки на регистрацию</h2>
          {pending.length === 0 ? (
            <p className="text-xs text-neutral-500">Нет новых заявок</p>
          ) : (
            <div className="divide-y divide-neutral-800">
              {pending.map(s => (
                <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{s.full_name}</p>
                    <p className="text-neutral-400 font-mono">{s.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => approve(s.id)} className="py-1 px-3 rounded-lg bg-emerald-500 text-black font-bold cursor-pointer">Принять</button>
                    <button onClick={() => reject(s.id)} className="py-1 px-3 rounded-lg bg-red-500/20 text-red-400 cursor-pointer">Отклонить</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'charts' && <AttendanceCharts />}

      {tab === 'students' && (
        <div className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/60 divide-y divide-neutral-800">
          {students.filter(s => s.status === 'active').map(s => (
            <div key={s.id} className="py-3 flex items-center justify-between text-xs">
              <span className="font-bold text-white">{s.full_name}</span>
              <span className="font-mono text-neutral-400">{s.phone}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
