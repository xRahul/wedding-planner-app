'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  Calendar,
  UtensilsCrossed,
  Music,
  CheckSquare,
  Plane,
  FileText,
  Folder,
  StickyNote,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/events', label: 'Events & Timeline', icon: Calendar },
  { href: '/guests', label: 'Guests', icon: Users },
  { href: '/vendors', label: 'Vendors', icon: Briefcase },
  { href: '/budget', label: 'Budget', icon: DollarSign },
  { href: '/menus', label: 'Menus', icon: UtensilsCrossed },
  { href: '/dances', label: 'Dances & Performances', icon: Music },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/travel', label: 'Travel & Logistics', icon: Plane },
  { href: '/files', label: 'Files & Documents', icon: Folder },
  { href: '/notes', label: 'Notes & Communication', icon: StickyNote },
  { href: '/reports', label: 'Reports', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#00E599]/10 text-[#00E599]'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

