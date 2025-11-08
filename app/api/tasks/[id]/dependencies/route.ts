import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { taskDependencies, tasks, weddings } from '@/lib/db/schema';
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

    const dependencies = await db
      .select()
      .from(taskDependencies)
      .where(eq(taskDependencies.taskId, id));

    return successResponse(dependencies);
  } catch (error: any) {
    console.error('Error fetching task dependencies:', error);
    return errorResponse(error.message || 'Failed to fetch dependencies', 500);
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
    const { dependsOnTaskId } = body;

    if (!dependsOnTaskId) {
      return errorResponse('dependsOnTaskId is required');
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

    // Verify dependsOnTaskId exists and belongs to same wedding
    const [dependsOnTask] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, dependsOnTaskId), isNull(tasks.deletedAt)))
      .limit(1);

    if (!dependsOnTask || dependsOnTask.weddingId !== task.weddingId) {
      return errorResponse('Dependent task not found or invalid', 404);
    }

    // Check for circular dependency
    if (dependsOnTaskId === id) {
      return errorResponse('Task cannot depend on itself', 400);
    }

    const [dependency] = await db
      .insert(taskDependencies)
      .values({
        taskId: id,
        dependsOnTaskId,
      })
      .returning();

    return successResponse(dependency, 201);
  } catch (error: any) {
    console.error('Error creating task dependency:', error);
    return errorResponse(error.message || 'Failed to create dependency', 500);
  }
}

