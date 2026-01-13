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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, Pencil, Trash2, Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ServiceDepartment {
  id: string;
  name: string;
  description: string | null;
  cc_email: string | null;
  is_request_title_disabled: boolean;
  created_at: string;
}

export default function DepartmentsMaster() {
  const [departments, setDepartments] = useState<ServiceDepartment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingDept, setEditingDept] = useState<ServiceDepartment | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cc_email: '',
    is_request_title_disabled: false,
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('service_departments')
      .select('*')
      .order('name');

    if (error) {
      toast.error('Failed to load departments');
      console.error(error);
    } else {
      setDepartments(data || []);
    }
    setIsLoading(false);
  };

  const filteredDepts = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      cc_email: '',
      is_request_title_disabled: false,
    });
    setEditingDept(null);
  };

  const handleEdit = (dept: ServiceDepartment) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      cc_email: dept.cc_email || '',
      is_request_title_disabled: dept.is_request_title_disabled,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Department name is required');
      return;
    }

    setIsSaving(true);

    const payload = {
      name: formData.name,
      description: formData.description || null,
      cc_email: formData.cc_email || null,
      is_request_title_disabled: formData.is_request_title_disabled,
    };

    if (editingDept) {
      const { error } = await supabase
        .from('service_departments')
        .update(payload)
        .eq('id', editingDept.id);

      if (error) {
        toast.error('Failed to update department');
        console.error(error);
      } else {
        toast.success('Department updated successfully');
        fetchDepartments();
      }
    } else {
      const { error } = await supabase
        .from('service_departments')
        .insert([payload]);

      if (error) {
        toast.error('Failed to create department');
        console.error(error);
      } else {
        toast.success('Department created successfully');
        fetchDepartments();
      }
    }

    setIsSaving(false);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('service_departments')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete department');
      console.error(error);
    } else {
      toast.success('Department deleted successfully');
      fetchDepartments();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Service Departments"
        description="Manage departments responsible for handling service requests"
      >
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary">
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingDept ? 'Edit Department' : 'Add New Department'}</DialogTitle>
              <DialogDescription>
                Configure a service department
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Department Name *</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Information Technology" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Department description..." 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ccEmail">CC Email (comma-separated)</Label>
                <Input 
                  id="ccEmail" 
                  placeholder="email1@example.com, email2@example.com" 
                  value={formData.cc_email}
                  onChange={(e) => setFormData({ ...formData, cc_email: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="disableTitle">Disable Request Title</Label>
                <Switch 
                  id="disableTitle" 
                  checked={formData.is_request_title_disabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_request_title_disabled: checked })}
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
              placeholder="Search departments..."
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
                  <TableHead>Department</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden sm:table-cell">CC Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepts.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{dept.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground max-w-[200px] truncate">
                      {dept.description || '-'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {dept.cc_email || '-'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {format(new Date(dept.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(dept)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(dept.id)}
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

          {!isLoading && filteredDepts.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No departments found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
