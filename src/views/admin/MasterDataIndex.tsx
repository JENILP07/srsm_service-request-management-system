import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tag,
  Building2,
  Users,
  FileText,
  ClipboardList,
  UserCog,
  ArrowRight,
} from 'lucide-react';

const masterItems = [
  {
    title: 'Request Status',
    description: 'Define and manage service request statuses',
    href: '/admin/masters/status',
    icon: Tag,
    examples: 'Pending, In Progress, Completed, Closed',
  },
  {
    title: 'Service Departments',
    description: 'Manage departments responsible for handling requests',
    href: '/admin/masters/departments',
    icon: Building2,
    examples: 'IT, Maintenance, Housekeeping',
  },
  {
    title: 'Department Personnel',
    description: 'Manage staff mapped to each service department',
    href: '/admin/masters/dept-persons',
    icon: Users,
    examples: 'Technicians, HODs',
  },
  {
    title: 'Service Types',
    description: 'Define broad service categories',
    href: '/admin/masters/service-types',
    icon: FileText,
    examples: 'Technical, Facility, Administrative',
  },
  {
    title: 'Request Types',
    description: 'Define specific request types under each service category',
    href: '/admin/masters/request-types',
    icon: ClipboardList,
    examples: 'Computer Issue, AC Repair',
  },
  {
    title: 'Type-Person Mapping',
    description: 'Map request types to responsible personnel',
    href: '/admin/masters/type-person-map',
    icon: UserCog,
    examples: 'Auto-assignment rules',
  },
];

export default function MasterDataIndex() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Master Data Management"
        description="Configure system-wide settings and reference data"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {masterItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full hover:shadow-card-hover transition-all duration-200 hover:border-primary/30 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Examples:</span> {item.examples}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
