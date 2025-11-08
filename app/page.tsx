import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { checkDbConnection } from './db';

export default async function Home() {
  const dbStatus = await checkDbConnection();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Plan Your Perfect
            <span className="text-[#00E599]"> North Indian Wedding</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 md:text-xl">
            Comprehensive wedding planning tool for coordinating multi-day events,
            managing guests, vendors, budget, menus, and more.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/handler/sign-up">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/handler/sign-in">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
          <div className="mt-12">
            <div
              className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold ${
                dbStatus === 'Database connected'
                  ? 'border-[#00E599]/20 bg-[#00E599]/10 text-[#1a8c66] dark:bg-[#00E599]/10 dark:text-[#00E599]'
                  : 'border-red-500/20 bg-red-500/10 text-red-500 dark:text-red-500'
              }`}
            >
              {dbStatus}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
