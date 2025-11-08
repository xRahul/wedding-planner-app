import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { tasks, weddings } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { id } = params;

    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
      .limit(1);

    if (!task) {
      return errorResponse('Task not found', 404);
    }

    // Verify access
    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, task.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    return successResponse(task);
  } catch (error: any) {
    console.error('Error fetching task:', error);
    return errorResponse(error.message || 'Failed to fetch task', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { id } = params;
    const body = await request.json();
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      category,
      eventId,
    } = body;

    // Get task first to verify access
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
      .limit(1);

    if (!task) {
      return errorResponse('Task not found', 404);
    }

    // Verify access
    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, task.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completedAt = new Date();
        updateData.completedBy = user.id;
      }
    }
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (category !== undefined) updateData.category = category;
    if (eventId !== undefined) updateData.eventId = eventId;

    const [updatedTask] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();

    return successResponse(updatedTask);
  } catch (error: any) {
    console.error('Error updating task:', error);
    return errorResponse(error.message || 'Failed to update task', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { id } = params;

    // Get task first to verify access
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
      .limit(1);

    if (!task) {
      return errorResponse('Task not found', 404);
    }

    // Verify access
    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, task.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    // Soft delete
    await db
      .update(tasks)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(tasks.id, id));

    return successResponse({ message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return errorResponse(error.message || 'Failed to delete task', 500);
  }
}

