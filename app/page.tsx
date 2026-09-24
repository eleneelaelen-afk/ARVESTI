'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import { BookOpen, ShieldCheck, Heart, Phone, MapPin, Instagram } from 'lucide-react';
import { StudioRuleSection, StudioDetailsRow } from '../../types/database';

export default function RulesPage() {
  const supabase = createClient();
  const [rules, setRules] = useState<StudioRuleSection[]>([]);
  const [details, setDetails] = useState<StudioDetailsRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: rulesData } = await supabase
        .from('studio_rules')
        .select('*')
        .order('sort_order', { ascending: true });

      const { data: detailsData } = await supabase
        .from('studio_details')
        .select('*')
        .single();

      if (rulesData && rulesData.length > 0) {
        setRules(rulesData as StudioRuleSection[]);
      } else {
        // Fallback default rules
        setRules([
          {
            id: 1,
            title: 'Общие правила студии ARVESTI',
            items: [
              'Вход в танцевальный зал строго в сменной чистой обуви (балетки, чешки или носочки).',
              'Приходить на занятие необходимо за 10–15 минут до начала для спокойной подготовки и переодевания.',
              'Во время занятия телефоны должны быть переведены в бесшумный режим.',
              'Бережно относиться к имуществу зала, зеркалам и реквизиту студии.',
            ],
            sort_order: 1,
          },
          {
            id: 2,
            title: 'Посещение и пропуски занятий',
            items: [
              'При невозможности посетить тренировку необходимо предупредить педагога заранее через личный кабинет (кнопка «Не смогу»).',
              'Пропущенные по уважительной причине занятия можно отработать с параллельной группой в течение текущего месяца.',
              'В случае отмены занятия педагогом, студия назначает дату полноценной отработки.',
            ],
            sort_order: 2,
          },
          {
            id: 3,
            title: 'Оплата абонементов и разовые визиты',
            items: [
              'Оплата абонемента производится строго с 27 числа текущего месяца до конца месяца на следующий расчётный период.',
              'В случае задержки оплаты место в группе не гарантируется.',
              'Разовые посещения осуществляются только по предварительной заявке при наличии свободных мест в зале.',
            ],
            sort_order: 3,
          },
        ]);
      }

      if (detailsData) {
        setDetails(detailsData as StudioDetailsRow);
      }
      setLoading(false);
    }

    loadData();
  }, [supabase]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-700 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Кодекс и этикет студии</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Правила студии танцев ARVESTI
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          Соблюдение правил помогает создавать тёплую, дисциплинированную и вдохновляющую атмосферу на каждой тренировке.
        </p>
      </div>

      {/* Rules Sections */}
      <div className="space-y-4">
        {rules.map((section) => (
          <div
            key={section.id}
            className="p-5 sm:p-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 space-y-3"
          >
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>{section.title}</span>
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-neutral-300">
              {section.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white mt-2 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Studio Contacts & Info */}
      <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 text-xs space-y-3">
        <h3 className="font-bold text-white text-sm">Контакты и адрес студии:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-white shrink-0" />
            <span>{details?.address ? `${details?.city ? details.city + ', ' : ''}${details.address}` : 'ТРЦ «Арбат», Октябрьская ул., 17, Пятигорск, Ставропольский край'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{details?.phone || '+7 903 440 04 56'} ({details?.contact_person || 'Линда Азизян'})</span>
          </div>
          <div className="flex items-center gap-2">
            <Instagram className="w-4 h-4 text-neutral-300 shrink-0" />
            <span>{details?.instagram || '@arvesti_dance'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400 shrink-0" />
            <span>{details?.motto || 'Танец — это язык души Кавказа'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
