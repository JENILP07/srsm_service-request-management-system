"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
// ... rest of imports
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getServiceTypes, getServiceRequestTypes } from '@/app/actions/master-data';
import { createRequest } from '@/app/actions/requests';
import { useAuth } from '@/contexts/AuthContext';
import { PriorityLevel } from '@/types/service-request';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { motion } from 'framer-motion';

// Zod schema for server-side style validation
const serviceRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(250, 'Title must be 250 characters or less'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description must be 5000 characters or less'),
  priority_level: z.enum(['Low', 'Medium', 'High']),
  service_request_type_id: z.string().uuid('Invalid request type'),
});

interface ServiceType {
  id: string;
  name: string;
}

interface ServiceRequestType {
  id: string;
  name: string;
  service_type_id: string;
  department: {
    id: string;
    name: string;
  };
  default_priority_level: string | null;
}

export default function NewRequest() {
  const router = useRouter(); // Changed from useNavigate
  const { user } = useAuth();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [requestTypes, setRequestTypes] = useState<ServiceRequestType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedServiceType, setSelectedServiceType] = useState<string>('');
  const [selectedRequestType, setSelectedRequestType] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>('Medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    // Fetch service types
    const { data: stData } = await getServiceTypes();
    if (stData) setServiceTypes(stData as ServiceType[]);

    // Fetch request types
    const { data: rtData } = await getServiceRequestTypes();
    // @ts-ignore
    if (rtData) setRequestTypes(rtData as ServiceRequestType[]);

    setIsLoading(false);
  };

  const filteredRequestTypes = requestTypes.filter(
    rt => rt.service_type_id === selectedServiceType
  );

  const selectedRequestTypeDetails = requestTypes.find(
    rt => rt.id === selectedRequestType
  );

  useEffect(() => {
    if (selectedRequestTypeDetails?.default_priority_level) {
      setSelectedPriority(selectedRequestTypeDetails.default_priority_level as PriorityLevel);
    }
  }, [selectedRequestTypeDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with Zod before submitting
    const validationResult = serviceRequestSchema.safeParse({
      title: title.trim(),
      description: description.trim(),
      priority_level: selectedPriority,
      service_request_type_id: selectedRequestType,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.errors;
      toast.error(errors[0]?.message || 'Validation failed');
      return;
    }

    setIsSubmitting(true);

    const { data: insertedRequest, error } = await createRequest({
      title: validationResult.data.title,
      description: validationResult.data.description,
      priority_level: validationResult.data.priority_level,
      service_request_type_id: validationResult.data.service_request_type_id,
    });

    if (error) {
      toast.error('Failed to submit request');
      console.error(error);
    } else {
      toast.success('Service request submitted successfully!', {
        description: `Request No: ${insertedRequest?.request_no}`,
      });
      router.push('/requests');
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

  const formItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-accent hover:text-accent-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title="New Service Request"
          description="Fill in the details below to submit a new request"
        />
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-l-4 border-l-primary/50 shadow-md">
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>
              Provide information about your service request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div 
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.1 }}
              className="space-y-6"
            >
              {/* Service Type */}
              <motion.div variants={formItemVariants} className="grid gap-2">
                <Label htmlFor="serviceType">Service Category *</Label>
                <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                  <SelectTrigger id="serviceType" className="h-11">
                    <SelectValue placeholder="Select a service category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Request Type */}
              <motion.div variants={formItemVariants} className="grid gap-2">
                <Label htmlFor="requestType">Request Type *</Label>
                <Select
                  value={selectedRequestType}
                  onValueChange={setSelectedRequestType}
                  disabled={!selectedServiceType}
                >
                  <SelectTrigger id="requestType" className="h-11">
                    <SelectValue placeholder={selectedServiceType ? "Select request type" : "First select a service category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRequestTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex flex-col">
                          <span>{type.name}</span>
                          <span className="text-xs text-muted-foreground">{type.department?.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRequestTypeDetails && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-muted-foreground"
                  >
                    Will be handled by: <span className="font-medium text-foreground">{selectedRequestTypeDetails.department?.name}</span>
                  </motion.p>
                )}
              </motion.div>

              {/* Priority */}
              <motion.div variants={formItemVariants} className="grid gap-2">
                <Label htmlFor="priority">Priority Level *</Label>
                <Select value={selectedPriority} onValueChange={(v) => setSelectedPriority(v as PriorityLevel)}>
                  <SelectTrigger id="priority" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-priority-low" />
                        Low - Can wait a few days
                      </div>
                    </SelectItem>
                    <SelectItem value="Medium">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-priority-medium" />
                        Medium - Needs attention soon
                      </div>
                    </SelectItem>
                    <SelectItem value="High">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-priority-high" />
                        High - Urgent, impacts work
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Title */}
              <motion.div variants={formItemVariants} className="grid gap-2">
                <Label htmlFor="title">Request Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief summary of your request"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={250}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground text-right">{title.length}/250</p>
              </motion.div>

              {/* Description */}
              <motion.div variants={formItemVariants} className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide detailed information about your request..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={5}
                  maxLength={2000}
                  className="resize-y"
                />
                <p className="text-xs text-muted-foreground text-right">{description.length}/2000</p>
              </motion.div>
            </motion.div>

            {/* Attachments - Feature coming soon */}
            {/* File upload functionality will be implemented with proper security controls */}
          </CardContent>
        </Card>

        {/* Submit */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-end gap-3 mt-6"
        >
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="gap-2 gradient-primary shadow-lg transition-transform hover:scale-105 active:scale-95"
            disabled={!selectedRequestType || !title || !description || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}