import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
  index?: number;
}

function AnimatedCounter({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 50, damping: 20 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [springValue]);

  return <span>{displayValue.toLocaleString()}</span>;
}

export function StatCard({ title, value, icon: Icon, trend, className, iconClassName, index = 0 }: StatCardProps) {
  const isNumber = typeof value === 'number';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
      className={cn(
        'relative overflow-hidden rounded-xl border bg-card p-6 shadow-card transition-colors',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold font-display tracking-tight">
             {isNumber ? <AnimatedCounter value={value as number} /> : value}
          </p>
          {trend && (
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + (index * 0.1) }}
              className={cn(
              'text-xs font-medium flex items-center gap-1',
              trend.isPositive ? 'text-status-completed' : 'text-destructive'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground">vs last month</span>
            </motion.p>
          )}
        </div>
        <div className={cn(
          'rounded-lg p-3 bg-primary/10 transition-transform duration-300 group-hover:scale-110',
          iconClassName
        )}>
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </motion.div>
  );
}
