import { cn } from '@/lib/utils';

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
  pending: 'bg-status-pending-bg text-status-pending border-status-pending/20',
  progress: 'bg-status-progress-bg text-status-progress border-status-progress/20',
  completed: 'bg-status-completed-bg text-status-completed border-status-completed/20',
  closed: 'bg-status-closed-bg text-status-closed border-status-closed/20',
  cancelled: 'bg-status-cancelled-bg text-status-cancelled border-status-cancelled/20',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusType = statusMap[status] || 'pending';
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        statusStyles[statusType],
        className
      )}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full mr-1.5',
        statusType === 'pending' && 'bg-status-pending',
        statusType === 'progress' && 'bg-status-progress animate-pulse-subtle',
        statusType === 'completed' && 'bg-status-completed',
        statusType === 'closed' && 'bg-status-closed',
        statusType === 'cancelled' && 'bg-status-cancelled',
      )} />
      {status}
    </span>
  );
}
