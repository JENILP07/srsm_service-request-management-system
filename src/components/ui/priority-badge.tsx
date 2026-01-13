import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

type PriorityType = 'High' | 'Medium' | 'Low';

interface PriorityBadgeProps {
  priority: PriorityType;
  showIcon?: boolean;
  className?: string;
}

const priorityStyles: Record<PriorityType, string> = {
  High: 'bg-priority-high/10 text-priority-high border-priority-high/20',
  Medium: 'bg-priority-medium/10 text-priority-medium border-priority-medium/20',
  Low: 'bg-priority-low/10 text-priority-low border-priority-low/20',
};

const PriorityIcon: Record<PriorityType, React.ComponentType<{ className?: string }>> = {
  High: AlertTriangle,
  Medium: AlertCircle,
  Low: Info,
};

export function PriorityBadge({ priority, showIcon = true, className }: PriorityBadgeProps) {
  const Icon = PriorityIcon[priority];
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border gap-1',
        priorityStyles[priority],
        className
      )}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {priority}
    </span>
  );
}
