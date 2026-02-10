import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function MasterDataIndex() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Data Management"
        description="Configure system-wide settings and reference data"
      />

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {masterItems.map((item) => (
          <motion.div key={item.href} variants={itemVariants}>
            <Link href={item.href}>
              <Card className="h-full hover:shadow-card-hover transition-all duration-300 hover:border-primary/50 group cursor-pointer overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="pb-3 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                  <CardTitle className="text-lg mt-4 group-hover:text-primary transition-colors">{item.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-xs text-muted-foreground/80 bg-muted/50 p-2 rounded border border-border/50">
                    <span className="font-medium text-foreground">Examples:</span> {item.examples}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}