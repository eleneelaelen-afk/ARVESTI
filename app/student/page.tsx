'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { CalendarCheck, CheckCircle2, XCircle } from 'lucide-react';
import { ProfileRow, LessonRow } from '../../types/database';

export default function StudentPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [nextLesson, setNextLesson] = useState<LessonRow | null>(null);
  const [attStatus, setAttStatus] = useState<string>('unconfirmed');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof as ProfileRow);

      if (prof?.group_id) {
        const { data: les } = await supabase.from('lessons').select('*').eq('group_id', prof.group_id).limit(1).single();
        if (les) {
          setNextLesson(les as LessonRow);
          const { data: att } = await supabase.from('attendance').select('status').eq('lesson_id', les.id).eq('student_id', user.id).single();
          if (att) setAttStatus(att.status);
        }
      }
    }
    load();
  }, [supabase, router]);

  const setAttendance = async (status: 'going' | 'not_going') => {
    if (!nextLesson || !profile) return;
    await supabase.from('attendance').upsert({
      lesson_id: nextLesson.id,
      student_id: profile.id,
      status,
      confirmed_at: new Date().toISOString()
    });
    setAttStatus(status);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <div className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/80 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">{profile?.full_name}</h1>
          <p className="text-xs text-neutral-400 font-mono">{profile?.phone}</p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
          {profile?.payment_status === 'paid' ? 'Абонемент оплачен' : 'Долг по оплате'}
        </span>
      </div>

      <div className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/60 space-y-4">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-white">Ближайшая тренировка</h2>
        </div>
        {nextLesson ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-400 font-black text-lg">{nextLesson.date_formatted} • {nextLesson.time}</p>
              <p className="text-xs text-neutral-400">ул. 295 Стрелковой Дивизии, 19к1</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAttendance('going')} className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer ${attStatus === 'going' ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-300'}`}>
                <CheckCircle2 className="w-4 h-4" /> Буду
              </button>
              <button onClick={() => setAttendance('not_going')} className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer ${attStatus === 'not_going' ? 'bg-red-500 text-white' : 'bg-neutral-800 text-neutral-300'}`}>
                <XCircle className="w-4 h-4" /> Не смогу
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-neutral-400">Нет запланированных уроков</p>
        )}
      </div>
    </div>
  );
}
