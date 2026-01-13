import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceRequestStatus {
  id: string;
  name: string;
  system_name: string;
  sequence: number;
  description: string | null;
  css_class: string | null;
  is_open: boolean;
  is_no_further_action_required: boolean;
  is_allowed_for_technician: boolean;
}

export default function StatusMaster() {
  const [statuses, setStatuses] = useState<ServiceRequestStatus[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingStatus, setEditingStatus] = useState<ServiceRequestStatus | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    system_name: '',
    sequence: 0,
    description: '',
    css_class: '',
    is_open: true,
    is_no_further_action_required: false,
    is_allowed_for_technician: false,
  });

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('service_request_statuses')
      .select('*')
      .order('sequence', { ascending: true });

    if (error) {
      toast.error('Failed to load statuses');
      console.error(error);
    } else {
      setStatuses(data || []);
    }
    setIsLoading(false);
  };

  const filteredStatuses = statuses.filter(status =>
    status.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    status.system_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      system_name: '',
      sequence: 0,
      description: '',
      css_class: '',
      is_open: true,
      is_no_further_action_required: false,
      is_allowed_for_technician: false,
    });
    setEditingStatus(null);
  };

  const handleEdit = (status: ServiceRequestStatus) => {
    setEditingStatus(status);
    setFormData({
      name: status.name,
      system_name: status.system_name,
      sequence: status.sequence,
      description: status.description || '',
      css_class: status.css_class || '',
      is_open: status.is_open,
      is_no_further_action_required: status.is_no_further_action_required,
      is_allowed_for_technician: status.is_allowed_for_technician,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.system_name) {
      toast.error('Name and System Name are required');
      return;
    }

    setIsSaving(true);

    if (editingStatus) {
      const { error } = await supabase
        .from('service_request_statuses')
        .update(formData)
        .eq('id', editingStatus.id);

      if (error) {
        toast.error('Failed to update status');
        console.error(error);
      } else {
        toast.success('Status updated successfully');
        fetchStatuses();
      }
    } else {
      const { error } = await supabase
        .from('service_request_statuses')
        .insert([formData]);

      if (error) {
        toast.error('Failed to create status');
        console.error(error);
      } else {
        toast.success('Status created successfully');
        fetchStatuses();
      }
    }

    setIsSaving(false);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('service_request_statuses')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete status');
      console.error(error);
    } else {
      toast.success('Status deleted successfully');
      fetchStatuses();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Service Request Status"
        description="Manage service request status definitions"
      >
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary">
              <Plus className="h-4 w-4" />
              Add Status
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingStatus ? 'Edit Status' : 'Add New Status'}</DialogTitle>
              <DialogDescription>
                Define a new status for service requests
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Status Name *</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., In Progress" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="systemName">System Name *</Label>
                <Input 
                  id="systemName" 
                  placeholder="e.g., IN_PROGRESS" 
                  value={formData.system_name}
                  onChange={(e) => setFormData({ ...formData, system_name: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sequence">Sequence</Label>
                <Input 
                  id="sequence" 
                  type="number" 
                  value={formData.sequence}
                  onChange={(e) => setFormData({ ...formData, sequence: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Status description..." 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cssClass">CSS Class</Label>
                <Input 
                  id="cssClass" 
                  placeholder="e.g., progress" 
                  value={formData.css_class}
                  onChange={(e) => setFormData({ ...formData, css_class: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isOpen">Is Open Status</Label>
                <Switch 
                  id="isOpen" 
                  checked={formData.is_open}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_open: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isNoFurtherAction">No Further Action Required</Label>
                <Switch 
                  id="isNoFurtherAction" 
                  checked={formData.is_no_further_action_required}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_no_further_action_required: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isAllowedForTechnician">Allowed for Technician</Label>
                <Switch 
                  id="isAllowedForTechnician" 
                  checked={formData.is_allowed_for_technician}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_allowed_for_technician: checked })}
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
              placeholder="Search statuses..."
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
                  <TableHead>Status Name</TableHead>
                  <TableHead>System Name</TableHead>
                  <TableHead className="hidden md:table-cell">Sequence</TableHead>
                  <TableHead className="hidden sm:table-cell">Flags</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStatuses.map((status) => (
                  <TableRow key={status.id}>
                    <TableCell className="font-medium">{status.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {status.system_name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{status.sequence}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {status.is_open && (
                          <span className="text-xs bg-status-progress-bg text-status-progress px-1.5 py-0.5 rounded">Open</span>
                        )}
                        {status.is_allowed_for_technician && (
                          <span className="text-xs bg-status-completed-bg text-status-completed px-1.5 py-0.5 rounded">Tech</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={status.name} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(status)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(status.id)}
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

          {!isLoading && filteredStatuses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No statuses found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
