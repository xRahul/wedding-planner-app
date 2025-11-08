import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { taskChecklists, tasks, weddings } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { checklistId: string } }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { checklistId } = params;
    const body = await request.json();
    const { item, completed, order } = body;

    // Get checklist item
    const [checklistItem] = await db
      .select()
      .from(taskChecklists)
      .where(eq(taskChecklists.id, checklistId))
      .limit(1);

    if (!checklistItem) {
      return errorResponse('Checklist item not found', 404);
    }

    // Verify task access
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, checklistItem.taskId), isNull(tasks.deletedAt)))
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

    const updateData: any = {};
    if (item !== undefined) updateData.item = item;
    if (completed !== undefined) updateData.completed = completed;
    if (order !== undefined) updateData.order = order;

    const [updated] = await db
      .update(taskChecklists)
      .set(updateData)
      .where(eq(taskChecklists.id, checklistId))
      .returning();

    return successResponse(updated);
  } catch (error: any) {
    console.error('Error updating checklist item:', error);
    return errorResponse(error.message || 'Failed to update checklist item', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { checklistId: string } }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { checklistId } = params;

    // Get checklist item
    const [checklistItem] = await db
      .select()
      .from(taskChecklists)
      .where(eq(taskChecklists.id, checklistId))
      .limit(1);

    if (!checklistItem) {
      return errorResponse('Checklist item not found', 404);
    }

    // Verify task access
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, checklistItem.taskId), isNull(tasks.deletedAt)))
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

    await db.delete(taskChecklists).where(eq(taskChecklists.id, checklistId));

    return successResponse({ message: 'Checklist item deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting checklist item:', error);
    return errorResponse(error.message || 'Failed to delete checklist item', 500);
  }
}

