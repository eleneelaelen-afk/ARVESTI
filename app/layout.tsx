import './globals.css';
import { Navbar } from '../components/Navbar';

export const metadata = {
  title: 'ARVESTI — Студия кавказских танцев в Пятигорске',
  description: 'Личный кабинет и расписание танцев ARVESTI под руководством Линды Азизян.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-neutral-950 text-neutral-100 min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">{children}</main>
        <footer className="border-t border-neutral-900 py-4 text-center text-xs text-neutral-500">
          © ARVESTI • Пятигорск, ул. 295 Стрелковой Дивизии, 19к1
        </footer>
      </body>
    </html>
  );
}
