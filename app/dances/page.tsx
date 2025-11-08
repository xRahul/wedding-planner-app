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
import { Music, Plus, Edit, Trash2, Users, Clock, Calendar } from 'lucide-react';

interface Participant {
  id?: string;
  guestId?: string;
  participantName?: string;
  role?: string;
  notes?: string;
  guest?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface DancePerformance {
  id: string;
  name: string;
  danceType?: string;
  songName?: string;
  songArtist?: string;
  duration?: number;
  isFamilyLed: boolean;
  choreographerName?: string;
  rehearsalSchedule?: any;
  costumeRequirements?: string;
  musicUrl?: string;
  videoUrl?: string;
  notes?: string;
  eventId?: string;
  participants: Participant[];
}

interface Event {
  id: string;
  name: string;
  eventType: string;
}

export default function DancesPage() {
  const user = useUser({ or: 'redirect' });
  const [performances, setPerformances] = useState<DancePerformance[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [guests, setGuests] = useState<Array<{ id: string; firstName: string; lastName: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [selectedPerformance, setSelectedPerformance] = useState<DancePerformance | null>(null);
  const [isPerformanceDialogOpen, setIsPerformanceDialogOpen] = useState(false);
  const [isParticipantDialogOpen, setIsParticipantDialogOpen] = useState(false);
  const [selectedPerformanceForParticipant, setSelectedPerformanceForParticipant] = useState<string | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  const [performanceForm, setPerformanceForm] = useState({
    name: '',
    eventId: '',
    danceType: '',
    songName: '',
    songArtist: '',
    duration: '',
    isFamilyLed: true,
    choreographerName: '',
    costumeRequirements: '',
    musicUrl: '',
    videoUrl: '',
    notes: '',
  });

  const [participantForm, setParticipantForm] = useState({
    guestId: '',
    participantName: '',
    role: '',
    notes: '',
  });

  useEffect(() => {
    fetchWedding();
  }, []);

  useEffect(() => {
    if (weddingId) {
      fetchPerformances();
      fetchEvents();
      fetchGuests();
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
    } finally {
      setLoading(false);
    }
  }

  async function fetchEvents() {
    if (!weddingId) return;
    try {
      const res = await fetch(`/api/events?weddingId=${weddingId}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }

  async function fetchGuests() {
    if (!weddingId) return;
    try {
      const res = await fetch(`/api/guests?weddingId=${weddingId}`);
      const data = await res.json();
      if (data.success) {
        setGuests(data.data);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
    }
  }

  async function fetchPerformances() {
    if (!weddingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dances?weddingId=${weddingId}`);
      const data = await res.json();
      if (data.success) {
        setPerformances(data.data);
      }
    } catch (error) {
      console.error('Error fetching performances:', error);
    } finally {
      setLoading(false);
    }
  }

  function openPerformanceDialog(performance?: DancePerformance) {
    if (performance) {
      setSelectedPerformance(performance);
      setPerformanceForm({
        name: performance.name,
        eventId: performance.eventId || '',
        danceType: performance.danceType || '',
        songName: performance.songName || '',
        songArtist: performance.songArtist || '',
        duration: performance.duration?.toString() || '',
        isFamilyLed: performance.isFamilyLed,
        choreographerName: performance.choreographerName || '',
        costumeRequirements: performance.costumeRequirements || '',
        musicUrl: performance.musicUrl || '',
        videoUrl: performance.videoUrl || '',
        notes: performance.notes || '',
      });
    } else {
      setSelectedPerformance(null);
      setPerformanceForm({
        name: '',
        eventId: '',
        danceType: '',
        songName: '',
        songArtist: '',
        duration: '',
        isFamilyLed: true,
        choreographerName: '',
        costumeRequirements: '',
        musicUrl: '',
        videoUrl: '',
        notes: '',
      });
    }
    setIsPerformanceDialogOpen(true);
  }

  function closePerformanceDialog() {
    setIsPerformanceDialogOpen(false);
    setSelectedPerformance(null);
  }

  async function handlePerformanceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weddingId || !performanceForm.name) return;

    try {
      const url = selectedPerformance
        ? `/api/dances/${selectedPerformance.id}`
        : '/api/dances';
      const method = selectedPerformance ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          eventId: performanceForm.eventId || null,
          name: performanceForm.name,
          danceType: performanceForm.danceType || null,
          songName: performanceForm.songName || null,
          songArtist: performanceForm.songArtist || null,
          duration: performanceForm.duration ? parseInt(performanceForm.duration) : null,
          isFamilyLed: performanceForm.isFamilyLed,
          choreographerName: performanceForm.choreographerName || null,
          costumeRequirements: performanceForm.costumeRequirements || null,
          musicUrl: performanceForm.musicUrl || null,
          videoUrl: performanceForm.videoUrl || null,
          notes: performanceForm.notes || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchPerformances();
        closePerformanceDialog();
      } else {
        alert(data.error || 'Failed to save performance');
      }
    } catch (error) {
      console.error('Error saving performance:', error);
      alert('Failed to save performance');
    }
  }

  async function handleDeletePerformance(performanceId: string) {
    if (!confirm('Are you sure you want to delete this performance?')) return;

    try {
      const res = await fetch(`/api/dances/${performanceId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        await fetchPerformances();
      } else {
        alert(data.error || 'Failed to delete performance');
      }
    } catch (error) {
      console.error('Error deleting performance:', error);
      alert('Failed to delete performance');
    }
  }

  function openParticipantDialog(performanceId: string, participant?: Participant) {
    setSelectedPerformanceForParticipant(performanceId);
    if (participant) {
      setSelectedParticipant(participant);
      setParticipantForm({
        guestId: participant.guestId || '',
        participantName: participant.participantName || '',
        role: participant.role || '',
        notes: participant.notes || '',
      });
    } else {
      setSelectedParticipant(null);
      setParticipantForm({
        guestId: '',
        participantName: '',
        role: '',
        notes: '',
      });
    }
    setIsParticipantDialogOpen(true);
  }

  function closeParticipantDialog() {
    setIsParticipantDialogOpen(false);
    setSelectedPerformanceForParticipant(null);
    setSelectedParticipant(null);
  }

  async function handleParticipantSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPerformanceForParticipant || (!participantForm.guestId && !participantForm.participantName)) return;

    try {
      if (selectedParticipant?.id) {
        // Update existing participant
        const res = await fetch(`/api/dances/participants/${selectedParticipant.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(participantForm),
        });

        const data = await res.json();
        if (data.success) {
          await fetchPerformances();
          closeParticipantDialog();
        } else {
          alert(data.error || 'Failed to save participant');
        }
      } else {
        // Create new participant
        const res = await fetch(`/api/dances/${selectedPerformanceForParticipant}/participants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(participantForm),
        });

        const data = await res.json();
        if (data.success) {
          await fetchPerformances();
          closeParticipantDialog();
        } else {
          alert(data.error || 'Failed to create participant');
        }
      }
    } catch (error) {
      console.error('Error saving participant:', error);
      alert('Failed to save participant');
    }
  }

  async function handleDeleteParticipant(performanceId: string, participantId: string) {
    if (!confirm('Are you sure you want to remove this participant?')) return;

    try {
      const res = await fetch(`/api/dances/participants/${participantId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        await fetchPerformances();
      } else {
        alert(data.error || 'Failed to remove participant');
      }
    } catch (error) {
      console.error('Error deleting participant:', error);
      alert('Failed to remove participant');
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
                <h1 className="text-3xl font-bold">Dances & Performances</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Coordinate dance performances, participants, and rehearsal schedules
                </p>
              </div>
              <Button onClick={() => openPerformanceDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Performance
              </Button>
            </div>

            {performances.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No performances found. Create your first performance to get started.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {performances.map((performance) => {
                  const event = events.find((e) => e.id === performance.eventId);

                  return (
                    <Card key={performance.id} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-xl">{performance.name}</CardTitle>
                              {performance.isFamilyLed && (
                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  Family Led
                                </span>
                              )}
                            </div>
                            {event && (
                              <CardDescription className="mt-1">
                                Event: {event.name} ({event.eventType})
                              </CardDescription>
                            )}
                            {performance.danceType && (
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Type: {performance.danceType}
                              </p>
                            )}
                            {performance.songName && (
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Song: {performance.songName}
                                {performance.songArtist && ` by ${performance.songArtist}`}
                              </p>
                            )}
                            {performance.duration && (
                              <p className="mt-1 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                <Clock className="h-3 w-3" />
                                Duration: {performance.duration} minutes
                              </p>
                            )}
                            {performance.choreographerName && (
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Choreographer: {performance.choreographerName}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPerformanceDialog(performance)}
                            >
                              <Edit className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePerformance(performance.id)}
                            >
                              <Trash2 className="mr-1 h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="flex items-center gap-2 font-medium">
                            <Users className="h-4 w-4" />
                            Participants ({performance.participants.length})
                          </h3>
                          <Button
                            size="sm"
                            onClick={() => openParticipantDialog(performance.id)}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Add Participant
                          </Button>
                        </div>

                        {performance.participants.length === 0 ? (
                          <div className="py-4 text-center text-sm text-gray-500">
                            No participants yet.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {performance.participants.map((participant, index) => (
                              <div
                                key={participant.id || index}
                                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {participant.guest
                                      ? `${participant.guest.firstName} ${participant.guest.lastName || ''}`
                                      : participant.participantName || 'Unnamed Participant'}
                                  </div>
                                  {participant.role && (
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                      Role: {participant.role}
                                    </p>
                                  )}
                                  {participant.notes && (
                                    <p className="mt-1 text-xs text-gray-500">
                                      {participant.notes}
                                    </p>
                                  )}
                                </div>
                                {participant.id && (
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openParticipantDialog(performance.id, participant)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteParticipant(performance.id, participant.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {performance.costumeRequirements && (
                          <div className="mt-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                            <p className="text-sm font-medium">Costume Requirements</p>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {performance.costumeRequirements}
                            </p>
                          </div>
                        )}

                        {performance.notes && (
                          <div className="mt-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                            <p className="text-sm font-medium">Notes</p>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {performance.notes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Performance Dialog */}
            <Dialog open={isPerformanceDialogOpen} onOpenChange={setIsPerformanceDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedPerformance ? 'Edit Performance' : 'Create New Performance'}
                  </DialogTitle>
                  <DialogDescription>
                    Create or edit a dance performance for your wedding
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePerformanceSubmit}>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Performance Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={performanceForm.name}
                        onChange={(e) =>
                          setPerformanceForm({ ...performanceForm, name: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="e.g., Bhangra Performance, Gidda Dance"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Event (Optional)
                      </label>
                      <select
                        value={performanceForm.eventId}
                        onChange={(e) =>
                          setPerformanceForm({ ...performanceForm, eventId: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                      >
                        <option value="">No specific event</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.name} ({event.eventType})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Dance Type
                        </label>
                        <select
                          value={performanceForm.danceType}
                          onChange={(e) =>
                            setPerformanceForm({ ...performanceForm, danceType: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        >
                          <option value="">Select type</option>
                          <option value="bhangra">Bhangra</option>
                          <option value="gidda">Gidda</option>
                          <option value="garba">Garba</option>
                          <option value="folk">Folk Dance</option>
                          <option value="bollywood">Bollywood</option>
                          <option value="classical">Classical</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={performanceForm.duration}
                          onChange={(e) =>
                            setPerformanceForm({ ...performanceForm, duration: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          placeholder="e.g., 5"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Song Name
                        </label>
                        <input
                          type="text"
                          value={performanceForm.songName}
                          onChange={(e) =>
                            setPerformanceForm({ ...performanceForm, songName: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          placeholder="Song name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Song Artist
                        </label>
                        <input
                          type="text"
                          value={performanceForm.songArtist}
                          onChange={(e) =>
                            setPerformanceForm({ ...performanceForm, songArtist: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          placeholder="Artist name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Choreographer
                      </label>
                      <input
                        type="text"
                        value={performanceForm.choreographerName}
                        onChange={(e) =>
                          setPerformanceForm({ ...performanceForm, choreographerName: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Choreographer name"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={performanceForm.isFamilyLed}
                          onChange={(e) =>
                            setPerformanceForm({ ...performanceForm, isFamilyLed: e.target.checked })
                          }
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Family-led performance</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Costume Requirements
                      </label>
                      <textarea
                        value={performanceForm.costumeRequirements}
                        onChange={(e) =>
                          setPerformanceForm({ ...performanceForm, costumeRequirements: e.target.value })
                        }
                        rows={2}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Costume details..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Music URL
                        </label>
                        <input
                          type="url"
                          value={performanceForm.musicUrl}
                          onChange={(e) =>
                            setPerformanceForm({ ...performanceForm, musicUrl: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Video URL
                        </label>
                        <input
                          type="url"
                          value={performanceForm.videoUrl}
                          onChange={(e) =>
                            setPerformanceForm({ ...performanceForm, videoUrl: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-800"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Notes
                      </label>
                      <textarea
                        value={performanceForm.notes}
                        onChange={(e) =>
                          setPerformanceForm({ ...performanceForm, notes: e.target.value })
                        }
                        rows={3}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closePerformanceDialog}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Performance</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Participant Dialog */}
            <Dialog open={isParticipantDialogOpen} onOpenChange={setIsParticipantDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedParticipant ? 'Edit Participant' : 'Add Participant'}
                  </DialogTitle>
                  <DialogDescription>
                    Add or edit a participant in the performance
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleParticipantSubmit}>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Guest (Optional)
                      </label>
                      <select
                        value={participantForm.guestId}
                        onChange={(e) =>
                          setParticipantForm({ ...participantForm, guestId: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                      >
                        <option value="">Select guest or enter name below</option>
                        {guests.map((guest) => (
                          <option key={guest.id} value={guest.id}>
                            {guest.firstName} {guest.lastName || ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Participant Name {participantForm.guestId ? '(Optional)' : '*'}
                      </label>
                      <input
                        type="text"
                        required={!participantForm.guestId}
                        value={participantForm.participantName}
                        onChange={(e) =>
                          setParticipantForm({ ...participantForm, participantName: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Name if not a guest"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        value={participantForm.role}
                        onChange={(e) =>
                          setParticipantForm({ ...participantForm, role: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="e.g., Lead, Backup, Solo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Notes
                      </label>
                      <textarea
                        value={participantForm.notes}
                        onChange={(e) =>
                          setParticipantForm({ ...participantForm, notes: e.target.value })
                        }
                        rows={2}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeParticipantDialog}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Participant</Button>
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
