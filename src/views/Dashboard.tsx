import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
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
} from 'lucide-react';

export default function Dashboard() {
  const { profile, role } = useAuth();

  // Demo stats - these would come from the database in a real implementation
  const stats = {
    totalRequests: 5,
    pendingRequests: 2,
    inProgressRequests: 1,
    completedRequests: 2,
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
            />
            <StatCard
              title="Departments"
              value={4}
              icon={Building2}
            />
            <StatCard
              title="Request Types"
              value={6}
              icon={TrendingUp}
            />
            <StatCard
              title="Resolution Rate"
              value="87%"
              icon={CheckCircle2}
              trend={{ value: 5, isPositive: true }}
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
            />
            <StatCard
              title="In Progress"
              value={stats.inProgressRequests}
              icon={AlertCircle}
              iconClassName="bg-status-progress/10"
            />
            <StatCard
              title="Completed Today"
              value={2}
              icon={CheckCircle2}
              iconClassName="bg-status-completed/10"
            />
            <StatCard
              title="Team Members"
              value={4}
              icon={Users}
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
            />
            <StatCard
              title="In Progress"
              value={stats.inProgressRequests}
              icon={Clock}
              iconClassName="bg-status-progress/10"
            />
            <StatCard
              title="Completed Today"
              value={1}
              icon={CheckCircle2}
              iconClassName="bg-status-completed/10"
            />
            <StatCard
              title="Avg. Resolution"
              value="2.4 days"
              icon={TrendingUp}
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
            />
            <StatCard
              title="Pending"
              value={stats.pendingRequests}
              icon={Clock}
              iconClassName="bg-status-pending/10"
            />
            <StatCard
              title="In Progress"
              value={stats.inProgressRequests}
              icon={AlertCircle}
              iconClassName="bg-status-progress/10"
            />
            <StatCard
              title="Resolved"
              value={stats.completedRequests}
              icon={CheckCircle2}
              iconClassName="bg-status-completed/10"
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
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title={`Welcome back, ${profile?.name?.split(' ')[0] || 'User'}!`}
        description={getWelcomeMessage()}
      >
        {role === 'requestor' && (
          <Button asChild className="gap-2 gradient-primary shadow-glow">
            <Link href="/requests/new">
              <Plus className="h-4 w-4" />
              New Request
            </Link>
          </Button>
        )}
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {roleSpecificStats()}
      </div>

      {/* Getting Started Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground mb-4">
              {role === 'admin'
                ? 'Start by setting up master data like departments, service types, and request types.'
                : 'Create your first service request to get started.'}
            </p>
            {role === 'requestor' && (
              <Button asChild variant="outline">
                <Link href="/requests/new">Create your first request</Link>
              </Button>
            )}
            {role === 'admin' && (
              <Button asChild variant="outline">
                <Link href="/admin/masters">Manage Master Data</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions for Admin */}
      {role === 'admin' && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
            <Link href="/admin/masters/departments">
              <CardContent className="pt-6">
                <Building2 className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold font-display">Manage Departments</h3>
                <p className="text-sm text-muted-foreground mt-1">Add or edit service departments</p>
              </CardContent>
            </Link>
          </Card>
          <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
            <Link href="/admin/masters/request-types">
              <CardContent className="pt-6">
                <ClipboardList className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold font-display">Request Types</h3>
                <p className="text-sm text-muted-foreground mt-1">Configure service request types</p>
              </CardContent>
            </Link>
          </Card>
          <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
            <Link href="/admin/masters/type-person-map">
              <CardContent className="pt-6">
                <Users className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold font-display">Personnel Mapping</h3>
                <p className="text-sm text-muted-foreground mt-1">Assign staff to request types</p>
              </CardContent>
            </Link>
          </Card>
        </div>
      )}
    </div>
  );
}
