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
import { getServiceTypes, createServiceType, updateServiceType, deleteServiceType } from '@/app/actions/admin';
import { Plus, Search, Pencil, Trash2, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceType {
  id: string;
  name: string;
  description: string | null;
  sequence: number;
  is_for_staff: boolean;
  is_for_student: boolean;
}

export default function ServiceTypesMaster() {
  const [types, setTypes] = useState<ServiceType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingType, setEditingType] = useState<ServiceType | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sequence: 0,
    is_for_staff: true,
    is_for_student: true,
  });

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    setIsLoading(true);
    const { data, error } = await getServiceTypes();

    if (error) {
      toast.error('Failed to load service types');
      console.error(error);
    } else {
      // @ts-ignore
      setTypes(data || []);
    }
    setIsLoading(false);
  };

  const filteredTypes = types.filter(type =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sequence: 0,
      is_for_staff: true,
      is_for_student: true,
    });
    setEditingType(null);
  };

  const handleEdit = (type: ServiceType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      sequence: type.sequence || 0,
      is_for_staff: type.is_for_staff || false,
      is_for_student: type.is_for_student || false,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Service type name is required');
      return;
    }

    setIsSaving(true);

    const payload = {
      name: formData.name,
      description: formData.description || null,
      sequence: formData.sequence,
      is_for_staff: formData.is_for_staff,
      is_for_student: formData.is_for_student,
    };

    if (editingType) {
      const { error } = await updateServiceType(editingType.id, payload);

      if (error) {
        toast.error('Failed to update service type');
      } else {
        toast.success('Service type updated successfully');
        fetchTypes();
      }
    } else {
      const { error } = await createServiceType(payload);

      if (error) {
        toast.error('Failed to create service type');
      } else {
        toast.success('Service type created successfully');
        fetchTypes();
      }
    }

    setIsSaving(false);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    
    const { error } = await deleteServiceType(id);

    if (error) {
      toast.error('Failed to delete service type');
    } else {
      toast.success('Service type deleted successfully');
      fetchTypes();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Service Types"
        description="Define broad service categories"
      >
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary">
              <Plus className="h-4 w-4" />
              Add Service Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingType ? 'Edit Service Type' : 'Add New Service Type'}</DialogTitle>
              <DialogDescription>
                Configure a service type category
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Service Type Name *</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Technical" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Service type description..." 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="isForStaff">Available for Staff</Label>
                <Switch 
                  id="isForStaff" 
                  checked={formData.is_for_staff}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_for_staff: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isForStudent">Available for Students</Label>
                <Switch 
                  id="isForStudent" 
                  checked={formData.is_for_student}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_for_student: checked })}
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
              placeholder="Search service types..."
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
                  <TableHead>Service Type</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead>Sequence</TableHead>
                  <TableHead>For Staff</TableHead>
                  <TableHead>For Students</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{type.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground max-w-[200px] truncate">
                      {type.description || '-'}
                    </TableCell>
                    <TableCell>{type.sequence}</TableCell>
                    <TableCell>
                      {type.is_for_staff ? (
                        <CheckCircle2 className="h-5 w-5 text-status-completed" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      {type.is_for_student ? (
                        <CheckCircle2 className="h-5 w-5 text-status-completed" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
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
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No service types found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
