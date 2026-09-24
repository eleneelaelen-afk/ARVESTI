export default function RulesPage() {
  const rules = [
    { title: '1. Дресс-код и сменная обувь', text: 'Вход в танцевальный зал строго в чистой сменной обуви (балетки, чешки или носочки).' },
    { title: '2. Время прибытия', text: 'Приходить на тренировку за 10–15 минут до начала для спокойного переодевания.' },
    { title: '3. Пропуски и предупреждения', text: 'При невозможности прийти необходимо нажать кнопку «Не смогу» в личном кабинете.' },
    { title: '4. Оплата абонемента', text: 'Оплата производится с 27 числа текущего месяца до конца месяца на следующий период.' },
  ];

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-4">
      <h1 className="text-2xl font-black text-white">Правила студии ARVESTI</h1>
      <div className="space-y-3">
        {rules.map((r, i) => (
          <div key={i} className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-1">
            <h2 className="text-amber-400 font-bold text-sm">{r.title}</h2>
            <p className="text-neutral-300 text-xs leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-950 text-xs text-neutral-400">
        📍 Пятигорск, ул. 295 Стрелковой Дивизии, 19к1 • Руководитель Линда Азизян (+7 928 654-46-99)
      </div>
    </div>
  );
}
