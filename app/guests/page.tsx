'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Search, Edit, Trash2, Download, Upload, X } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Guest {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  rsvpStatus: 'pending' | 'confirmed' | 'declined' | 'maybe';
  plusOne: boolean;
  plusOneName: string | null;
  dietaryPreferences: any;
  accommodationNeeded: boolean;
  role: string | null;
  notes: string | null;
  groupId: string | null;
}

interface GuestFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  rsvpStatus: 'pending' | 'confirmed' | 'declined' | 'maybe';
  plusOne: boolean;
  plusOneName: string;
  dietaryPreferences: {
    vegetarian?: boolean;
    vegan?: boolean;
    jain?: boolean;
    glutenFree?: boolean;
  };
  accommodationNeeded: boolean;
  role: string;
  notes: string;
}

export default function GuestsPage() {
  const user = useUser({ or: 'redirect' });
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState<GuestFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    rsvpStatus: 'pending',
    plusOne: false,
    plusOneName: '',
    dietaryPreferences: {},
    accommodationNeeded: false,
    role: '',
    notes: '',
  });

  useEffect(() => {
    fetchWedding();
  }, []);

  useEffect(() => {
    if (weddingId) {
      fetchGuests();
    }
  }, [weddingId, search]);

  async function fetchWedding() {
    try {
      const res = await fetch('/api/weddings');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setWeddingId(data.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching wedding:', error);
    }
  }

  async function fetchGuests() {
    if (!weddingId) return;
    setLoading(true);
    try {
      const url = `/api/guests?weddingId=${weddingId}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setGuests(data.data);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
    } finally {
      setLoading(false);
    }
  }

  function openAddDialog() {
    setEditingGuest(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      rsvpStatus: 'pending',
      plusOne: false,
      plusOneName: '',
      dietaryPreferences: {},
      accommodationNeeded: false,
      role: '',
      notes: '',
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(guest: Guest) {
    setEditingGuest(guest);
    setFormData({
      firstName: guest.firstName,
      lastName: guest.lastName || '',
      email: guest.email || '',
      phone: guest.phone || '',
      rsvpStatus: guest.rsvpStatus,
      plusOne: guest.plusOne,
      plusOneName: guest.plusOneName || '',
      dietaryPreferences: guest.dietaryPreferences || {},
      accommodationNeeded: guest.accommodationNeeded,
      role: guest.role || '',
      notes: guest.notes || '',
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weddingId) return;

    try {
      const url = editingGuest ? `/api/guests/${editingGuest.id}` : '/api/guests';
      const method = editingGuest ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingGuest ? {} : { weddingId }),
          ...formData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsDialogOpen(false);
        fetchGuests();
      } else {
        alert(data.message || 'Failed to save guest');
      }
    } catch (error) {
      console.error('Error saving guest:', error);
      alert('Failed to save guest');
    }
  }

  async function handleDelete(guestId: string) {
    if (!confirm('Are you sure you want to delete this guest?')) return;

    try {
      const response = await fetch(`/api/guests/${guestId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchGuests();
      } else {
        alert(data.message || 'Failed to delete guest');
      }
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('Failed to delete guest');
    }
  }

  function handleExportCSV() {
    const csvData = guests.map((guest) => ({
      'First Name': guest.firstName,
      'Last Name': guest.lastName || '',
      'Email': guest.email || '',
      'Phone': guest.phone || '',
      'RSVP Status': guest.rsvpStatus,
      'Plus One': guest.plusOne ? 'Yes' : 'No',
      'Plus One Name': guest.plusOneName || '',
      'Dietary Preferences': guest.dietaryPreferences
        ? Object.entries(guest.dietaryPreferences)
            .filter(([_, v]) => v)
            .map(([k]) => k)
            .join(', ')
        : '',
      'Accommodation Needed': guest.accommodationNeeded ? 'Yes' : 'No',
      'Role': guest.role || '',
      'Notes': guest.notes || '',
    }));

    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Guests');
    XLSX.writeFile(wb, 'guests-export.xlsx');
  }

  function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !weddingId) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        let successCount = 0;
        let errorCount = 0;

        for (const row of jsonData) {
          try {
            const dietaryPrefs: any = {};
            if (row['Dietary Preferences']) {
              const prefs = String(row['Dietary Preferences']).split(',').map((p: string) => p.trim().toLowerCase());
              if (prefs.includes('vegetarian')) dietaryPrefs.vegetarian = true;
              if (prefs.includes('vegan')) dietaryPrefs.vegan = true;
              if (prefs.includes('jain')) dietaryPrefs.jain = true;
              if (prefs.includes('gluten free') || prefs.includes('gluten-free')) dietaryPrefs.glutenFree = true;
            }

            const response = await fetch('/api/guests', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                weddingId,
                firstName: row['First Name'] || row['firstName'] || '',
                lastName: row['Last Name'] || row['lastName'] || '',
                email: row['Email'] || row['email'] || '',
                phone: row['Phone'] || row['phone'] || '',
                rsvpStatus: (row['RSVP Status'] || row['rsvpStatus'] || 'pending').toLowerCase(),
                plusOne: row['Plus One'] === 'Yes' || row['plusOne'] === true,
                plusOneName: row['Plus One Name'] || row['plusOneName'] || '',
                dietaryPreferences: dietaryPrefs,
                accommodationNeeded: row['Accommodation Needed'] === 'Yes' || row['accommodationNeeded'] === true,
                role: row['Role'] || row['role'] || '',
                notes: row['Notes'] || row['notes'] || '',
              }),
            });

            const data = await response.json();
            if (data.success) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
          }
        }

        alert(`Import complete: ${successCount} successful, ${errorCount} failed`);
        fetchGuests();
      } catch (error) {
        console.error('Error importing CSV:', error);
        alert('Failed to import CSV file');
      }
    };

    reader.readAsBinaryString(file);
    e.target.value = '';
  }

  const rsvpCounts = {
    pending: guests.filter((g) => g.rsvpStatus === 'pending').length,
    confirmed: guests.filter((g) => g.rsvpStatus === 'confirmed').length,
    declined: guests.filter((g) => g.rsvpStatus === 'declined').length,
    maybe: guests.filter((g) => g.rsvpStatus === 'maybe').length,
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Guests</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Manage your guest list and RSVP tracking
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <label>
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Import CSV
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImportCSV}
                    className="hidden"
                  />
                </label>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openAddDialog}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Guest
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingGuest ? 'Edit Guest' : 'Add Guest'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingGuest
                          ? 'Update guest information'
                          : 'Add a new guest to your wedding list'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) =>
                                setFormData({ ...formData, firstName: e.target.value })
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) =>
                                setFormData({ ...formData, lastName: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="rsvpStatus">RSVP Status</Label>
                            <Select
                              value={formData.rsvpStatus}
                              onValueChange={(value: any) =>
                                setFormData({ ...formData, rsvpStatus: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="declined">Declined</SelectItem>
                                <SelectItem value="maybe">Maybe</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="role">Role</Label>
                            <Input
                              id="role"
                              value={formData.role}
                              onChange={(e) =>
                                setFormData({ ...formData, role: e.target.value })
                              }
                              placeholder="e.g., Family Member, Friend"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="checkbox"
                              id="plusOne"
                              checked={formData.plusOne}
                              onChange={(e) =>
                                setFormData({ ...formData, plusOne: e.target.checked })
                              }
                              className="rounded"
                            />
                            <Label htmlFor="plusOne">Plus One</Label>
                          </div>
                          {formData.plusOne && (
                            <Input
                              placeholder="Plus One Name"
                              value={formData.plusOneName}
                              onChange={(e) =>
                                setFormData({ ...formData, plusOneName: e.target.value })
                              }
                              className="mt-2"
                            />
                          )}
                        </div>
                        <div>
                          <Label>Dietary Preferences</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {[
                              { key: 'vegetarian', label: 'Vegetarian' },
                              { key: 'vegan', label: 'Vegan' },
                              { key: 'jain', label: 'Jain' },
                              { key: 'glutenFree', label: 'Gluten Free' },
                            ].map((pref) => (
                              <div key={pref.key} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={pref.key}
                                  checked={formData.dietaryPreferences[pref.key as keyof typeof formData.dietaryPreferences] || false}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      dietaryPreferences: {
                                        ...formData.dietaryPreferences,
                                        [pref.key]: e.target.checked,
                                      },
                                    })
                                  }
                                  className="rounded"
                                />
                                <Label htmlFor={pref.key} className="font-normal">
                                  {pref.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="accommodationNeeded"
                              checked={formData.accommodationNeeded}
                              onChange={(e) =>
                                setFormData({ ...formData, accommodationNeeded: e.target.checked })
                              }
                              className="rounded"
                            />
                            <Label htmlFor="accommodationNeeded">Accommodation Needed</Label>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) =>
                              setFormData({ ...formData, notes: e.target.value })
                            }
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Save Guest</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{guests.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{rsvpCounts.confirmed}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{rsvpCounts.pending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Declined</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{rsvpCounts.declined}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search guests..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-8 text-center">Loading...</div>
                ) : guests.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    No guests found. Add your first guest to get started.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">RSVP Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Plus One</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {guests.map((guest) => (
                          <tr
                            key={guest.id}
                            className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="px-4 py-3">
                              {guest.firstName} {guest.lastName}
                            </td>
                            <td className="px-4 py-3">{guest.email || '-'}</td>
                            <td className="px-4 py-3">{guest.phone || '-'}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  guest.rsvpStatus === 'confirmed'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : guest.rsvpStatus === 'declined'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    : guest.rsvpStatus === 'maybe'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                }`}
                              >
                                {guest.rsvpStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {guest.plusOne ? 'Yes' : 'No'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(guest)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(guest.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
