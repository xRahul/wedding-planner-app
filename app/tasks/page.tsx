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
import { formatDate } from '@/lib/utils';
import {
  CheckSquare,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Clock,
  User,
  Tag,
  ListChecks,
  Link as LinkIcon,
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  item: string;
  completed: boolean;
  order: number;
}

interface TaskDependency {
  id: string;
  dependsOnTaskId: string;
  dependsOnTask?: {
    id: string;
    title: string;
  };
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate: string | null;
  category: string | null;
  assignedTo: string | null;
  eventId: string | null;
  checklist?: ChecklistItem[];
  dependencies?: TaskDependency[];
}

interface Event {
  id: string;
  name: string;
}

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const CATEGORY_OPTIONS = [
  'Vendor Coordination',
  'Guest Management',
  'Decoration',
  'Food',
  'Transportation',
  'Accommodation',
  'Entertainment',
  'Photography',
  'Other',
];

export default function TasksPage() {
  const user = useUser({ or: 'redirect' });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);
  const [isDependencyDialogOpen, setIsDependencyDialogOpen] = useState(false);
  const [selectedTaskForChecklist, setSelectedTaskForChecklist] = useState<string | null>(null);
  const [selectedTaskForDependency, setSelectedTaskForDependency] = useState<string | null>(null);
  const [checklistItem, setChecklistItem] = useState('');
  const [selectedDependencyTaskId, setSelectedDependencyTaskId] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'not_started' as Task['status'],
    priority: 'medium' as Task['priority'],
    dueDate: '',
    category: '',
    assignedTo: '',
    eventId: '',
  });

  useEffect(() => {
    fetchWedding();
  }, []);

  useEffect(() => {
    if (weddingId) {
      fetchTasks();
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

  async function fetchTasks() {
    if (!weddingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?weddingId=${weddingId}`);
      const data = await res.json();
      if (data.success) {
        const tasksWithDetails = await Promise.all(
          data.data.map(async (task: Task) => {
            const [checklistRes, dependenciesRes] = await Promise.all([
              fetch(`/api/tasks/${task.id}/checklists`),
              fetch(`/api/tasks/${task.id}/dependencies`),
            ]);
            const checklistData = await checklistRes.json();
            const dependenciesData = await dependenciesRes.json();

            const dependenciesWithTasks = await Promise.all(
              (dependenciesData.data || []).map(async (dep: TaskDependency) => {
                const taskRes = await fetch(`/api/tasks/${dep.dependsOnTaskId}`);
                const taskData = await taskRes.json();
                return {
                  ...dep,
                  dependsOnTask: taskData.success ? taskData.data : null,
                };
              })
            );

            return {
              ...task,
              checklist: checklistData.success ? checklistData.data : [],
              dependencies: dependenciesWithTasks,
            };
          })
        );
        setTasks(tasksWithDetails);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  function openTaskDialog(task?: Task) {
    if (task) {
      setSelectedTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        category: task.category || '',
        assignedTo: task.assignedTo || '',
        eventId: task.eventId || '',
      });
    } else {
      setSelectedTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'not_started',
        priority: 'medium',
        dueDate: '',
        category: '',
        assignedTo: '',
        eventId: '',
      });
    }
    setIsTaskDialogOpen(true);
  }

  function closeTaskDialog() {
    setIsTaskDialogOpen(false);
    setSelectedTask(null);
  }

  async function handleTaskSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weddingId || !formData.title) return;

    try {
      const url = selectedTask ? `/api/tasks/${selectedTask.id}` : '/api/tasks';
      const method = selectedTask ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          title: formData.title,
          description: formData.description || null,
          status: formData.status,
          priority: formData.priority,
          dueDate: formData.dueDate || null,
          category: formData.category || null,
          assignedTo: formData.assignedTo || null,
          eventId: formData.eventId || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchTasks();
        closeTaskDialog();
      } else {
        alert(data.error || 'Failed to save task');
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task');
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        await fetchTasks();
      } else {
        alert(data.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  }

  function openChecklistDialog(taskId: string) {
    setSelectedTaskForChecklist(taskId);
    setChecklistItem('');
    setIsChecklistDialogOpen(true);
  }

  function closeChecklistDialog() {
    setIsChecklistDialogOpen(false);
    setSelectedTaskForChecklist(null);
    setChecklistItem('');
  }

  async function handleAddChecklistItem(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTaskForChecklist || !checklistItem) return;

    try {
      const res = await fetch(`/api/tasks/${selectedTaskForChecklist}/checklists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: checklistItem }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchTasks();
        closeChecklistDialog();
      } else {
        alert(data.error || 'Failed to add checklist item');
      }
    } catch (error) {
      console.error('Error adding checklist item:', error);
      alert('Failed to add checklist item');
    }
  }

  async function handleToggleChecklistItem(taskId: string, checklistId: string, completed: boolean) {
    try {
      const res = await fetch(`/api/tasks/checklists/${checklistId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  }

  async function handleDeleteChecklistItem(taskId: string, checklistId: string) {
    if (!confirm('Are you sure you want to delete this checklist item?')) return;

    try {
      const res = await fetch(`/api/tasks/checklists/${checklistId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error deleting checklist item:', error);
    }
  }

  function openDependencyDialog(taskId: string) {
    setSelectedTaskForDependency(taskId);
    setSelectedDependencyTaskId('');
    setIsDependencyDialogOpen(true);
  }

  function closeDependencyDialog() {
    setIsDependencyDialogOpen(false);
    setSelectedTaskForDependency(null);
    setSelectedDependencyTaskId('');
  }

  async function handleAddDependency(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTaskForDependency || !selectedDependencyTaskId) return;

    try {
      const res = await fetch(`/api/tasks/${selectedTaskForDependency}/dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dependsOnTaskId: selectedDependencyTaskId }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchTasks();
        closeDependencyDialog();
      } else {
        alert(data.error || 'Failed to add dependency');
      }
    } catch (error) {
      console.error('Error adding dependency:', error);
      alert('Failed to add dependency');
    }
  }

  const statusColors = {
    not_started: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    delayed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  };

  const priorityColors = {
    critical: 'text-red-600 dark:text-red-400',
    high: 'text-orange-600 dark:text-orange-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    low: 'text-gray-600 dark:text-gray-400',
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
                <h1 className="text-3xl font-bold">Tasks</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Manage your wedding planning tasks with dependencies and checklists
                </p>
              </div>
              <Button onClick={() => openTaskDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : tasks.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No tasks found. Add your first task to get started.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => {
                  const checklistProgress =
                    task.checklist && task.checklist.length > 0
                      ? (task.checklist.filter((item) => item.completed).length /
                          task.checklist.length) *
                        100
                      : 0;

                  return (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-xl">{task.title}</CardTitle>
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[task.status]}`}
                              >
                                {STATUS_OPTIONS.find((s) => s.value === task.status)?.label}
                              </span>
                              <span className={`text-sm font-medium ${priorityColors[task.priority]}`}>
                                {PRIORITY_OPTIONS.find((p) => p.value === task.priority)?.label}
                              </span>
                            </div>
                            {task.description && (
                              <CardDescription className="mt-2">{task.description}</CardDescription>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openTaskDialog(task)}
                            >
                              <Edit className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="mr-1 h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {task.dueDate && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">
                                  <span className="font-medium">Due:</span>{' '}
                                  {formatDate(task.dueDate)}
                                </span>
                              </div>
                            )}
                            {task.category && (
                              <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">
                                  <span className="font-medium">Category:</span> {task.category}
                                </span>
                              </div>
                            )}
                            {task.assignedTo && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">
                                  <span className="font-medium">Assigned to:</span> {task.assignedTo}
                                </span>
                              </div>
                            )}
                          </div>

                          {task.checklist && task.checklist.length > 0 && (
                            <div>
                              <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ListChecks className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm font-medium">Checklist</span>
                                  <span className="text-xs text-gray-500">
                                    ({task.checklist.filter((item) => item.completed).length}/
                                    {task.checklist.length})
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openChecklistDialog(task.id)}
                                >
                                  <Plus className="mr-1 h-3 w-3" />
                                  Add Item
                                </Button>
                              </div>
                              <div className="space-y-1">
                                {task.checklist.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-2 rounded border border-gray-200 p-2 dark:border-gray-700"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={item.completed}
                                      onChange={() =>
                                        handleToggleChecklistItem(task.id, item.id, item.completed)
                                      }
                                      className="rounded border-gray-300"
                                    />
                                    <span
                                      className={`flex-1 text-sm ${
                                        item.completed
                                          ? 'text-gray-500 line-through'
                                          : 'text-gray-900 dark:text-gray-100'
                                      }`}
                                    >
                                      {item.item}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteChecklistItem(task.id, item.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                <div
                                  className="h-full bg-green-500 transition-all"
                                  style={{ width: `${checklistProgress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {task.dependencies && task.dependencies.length > 0 && (
                            <div>
                              <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <LinkIcon className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm font-medium">Dependencies</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDependencyDialog(task.id)}
                                >
                                  <Plus className="mr-1 h-3 w-3" />
                                  Add Dependency
                                </Button>
                              </div>
                              <div className="space-y-1">
                                {task.dependencies.map((dep) => (
                                  <div
                                    key={dep.id}
                                    className="rounded border border-gray-200 p-2 text-sm dark:border-gray-700"
                                  >
                                    {dep.dependsOnTask ? (
                                      <span>
                                        Depends on: <strong>{dep.dependsOnTask.title}</strong>
                                      </span>
                                    ) : (
                                      <span className="text-gray-500">Loading...</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {(!task.checklist || task.checklist.length === 0) &&
                            (!task.dependencies || task.dependencies.length === 0) && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openChecklistDialog(task.id)}
                                >
                                  <ListChecks className="mr-1 h-3 w-3" />
                                  Add Checklist
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDependencyDialog(task.id)}
                                >
                                  <LinkIcon className="mr-1 h-3 w-3" />
                                  Add Dependency
                                </Button>
                              </div>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Task Dialog */}
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selectedTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                  <DialogDescription>
                    {selectedTask ? 'Update task details' : 'Add a new task to your wedding planning'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTaskSubmit}>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Task Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="e.g., Book photographer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Task description..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value as Task['status'] })
                          }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Priority</label>
                        <select
                          value={formData.priority}
                          onChange={(e) =>
                            setFormData({ ...formData, priority: e.target.value as Task['priority'] })
                          }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        >
                          {PRIORITY_OPTIONS.map((priority) => (
                            <option key={priority.value} value={priority.value}>
                              {priority.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Due Date</label>
                        <input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        >
                          <option value="">Select category</option>
                          {CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Assigned To</label>
                        <input
                          type="text"
                          value={formData.assignedTo}
                          onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          placeholder="User ID or name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Event (Optional)</label>
                        <select
                          value={formData.eventId}
                          onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        >
                          <option value="">No specific event</option>
                          {events.map((event) => (
                            <option key={event.id} value={event.id}>
                              {event.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={closeTaskDialog}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Task</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Checklist Dialog */}
            <Dialog open={isChecklistDialogOpen} onOpenChange={setIsChecklistDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Checklist Item</DialogTitle>
                  <DialogDescription>Add a new item to the task checklist</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddChecklistItem}>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Item *</label>
                      <input
                        type="text"
                        required
                        value={checklistItem}
                        onChange={(e) => setChecklistItem(e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="e.g., Confirm date with vendor"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={closeChecklistDialog}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Item</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Dependency Dialog */}
            <Dialog open={isDependencyDialogOpen} onOpenChange={setIsDependencyDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Task Dependency</DialogTitle>
                  <DialogDescription>
                    Select a task that must be completed before this task can start
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddDependency}>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Depends On *</label>
                      <select
                        required
                        value={selectedDependencyTaskId}
                        onChange={(e) => setSelectedDependencyTaskId(e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                      >
                        <option value="">Select a task</option>
                        {tasks
                          .filter((t) => t.id !== selectedTaskForDependency)
                          .map((task) => (
                            <option key={task.id} value={task.id}>
                              {task.title}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={closeDependencyDialog}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Dependency</Button>
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
