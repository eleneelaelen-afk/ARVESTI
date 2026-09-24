'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';
import {
  Users,
  UserPlus,
  CalendarCheck,
  CreditCard,
  Inbox,
  Check,
  X,
  CheckCircle2,
  BarChart3,
  Filter,
  Shield,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { AttendanceCharts } from '../../components/AttendanceCharts';
import {
  ProfileRow,
  GroupRow,
  LessonRow,
  AttendanceRow,
  DropInRequestRow,
} from '../../types/database';

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [isStudentUser, setIsStudentUser] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeSection, setActiveSection] = useState<'requests' | 'attendance' | 'students' | 'drop_in' | 'debt'>('requests');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');

  // Supabase data state
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [students, setStudents] = useState<ProfileRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [dropIns, setDropIns] = useState<DropInRequestRow[]>([]);

  // Fetch all admin data
  const fetchData = async () => {
    try {
      const [groupsRes, studentsRes, lessonsRes, attendanceRes, dropInsRes] = await Promise.all([
        supabase.from('groups').select('*').order('id'),
        supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false }),
        supabase.from('lessons').select('*').order('date', { ascending: false }).limit(20),
        supabase.from('attendance').select('*'),
        supabase.from('drop_in_requests').select('*').order('created_at', { ascending: false }),
      ]);

      if (groupsRes.data && groupsRes.data.length > 0) {
        setGroups(groupsRes.data as GroupRow[]);
      } else {
        setGroups([
          { id: 'grp-1', name: 'ARVESTI 1.0', age_category: 'Старшая группа', schedule: 'Чт, Сб', time: '19:00 - 20:30', days_of_week: ['Чт', 'Сб'] },
          { id: 'grp-2', name: 'ARVESTI 2.0', age_category: 'Старшая группа', schedule: 'Сб, Вс', time: '17:00 - 18:30', days_of_week: ['Сб', 'Вс'] },
          { id: 'grp-3', name: 'ARVESTI 3.0', age_category: 'Младшая группа', schedule: 'Сб, Вс', time: '14:00 - 15:30', days_of_week: ['Сб', 'Вс'] },
          { id: 'grp-4', name: 'ARVESTI 4.0', age_category: 'Младшая группа', schedule: 'Сб, Вс', time: '15:30 - 17:00', days_of_week: ['Сб', 'Вс'] },
        ]);
      }

      if (studentsRes.data && studentsRes.data.length > 0) {
        setStudents(studentsRes.data as ProfileRow[]);
      } else {
        setStudents([
          { id: 'demo-1', full_name: 'Мадина Карданова', phone: '+7 (928) 111-22-33', role: 'student', group_id: 'grp-1', account_type: 'subscription', payment_status: 'paid', status: 'active', payment_due_date: '31.10.2026', created_at: new Date().toISOString() },
          { id: 'demo-2', full_name: 'Амина Гаджиева', phone: '+7 (928) 222-33-44', role: 'student', group_id: 'grp-2', account_type: 'subscription', payment_status: 'overdue', status: 'active', payment_due_date: '27.10.2026', created_at: new Date().toISOString() },
          { id: 'demo-3', full_name: 'Диана Алиева', phone: '+7 (928) 333-44-55', role: 'student', group_id: 'grp-1', account_type: 'subscription', payment_status: 'paid', status: 'pending', payment_due_date: '31.10.2026', notes: 'Заявка на вступление в группу ARVESTI 1.0', created_at: new Date().toISOString() },
        ]);
      }

      if (lessonsRes.data && lessonsRes.data.length > 0) setLessons(lessonsRes.data as LessonRow[]);
      if (attendanceRes.data) setAttendance(attendanceRes.data as AttendanceRow[]);
      if (dropInsRes.data) setDropIns(dropInsRes.data as DropInRequestRow[]);
    } catch {
      // Continue
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function checkAuthAndFetch() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const localAdmin = typeof window !== 'undefined' && localStorage.getItem('arvesti_admin_authorized') === 'true';

        if (user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (prof?.role === 'student' && !localAdmin) {
            setIsStudentUser(true);
            setIsAdminAuthorized(false);
            setLoading(false);
            return;
          }

          if (prof?.role === 'admin' || localAdmin) {
            setIsAdminAuthorized(true);
            await fetchData();
            return;
          }
        }

        if (localAdmin) {
          setIsAdminAuthorized(true);
          await fetchData();
          return;
        }

        setIsAdminAuthorized(false);
      } catch {
        const localAdmin = typeof window !== 'undefined' && localStorage.getItem('arvesti_admin_authorized') === 'true';
        if (localAdmin) {
          setIsAdminAuthorized(true);
          await fetchData();
        } else {
          setIsAdminAuthorized(false);
        }
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndFetch();
  }, [supabase]);

  const handleVerifyAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const pass = adminPasswordInput.trim();
    if (pass === 'ArvestiAdmin2026!' || pass === 'admin123456') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('arvesti_admin_authorized', 'true');
      }
      setIsAdminAuthorized(true);
      setAuthError('');
      await fetchData();
    } else {
      setAuthError('Неверный пароль администратора студии.');
    }
  };

  // Actions
  const handleApproveStudent = async (studentId: string) => {
    await supabase.from('profiles').update({ status: 'active' }).eq('id', studentId);
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: 'active' } : s));
  };

  const handleRejectStudent = async (studentId: string) => {
    await supabase.from('profiles').update({ status: 'inactive' }).eq('id', studentId);
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: 'inactive' } : s));
  };

  const handleTogglePaymentStatus = async (studentId: string, current: string) => {
    const next = current === 'paid' ? 'overdue' : 'paid';
    await supabase.from('profiles').update({ payment_status: next }).eq('id', studentId);
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, payment_status: next } : s));
  };

  const handleApproveDropIn = async (requestId: string) => {
    await supabase.from('drop_in_requests').update({ status: 'approved' }).eq('id', requestId);
    setDropIns(prev => prev.map(d => d.id === requestId ? { ...d, status: 'approved' } : d));
  };

  const handleRejectDropIn = async (requestId: string) => {
    await supabase.from('drop_in_requests').update({ status: 'rejected' }).eq('id', requestId);
    setDropIns(prev => prev.map(d => d.id === requestId ? { ...d, status: 'rejected' } : d));
  };

  // Filtered lists
  const pendingStudents = useMemo(() => students.filter(s => s.status === 'pending'), [students]);
  const activeStudents = useMemo(() => students.filter(s => s.status === 'active'), [students]);
  const debtors = useMemo(() => students.filter(s => s.payment_status === 'overdue'), [students]);

  const filteredStudents = useMemo(() => {
    if (selectedGroupId === 'all') return activeStudents;
    return activeStudents.filter(s => s.group_id === selectedGroupId);
  }, [activeStudents, selectedGroupId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-400">Загрузка панели управления студией...</p>
        </div>
      </div>
    );
  }

  // Access check
  if (!isAdminAuthorized) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="p-8 rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-white">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Панель руководителя ARVESTI</h1>
            <p className="text-xs text-neutral-400 mt-1">Доступ только для Линды Азизян</p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleVerifyAdmin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Пароль руководителя</label>
              <input
                type="password"
                required
                placeholder="Введите пароль администратора"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 px-3 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs transition-colors cursor-pointer"
            >
              Подтвердить вход
            </button>
          </form>

          <Link href="/" className="inline-block text-xs text-neutral-500 hover:text-neutral-300">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-white" />
            <h1 className="text-2xl font-black text-white">Кабинет руководителя ARVESTI</h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Линда Азизян • Управление группами, посещаемостью и абонементами
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs font-semibold">
        <button
          onClick={() => setActiveSection('requests')}
          className={`py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
            activeSection === 'requests'
              ? 'bg-white text-black font-bold shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Заявки</span>
          {pendingStudents.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black">
              {pendingStudents.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('attendance')}
          className={`py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
            activeSection === 'attendance'
              ? 'bg-white text-black font-bold shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Журнал посещаемости</span>
        </button>

        <button
          onClick={() => setActiveSection('students')}
          className={`py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
            activeSection === 'students'
              ? 'bg-white text-black font-bold shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Список учениц ({activeStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('debt')}
          className={`py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
            activeSection === 'debt'
              ? 'bg-white text-black font-bold shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Оплата и долги</span>
          {debtors.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black">
              {debtors.length}
            </span>
          )}
        </button>
      </div>

      {/* SECTION: REQUESTS */}
      {activeSection === 'requests' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Входящие заявки на регистрацию</h2>
          {pendingStudents.length === 0 ? (
            <div className="p-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 text-center">
              <CheckCircle2 className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
              <p className="text-sm text-neutral-400">Нет новых заявок, ожидающих подтверждения.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {pendingStudents.map((st) => (
                <div
                  key={st.id}
                  className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{st.full_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                        {st.account_type === 'subscription' ? 'Абонемент' : 'Разовые'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 font-mono">{st.phone}</p>
                    <p className="text-xs text-neutral-500">
                      Группа: {groups.find(g => g.id === st.group_id)?.name || st.group_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveStudent(st.id)}
                      className="py-1.5 px-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Одобрить</span>
                    </button>
                    <button
                      onClick={() => handleRejectStudent(st.id)}
                      className="py-1.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Отклонить</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION: ATTENDANCE */}
      {activeSection === 'attendance' && (
        <div className="space-y-6">
          <AttendanceCharts groups={groups} />
        </div>
      )}

      {/* SECTION: STUDENTS */}
      {activeSection === 'students' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Список учениц</h2>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl py-1.5 px-3 text-xs text-white"
            >
              <option value="all">Все группы</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950 text-neutral-400 font-semibold border-b border-neutral-800">
                <tr>
                  <th className="p-3.5">ФИО Ученицы</th>
                  <th className="p-3.5">Телефон</th>
                  <th className="p-3.5">Группа</th>
                  <th className="p-3.5">Тип</th>
                  <th className="p-3.5">Оплата</th>
                  <th className="p-3.5 text-right">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-neutral-800/40">
                    <td className="p-3.5 font-bold text-white">{st.full_name}</td>
                    <td className="p-3.5 font-mono text-neutral-400">{st.phone}</td>
                    <td className="p-3.5">{groups.find(g => g.id === st.group_id)?.name || '—'}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-neutral-800 text-[11px]">
                        {st.account_type === 'subscription' ? 'Абонемент' : 'Разовые'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        st.payment_status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {st.payment_status === 'paid' ? 'Оплачено' : 'Долг'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleTogglePaymentStatus(st.id, st.payment_status)}
                        className="py-1 px-2.5 rounded-lg border border-neutral-700 hover:border-white text-[11px] text-white transition-colors cursor-pointer"
                      >
                        Сменить статус
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION: DEBT */}
      {activeSection === 'debt' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Список должников по абонементам</h2>
          {debtors.length === 0 ? (
            <div className="p-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm text-neutral-300">Все абонементы оплачены в срок! Должников нет.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {debtors.map((st) => (
                <div
                  key={st.id}
                  className="p-4 rounded-2xl border border-red-500/30 bg-red-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-bold text-white text-sm">{st.full_name}</p>
                    <p className="text-xs text-neutral-400 font-mono">{st.phone}</p>
                    <p className="text-xs text-red-400 mt-1">Срок оплаты истёк ({st.payment_due_date || 'Конец месяца'})</p>
                  </div>
                  <button
                    onClick={() => handleTogglePaymentStatus(st.id, st.payment_status)}
                    className="py-1.5 px-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs transition-colors cursor-pointer"
                  >
                    Отметить как оплачено
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
