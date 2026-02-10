"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Line, 
  LineChart, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis,
  Sector 
} from 'recharts';
import { 
  ArrowUpRight, 
  Activity, 
  Users, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon,
  Download,
  Calendar as CalendarIcon,
  Zap,
  Filter
} from 'lucide-react';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChartConfig, 
  ChartContainer, 
  ChartLegend, 
  ChartLegendContent, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { 
  getAnalyticsStats, 
  getMonthlyTrends, 
  getStatusDistribution, 
  getDepartmentLoad,
  downloadAnalyticsReport 
} from '@/app/actions/analytics';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// --- Chart Configs ---

const trendConfig = {
  requests: {
    label: "Total Requests",
    color: "hsl(var(--chart-1))",
  },
  resolved: {
    label: "Resolved",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const deptConfig = {
  tickets: {
    label: "Tickets",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const statusConfig = {
  value: {
    label: "Requests",
  },
  Pending: {
    label: "Pending",
    color: "hsl(var(--chart-1))",
  },
  "In Progress": {
    label: "In Progress",
    color: "hsl(var(--chart-2))",
  },
  Resolved: {
    label: "Resolved",
    color: "hsl(var(--chart-3))",
  },
  Rejected: {
    label: "Rejected",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

// --- Components ---

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100
    }
  }
};

export default function AnalyticsDashboard() {
  const { role } = useAuth();
  const [stats, setStats] = useState({ totalRequests: 0, pendingCount: 0, resolvedCount: 0, avgHours: 0 });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Date Range State
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const fetchData = async (range?: { from?: string, to?: string }) => {
    setLoading(true);
    try {
      const [statsRes, trendsRes, statusRes, deptRes] = await Promise.all([
        getAnalyticsStats(range),
        getMonthlyTrends(range),
        getStatusDistribution(range),
        getDepartmentLoad(range)
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (trendsRes.data) setMonthlyData(trendsRes.data);
      if (statusRes.data) setStatusData(statusRes.data);
      if (deptRes.data) setDepartmentData(deptRes.data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRangeChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (newDate?.from) {
        fetchData({
            from: newDate.from.toISOString(),
            to: newDate.to?.toISOString()
        });
    } else if (!newDate) {
        fetchData();
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
        const res = await downloadAnalyticsReport({
            from: date?.from?.toISOString(),
            to: date?.to?.toISOString()
        });
        if (res.data) {
            const blob = new Blob([res.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download', `SRSM_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast.success('Report downloaded successfully');
        } else {
            toast.error(res.error || 'Failed to download report');
        }
    } catch (err) {
        toast.error('An error occurred while downloading');
    } finally {
        setIsDownloading(false);
    }
  };

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  const detailLink = role === 'admin' ? '/admin/requests' : '/hod/requests';

  if (loading && monthlyData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-muted-foreground animate-pulse font-medium">Crunching the numbers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 overflow-hidden">
      {/* --- Hero Section --- */}
      <motion.div 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 pt-10 pb-16 px-6 sm:px-12 rounded-b-[3rem] border-b border-border/40"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-4 max-w-2xl"
          >
            <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-primary/20 text-primary animate-pulse">
              <Zap className="w-3 h-3 mr-1" /> Live Analytics
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
              System Performance <br /> Overview
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Real-time insights into request processing, department efficiency, and resolution trends.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                size="lg" 
                className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                Download Report
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="lg" variant="outline" className="rounded-full bg-background/50 backdrop-blur-sm">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd")} - {format(date.to, "LLL dd")}
                        </>
                      ) : (
                        format(date.from, "LLL dd")
                      )
                    ) : (
                      <span>Select Date Range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={handleRangeChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              {date && (
                <Button variant="ghost" size="sm" onClick={() => handleRangeChange(undefined)} className="rounded-full">
                    Reset Filter
                </Button>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden md:block"
          >
             {/* Abstract Floating UI Elements */}
             <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
             >
                <div className="w-64 h-64 bg-gradient-to-tr from-primary to-purple-500 rounded-3xl rotate-12 opacity-20 blur-3xl absolute -inset-4" />
                <Card className="w-72 bg-background/80 backdrop-blur-md border-border/50 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" /> Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 w-full flex items-end gap-2 justify-between px-2 pb-2">
                        {monthlyData.slice(-7).map((d, i) => {
                            const maxVal = Math.max(...monthlyData.map(m => m.requests)) || 1;
                            return (
                                <motion.div 
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(d.requests / maxVal) * 100}%` }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    className="w-6 bg-primary/80 rounded-t-sm"
                                />
                            );
                        })}
                    </div>
                  </CardContent>
                </Card>
             </motion.div>
             
             <motion.div 
                animate={{ y: [0, 15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -right-12 top-20 z-20"
             >
                <Card className="p-4 bg-background/90 backdrop-blur shadow-xl border-l-4 border-l-green-500 w-48">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Efficiency</p>
                            <p className="text-2xl font-bold">{stats.totalRequests > 0 ? Math.round((stats.resolvedCount / stats.totalRequests) * 100) : 0}%</p>
                        </div>
                    </div>
                </Card>
             </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 -mt-12 relative z-30">
        
        {/* --- Stats Grid --- */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
            {[
                { title: "Total Requests", value: stats.totalRequests, icon: BarChart3, color: "text-blue-500", trend: "+12%" },
                { title: "Pending", value: stats.pendingCount, icon: Clock, color: "text-orange-500", trend: "-5%" },
                { title: "Resolved", value: stats.resolvedCount, icon: CheckCircle2, color: "text-green-500", trend: "+8%" },
                { title: "Avg Time (hrs)", value: stats.avgHours, icon: TrendingUp, color: "text-purple-500", trend: "-2.1%" },
            ].map((stat, index) => (
                <motion.div key={index} variants={itemVariants} whileHover={{ y: -5 }} className="h-full">
                    <Card className="h-full overflow-hidden border-border/50 shadow-sm hover:shadow-lg transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <AnimatedCounter value={stat.value} />
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                                <span className={cn("font-medium", stat.trend.startsWith('+') ? "text-green-500" : "text-red-500")}>
                                    {stat.trend}
                                </span>
                                <span className="ml-1">from last month</span>
                            </p>
                            <div className="h-1 w-full bg-secondary mt-3 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: stats.totalRequests > 0 ? `${(stat.value / stats.totalRequests) * 100}%` : "0%" }}
                                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                    className={`h-full ${stat.color.replace('text-', 'bg-')}`} 
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </motion.div>

        {/* --- Charts Section --- */}
        <Tabs defaultValue="overview" className="space-y-8">
            <div className="flex items-center justify-between">
                <TabsList className="bg-background/50 backdrop-blur border border-border/40 p-1 rounded-full">
                    <TabsTrigger value="overview" className="rounded-full">Overview</TabsTrigger>
                    <TabsTrigger value="analytics" className="rounded-full">Department Analytics</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Area Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle>Request Volume Trends</CardTitle>
                                <CardDescription>Showing total vs resolved requests</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={trendConfig}>
                                    <AreaChart
                                        accessibilityLayer
                                        data={monthlyData}
                                        margin={{ left: 12, right: 12 }}
                                    >
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.2} />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent indicator="dot" />}
                                        />
                                        <Area
                                            dataKey="requests"
                                            type="natural"
                                            fill="var(--color-requests)"
                                            fillOpacity={0.4}
                                            stroke="var(--color-requests)"
                                            stackId="a"
                                        />
                                        <Area
                                            dataKey="resolved"
                                            type="natural"
                                            fill="var(--color-resolved)"
                                            fillOpacity={0.4}
                                            stroke="var(--color-resolved)"
                                            stackId="a"
                                        />
                                        <ChartLegend content={<ChartLegendContent />} />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Radial/Donut Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                         <Card className="flex flex-col border-border/50 shadow-sm h-full">
                            <CardHeader className="items-center pb-0">
                                <CardTitle>Current Status Distribution</CardTitle>
                                <CardDescription>Real-time request status</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 pb-0">
                                <ChartContainer
                                    config={statusConfig}
                                    className="mx-auto aspect-square max-h-[250px]"
                                >
                                    <PieChart>
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel />}
                                        />
                                        <Pie
                                            data={statusData}
                                            dataKey="value"
                                            nameKey="status"
                                            innerRadius={60}
                                            strokeWidth={5}
                                        >
                                             {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <ChartLegend content={<ChartLegendContent className="-translate-y-2 flex-wrap gap-2" />} />
                                    </PieChart>
                                </ChartContainer>
                            </CardContent>
                            <CardFooter className="flex-col gap-2 text-sm">
                                <div className="flex items-center gap-2 font-medium leading-none">
                                    Overall resolution rate: {stats.totalRequests > 0 ? Math.round((stats.resolvedCount / stats.totalRequests) * 100) : 0}% <TrendingUp className="h-4 w-4 text-green-500" />
                                </div>
                                <div className="leading-none text-muted-foreground">
                                    Showing distribution of all recorded requests
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>
            </TabsContent>
            
            <TabsContent value="analytics">
                 <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                >
                     <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle>Departmental Load</CardTitle>
                            <CardDescription>Number of tickets assigned per department</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={deptConfig} className="min-h-[300px] max-h-[400px] w-full">
                                <BarChart accessibilityLayer data={departmentData}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.2} />
                                    <XAxis
                                        dataKey="department"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tickMargin={10} />
                                    <ChartTooltip
                                        cursor={{ fill: 'var(--accent)', opacity: 0.1 }}
                                        content={<ChartTooltipContent indicator="dashed" />}
                                    />
                                    <Bar dataKey="tickets" fill="var(--color-tickets)" radius={8}>
                                        {departmentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </TabsContent>
        </Tabs>

        {/* --- Recent Activity / Additional Info --- */}
        <motion.div
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5, delay: 0.4 }}
             className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
            <Card className="md:col-span-2 bg-gradient-to-r from-primary/5 to-transparent border-none shadow-none">
                <CardHeader>
                    <CardTitle className="text-lg">System Insights</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            `System currently managing ${stats.totalRequests} total service requests.`,
                            `${stats.pendingCount} requests currently require attention from technicians or HODs.`,
                            `Average time to resolve a request is approximately ${stats.avgHours} hours.`
                        ].map((insight, i) => (
                            <motion.div 
                                key={i}
                                initial={{ x: -20, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.2 }}
                                className="flex items-start gap-3 p-3 rounded-lg bg-background/60 border border-border/30"
                            >
                                <div className="p-1.5 bg-primary/10 rounded-full text-primary mt-0.5">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <p className="text-sm text-muted-foreground">{insight}</p>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col justify-center items-center text-center space-y-4 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="p-4 bg-background rounded-full shadow-lg text-primary mb-2">
                   <Users className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg">Resource Efficiency</h3>
                <p className="text-sm text-muted-foreground">Monitor how departments are handling their current ticket load.</p>
                <Button asChild variant="secondary" className="w-full rounded-full">
                    <Link href={detailLink}>Detailed Report</Link>
                </Button>
            </div>

        </motion.div>
      </div>
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
