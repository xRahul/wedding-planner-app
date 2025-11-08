'use client';

import Link from 'next/link';
import { useUser, UserButton } from '@stackframe/stack';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const user = useUser();

  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-bold text-[#00E599]">
          Wedding Planner
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link href="/handler/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/handler/sign-up">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

