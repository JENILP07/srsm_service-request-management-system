"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { getRequests } from '@/app/actions/requests';
import { getStatuses } from '@/app/actions/master-data';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Filter, ArrowUpDown, Eye, ClipboardList, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { PriorityLevel } from '@/types/service-request';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface ServiceRequest {
  id: string;
  request_no: string;
  request_datetime: string;
  title: string;
  description: string;
  priority_level: string;
  status: {
    id: string;
    name: string;
  };
  service_request_type: {
    id: string;
    name: string;
    department: {
      id: string;
      name: string;
    } | null;
  };
}

interface ServiceRequestStatus {
  id: string;
  name: string;
}

const listContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const listItem = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 }
};

export default function RequestsList() {
  const { user, role } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [statuses, setStatuses] = useState<ServiceRequestStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'priority'>('date');

  useEffect(() => {
    fetchData();
  }, [user, role]);

  const fetchData = async () => {
    setIsLoading(true);

    // Fetch statuses
    const { data: statusData } = await getStatuses();

    if (statusData) {
      setStatuses(statusData);
    }

    // Fetch requests using Server Action
    const { data, error } = await getRequests();

    if (error) {
      console.error('Error fetching requests:', error);
    } else {
      // @ts-ignore - Prisma types vs Client types
      setRequests(data || []);
    }

    setIsLoading(false);
  };

  // Apply filters
  const filteredRequests = requests.filter(request => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.request_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.service_request_type?.department?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status?.id === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortField === 'date') {
      return new Date(b.request_datetime).getTime() - new Date(a.request_datetime).getTime();
    }
    const priorityOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
    return (priorityOrder[a.priority_level] || 2) - (priorityOrder[b.priority_level] || 2);
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <PageHeader
        title={role === 'requestor' ? 'My Requests' : 'All Requests'}
        description="View and manage service requests"
      >
        {role === 'requestor' && (
          <Button asChild className="gap-2 gradient-primary shadow-glow hover:scale-105 transition-transform">
            <Link href="/requests/new">
              <Plus className="h-4 w-4" />
              New Request
            </Link>
          </Button>
        )}
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, request no, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortField} onValueChange={(v) => setSortField(v as 'date' | 'priority')}>
                <SelectTrigger className="w-[140px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">By Date</SelectItem>
                  <SelectItem value="priority">By Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[130px]">Request No</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton Loader
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24 md:hidden" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : sortedRequests.length > 0 ? (
                <AnimatePresence>
                  {sortedRequests.map((request, index) => (
                    <motion.tr
                      key={request.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <TableCell className="font-mono text-sm">{request.request_no}</TableCell>
                      <TableCell>
                        <div className="max-w-[300px]">
                          <p className="font-medium truncate">{request.title}</p>
                          <p className="text-sm text-muted-foreground truncate md:hidden">
                            {request.service_request_type?.department?.name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {request.service_request_type?.department?.name}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {format(new Date(request.request_datetime), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={request.status?.name || 'Pending'} />
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={request.priority_level as PriorityLevel} showIcon={false} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        >
                          <Link href={`/requests/${request.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">No requests found</p>
                      {role === 'requestor' && (
                        <Button asChild variant="link" className="mt-2">
                          <Link href="/requests/new">Create your first request</Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}