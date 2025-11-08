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
import { Plus, Search, Edit, Trash2, Briefcase, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Vendor {
  id: string;
  name: string;
  category: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: 'pending_quote' | 'negotiating' | 'confirmed' | 'booked' | 'paid' | 'cancelled';
  rating: number | null;
  notes: string | null;
}

interface VendorFormData {
  name: string;
  category: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  status: 'pending_quote' | 'negotiating' | 'confirmed' | 'booked' | 'paid' | 'cancelled';
  rating: number | null;
  notes: string;
}

interface Contract {
  id: string;
  totalAmount: string;
  depositAmount: string | null;
  depositPaid: boolean;
  advanceAmount: string | null;
  advancePaid: boolean;
  finalAmount: string | null;
  finalPaid: boolean;
  currency: string;
  notes: string | null;
}

const VENDOR_CATEGORIES = [
  'Caterer',
  'Photographer',
  'Videographer',
  'Decorator',
  'Florist',
  'DJ/Music',
  'Venue',
  'Transportation',
  'Beauty Services',
  'Pandit/Religious Coordinator',
  'Invitation Designer',
  'Other',
];

export default function VendorsPage() {
  const user = useUser({ or: 'redirect' });
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    category: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    status: 'pending_quote',
    rating: null,
    notes: '',
  });
  const [contractForm, setContractForm] = useState({
    totalAmount: '',
    depositAmount: '',
    advanceAmount: '',
    finalAmount: '',
    currency: 'INR',
    notes: '',
  });

  useEffect(() => {
    fetchWedding();
  }, []);

  useEffect(() => {
    if (weddingId) {
      fetchVendors();
    }
  }, [weddingId, search, categoryFilter]);

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

  async function fetchVendors() {
    if (!weddingId) return;
    setLoading(true);
    try {
      const url = `/api/vendors?weddingId=${weddingId}${categoryFilter ? `&category=${encodeURIComponent(categoryFilter)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        let vendorList = data.data;
        if (search) {
          vendorList = vendorList.filter(
            (v: Vendor) =>
              v.name.toLowerCase().includes(search.toLowerCase()) ||
              v.category.toLowerCase().includes(search.toLowerCase()) ||
              v.contactName?.toLowerCase().includes(search.toLowerCase())
          );
        }
        setVendors(vendorList);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchContracts(vendorId: string) {
    try {
      const res = await fetch(`/api/vendors/${vendorId}/contracts`);
      const data = await res.json();
      if (data.success) {
        setContracts(data.data);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  }

  function openAddDialog() {
    setEditingVendor(null);
    setFormData({
      name: '',
      category: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      status: 'pending_quote',
      rating: null,
      notes: '',
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(vendor: Vendor) {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      category: vendor.category,
      contactName: vendor.contactName || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      status: vendor.status,
      rating: vendor.rating,
      notes: vendor.notes || '',
    });
    setIsDialogOpen(true);
  }

  function openContractDialog(vendor: Vendor) {
    setSelectedVendor(vendor);
    setContractForm({
      totalAmount: '',
      depositAmount: '',
      advanceAmount: '',
      finalAmount: '',
      currency: 'INR',
      notes: '',
    });
    fetchContracts(vendor.id);
    setIsContractDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weddingId) return;

    try {
      const url = editingVendor ? `/api/vendors/${editingVendor.id}` : '/api/vendors';
      const method = editingVendor ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingVendor ? {} : { weddingId }),
          ...formData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsDialogOpen(false);
        fetchVendors();
      } else {
        alert(data.message || 'Failed to save vendor');
      }
    } catch (error) {
      console.error('Error saving vendor:', error);
      alert('Failed to save vendor');
    }
  }

  async function handleDelete(vendorId: string) {
    if (!confirm('Are you sure you want to delete this vendor?')) return;

    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchVendors();
      } else {
        alert(data.message || 'Failed to delete vendor');
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert('Failed to delete vendor');
    }
  }

  async function handleContractSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVendor) return;

    try {
      const response = await fetch(`/api/vendors/${selectedVendor.id}/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmount: contractForm.totalAmount,
          depositAmount: contractForm.depositAmount || null,
          advanceAmount: contractForm.advanceAmount || null,
          finalAmount: contractForm.finalAmount || null,
          currency: contractForm.currency,
          notes: contractForm.notes || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setContractForm({
          totalAmount: '',
          depositAmount: '',
          advanceAmount: '',
          finalAmount: '',
          currency: 'INR',
          notes: '',
        });
        fetchContracts(selectedVendor.id);
      } else {
        alert(data.message || 'Failed to create contract');
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      alert('Failed to create contract');
    }
  }

  async function handlePaymentUpdate(contractId: string, paymentType: 'deposit' | 'advance' | 'final', paid: boolean) {
    if (!selectedVendor) return;

    try {
      const response = await fetch(`/api/vendors/${selectedVendor.id}/contracts/${contractId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [`${paymentType}Paid`]: paid,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchContracts(selectedVendor.id);
      } else {
        alert(data.message || 'Failed to update payment');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment');
    }
  }

  const statusColors = {
    pending_quote: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    negotiating: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    booked: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const statusCounts = {
    pending_quote: vendors.filter((v) => v.status === 'pending_quote').length,
    negotiating: vendors.filter((v) => v.status === 'negotiating').length,
    confirmed: vendors.filter((v) => v.status === 'confirmed').length,
    booked: vendors.filter((v) => v.status === 'booked').length,
    paid: vendors.filter((v) => v.status === 'paid').length,
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
                <h1 className="text-3xl font-bold">Vendors</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Manage your wedding vendors and service providers
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Vendor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingVendor ? 'Edit Vendor' : 'Add Vendor'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingVendor
                        ? 'Update vendor information'
                        : 'Add a new vendor to your wedding'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Vendor Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) =>
                              setFormData({ ...formData, category: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {VENDOR_CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="contactName">Contact Name</Label>
                        <Input
                          id="contactName"
                          value={formData.contactName}
                          onChange={(e) =>
                            setFormData({ ...formData, contactName: e.target.value })
                          }
                        />
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
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({ ...formData, address: e.target.value })
                          }
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value: any) =>
                              setFormData({ ...formData, status: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending_quote">Pending Quote</SelectItem>
                              <SelectItem value="negotiating">Negotiating</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="booked">Booked</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="rating">Rating (1-5)</Label>
                          <Input
                            id="rating"
                            type="number"
                            min="1"
                            max="5"
                            value={formData.rating || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                rating: e.target.value ? parseInt(e.target.value) : null,
                              })
                            }
                          />
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
                      <Button type="submit">Save Vendor</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{vendors.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Pending Quote</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {statusCounts.pending_quote}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {statusCounts.confirmed}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Booked</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {statusCounts.booked}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Paid</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{statusCounts.paid}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search vendors..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {VENDOR_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
            </Card>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : vendors.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No vendors found. Add your first vendor to get started.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {vendors.map((vendor) => (
                  <Card key={vendor.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{vendor.name}</CardTitle>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {vendor.category}
                          </p>
                        </div>
                        <Briefcase className="h-5 w-5 text-gray-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {vendor.contactName && (
                          <p className="text-sm">
                            <span className="font-medium">Contact:</span> {vendor.contactName}
                          </p>
                        )}
                        {vendor.email && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {vendor.email}
                          </p>
                        )}
                        {vendor.phone && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {vendor.phone}
                          </p>
                        )}
                        <div className="pt-2 flex items-center justify-between">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${statusColors[vendor.status]}`}
                          >
                            {vendor.status.replace('_', ' ')}
                          </span>
                          {vendor.rating && (
                            <span className="text-sm">⭐ {vendor.rating}/5</span>
                          )}
                        </div>
                        <div className="pt-2 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(vendor)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openContractDialog(vendor)}
                            className="flex-1"
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Contract
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(vendor.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Dialog open={isContractDialogOpen} onOpenChange={setIsContractDialogOpen}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Contracts & Payments - {selectedVendor?.name}
                  </DialogTitle>
                  <DialogDescription>
                    Manage contracts and payment tracking for this vendor
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Add New Contract</h3>
                    <form onSubmit={handleContractSubmit}>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="totalAmount">Total Amount *</Label>
                            <Input
                              id="totalAmount"
                              type="number"
                              step="0.01"
                              value={contractForm.totalAmount}
                              onChange={(e) =>
                                setContractForm({ ...contractForm, totalAmount: e.target.value })
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="currency">Currency</Label>
                            <Select
                              value={contractForm.currency}
                              onValueChange={(value) =>
                                setContractForm({ ...contractForm, currency: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="INR">INR (₹)</SelectItem>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="depositAmount">Deposit Amount</Label>
                            <Input
                              id="depositAmount"
                              type="number"
                              step="0.01"
                              value={contractForm.depositAmount}
                              onChange={(e) =>
                                setContractForm({ ...contractForm, depositAmount: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="advanceAmount">Advance Amount</Label>
                            <Input
                              id="advanceAmount"
                              type="number"
                              step="0.01"
                              value={contractForm.advanceAmount}
                              onChange={(e) =>
                                setContractForm({ ...contractForm, advanceAmount: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="finalAmount">Final Amount</Label>
                            <Input
                              id="finalAmount"
                              type="number"
                              step="0.01"
                              value={contractForm.finalAmount}
                              onChange={(e) =>
                                setContractForm({ ...contractForm, finalAmount: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="contractNotes">Notes</Label>
                          <Textarea
                            id="contractNotes"
                            value={contractForm.notes}
                            onChange={(e) =>
                              setContractForm({ ...contractForm, notes: e.target.value })
                            }
                            rows={2}
                          />
                        </div>
                        <Button type="submit">Add Contract</Button>
                      </div>
                    </form>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Existing Contracts</h3>
                    {contracts.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No contracts yet</p>
                    ) : (
                      <div className="space-y-4">
                        {contracts.map((contract) => (
                          <Card key={contract.id}>
                            <CardContent className="pt-6">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold">
                                    Total: {formatCurrency(parseFloat(contract.totalAmount), contract.currency)}
                                  </span>
                                </div>
                                {contract.depositAmount && (
                                  <div className="flex justify-between items-center">
                                    <span>
                                      Deposit: {formatCurrency(parseFloat(contract.depositAmount), contract.currency)}
                                    </span>
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={contract.depositPaid}
                                        onChange={(e) =>
                                          handlePaymentUpdate(contract.id, 'deposit', e.target.checked)
                                        }
                                        className="rounded"
                                      />
                                      <span className="text-sm">Paid</span>
                                    </label>
                                  </div>
                                )}
                                {contract.advanceAmount && (
                                  <div className="flex justify-between items-center">
                                    <span>
                                      Advance: {formatCurrency(parseFloat(contract.advanceAmount), contract.currency)}
                                    </span>
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={contract.advancePaid}
                                        onChange={(e) =>
                                          handlePaymentUpdate(contract.id, 'advance', e.target.checked)
                                        }
                                        className="rounded"
                                      />
                                      <span className="text-sm">Paid</span>
                                    </label>
                                  </div>
                                )}
                                {contract.finalAmount && (
                                  <div className="flex justify-between items-center">
                                    <span>
                                      Final: {formatCurrency(parseFloat(contract.finalAmount), contract.currency)}
                                    </span>
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={contract.finalPaid}
                                        onChange={(e) =>
                                          handlePaymentUpdate(contract.id, 'final', e.target.checked)
                                        }
                                        className="rounded"
                                      />
                                      <span className="text-sm">Paid</span>
                                    </label>
                                  </div>
                                )}
                                {contract.notes && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {contract.notes}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsContractDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}
