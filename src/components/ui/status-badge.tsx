import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type StatusType = 'pending' | 'progress' | 'completed' | 'closed' | 'cancelled';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusMap: Record<string, StatusType> = {
  'Pending': 'pending',
  'In Progress': 'progress',
  'Completed': 'completed',
  'Closed': 'closed',
  'Cancelled': 'cancelled',
};

const statusStyles: Record<StatusType, string> = {
  pending: 'bg-warning/10 text-warning',
  progress: 'bg-primary/10 text-primary',
  completed: 'bg-success/10 text-success',
  closed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-error/10 text-error',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusType = statusMap[status] || 'pending';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusStyles[statusType],
        className
      )}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full mr-1.5',
        statusType === 'pending' && 'bg-warning',
        statusType === 'progress' && 'bg-primary',
        statusType === 'completed' && 'bg-success',
        statusType === 'closed' && 'bg-muted-foreground',
        statusType === 'cancelled' && 'bg-error',
      )} />
      {status}
    </span>
  );
}
