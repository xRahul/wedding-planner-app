import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { taskChecklists, tasks, weddings } from '@/lib/db/schema';
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

    // Verify task access
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
      .limit(1);

    if (!task) {
      return errorResponse('Task not found', 404);
    }

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, task.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    const checklist = await db
      .select()
      .from(taskChecklists)
      .where(eq(taskChecklists.taskId, id))
      .orderBy(taskChecklists.order);

    return successResponse(checklist);
  } catch (error: any) {
    console.error('Error fetching task checklist:', error);
    return errorResponse(error.message || 'Failed to fetch checklist', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { id } = params;
    const body = await request.json();
    const { item, order } = body;

    if (!item) {
      return errorResponse('item is required');
    }

    // Verify task access
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
      .limit(1);

    if (!task) {
      return errorResponse('Task not found', 404);
    }

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, task.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    const [checklistItem] = await db
      .insert(taskChecklists)
      .values({
        taskId: id,
        item,
        order: order || 0,
        completed: false,
      })
      .returning();

    return successResponse(checklistItem, 201);
  } catch (error: any) {
    console.error('Error creating checklist item:', error);
    return errorResponse(error.message || 'Failed to create checklist item', 500);
  }
}

