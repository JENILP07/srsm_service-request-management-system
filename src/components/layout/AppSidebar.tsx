"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  BarChart3,
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
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['admin', 'hod'],
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
      className="fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col font-sans"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border/60">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center shadow-md shadow-black/10">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sidebar-foreground tracking-tight">SRSM</span>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="p-4 border-b border-sidebar-border/60 bg-sidebar-accent/10">
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70">Workspace</span>
          </div>
          <div className="mt-1 px-2 text-sm font-medium text-sidebar-foreground capitalize flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${role === 'admin' ? 'bg-secondary' : 'bg-status-completed'}`} />
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
                    'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/20',
                    isParentActive(item) && 'bg-sidebar-accent/25 text-sidebar-foreground'
                  )}
                >
                  <item.icon className={cn("h-4 w-4 flex-shrink-0", isParentActive(item) ? "text-accent" : "text-sidebar-foreground/60")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform text-sidebar-foreground/60',
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
                      className="overflow-hidden ml-4 mt-1 space-y-1 border-l border-sidebar-border/60 pl-2"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                            isActive(child.href)
                              ? 'bg-sidebar-accent/25 text-sidebar-foreground font-medium'
                              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20'
                          )}
                        >
                          <child.icon className={cn("h-4 w-4", isActive(child.href) ? "text-accent" : "text-sidebar-foreground/60")} />
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
                    ? 'bg-sidebar-accent/25 text-sidebar-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/20 hover:text-sidebar-foreground'
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", isActive(item.href) ? "text-accent" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground")} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User Info & Sign Out */}
      {profile && (
        <div className="p-4 border-t border-sidebar-border/60 space-y-2 bg-sidebar-accent/10">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <div className="w-8 h-8 rounded-full bg-sidebar-accent/30 flex items-center justify-center text-sidebar-foreground font-bold text-xs ring-2 ring-sidebar-border">
              {profile.name?.split(' ').map(n => n[0]).join('') || profile.email[0].toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{profile.name}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">{profile.email}</p>
              </div>
            )}

            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="h-8 w-8 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
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
              className="h-8 w-8 mx-auto flex text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
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
