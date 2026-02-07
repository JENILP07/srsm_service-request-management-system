"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
// ... imports
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getRequestDetail, addReply, getDepartmentTechnicians, assignTechnician } from '@/app/actions/requests';
import { useAuth } from '@/contexts/AuthContext';
import { PriorityLevel } from '@/types/service-request';
import {
  ArrowLeft,
  Calendar,
  Building2,
  User,
  Send,
  CheckCircle2,
  Clock,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { z } from 'zod';

// Zod schema for reply validation
const replySchema = z.object({
  reply_description: z.string()
    .min(1, 'Reply cannot be empty')
    .max(5000, 'Reply must be 5000 characters or less'),
});

interface ServiceRequest {
  id: string;
  request_no: string;
  request_datetime: string;
  title: string;
  description: string;
  priority_level: string;
  approval_status: string | null;
  assigned_to_user_id: string | null;
  status: {
    id: string;
    name: string;
  };
  requester: {
    id: string;
    name: string;
    email: string;
  };
  assigned_to_user: {
    id: string;
    name: string;
  } | null;
  service_request_type: {
    id: string;
    name: string;
    department: {
      id: string;
      name: string;
    } | null;
  };
}

interface Reply {
  id: string;
  reply_datetime: string;
  reply_description: string;
  user: {
    name: string;
  };
  status: {
    name: string;
  } | null;
}

export default function RequestDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, role } = useAuth();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [technicians, setTechnicians] = useState<{ id: string; name: string }[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');

  useEffect(() => {
    if (id) {
      loadRequestData();
    }
  }, [id]);

  useEffect(() => {
    if (request?.service_request_type?.department?.id && role === 'hod') {
      fetchTechnicians();
    }
  }, [request, role]);

  const fetchTechnicians = async () => {
    if (!request?.service_request_type?.department?.id) return;
    const { data } = await getDepartmentTechnicians(request.service_request_type.department.id);
    if (data) setTechnicians(data);
  };

  const loadRequestData = async () => {
    const { data, error } = await getRequestDetail(id);
    if (error || !data) {
        toast.error('Failed to load request');
    } else {
        // @ts-ignore - Prisma return types vs Interface match up
        setRequest(data);
        // @ts-ignore
        setReplies(data.replies);
    }
    setIsLoading(false);
  };

  const handleAssign = async () => {
    if (!selectedTechnician || !request) return;
    setIsSubmitting(true);

    const { error } = await assignTechnician(request.id, selectedTechnician);

    if (error) {
      toast.error('Failed to assign technician');
    } else {
      toast.success('Technician assigned successfully');
      loadRequestData(); // Refresh data
    }
    setIsSubmitting(false);
  };

  const handleReply = async () => {
    const validationResult = replySchema.safeParse({
      reply_description: replyText.trim(),
    });

    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0]?.message || 'Invalid reply');
      return;
    }

    if (!request || !user) return;
    setIsSubmitting(true);

    const { error } = await addReply(request.id, validationResult.data.reply_description);

    if (error) {
      toast.error('Failed to post reply');
    } else {
      toast.success('Reply posted successfully');
      setReplyText('');
      loadRequestData(); // Refresh to get new reply
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Request not found</p>
        <Button variant="link" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  const canReply = role === 'technician' || role === 'requestor' || role === 'admin';
  const canUpdateStatus = role === 'technician' || role === 'hod' || role === 'admin';

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mt-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-sm text-muted-foreground">{request.request_no}</span>
            <StatusBadge status={request.status?.name || 'Pending'} />
            <PriorityBadge priority={request.priority_level as PriorityLevel} />
          </div>
          <h1 className="text-2xl font-bold font-display">{request.title}</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground">{request.description}</p>
            </CardContent>
          </Card>

          {/* Activity / Replies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Activity ({replies.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {replies.length > 0 ? (
                replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {reply.user?.name?.split(' ').map(n => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{reply.user?.name || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.reply_datetime), { addSuffix: true })}
                        </span>
                        {reply.status && (
                          <StatusBadge status={reply.status.name} className="text-[10px] px-1.5 py-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{reply.reply_description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
              )}

              {canReply && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add a reply or update..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleReply}
                        disabled={!replyText.trim() || isSubmitting}
                        className="gap-2"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        {isSubmitting ? 'Posting...' : 'Post Reply'}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p className="font-medium">{request.service_request_type?.department?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{format(new Date(request.request_datetime), 'PPP')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Requested By</p>
                  <p className="font-medium">{request.requester?.name}</p>
                </div>
              </div>
              {request.assigned_to_user && (
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Assigned To</p>
                    <p className="font-medium">{request.assigned_to_user.name}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Request Type</p>
                  <p className="font-medium">{request.service_request_type?.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions for technician/HOD */}
          {canUpdateStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* HOD Assignment */}
                {role === 'hod' && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Assign Technician</label>
                    <div className="flex gap-2">
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={selectedTechnician}
                        onChange={(e) => setSelectedTechnician(e.target.value)}
                      >
                        <option value="">Select Technician...</option>
                        {technicians.map(tech => (
                          <option key={tech.id} value={tech.id}>{tech.name}</option>
                        ))}
                      </select>
                      <Button onClick={handleAssign} disabled={!selectedTechnician || isSubmitting}>
                        Assign
                      </Button>
                    </div>
                    <Separator />
                  </div>
                )}

                {request.status?.name === 'Pending' && (
                  <Button className="w-full" variant="outline">
                    Mark In Progress
                  </Button>
                )}
                {request.status?.name === 'In Progress' && (
                  <Button className="w-full gradient-primary">
                    Mark Completed
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
