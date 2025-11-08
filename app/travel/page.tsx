'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plane, Plus, Edit, Trash2, Hotel, Car, Users } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';

interface TravelDetail {
  id: string;
  guestId: string;
  travelType?: string;
  departureCity?: string;
  arrivalCity?: string;
  departureDate?: string;
  arrivalDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  bookingReference?: string;
  airline?: string;
  flightNumber?: string;
  seatNumber?: string;
  returnDepartureDate?: string;
  returnArrivalDate?: string;
  returnFlightNumber?: string;
  notes?: string;
}

interface Accommodation {
  id: string;
  hotelName: string;
  address?: string;
  checkInDate?: string;
  checkOutDate?: string;
  roomBlock?: string;
  totalRooms?: number;
  bookedRooms: number;
  ratePerNight?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
}

interface Transportation {
  id: string;
  eventId?: string;
  vehicleType?: string;
  vehicleCount: number;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupTime?: string;
  dropoffTime?: string;
  vendorId?: string;
  guestIds?: string[];
  notes?: string;
}

interface Guest {
  id: string;
  firstName: string;
  lastName: string | null;
}

export default function TravelPage() {
  const user = useUser({ or: 'redirect' });
  const [activeTab, setActiveTab] = useState<'travel' | 'accommodation' | 'transportation'>('travel');
  const [travelDetails, setTravelDetails] = useState<Array<{ guest: Guest; travelDetails: TravelDetail[] }>>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [transportation, setTransportation] = useState<Transportation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [events, setEvents] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [weddingId, setWeddingId] = useState<string | null>(null);

  // Dialog states
  const [isTravelDialogOpen, setIsTravelDialogOpen] = useState(false);
  const [isAccommodationDialogOpen, setIsAccommodationDialogOpen] = useState(false);
  const [isTransportationDialogOpen, setIsTransportationDialogOpen] = useState(false);
  const [selectedTravel, setSelectedTravel] = useState<{ guestId: string; detail?: TravelDetail } | null>(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [selectedTransportation, setSelectedTransportation] = useState<Transportation | null>(null);

  useEffect(() => {
    fetchWedding();
  }, []);

  useEffect(() => {
    if (weddingId) {
      fetchData();
    }
  }, [weddingId, activeTab]);

  async function fetchWedding() {
    try {
      const res = await fetch('/api/weddings');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setWeddingId(data.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching wedding:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchData() {
    if (!weddingId) return;
    setLoading(true);
    try {
      if (activeTab === 'travel') {
        const res = await fetch(`/api/travel?weddingId=${weddingId}`);
        const data = await res.json();
        if (data.success) {
          setTravelDetails(data.data);
        }
      } else if (activeTab === 'accommodation') {
        const res = await fetch(`/api/travel/accommodation?weddingId=${weddingId}`);
        const data = await res.json();
        if (data.success) {
          setAccommodations(data.data);
        }
      } else if (activeTab === 'transportation') {
        const res = await fetch(`/api/travel/transportation?weddingId=${weddingId}`);
        const data = await res.json();
        if (data.success) {
          setTransportation(data.data);
        }
      }

      // Fetch guests and events for forms
      const [guestsRes, eventsRes] = await Promise.all([
        fetch(`/api/guests?weddingId=${weddingId}`),
        fetch(`/api/events?weddingId=${weddingId}`),
      ]);

      const guestsData = await guestsRes.json();
      const eventsData = await eventsRes.json();

      if (guestsData.success) setGuests(guestsData.data);
      if (eventsData.success) setEvents(eventsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Travel handlers
  function openTravelDialog(guestId?: string, detail?: TravelDetail) {
    setSelectedTravel({ guestId: guestId || '', detail });
    setIsTravelDialogOpen(true);
  }

  async function handleTravelSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTravel?.guestId) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    try {
      const url = selectedTravel.detail
        ? `/api/travel/${selectedTravel.detail.id}`
        : '/api/travel';
      const method = selectedTravel.detail ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: selectedTravel.guestId,
          ...data,
        }),
      });

      const result = await res.json();
      if (result.success) {
        await fetchData();
        setIsTravelDialogOpen(false);
        setSelectedTravel(null);
      } else {
        alert(result.error || 'Failed to save travel details');
      }
    } catch (error) {
      console.error('Error saving travel:', error);
      alert('Failed to save travel details');
    }
  }

  // Accommodation handlers
  function openAccommodationDialog(accommodation?: Accommodation) {
    setSelectedAccommodation(accommodation || null);
    setIsAccommodationDialogOpen(true);
  }

  async function handleAccommodationSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weddingId) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    try {
      const url = selectedAccommodation
        ? `/api/travel/accommodation/${selectedAccommodation.id}`
        : '/api/travel/accommodation';
      const method = selectedAccommodation ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          ...data,
        }),
      });

      const result = await res.json();
      if (result.success) {
        await fetchData();
        setIsAccommodationDialogOpen(false);
        setSelectedAccommodation(null);
      } else {
        alert(result.error || 'Failed to save accommodation');
      }
    } catch (error) {
      console.error('Error saving accommodation:', error);
      alert('Failed to save accommodation');
    }
  }

  // Transportation handlers
  function openTransportationDialog(transport?: Transportation) {
    setSelectedTransportation(transport || null);
    setIsTransportationDialogOpen(true);
  }

  async function handleTransportationSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weddingId) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    try {
      const url = selectedTransportation
        ? `/api/travel/transportation/${selectedTransportation.id}`
        : '/api/travel/transportation';
      const method = selectedTransportation ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          ...data,
        }),
      });

      const result = await res.json();
      if (result.success) {
        await fetchData();
        setIsTransportationDialogOpen(false);
        setSelectedTransportation(null);
      } else {
        alert(result.error || 'Failed to save transportation');
      }
    } catch (error) {
      console.error('Error saving transportation:', error);
      alert('Failed to save transportation');
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Travel & Logistics</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Manage guest travel, accommodation, and transportation
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-2 border-b">
              <button
                onClick={() => setActiveTab('travel')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'travel'
                    ? 'border-b-2 border-[#00E599] text-[#00E599]'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Plane className="mr-2 inline h-4 w-4" />
                Guest Travel
              </button>
              <button
                onClick={() => setActiveTab('accommodation')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'accommodation'
                    ? 'border-b-2 border-[#00E599] text-[#00E599]'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Hotel className="mr-2 inline h-4 w-4" />
                Accommodation
              </button>
              <button
                onClick={() => setActiveTab('transportation')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'transportation'
                    ? 'border-b-2 border-[#00E599] text-[#00E599]'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Car className="mr-2 inline h-4 w-4" />
                Transportation
              </button>
            </div>

            {/* Travel Tab */}
            {activeTab === 'travel' && (
              <div>
                <div className="mb-4 flex justify-end">
                  <Button onClick={() => openTravelDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Travel Details
                  </Button>
                </div>
                {travelDetails.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      No travel details found.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {travelDetails.map((item) => (
                      <Card key={item.guest.id}>
                        <CardHeader>
                          <CardTitle>
                            {item.guest.firstName} {item.guest.lastName || ''}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {item.travelDetails.length === 0 ? (
                            <p className="text-sm text-gray-500">No travel details</p>
                          ) : (
                            <div className="space-y-3">
                              {item.travelDetails.map((detail) => (
                                <div key={detail.id} className="rounded-lg border p-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium">
                                        {detail.travelType || 'Travel'} - {detail.departureCity} to {detail.arrivalCity}
                                      </p>
                                      {detail.departureDate && (
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                          Departure: {formatDate(detail.departureDate)} {detail.departureTime}
                                        </p>
                                      )}
                                      {detail.arrivalDate && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          Arrival: {formatDate(detail.arrivalDate)} {detail.arrivalTime}
                                        </p>
                                      )}
                                      {detail.flightNumber && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          Flight: {detail.airline} {detail.flightNumber}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openTravelDialog(item.guest.id, detail)}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => openTravelDialog(item.guest.id)}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Add Travel
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Accommodation Tab */}
            {activeTab === 'accommodation' && (
              <div>
                <div className="mb-4 flex justify-end">
                  <Button onClick={() => openAccommodationDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Accommodation
                  </Button>
                </div>
                {accommodations.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      No accommodations found.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {accommodations.map((accommodation) => (
                      <Card key={accommodation.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle>{accommodation.hotelName}</CardTitle>
                              {accommodation.address && (
                                <CardDescription className="mt-1">
                                  {accommodation.address}
                                </CardDescription>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openAccommodationDialog(accommodation)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            {accommodation.checkInDate && (
                              <p>
                                Check-in: {formatDate(accommodation.checkInDate)}
                              </p>
                            )}
                            {accommodation.checkOutDate && (
                              <p>
                                Check-out: {formatDate(accommodation.checkOutDate)}
                              </p>
                            )}
                            {accommodation.totalRooms && (
                              <p>
                                Rooms: {accommodation.bookedRooms} / {accommodation.totalRooms}
                              </p>
                            )}
                            {accommodation.ratePerNight && (
                              <p>Rate: ₹{accommodation.ratePerNight}/night</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Transportation Tab */}
            {activeTab === 'transportation' && (
              <div>
                <div className="mb-4 flex justify-end">
                  <Button onClick={() => openTransportationDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Transportation
                  </Button>
                </div>
                {transportation.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      No transportation arrangements found.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {transportation.map((transport) => {
                      const event = events.find((e) => e.id === transport.eventId);
                      return (
                        <Card key={transport.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle>
                                  {transport.vehicleType || 'Transport'} ({transport.vehicleCount} vehicle{transport.vehicleCount !== 1 ? 's' : ''})
                                </CardTitle>
                                {event && (
                                  <CardDescription className="mt-1">
                                    Event: {event.name}
                                  </CardDescription>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openTransportationDialog(transport)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              {transport.pickupLocation && (
                                <p>
                                  Pickup: {transport.pickupLocation}
                                  {transport.pickupTime && ` at ${formatDateTime(transport.pickupTime)}`}
                                </p>
                              )}
                              {transport.dropoffLocation && (
                                <p>
                                  Drop-off: {transport.dropoffLocation}
                                  {transport.dropoffTime && ` at ${formatDateTime(transport.dropoffTime)}`}
                                </p>
                              )}
                              {transport.guestIds && transport.guestIds.length > 0 && (
                                <p>
                                  <Users className="mr-1 inline h-3 w-3" />
                                  {transport.guestIds.length} guest(s)
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Travel Dialog - Simplified for space */}
            <Dialog open={isTravelDialogOpen} onOpenChange={setIsTravelDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Travel Details</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTravelSubmit}>
                  <div className="space-y-4 py-4">
                    {!selectedTravel?.detail && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Guest *</label>
                        <select
                          name="guestId"
                          required
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          onChange={(e) => setSelectedTravel({ guestId: e.target.value })}
                        >
                          <option value="">Select guest</option>
                          {guests.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.firstName} {g.lastName || ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Travel Type</label>
                        <select
                          name="travelType"
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          defaultValue={selectedTravel?.detail?.travelType}
                        >
                          <option value="">Select type</option>
                          <option value="flight">Flight</option>
                          <option value="train">Train</option>
                          <option value="car">Car</option>
                          <option value="bus">Bus</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Airline</label>
                        <input
                          type="text"
                          name="airline"
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          defaultValue={selectedTravel?.detail?.airline}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Departure City</label>
                        <input
                          type="text"
                          name="departureCity"
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          defaultValue={selectedTravel?.detail?.departureCity}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Arrival City</label>
                        <input
                          type="text"
                          name="arrivalCity"
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          defaultValue={selectedTravel?.detail?.arrivalCity}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Departure Date</label>
                        <input
                          type="datetime-local"
                          name="departureDate"
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          defaultValue={selectedTravel?.detail?.departureDate ? new Date(selectedTravel.detail.departureDate).toISOString().slice(0, 16) : ''}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Arrival Date</label>
                        <input
                          type="datetime-local"
                          name="arrivalDate"
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          defaultValue={selectedTravel?.detail?.arrivalDate ? new Date(selectedTravel.detail.arrivalDate).toISOString().slice(0, 16) : ''}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Flight Number</label>
                        <input
                          type="text"
                          name="flightNumber"
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          defaultValue={selectedTravel?.detail?.flightNumber}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Booking Reference</label>
                        <input
                          type="text"
                          name="bookingReference"
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          defaultValue={selectedTravel?.detail?.bookingReference}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsTravelDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Accommodation Dialog - Simplified */}
            <Dialog open={isAccommodationDialogOpen} onOpenChange={setIsAccommodationDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Accommodation Booking</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAccommodationSubmit}>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Hotel Name *</label>
                      <input
                        type="text"
                        name="hotelName"
                        required
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        defaultValue={selectedAccommodation?.hotelName}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Address</label>
                      <textarea
                        name="address"
                        rows={2}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        defaultValue={selectedAccommodation?.address}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Check-in Date</label>
                        <input
                          type="date"
                          name="checkInDate"
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          defaultValue={selectedAccommodation?.checkInDate ? new Date(selectedAccommodation.checkInDate).toISOString().split('T')[0] : ''}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Check-out Date</label>
                        <input
                          type="date"
                          name="checkOutDate"
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          defaultValue={selectedAccommodation?.checkOutDate ? new Date(selectedAccommodation.checkOutDate).toISOString().split('T')[0] : ''}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Total Rooms</label>
                        <input
                          type="number"
                          name="totalRooms"
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          defaultValue={selectedAccommodation?.totalRooms}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Rate per Night (₹)</label>
                        <input
                          type="number"
                          name="ratePerNight"
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          defaultValue={selectedAccommodation?.ratePerNight}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAccommodationDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Transportation Dialog - Simplified */}
            <Dialog open={isTransportationDialogOpen} onOpenChange={setIsTransportationDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Transportation Arrangement</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTransportationSubmit}>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Event (Optional)</label>
                      <select
                        name="eventId"
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        defaultValue={selectedTransportation?.eventId}
                      >
                        <option value="">No specific event</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Vehicle Type</label>
                        <select
                          name="vehicleType"
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          defaultValue={selectedTransportation?.vehicleType}
                        >
                          <option value="">Select type</option>
                          <option value="car">Car</option>
                          <option value="bus">Bus</option>
                          <option value="tempo">Tempo</option>
                          <option value="van">Van</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Vehicle Count</label>
                        <input
                          type="number"
                          name="vehicleCount"
                          min="1"
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          defaultValue={selectedTransportation?.vehicleCount || 1}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Pickup Location</label>
                      <input
                        type="text"
                        name="pickupLocation"
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        defaultValue={selectedTransportation?.pickupLocation}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Drop-off Location</label>
                      <input
                        type="text"
                        name="dropoffLocation"
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        defaultValue={selectedTransportation?.dropoffLocation}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsTransportationDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}
