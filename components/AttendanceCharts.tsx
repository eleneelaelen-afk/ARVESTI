'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';

const MONTH_DATA = [
  { date: '28 авг', 'ARVESTI 1.0': 92, 'ARVESTI 2.0': 85, 'ARVESTI 3.0': 88, 'ARVESTI 4.0': 84 },
  { date: '04 сен', 'ARVESTI 1.0': 96, 'ARVESTI 2.0': 87, 'ARVESTI 3.0': 90, 'ARVESTI 4.0': 88 },
  { date: '11 сен', 'ARVESTI 1.0': 98, 'ARVESTI 2.0': 89, 'ARVESTI 3.0': 93, 'ARVESTI 4.0': 88 },
  { date: '18 сен', 'ARVESTI 1.0': 100, 'ARVESTI 2.0': 92, 'ARVESTI 3.0': 95, 'ARVESTI 4.0': 91 },
  { date: '24 сен', 'ARVESTI 1.0': 97, 'ARVESTI 2.0': 92, 'ARVESTI 3.0': 94, 'ARVESTI 4.0': 90 },
];

export function AttendanceCharts() {
  return (
    <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-white text-sm">Тренды посещаемости за последний месяц</h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> +5.4% рост
        </span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MONTH_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="date" tick={{ fill: '#A3A3A3', fontSize: 11 }} />
            <YAxis domain={[70, 100]} unit="%" tick={{ fill: '#A3A3A3', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', borderRadius: '8px' }} />
            <Legend verticalAlign="top" height={32} />
            <Area type="monotone" dataKey="ARVESTI 1.0" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} />
            <Area type="monotone" dataKey="ARVESTI 2.0" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
            <Area type="monotone" dataKey="ARVESTI 3.0" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.2} />
            <Area type="monotone" dataKey="ARVESTI 4.0" stroke="#A855F7" fill="#A855F7" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
