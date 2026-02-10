"use client";

import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Users,
  Building2,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export default function Dashboard() {
  const { profile, role } = useAuth();

  // Demo stats - these would come from the database in a real implementation
  const stats = {
    totalRequests: 5,
    pendingRequests: 2,
    inProgressRequests: 1,
    completedRequests: 2,
  };

  const chartData = [
    { name: 'Pending', value: stats.pendingRequests, color: 'hsl(var(--chart-1))' },
    { name: 'In Progress', value: stats.inProgressRequests, color: 'hsl(var(--chart-2))' },
    { name: 'Completed', value: stats.completedRequests, color: 'hsl(var(--chart-3))' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const roleSpecificStats = () => {
    switch (role) {
      case 'admin':
        return (
          <>
            <StatCard
              title="Total Requests"
              value={stats.totalRequests}
              icon={ClipboardList}
              trend={{ value: 12, isPositive: true }}
              index={0}
            />
            <StatCard
              title="Departments"
              value={4}
              icon={Building2}
              index={1}
            />
            <StatCard
              title="Request Types"
              value={6}
              icon={TrendingUp}
              index={2}
            />
            <StatCard
              title="Resolution Rate"
              value="87%"
              icon={CheckCircle2}
              trend={{ value: 5, isPositive: true }}
              index={3}
            />
          </>
        );
      case 'hod':
        return (
          <>
            <StatCard
              title="Pending Approval"
              value={stats.pendingRequests}
              icon={Clock}
              iconClassName="bg-status-pending/10"
              index={0}
            />
            <StatCard
              title="In Progress"
              value={stats.inProgressRequests}
              icon={AlertCircle}
              iconClassName="bg-status-progress/10"
              index={1}
            />
            <StatCard
              title="Completed Today"
              value={2}
              icon={CheckCircle2}
              iconClassName="bg-status-completed/10"
              index={2}
            />
            <StatCard
              title="Team Members"
              value={4}
              icon={Users}
              index={3}
            />
          </>
        );
      case 'technician':
        return (
          <>
            <StatCard
              title="Assigned to Me"
              value={stats.inProgressRequests + stats.pendingRequests}
              icon={ClipboardList}
              index={0}
            />
            <StatCard
              title="In Progress"
              value={stats.inProgressRequests}
              icon={Clock}
              iconClassName="bg-status-progress/10"
              index={1}
            />
            <StatCard
              title="Completed Today"
              value={1}
              icon={CheckCircle2}
              iconClassName="bg-status-completed/10"
              index={2}
            />
            <StatCard
              title="Avg. Resolution"
              value="2.4 days"
              icon={TrendingUp}
              index={3}
            />
          </>
        );
      default:
        return (
          <>
            <StatCard
              title="My Requests"
              value={stats.totalRequests}
              icon={ClipboardList}
              index={0}
            />
            <StatCard
              title="Pending"
              value={stats.pendingRequests}
              icon={Clock}
              iconClassName="bg-status-pending/10"
              index={1}
            />
            <StatCard
              title="In Progress"
              value={stats.inProgressRequests}
              icon={AlertCircle}
              iconClassName="bg-status-progress/10"
              index={2}
            />
            <StatCard
              title="Resolved"
              value={stats.completedRequests}
              icon={CheckCircle2}
              iconClassName="bg-status-completed/10"
              index={3}
            />
          </>
        );
    }
  };

  const getWelcomeMessage = () => {
    switch (role) {
      case 'admin':
        return 'System administration and master data management';
      case 'hod':
        return 'Monitor, approve, and assign department requests';
      case 'technician':
        return 'View and resolve assigned service requests';
      default:
        return 'Track and manage your service requests';
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={item}>
        <PageHeader
          title={`Welcome back, ${profile?.name?.split(' ')[0] || 'User'}!`}
          description={getWelcomeMessage()}
        >
          {role === 'requestor' && (
            <Button asChild className="gap-2 gradient-primary shadow-glow transition-transform hover:scale-105">
              <Link href="/requests/new">
                <Plus className="h-4 w-4" />
                New Request
              </Link>
            </Button>
          )}
        </PageHeader>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {roleSpecificStats()}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Getting Started Card */}
        <motion.div variants={item} className="md:col-span-2">
            <Card className="h-full border-l-4 border-l-primary/50">
                <CardHeader>
                <CardTitle className="text-lg font-display">Getting Started</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-6 py-4">
                    <div className="p-4 bg-secondary/10 rounded-full">
                        <ClipboardList className="h-10 w-10 text-secondary" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-muted-foreground mb-4">
                        {role === 'admin'
                            ? 'Start by setting up master data like departments, service types, and request types.'
                            : 'Create your first service request to get started.'}
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            {role === 'requestor' && (
                            <Button asChild variant="outline" className="transition-all hover:bg-secondary hover:text-secondary-foreground">
                                <Link href="/requests/new">Create your first request</Link>
                            </Button>
                            )}
                            {role === 'admin' && (
                            <Button asChild variant="outline" className="transition-all hover:bg-secondary hover:text-secondary-foreground">
                                <Link href="/admin/masters">Manage Master Data</Link>
                            </Button>
                            )}
                        </div>
                    </div>
                </div>
                </CardContent>
            </Card>
        </motion.div>
        
        {/* Mini Chart */}
        <motion.div variants={item} className="md:col-span-1">
             <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" /> Quick Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[180px] w-full mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                    {payload[0].payload.name}
                                                </span>
                                                <span className="font-bold text-muted-foreground">
                                                    {payload[0].value}
                                                </span>
                                                </div>
                                            </div>
                                            </div>
                                        )
                                        }
                                        return null
                                    }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
             </Card>
        </motion.div>
      </div>

      {/* Quick Actions for Admin */}
      {role === 'admin' && (
        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-3">
          <motion.div variants={item}>
            <Card className="hover:shadow-card-hover transition-all cursor-pointer hover:-translate-y-1">
                <Link href="/admin/masters/departments">
                <CardContent className="pt-6">
                    <Building2 className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold font-display">Manage Departments</h3>
                    <p className="text-sm text-muted-foreground mt-1">Add or edit service departments</p>
                </CardContent>
                </Link>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="hover:shadow-card-hover transition-all cursor-pointer hover:-translate-y-1">
                <Link href="/admin/masters/request-types">
                <CardContent className="pt-6">
                    <ClipboardList className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold font-display">Request Types</h3>
                    <p className="text-sm text-muted-foreground mt-1">Configure service request types</p>
                </CardContent>
                </Link>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="hover:shadow-card-hover transition-all cursor-pointer hover:-translate-y-1">
                <Link href="/admin/masters/type-person-map">
                <CardContent className="pt-6">
                    <Users className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold font-display">Personnel Mapping</h3>
                    <p className="text-sm text-muted-foreground mt-1">Assign staff to request types</p>
                </CardContent>
                </Link>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}