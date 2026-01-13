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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, Pencil, Trash2, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ServiceDepartment {
  id: string;
  name: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
}

interface ServiceDeptPerson {
  id: string;
  department_id: string;
  user_id: string;
  from_date: string;
  to_date: string | null;
  is_hod: boolean;
  description: string | null;
  department: ServiceDepartment;
  profile: Profile;
}

export default function DeptPersonsMaster() {
  const [persons, setPersons] = useState<ServiceDeptPerson[]>([]);
  const [departments, setDepartments] = useState<ServiceDepartment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPerson, setEditingPerson] = useState<ServiceDeptPerson | null>(null);

  const [formData, setFormData] = useState({
    department_id: '',
    user_id: '',
    from_date: '',
    to_date: '',
    is_hod: false,
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    // Fetch departments
    const { data: deptData } = await supabase
      .from('service_departments')
      .select('id, name')
      .order('name');
    if (deptData) setDepartments(deptData);

    // Fetch profiles
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, name, email')
      .order('name');
    if (profileData) setProfiles(profileData);

    // Fetch dept persons with joins
    const { data, error } = await supabase
      .from('service_dept_persons')
      .select(`
        id,
        department_id,
        user_id,
        from_date,
        to_date,
        is_hod,
        description,
        department:service_departments(id, name)
      `)
      .order('from_date', { ascending: false });

    if (error) {
      toast.error('Failed to load personnel');
      console.error(JSON.stringify(error, null, 2));
    } else {
      const enrichedData = data.map((item: any) => ({
        ...item,
        profile: profileData?.find(p => p.id === item.user_id) || { id: item.user_id, name: 'Unknown', email: '' }
      }));
      setPersons(enrichedData as unknown as ServiceDeptPerson[]);
    }
    setIsLoading(false);
  };

  const filteredPersons = persons.filter(person =>
    person.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.department?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      department_id: '',
      user_id: '',
      from_date: new Date().toISOString().split('T')[0],
      to_date: '',
      is_hod: false,
      description: '',
    });
    setEditingPerson(null);
  };

  const handleEdit = (person: ServiceDeptPerson) => {
    setEditingPerson(person);
    setFormData({
      department_id: person.department_id,
      user_id: person.user_id,
      from_date: person.from_date.split('T')[0],
      to_date: person.to_date?.split('T')[0] || '',
      is_hod: person.is_hod,
      description: person.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.department_id || !formData.user_id) {
      toast.error('Department and User are required');
      return;
    }

    setIsSaving(true);

    const payload = {
      department_id: formData.department_id,
      user_id: formData.user_id,
      from_date: formData.from_date,
      to_date: formData.to_date || null,
      is_hod: formData.is_hod,
      description: formData.description || null,
    };

    if (editingPerson) {
      const { error } = await supabase
        .from('service_dept_persons')
        .update(payload)
        .eq('id', editingPerson.id);

      if (error) {
        toast.error('Failed to update person');
        console.error(error);
      } else {
        toast.success('Person updated successfully');
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from('service_dept_persons')
        .insert([payload]);

      if (error) {
        toast.error('Failed to add person');
        console.error(error);
      } else {
        toast.success('Person added successfully');
        fetchData();
      }
    }

    setIsSaving(false);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('service_dept_persons')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete person');
      console.error(error);
    } else {
      toast.success('Person removed successfully');
      fetchData();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Department Personnel"
        description="Manage staff mapped to each service department"
      >
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary">
              <Plus className="h-4 w-4" />
              Add Person
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingPerson ? 'Edit Person' : 'Add Person to Department'}</DialogTitle>
              <DialogDescription>
                Assign staff to a service department
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department_id} onValueChange={(v) => setFormData({ ...formData, department_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff">Staff Member *</Label>
                <Select value={formData.user_id} onValueChange={(v) => setFormData({ ...formData, user_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map(profile => (
                      <SelectItem key={profile.id} value={profile.id}>{profile.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fromDate">From Date *</Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={formData.from_date}
                    onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="toDate">To Date</Label>
                  <Input
                    id="toDate"
                    type="date"
                    value={formData.to_date}
                    onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isHOD">Is HOD (Head of Department)</Label>
                <Switch
                  id="isHOD"
                  checked={formData.is_hod}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_hod: checked })}
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
              placeholder="Search personnel..."
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
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="hidden md:table-cell">From Date</TableHead>
                  <TableHead className="hidden sm:table-cell">To Date</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPersons.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {person.profile?.name?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{person.profile?.name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{person.department?.name || 'Unknown'}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {format(new Date(person.from_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {person.to_date ? format(new Date(person.to_date), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      {person.is_hod ? (
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20">HOD</Badge>
                      ) : (
                        <Badge variant="secondary">Technician</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(person)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(person.id)}
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

          {!isLoading && filteredPersons.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No personnel found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
