import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { PriorityLevel } from '@/types/service-request';
import { Plus, Search, Pencil, Trash2, ClipboardList, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceType {
  id: string;
  name: string;
}

interface ServiceDepartment {
  id: string;
  name: string;
}

interface ServiceRequestType {
  id: string;
  name: string;
  description: string | null;
  sequence: number;
  service_type_id: string;
  department_id: string;
  default_priority_level: string | null;
  reminder_days_after_assignment: number | null;
  is_visible_resource: boolean;
  is_mandatory_resource: boolean;
  service_type: ServiceType;
  department: ServiceDepartment;
}

export default function RequestTypesMaster() {
  const [requestTypes, setRequestTypes] = useState<ServiceRequestType[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [departments, setDepartments] = useState<ServiceDepartment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingType, setEditingType] = useState<ServiceRequestType | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sequence: 0,
    service_type_id: '',
    department_id: '',
    default_priority_level: 'Medium',
    reminder_days_after_assignment: 3,
    is_visible_resource: false,
    is_mandatory_resource: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch service types
    const { data: stData } = await supabase
      .from('service_types')
      .select('id, name')
      .order('sequence');
    if (stData) setServiceTypes(stData);

    // Fetch departments
    const { data: deptData } = await supabase
      .from('service_departments')
      .select('id, name')
      .order('name');
    if (deptData) setDepartments(deptData);

    // Fetch request types with joins
    const { data, error } = await supabase
      .from('service_request_types')
      .select(`
        *,
        service_type:service_types(id, name),
        department:service_departments(id, name)
      `)
      .order('sequence');

    if (error) {
      toast.error('Failed to load request types');
      console.error(error);
    } else {
      setRequestTypes(data as unknown as ServiceRequestType[]);
    }
    setIsLoading(false);
  };

  const filteredTypes = requestTypes.filter(type =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.service_type?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.department?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sequence: 0,
      service_type_id: '',
      department_id: '',
      default_priority_level: 'Medium',
      reminder_days_after_assignment: 3,
      is_visible_resource: false,
      is_mandatory_resource: false,
    });
    setEditingType(null);
  };

  const handleEdit = (type: ServiceRequestType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      sequence: type.sequence,
      service_type_id: type.service_type_id,
      department_id: type.department_id,
      default_priority_level: type.default_priority_level || 'Medium',
      reminder_days_after_assignment: type.reminder_days_after_assignment || 3,
      is_visible_resource: type.is_visible_resource,
      is_mandatory_resource: type.is_mandatory_resource,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.service_type_id || !formData.department_id) {
      toast.error('Name, Service Type, and Department are required');
      return;
    }

    setIsSaving(true);

    const payload = {
      name: formData.name,
      description: formData.description || null,
      sequence: formData.sequence,
      service_type_id: formData.service_type_id,
      department_id: formData.department_id,
      default_priority_level: formData.default_priority_level,
      reminder_days_after_assignment: formData.reminder_days_after_assignment,
      is_visible_resource: formData.is_visible_resource,
      is_mandatory_resource: formData.is_mandatory_resource,
    };

    if (editingType) {
      const { error } = await supabase
        .from('service_request_types')
        .update(payload)
        .eq('id', editingType.id);

      if (error) {
        toast.error('Failed to update request type');
        console.error(error);
      } else {
        toast.success('Request type updated successfully');
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from('service_request_types')
        .insert([payload]);

      if (error) {
        toast.error('Failed to create request type');
        console.error(error);
      } else {
        toast.success('Request type created successfully');
        fetchData();
      }
    }

    setIsSaving(false);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('service_request_types')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete request type');
      console.error(error);
    } else {
      toast.success('Request type deleted successfully');
      fetchData();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Service Request Types"
        description="Define specific request types under each service category"
      >
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary">
              <Plus className="h-4 w-4" />
              Add Request Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingType ? 'Edit Request Type' : 'Add New Request Type'}</DialogTitle>
              <DialogDescription>
                Configure a service request type
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 grid gap-2">
                <Label htmlFor="name">Request Type Name *</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Computer Issue" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="serviceType">Service Category *</Label>
                <Select value={formData.service_type_id} onValueChange={(v) => setFormData({ ...formData, service_type_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map(st => (
                      <SelectItem key={st.id} value={st.id}>{st.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department_id} onValueChange={(v) => setFormData({ ...formData, department_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Request type description..." 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="defaultPriority">Default Priority</Label>
                <Select value={formData.default_priority_level} onValueChange={(v) => setFormData({ ...formData, default_priority_level: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reminderDays">Reminder Days After Assignment</Label>
                <Input 
                  id="reminderDays" 
                  type="number" 
                  value={formData.reminder_days_after_assignment}
                  onChange={(e) => setFormData({ ...formData, reminder_days_after_assignment: parseInt(e.target.value) || 3 })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="visibleResource">Show Resource Field</Label>
                <Switch 
                  id="visibleResource" 
                  checked={formData.is_visible_resource}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_visible_resource: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="mandatoryResource">Resource is Mandatory</Label>
                <Switch 
                  id="mandatoryResource" 
                  checked={formData.is_mandatory_resource}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_mandatory_resource: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search request types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  <TableHead>Default Priority</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ClipboardList className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">{type.name}</span>
                          <p className="text-xs text-muted-foreground sm:hidden">{type.service_type?.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary">{type.service_type?.name}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {type.department?.name}
                    </TableCell>
                    <TableCell>
                      {type.default_priority_level && (
                        <PriorityBadge priority={type.default_priority_level as PriorityLevel} showIcon={false} />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(type)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(type.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredTypes.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No request types found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
