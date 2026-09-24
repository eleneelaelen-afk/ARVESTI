'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';
import { BookOpen, Shield, User, LogOut, LogIn } from 'lucide-react';
import { ProfileRow } from '../types/database';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data as ProfileRow);
      } else {
        setProfile(null);
      }
    }
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => { load(); });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-black font-black flex items-center justify-center">A</div>
          <span className="font-black text-white text-base tracking-wider">ARVESTI</span>
        </Link>
        <div className="flex items-center gap-2 text-xs">
          <Link href="/rules" className="py-1.5 px-3 rounded-lg text-neutral-400 hover:text-white flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Правила</span>
          </Link>
          {profile?.role === 'admin' && (
            <Link href="/admin" className="py-1.5 px-3 rounded-lg bg-amber-500 text-black font-bold flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Админка</span>
            </Link>
          )}
          {profile && (
            <Link href="/student" className="py-1.5 px-3 rounded-lg bg-neutral-800 text-white flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Кабинет</span>
            </Link>
          )}
          {profile ? (
            <button onClick={handleLogout} className="py-1.5 px-3 text-neutral-400 hover:text-red-400 cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <Link href="/" className="py-1.5 px-3 rounded-lg bg-amber-500 text-black font-bold flex items-center gap-1">
              <LogIn className="w-3.5 h-3.5" />
              <span>Вход</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
