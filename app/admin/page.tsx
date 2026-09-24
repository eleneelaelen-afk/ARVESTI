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
        // Fallback groups
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
        // Fallback demo students
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
      // Continue with available state
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
      setLoading(true);
      await fetchData();
    } else {
      setAuthError('Неверный пароль администратора. Доступ разрешён только руководителю.');
    }
  };

  // Pending registrations
  const pendingRequests = useMemo(() => {
    const list = students.filter((s) => s.status === 'pending');
    const seen = new Set<string>();
    return list.filter((s) => {
      if (!s.id || seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [students]);

  // Filtered students by group
  const activeStudents = useMemo(() => {
    return students.filter((s) => s.status === 'active');
  }, [students]);

  const groupStudents = useMemo(() => {
    if (selectedGroupId === 'all') return activeStudents;
    return activeStudents.filter((s) => s.group_id === selectedGroupId);
  }, [activeStudents, selectedGroupId]);

  // Actions
  const handleApproveStudent = async (studentId: string, assignedGroupId?: string) => {
    const targetGroup = assignedGroupId || 'grp-1';
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: 'active', group_id: targetGroup } : s))
    );
    try {
      await supabase
        .from('profiles')
        .update({
          status: 'active',
          group_id: targetGroup,
          updated_at: new Date().toISOString(),
        })
        .eq('id', studentId);
    } catch {}
  };

  const handleRejectStudent = async (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    try {
      await supabase.from('profiles').update({ status: 'rejected' }).eq('id', studentId);
    } catch {}
  };

  const handleTogglePayment = async (studentId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'paid' ? 'overdue' : 'paid';
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, payment_status: nextStatus as any } : s))
    );
    try {
      await supabase.from('profiles').update({ payment_status: nextStatus }).eq('id', studentId);
    } catch {}
  };

  const handleApproveDropIn = async (requestId: string) => {
    setDropIns((prev) =>
      prev.map((d) => (d.id === requestId ? { ...d, status: 'approved' } : d))
    );
    try {
      await supabase.from('drop_in_requests').update({ status: 'approved' }).eq('id', requestId);
    } catch {}
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-neutral-400">
        Проверка прав доступа к панели руководителя ARVESTI...
      </div>
    );
  }

  // If currently authenticated as a student
  if (isStudentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl border border-neutral-800 bg-neutral-900/90 text-center space-y-5 shadow-2xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
          <Shield className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-white">Доступ ограничен</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Вы авторизованы как ученица. Этот раздел предназначен исключительно для руководителя студии (Линда Азизян).
          </p>
        </div>
        <button
          onClick={() => router.push('/student')}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs transition-all shadow cursor-pointer"
        >
          Вернуться в мой кабинет ученицы
        </button>
      </div>
    );
  }

  // If not authorized as admin yet, show password prompt
  if (!isAdminAuthorized) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl border border-neutral-800 bg-neutral-900/90 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white">Вход для руководителя</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Для доступа к панели управления студией ARVESTI подтвердите пароль администратора:
          </p>
        </div>

        {authError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleVerifyAdmin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Пароль администратора</label>
            <input
              type="password"
              required
              placeholder="Введите пароль руководителя"
              value={adminPasswordInput}
              onChange={(e) => setAdminPasswordInput(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs transition-all shadow cursor-pointer"
          >
            Войти в панель управления
          </button>
        </form>

        <div className="text-center">
          <Link href="/" className="text-xs text-neutral-500 hover:text-white underline">
            ← Вернуться на главную страницу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">Админ-панель студии</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-black font-extrabold uppercase shadow-sm">
              Линда Азизян
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Управление составами ARVESTI, заявками, посещаемостью и абонементами
          </p>
        </div>

        {/* Master Group Selector Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-white" />
          <span className="text-neutral-400">Состав:</span>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-white font-semibold focus:outline-none focus:border-white"
          >
            <option value="all">Все составы студии</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.age_category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setActiveSection('requests')}
          className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
            activeSection === 'requests'
              ? 'bg-white text-black border-white shadow'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Заявки на регистрацию</span>
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white font-bold text-[10px] animate-pulse">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('attendance')}
          className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
            activeSection === 'attendance'
              ? 'bg-white text-black border-white shadow'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>График посещаемости</span>
        </button>

        <button
          onClick={() => setActiveSection('students')}
          className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
            activeSection === 'students'
              ? 'bg-white text-black border-white shadow'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Ученицы ({groupStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('drop_in')}
          className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
            activeSection === 'drop_in'
              ? 'bg-white text-black border-white shadow'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Разовые визиты ({dropIns.filter((d) => d.status === 'pending').length})</span>
        </button>

        <button
          onClick={() => setActiveSection('debt')}
          className={`py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
            activeSection === 'debt'
              ? 'bg-white text-black border-white shadow'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Абонементы & Долги</span>
        </button>
      </div>

      {/* 1. REGISTRATION REQUESTS SECTION */}
      {activeSection === 'requests' && (
        <div className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-white" />
                <span>Новые заявки на регистрацию</span>
              </h2>
              <p className="text-xs text-neutral-400">
                Ученицы, заполнившие форму самостоятельной регистрации
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-300 font-bold">
              {pendingRequests.length} ожидают
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400 space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
              <p className="font-semibold text-neutral-200">Все заявки обработаны</p>
              <p>Новых запросов на регистрацию нет.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {pendingRequests.map((st) => (
                <div key={st.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{st.full_name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700 font-semibold">
                        {st.account_type === 'subscription' ? 'Абонемент' : 'Разовые'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">{st.phone}</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{st.notes}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveStudent(st.id, st.group_id || 'grp-1')}
                      className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1 cursor-pointer shadow"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Принять в состав</span>
                    </button>
                    <button
                      onClick={() => handleRejectStudent(st.id)}
                      className="py-1.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Отклонить</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. ATTENDANCE & RECHARTS ANALYTICS */}
      {activeSection === 'attendance' && (
        <div className="space-y-6">
          <AttendanceCharts groups={groups} />

          {/* Lessons list */}
          <div className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/80 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-white" />
              <span>Расписание тренировок ARVESTI</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {groups.map((grp) => (
                <div key={grp.id} className="p-4 rounded-2xl border border-neutral-800 bg-neutral-950 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">{grp.age_category}</span>
                    <h4 className="text-sm font-bold text-white">{grp.name}</h4>
                    <p className="text-xs text-neutral-400">{grp.schedule} • {grp.time}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Активно
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. ACTIVE STUDENTS LIST */}
      {activeSection === 'students' && (
        <div className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-white" />
              <span>Состав учениц ({groupStudents.length})</span>
            </h2>
          </div>

          <div className="divide-y divide-neutral-800">
            {groupStudents.map((std) => {
              const grp = groups.find((g) => g.id === std.group_id);
              return (
                <div key={std.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold">
                      {std.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{std.full_name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                          {grp?.name || 'ARVESTI'}
                        </span>
                      </div>
                      <span className="text-neutral-400 font-mono text-[11px]">{std.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleTogglePayment(std.id, std.payment_status)}
                      className={`px-3 py-1 rounded-lg border font-bold cursor-pointer ${
                        std.payment_status === 'paid'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-red-500/30 bg-red-500/10 text-red-400'
                      }`}
                    >
                      {std.payment_status === 'paid' ? 'Оплачен' : 'Задолженность'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. DROP-IN VISITS */}
      {activeSection === 'drop_in' && (
        <div className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/80 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Inbox className="w-5 h-5 text-white" />
            <span>Заявки на разовые посещения</span>
          </h2>

          <div className="divide-y divide-neutral-800">
            {dropIns.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                Заявок на разовые визиты пока нет.
              </div>
            ) : (
              dropIns.map((req) => (
                <div key={req.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-white">{req.student_name}</h4>
                    <p className="text-neutral-400 font-mono">{req.student_phone}</p>
                    <p className="text-[11px] text-neutral-300 mt-0.5">Дата визита: {req.visit_date}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === 'pending' ? (
                      <button
                        onClick={() => handleApproveDropIn(req.id)}
                        className="py-1 px-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold cursor-pointer"
                      >
                        Подтвердить место
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
                        Подтверждено
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. DEBTS & SUBSCRIPTIONS */}
      {activeSection === 'debt' && (
        <div className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/80 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-white" />
            <span>Контроль оплат и задолженностей</span>
          </h2>

          <div className="divide-y divide-neutral-800 text-xs">
            {groupStudents.filter((s) => s.payment_status === 'overdue').length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1 opacity-80" />
                <p>Все абонементы оплачены. Задолженностей нет!</p>
              </div>
            ) : (
              groupStudents
                .filter((s) => s.payment_status === 'overdue')
                .map((std) => (
                  <div key={std.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-red-400">{std.full_name}</h4>
                      <p className="text-neutral-400 font-mono">{std.phone}</p>
                      <p className="text-[10px] text-neutral-500">Срок оплаты: {std.payment_due_date || 'Конец месяца'}</p>
                    </div>
                    <button
                      onClick={() => handleTogglePayment(std.id, 'overdue')}
                      className="py-1 px-3 rounded-xl bg-emerald-500 text-black font-bold cursor-pointer"
                    >
                      Отметить оплату
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
