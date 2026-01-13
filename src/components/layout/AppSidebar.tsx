"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  List,
  Settings,
  Users,
  Building2,
  Tag,
  FileText,
  ClipboardList,
  UserCog,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Wrench,
  Shield,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: AppRole[];
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'hod', 'technician', 'requestor'],
  },
  {
    title: 'New Request',
    href: '/requests/new',
    icon: PlusCircle,
    roles: ['requestor'],
  },
  {
    title: 'My Requests',
    href: '/requests',
    icon: List,
    roles: ['requestor'],
  },
  {
    title: 'Assigned Requests',
    href: '/technician/requests',
    icon: Wrench,
    roles: ['technician'],
  },
  {
    title: 'Department Requests',
    href: '/hod/requests',
    icon: ClipboardList,
    roles: ['hod'],
  },
  {
    title: 'Approvals',
    href: '/hod/approvals',
    icon: CheckSquare,
    roles: ['hod'],
  },
  {
    title: 'Master Data',
    href: '/admin/masters',
    icon: Settings,
    roles: ['admin'],
    children: [
      { title: 'Request Status', href: '/admin/masters/status', icon: Tag, roles: ['admin'] },
      { title: 'Departments', href: '/admin/masters/departments', icon: Building2, roles: ['admin'] },
      { title: 'Dept. Personnel', href: '/admin/masters/dept-persons', icon: Users, roles: ['admin'] },
      { title: 'Service Types', href: '/admin/masters/service-types', icon: FileText, roles: ['admin'] },
      { title: 'Request Types', href: '/admin/masters/request-types', icon: ClipboardList, roles: ['admin'] },
      { title: 'Type-Person Map', href: '/admin/masters/type-person-map', icon: UserCog, roles: ['admin'] },
    ],
  },
  {
    title: 'All Requests',
    href: '/admin/requests',
    icon: List,
    roles: ['admin'],
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  const { profile, role, signOut } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Master Data']);

  const filteredNavItems = navItems.filter(item =>
    item.roles.includes(role)
  );

  const toggleExpand = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (item: NavItem) =>
    item.children?.some(child => pathname === child.href);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-40 h-screen bg-white border-r border-slate-200 flex flex-col font-sans"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900 tracking-tight">SRSM</span>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Workspace</span>
          </div>
          <div className="mt-1 px-2 text-sm font-medium text-slate-900 capitalize flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${role === 'admin' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
            {role} Dashboard
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredNavItems.map((item) => (
          <div key={item.title}>
            {item.children ? (
              <>
                <button
                  onClick={() => toggleExpand(item.title)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                    isParentActive(item) && 'bg-slate-50 text-indigo-700'
                  )}
                >
                  <item.icon className={cn("h-4 w-4 flex-shrink-0", isParentActive(item) ? "text-indigo-600" : "text-slate-400")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform text-slate-400',
                          expandedItems.includes(item.title) && 'rotate-180'
                        )}
                      />
                    </>
                  )}
                </button>
                <AnimatePresence>
                  {!collapsed && expandedItems.includes(item.title) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden ml-4 mt-1 space-y-1 border-l border-slate-100 pl-2"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                            isActive(child.href)
                              ? 'bg-indigo-50 text-indigo-700 font-medium'
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                          )}
                        >
                          <child.icon className={cn("h-4 w-4", isActive(child.href) ? "text-indigo-600" : "text-slate-400")} />
                          <span>{child.title}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                  isActive(item.href)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", isActive(item.href) ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500")} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User Info & Sign Out */}
      {profile && (
        <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50/30">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs ring-2 ring-white">
              {profile.name?.split(' ').map(n => n[0]).join('') || profile.email[0].toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{profile.name}</p>
                <p className="text-xs text-slate-500 truncate">{profile.email}</p>
              </div>
            )}

            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-8 w-8 mx-auto flex text-slate-400 hover:text-red-500 hover:bg-red-50"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </motion.aside>
  );
}
