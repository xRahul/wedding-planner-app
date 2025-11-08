'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatCurrency, formatDate, getDaysUntil } from '@/lib/utils';
import {
  Calendar,
  Users,
  DollarSign,
  CheckSquare,
  Plus,
  TrendingUp,
  AlertCircle,
  Briefcase,
  Clock,
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Wedding {
  id: string;
  name: string;
  brideName: string;
  groomName: string;
  startDate: string;
  endDate: string;
  location: string;
  budget: string | null;
  defaultGuestCount: number;
}

interface Event {
  id: string;
  name: string;
  eventType: string;
  date: string;
  startTime: string | null;
}

export default function DashboardPage() {
  const user = useUser({ or: 'redirect' });
  const router = useRouter();
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGuests: 0,
    confirmedGuests: 0,
    pendingGuests: 0,
    declinedGuests: 0,
    maybeGuests: 0,
    pendingTasks: 0,
    totalBudget: 0,
    spent: 0,
    budgetCategories: [] as Array<{ name: string; allocated: number; spent: number }>,
  });

  useEffect(() => {
    if (user) {
      fetchWeddings();
    }
  }, [user]);

  async function fetchWeddings() {
    try {
      const res = await fetch('/api/weddings');
      const data = await res.json();
      if (data.success) {
        setWeddings(data.data);
        if (data.data.length > 0) {
          fetchStats(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching weddings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats(weddingId: string) {
    try {
      const [guestsRes, tasksRes, budgetRes, eventsRes] = await Promise.all([
        fetch(`/api/guests?weddingId=${weddingId}`),
        fetch(`/api/tasks?weddingId=${weddingId}`),
        fetch(`/api/budget?weddingId=${weddingId}`),
        fetch(`/api/events?weddingId=${weddingId}`),
      ]);

      const guestsData = await guestsRes.json();
      const tasksData = await tasksRes.json();
      const budgetData = await budgetRes.json();
      const eventsData = await eventsRes.json();

      if (guestsData.success) {
        const guests = guestsData.data;
        setStats((prev) => ({
          ...prev,
          totalGuests: guests.length,
          confirmedGuests: guests.filter((g: any) => g.rsvpStatus === 'confirmed').length,
          pendingGuests: guests.filter((g: any) => g.rsvpStatus === 'pending').length,
          declinedGuests: guests.filter((g: any) => g.rsvpStatus === 'declined').length,
          maybeGuests: guests.filter((g: any) => g.rsvpStatus === 'maybe').length,
        }));
      }

      if (tasksData.success) {
        setStats((prev) => ({
          ...prev,
          pendingTasks: tasksData.data.filter((t: any) => t.status !== 'completed').length,
        }));
      }

      if (budgetData.success) {
        setStats((prev) => ({
          ...prev,
          totalBudget: budgetData.data.totalBudget || 0,
          spent: budgetData.data.totalSpent || 0,
          budgetCategories: budgetData.data.categories || [],
        }));
      }

      if (eventsData.success) {
        // Sort events by date and get upcoming ones
        const sortedEvents = eventsData.data
          .sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .filter((e: Event) => new Date(e.date) >= new Date())
          .slice(0, 5);
        setEvents(sortedEvents);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  const selectedWedding = weddings[0];
  const daysUntil = selectedWedding ? getDaysUntil(selectedWedding.startDate) : 0;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Overview of your wedding planning progress
                </p>
              </div>
              <Link href="/weddings/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Wedding
                </Button>
              </Link>
            </div>

            {weddings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="mb-4 text-lg text-gray-600 dark:text-gray-400">
                    No weddings yet. Create your first wedding to get started!
                  </p>
                  <Link href="/weddings/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Wedding
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {selectedWedding && (
                  <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Days Until Wedding</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{daysUntil}</div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(selectedWedding.startDate)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Guests</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.confirmedGuests}</div>
                        <p className="text-xs text-muted-foreground">
                          of {stats.totalGuests} confirmed
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingTasks}</div>
                        <p className="text-xs text-muted-foreground">tasks remaining</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Budget</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(stats.spent)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          of {formatCurrency(stats.totalBudget)} spent
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* RSVP Status Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>RSVP Status</CardTitle>
                      <CardDescription>Guest response breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats.totalGuests > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Confirmed', value: stats.confirmedGuests, color: '#10b981' },
                                { name: 'Pending', value: stats.pendingGuests, color: '#f59e0b' },
                                { name: 'Declined', value: stats.declinedGuests, color: '#ef4444' },
                                { name: 'Maybe', value: stats.maybeGuests, color: '#6366f1' },
                              ].filter((item) => item.value > 0)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {[
                                { name: 'Confirmed', value: stats.confirmedGuests, color: '#10b981' },
                                { name: 'Pending', value: stats.pendingGuests, color: '#f59e0b' },
                                { name: 'Declined', value: stats.declinedGuests, color: '#ef4444' },
                                { name: 'Maybe', value: stats.maybeGuests, color: '#6366f1' },
                              ]
                                .filter((item) => item.value > 0)
                                .map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-[200px] items-center justify-center text-sm text-gray-500">
                          No guest data available
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Budget Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Budget Overview</CardTitle>
                      <CardDescription>Allocated vs. Spent</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats.budgetCategories.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={stats.budgetCategories.slice(0, 5)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="allocated" fill="#3b82f6" name="Allocated" />
                            <Bar dataKey="spent" fill="#10b981" name="Spent" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : stats.totalBudget > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Total Budget</span>
                            <span className="font-medium">{formatCurrency(stats.totalBudget)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Spent</span>
                            <span className="font-medium">{formatCurrency(stats.spent)}</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className="h-full bg-green-500 transition-all"
                              style={{
                                width: `${Math.min((stats.spent / stats.totalBudget) * 100, 100)}%`,
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            {((stats.spent / stats.totalBudget) * 100).toFixed(1)}% spent
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-[200px] items-center justify-center text-sm text-gray-500">
                          No budget data available
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Upcoming Events */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Upcoming Events</CardTitle>
                      <CardDescription>Next 5 events</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {events.length > 0 ? (
                        <div className="space-y-3">
                          {events.map((event) => (
                            <div
                              key={event.id}
                              className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                            >
                              <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{event.name}</p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(event.date)}
                                  {event.startTime && ` • ${event.startTime}`}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-[200px] items-center justify-center text-sm text-gray-500">
                          No upcoming events
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Wedding Overview</CardTitle>
                      <CardDescription>
                        {selectedWedding?.name || 'No wedding selected'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedWedding && (
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium">Couple</p>
                            <p className="text-lg">
                              {selectedWedding.brideName} & {selectedWedding.groomName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Dates</p>
                            <p className="text-lg">
                              {formatDate(selectedWedding.startDate)} -{' '}
                              {formatDate(selectedWedding.endDate)}
                            </p>
                          </div>
                          {selectedWedding.location && (
                            <div>
                              <p className="text-sm font-medium">Location</p>
                              <p className="text-lg">{selectedWedding.location}</p>
                            </div>
                          )}
                          <Link href={`/weddings/${selectedWedding.id}`}>
                            <Button variant="outline" className="w-full">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Link href="/guests">
                          <Button variant="outline" className="w-full justify-start">
                            <Users className="mr-2 h-4 w-4" />
                            Manage Guests
                          </Button>
                        </Link>
                        <Link href="/vendors">
                          <Button variant="outline" className="w-full justify-start">
                            <Briefcase className="mr-2 h-4 w-4" />
                            Manage Vendors
                          </Button>
                        </Link>
                        <Link href="/tasks">
                          <Button variant="outline" className="w-full justify-start">
                            <CheckSquare className="mr-2 h-4 w-4" />
                            View Tasks
                          </Button>
                        </Link>
                        <Link href="/budget">
                          <Button variant="outline" className="w-full justify-start">
                            <DollarSign className="mr-2 h-4 w-4" />
                            Budget Overview
                          </Button>
                        </Link>
                        <Link href="/events">
                          <Button variant="outline" className="w-full justify-start">
                            <Calendar className="mr-2 h-4 w-4" />
                            View Events
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

