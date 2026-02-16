"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
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
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100, damping: 20 }}
      className={cn(
        "fixed left-4 top-4 bottom-4 z-40 rounded-3xl border border-white/10 flex flex-col font-sans overflow-hidden shadow-2xl backdrop-blur-xl bg-sidebar/80",
        // Glassmorphism effect handled by CSS variables indirectly via bg-sidebar/80 + backdrop-blur
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-sidebar-ring/20 overflow-hidden relative">
                <Image
                  src="/service-requests-icon-line-vector-260nw-2401783211.webp"
                  alt="SRSM Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-white tracking-tight">SRSM</span>
                <span className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Workspace</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10 transition-colors rounded-full"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-6 py-4 border-b border-white/5">
          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${role === 'admin' ? 'bg-secondary' : 'bg-status-completed'} shadow-[0_0_8px_currentColor]`} />
            <span className="text-sm font-medium text-white/90 capitalize">{role} Dashboard</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {filteredNavItems.map((item) => (
          <div key={item.title}>
            {item.children ? (
              <>
                <button
                  onClick={() => toggleExpand(item.title)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                    isParentActive(item) ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                  )}
                >
                  {isParentActive(item) && (
                    <motion.div
                      layoutId="activeNavParent"
                      className="absolute inset-0 bg-white/10 rounded-xl border border-white/5"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">
                    <item.icon className={cn("h-5 w-5 transition-colors", isParentActive(item) ? "text-sidebar-ring" : "text-white/60 group-hover:text-white")} />
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left relative z-10">{item.title}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform text-white/40',
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
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden ml-4 mt-1 space-y-1 pl-2 border-l border-white/10"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="relative block"
                        >
                          <div className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 relative z-10',
                            isActive(child.href)
                              ? 'text-white font-medium'
                              : 'text-white/50 hover:text-white hover:bg-white/5'
                          )}>
                            {isActive(child.href) && (
                              <motion.div
                                layoutId="activeNavChild"
                                className="absolute inset-0 bg-white/10 rounded-lg"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              />
                            )}
                            <child.icon className={cn("h-4 w-4 relative z-10", isActive(child.href) ? "text-sidebar-ring" : "opacity-70")} />
                            <span className="relative z-10">{child.title}</span>
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link
                href={item.href}
                className="relative block"
                title={collapsed ? item.title : undefined}
              >
                <div className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                  isActive(item.href) ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                )}>
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-white/10 rounded-xl border border-white/5"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">
                    <item.icon className={cn("h-5 w-5 transition-colors", isActive(item.href) ? "text-sidebar-ring shadow-[0_0_10px_currentColor]" : "text-white/60 group-hover:text-white")} />
                  </span>
                  {!collapsed && <span className="relative z-10">{item.title}</span>}
                </div>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User Info & Sign Out */}
      {profile && (
        <div className="p-4 mt-auto border-t border-white/5 bg-black/20 backdrop-blur-sm">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sidebar-accent to-sidebar-ring flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/10 shadow-lg">
              {profile.name?.split(' ').map(n => n[0]).join('') || profile.email[0].toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{profile.name}</p>
                <p className="text-xs text-white/50 truncate">{profile.email}</p>
              </div>
            )}

            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="h-9 w-9 text-white/50 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
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
              className="h-8 w-8 mx-auto mt-2 flex text-white/50 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
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
