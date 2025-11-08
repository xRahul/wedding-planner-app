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
import { formatDate, formatDateTime } from '@/lib/utils';
import { Calendar, Plus, Edit, Trash2, Clock, MapPin } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  eventType: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  venue: string | null;
  description: string | null;
  expectedGuests: number | null;
}

const EVENT_TYPES = [
  { value: 'roka', label: 'Roka' },
  { value: 'mehendi', label: 'Mehendi' },
  { value: 'haldi', label: 'Haldi' },
  { value: 'sangeet', label: 'Sangeet' },
  { value: 'baraat', label: 'Baraat' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'reception', label: 'Reception' },
  { value: 'walima', label: 'Walima' },
  { value: 'custom', label: 'Custom' },
];

export default function EventsPage() {
  const user = useUser({ or: 'redirect' });
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    eventType: 'custom',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    venue: '',
    description: '',
    expectedGuests: '',
  });

  useEffect(() => {
    fetchWedding();
  }, []);

  useEffect(() => {
    if (weddingId) {
      fetchEvents();
    }
  }, [weddingId]);

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

  async function fetchEvents() {
    if (!weddingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events?weddingId=${weddingId}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  function openDialog(event?: Event) {
    if (event) {
      setSelectedEvent(event);
      setFormData({
        name: event.name,
        eventType: event.eventType,
        date: event.date.split('T')[0],
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        location: event.location || '',
        venue: event.venue || '',
        description: event.description || '',
        expectedGuests: event.expectedGuests?.toString() || '',
      });
    } else {
      setSelectedEvent(null);
      setFormData({
        name: '',
        eventType: 'custom',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        venue: '',
        description: '',
        expectedGuests: '',
      });
    }
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setSelectedEvent(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weddingId || !formData.name || !formData.eventType || !formData.date) return;

    try {
      const url = selectedEvent ? `/api/events/${selectedEvent.id}` : '/api/events';
      const method = selectedEvent ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          name: formData.name,
          eventType: formData.eventType,
          date: formData.date,
          startTime: formData.startTime || null,
          endTime: formData.endTime || null,
          location: formData.location || null,
          venue: formData.venue || null,
          description: formData.description || null,
          expectedGuests: formData.expectedGuests ? parseInt(formData.expectedGuests) : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchEvents();
        closeDialog();
      } else {
        alert(data.error || 'Failed to save event');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event');
    }
  }

  async function handleDelete(eventId: string) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        await fetchEvents();
      } else {
        alert(data.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
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
                <h1 className="text-3xl font-bold">Events & Timeline</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Manage your wedding events and schedule
                </p>
              </div>
              <Button onClick={() => openDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : events.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No events found. Add your first event to get started.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-xl">{event.name}</CardTitle>
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                              {EVENT_TYPES.find((t) => t.value === event.eventType)?.label || event.eventType}
                            </span>
                          </div>
                          {event.description && (
                            <CardDescription className="mt-2">{event.description}</CardDescription>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(event)}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(event.id)}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Date</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(event.date)}
                            </p>
                          </div>
                        </div>
                        {(event.startTime || event.endTime) && (
                          <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Time</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {event.startTime || 'TBD'}
                                {event.endTime && ` - ${event.endTime}`}
                              </p>
                            </div>
                          </div>
                        )}
                        {event.venue && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Venue</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{event.venue}</p>
                            </div>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Location</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{event.location}</p>
                            </div>
                          </div>
                        )}
                        {event.expectedGuests && (
                          <div>
                            <p className="text-sm font-medium">Expected Guests</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {event.expectedGuests} guests
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Event Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedEvent ? 'Edit Event' : 'Create New Event'}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedEvent ? 'Update event details' : 'Add a new event to your wedding'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Event Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="e.g., Mehendi Ceremony"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Event Type *
                        </label>
                        <select
                          required
                          value={formData.eventType}
                          onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        >
                          {EVENT_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Venue
                      </label>
                      <input
                        type="text"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="e.g., Grand Ballroom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="e.g., New Delhi, India"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Expected Guests
                      </label>
                      <input
                        type="number"
                        value={formData.expectedGuests}
                        onChange={(e) => setFormData({ ...formData, expectedGuests: e.target.value })}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Number of expected guests"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Event description..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={closeDialog}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Event</Button>
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

