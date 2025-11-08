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
import { StickyNote, MessageSquare, Plus, Edit, Trash2, Filter } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';

interface Note {
  id: string;
  content: string;
  entityType?: string;
  entityId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Communication {
  id: string;
  communicationType?: string;
  subject?: string;
  content?: string;
  date: string;
  initiatedBy: string;
  outcome?: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
}

export default function NotesPage() {
  const user = useUser({ or: 'redirect' });
  const [activeTab, setActiveTab] = useState<'notes' | 'communication'>('notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isCommDialogOpen, setIsCommDialogOpen] = useState(false);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');

  const [noteForm, setNoteForm] = useState({
    content: '',
    entityType: '',
    entityId: '',
  });

  const [commForm, setCommForm] = useState({
    communicationType: '',
    subject: '',
    content: '',
    date: new Date().toISOString().slice(0, 16),
    outcome: '',
    entityType: '',
    entityId: '',
  });

  useEffect(() => {
    fetchWedding();
  }, []);

  useEffect(() => {
    if (weddingId) {
      if (activeTab === 'notes') {
        fetchNotes();
      } else {
        fetchCommunications();
      }
    }
  }, [weddingId, activeTab, entityTypeFilter]);

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

  async function fetchNotes() {
    if (!weddingId) return;
    setLoading(true);
    try {
      let url = `/api/notes?weddingId=${weddingId}`;
      if (entityTypeFilter !== 'all') {
        url += `&entityType=${entityTypeFilter}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setNotes(data.data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCommunications() {
    if (!weddingId) return;
    setLoading(true);
    try {
      let url = `/api/communication?weddingId=${weddingId}`;
      if (entityTypeFilter !== 'all') {
        url += `&entityType=${entityTypeFilter}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setCommunications(data.data);
      }
    } catch (error) {
      console.error('Error fetching communications:', error);
    } finally {
      setLoading(false);
    }
  }

  function openNoteDialog(note?: Note) {
    if (note) {
      setSelectedNote(note);
      setNoteForm({
        content: note.content,
        entityType: note.entityType || '',
        entityId: note.entityId || '',
      });
    } else {
      setSelectedNote(null);
      setNoteForm({ content: '', entityType: '', entityId: '' });
    }
    setIsNoteDialogOpen(true);
  }

  function openCommDialog(comm?: Communication) {
    if (comm) {
      setSelectedCommunication(comm);
      setCommForm({
        communicationType: comm.communicationType || '',
        subject: comm.subject || '',
        content: comm.content || '',
        date: comm.date ? new Date(comm.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        outcome: comm.outcome || '',
        entityType: comm.entityType || '',
        entityId: comm.entityId || '',
      });
    } else {
      setSelectedCommunication(null);
      setCommForm({
        communicationType: '',
        subject: '',
        content: '',
        date: new Date().toISOString().slice(0, 16),
        outcome: '',
        entityType: '',
        entityId: '',
      });
    }
    setIsCommDialogOpen(true);
  }

  async function handleNoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weddingId || !noteForm.content) return;

    try {
      const url = selectedNote ? `/api/notes/${selectedNote.id}` : '/api/notes';
      const method = selectedNote ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          content: noteForm.content,
          entityType: noteForm.entityType || null,
          entityId: noteForm.entityId || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchNotes();
        setIsNoteDialogOpen(false);
        setSelectedNote(null);
      } else {
        alert(data.error || 'Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    }
  }

  async function handleCommSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weddingId) return;

    try {
      const url = selectedCommunication
        ? `/api/communication/${selectedCommunication.id}`
        : '/api/communication';
      const method = selectedCommunication ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          communicationType: commForm.communicationType || null,
          subject: commForm.subject || null,
          content: commForm.content || null,
          date: commForm.date,
          outcome: commForm.outcome || null,
          entityType: commForm.entityType || null,
          entityId: commForm.entityId || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchCommunications();
        setIsCommDialogOpen(false);
        setSelectedCommunication(null);
      } else {
        alert(data.error || 'Failed to save communication');
      }
    } catch (error) {
      console.error('Error saving communication:', error);
      alert('Failed to save communication');
    }
  }

  async function handleDeleteNote(noteId: string) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        await fetchNotes();
      } else {
        alert(data.error || 'Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  }

  async function handleDeleteComm(commId: string) {
    if (!confirm('Are you sure you want to delete this communication log?')) return;

    try {
      const res = await fetch(`/api/communication/${commId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        await fetchCommunications();
      } else {
        alert(data.error || 'Failed to delete communication');
      }
    } catch (error) {
      console.error('Error deleting communication:', error);
      alert('Failed to delete communication');
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
                <h1 className="text-3xl font-bold">Notes & Communication</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Track notes and communication history with vendors and guests
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-2 border-b">
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'notes'
                    ? 'border-b-2 border-[#00E599] text-[#00E599]'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <StickyNote className="mr-2 inline h-4 w-4" />
                Notes
              </button>
              <button
                onClick={() => setActiveTab('communication')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'communication'
                    ? 'border-b-2 border-[#00E599] text-[#00E599]'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <MessageSquare className="mr-2 inline h-4 w-4" />
                Communication Log
              </button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={entityTypeFilter}
                onChange={(e) => setEntityTypeFilter(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="all">All Entities</option>
                <option value="vendor">Vendors</option>
                <option value="guest">Guests</option>
                <option value="task">Tasks</option>
                <option value="event">Events</option>
              </select>
            </div>

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div>
                <div className="mb-4 flex justify-end">
                  <Button onClick={() => openNoteDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Note
                  </Button>
                </div>
                {notes.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      No notes found. Create your first note to get started.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <Card key={note.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {note.entityType && (
                                <CardDescription>
                                  Linked to: {note.entityType}
                                </CardDescription>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openNoteDialog(note)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNote(note.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="whitespace-pre-wrap">{note.content}</p>
                          <p className="mt-2 text-xs text-gray-500">
                            Created: {formatDate(note.createdAt)}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Communication Tab */}
            {activeTab === 'communication' && (
              <div>
                <div className="mb-4 flex justify-end">
                  <Button onClick={() => openCommDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Communication
                  </Button>
                </div>
                {communications.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      No communications found. Log your first communication to get started.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {communications.map((comm) => (
                      <Card key={comm.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">
                                {comm.subject || 'Communication'}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                Type: {comm.communicationType || 'N/A'} | Date:{' '}
                                {formatDateTime(comm.date)}
                              </CardDescription>
                              {comm.entityType && (
                                <CardDescription>
                                  Linked to: {comm.entityType}
                                </CardDescription>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openCommDialog(comm)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteComm(comm.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {comm.content && (
                            <p className="whitespace-pre-wrap">{comm.content}</p>
                          )}
                          {comm.outcome && (
                            <p className="mt-2 text-sm">
                              <span className="font-medium">Outcome:</span> {comm.outcome}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Note Dialog */}
            <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedNote ? 'Edit Note' : 'Create New Note'}
                  </DialogTitle>
                  <DialogDescription>
                    Add a note linked to a vendor, guest, task, or event
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleNoteSubmit}>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Content *
                      </label>
                      <textarea
                        required
                        value={noteForm.content}
                        onChange={(e) =>
                          setNoteForm({ ...noteForm, content: e.target.value })
                        }
                        rows={6}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Note content..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Link to Entity Type
                        </label>
                        <select
                          value={noteForm.entityType}
                          onChange={(e) =>
                            setNoteForm({ ...noteForm, entityType: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        >
                          <option value="">None</option>
                          <option value="vendor">Vendor</option>
                          <option value="guest">Guest</option>
                          <option value="task">Task</option>
                          <option value="event">Event</option>
                        </select>
                      </div>
                      {noteForm.entityType && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Entity ID
                          </label>
                          <input
                            type="text"
                            value={noteForm.entityId}
                            onChange={(e) =>
                              setNoteForm({ ...noteForm, entityId: e.target.value })
                            }
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                            placeholder="UUID"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsNoteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Note</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Communication Dialog */}
            <Dialog open={isCommDialogOpen} onOpenChange={setIsCommDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedCommunication ? 'Edit Communication' : 'Log Communication'}
                  </DialogTitle>
                  <DialogDescription>
                    Record a communication with a vendor, guest, or other entity
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCommSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Communication Type
                        </label>
                        <select
                          value={commForm.communicationType}
                          onChange={(e) =>
                            setCommForm({ ...commForm, communicationType: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        >
                          <option value="">Select type</option>
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="meeting">Meeting</option>
                          <option value="text">Text/SMS</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Date
                        </label>
                        <input
                          type="datetime-local"
                          value={commForm.date}
                          onChange={(e) =>
                            setCommForm({ ...commForm, date: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={commForm.subject}
                        onChange={(e) =>
                          setCommForm({ ...commForm, subject: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Communication subject..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Content
                      </label>
                      <textarea
                        value={commForm.content}
                        onChange={(e) =>
                          setCommForm({ ...commForm, content: e.target.value })
                        }
                        rows={4}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Communication details..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Outcome
                      </label>
                      <input
                        type="text"
                        value={commForm.outcome}
                        onChange={(e) =>
                          setCommForm({ ...commForm, outcome: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="e.g., Quote received, Confirmed booking..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Link to Entity Type
                        </label>
                        <select
                          value={commForm.entityType}
                          onChange={(e) =>
                            setCommForm({ ...commForm, entityType: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        >
                          <option value="">None</option>
                          <option value="vendor">Vendor</option>
                          <option value="guest">Guest</option>
                          <option value="task">Task</option>
                          <option value="event">Event</option>
                        </select>
                      </div>
                      {commForm.entityType && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Entity ID
                          </label>
                          <input
                            type="text"
                            value={commForm.entityId}
                            onChange={(e) =>
                              setCommForm({ ...commForm, entityId: e.target.value })
                            }
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                            placeholder="UUID"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCommDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Communication</Button>
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

