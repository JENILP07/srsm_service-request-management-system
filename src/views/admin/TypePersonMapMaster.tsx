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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, Pencil, Trash2, UserCog, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ServiceRequestType {
  id: string;
  name: string;
}

interface Profile {
  id: string;
  name: string;
}

interface TypeWisePerson {
  id: string;
  service_request_type_id: string;
  user_id: string;
  from_date: string | null;
  to_date: string | null;
  description: string | null;
  request_type: ServiceRequestType;
  profile: Profile;
}

export default function TypePersonMapMaster() {
  const [mappings, setMappings] = useState<TypeWisePerson[]>([]);
  const [requestTypes, setRequestTypes] = useState<ServiceRequestType[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingMap, setEditingMap] = useState<TypeWisePerson | null>(null);

  const [formData, setFormData] = useState({
    service_request_type_id: '',
    user_id: '',
    from_date: '',
    to_date: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    // Fetch request types
    const { data: rtData } = await supabase
      .from('service_request_types')
      .select('id, name')
      .order('name');
    if (rtData) setRequestTypes(rtData);

    // Fetch profiles (technicians)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, name')
      .order('name');
    if (profileData) setProfiles(profileData);

    // Fetch mappings
    const { data, error } = await supabase
      .from('service_request_type_wise_persons')
      .select(`
        id,
        service_request_type_id,
        user_id,
        from_date,
        to_date,
        description,
        request_type:service_request_types(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load mappings');
      console.error(JSON.stringify(error, null, 2));
    } else {
      const enrichedData = data.map((item: any) => ({
        ...item,
        profile: profileData?.find(p => p.id === item.user_id) || { id: item.user_id, name: 'Unknown' }
      }));
      setMappings(enrichedData as unknown as TypeWisePerson[]);
    }
    setIsLoading(false);
  };

  const filteredMaps = mappings.filter(map =>
    map.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    map.request_type?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      service_request_type_id: '',
      user_id: '',
      from_date: '',
      to_date: '',
      description: '',
    });
    setEditingMap(null);
  };

  const handleEdit = (map: TypeWisePerson) => {
    setEditingMap(map);
    setFormData({
      service_request_type_id: map.service_request_type_id,
      user_id: map.user_id,
      from_date: map.from_date?.split('T')[0] || '',
      to_date: map.to_date?.split('T')[0] || '',
      description: map.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.service_request_type_id || !formData.user_id) {
      toast.error('Request Type and Staff Member are required');
      return;
    }

    setIsSaving(true);

    const payload = {
      service_request_type_id: formData.service_request_type_id,
      user_id: formData.user_id,
      from_date: formData.from_date || null,
      to_date: formData.to_date || null,
      description: formData.description || null,
    };

    if (editingMap) {
      const { error } = await supabase
        .from('service_request_type_wise_persons')
        .update(payload)
        .eq('id', editingMap.id);

      if (error) {
        toast.error('Failed to update mapping');
        console.error(error);
      } else {
        toast.success('Mapping updated successfully');
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from('service_request_type_wise_persons')
        .insert([payload]);

      if (error) {
        toast.error('Failed to create mapping');
        console.error(error);
      } else {
        toast.success('Mapping created successfully');
        fetchData();
      }
    }

    setIsSaving(false);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('service_request_type_wise_persons')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete mapping');
      console.error(error);
    } else {
      toast.success('Mapping deleted successfully');
      fetchData();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Request Type-Person Mapping"
        description="Map service request types to responsible department personnel"
      >
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary">
              <Plus className="h-4 w-4" />
              Add Mapping
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingMap ? 'Edit Mapping' : 'Add New Mapping'}</DialogTitle>
              <DialogDescription>
                Assign a staff member to handle a specific request type
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="requestType">Request Type *</Label>
                <Select value={formData.service_request_type_id} onValueChange={(v) => setFormData({ ...formData, service_request_type_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
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
                  <Label htmlFor="fromDate">From Date</Label>
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
              placeholder="Search mappings..."
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
                  <TableHead></TableHead>
                  <TableHead>Assigned Person</TableHead>
                  <TableHead className="hidden md:table-cell">From Date</TableHead>
                  <TableHead className="hidden sm:table-cell">To Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaps.map((map) => (
                  <TableRow key={map.id}>
                    <TableCell>
                      <Badge variant="secondary" className="font-medium">
                        {map.request_type?.name || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-0">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {map.profile?.name?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{map.profile?.name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {map.from_date ? format(new Date(map.from_date), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {map.to_date ? format(new Date(map.to_date), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(map)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(map.id)}
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

          {!isLoading && filteredMaps.length === 0 && (
            <div className="text-center py-12">
              <UserCog className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No mappings found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
