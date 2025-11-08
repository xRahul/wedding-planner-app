import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { tasks, weddings } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('weddingId');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');

    if (!weddingId) {
      return errorResponse('weddingId is required');
    }

    // Verify access
    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    let query = db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.weddingId, weddingId),
          isNull(tasks.deletedAt)
        )
      );

    if (status) {
      query = query.where(
        and(
          eq(tasks.weddingId, weddingId),
          isNull(tasks.deletedAt),
          eq(tasks.status, status as any)
        )
      ) as any;
    }

    if (assignedTo) {
      query = query.where(
        and(
          eq(tasks.weddingId, weddingId),
          isNull(tasks.deletedAt),
          eq(tasks.assignedTo, assignedTo)
        )
      ) as any;
    }

    const taskList = await query.orderBy(tasks.dueDate);

    return successResponse(taskList);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return errorResponse(error.message || 'Failed to fetch tasks', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const body = await request.json();
    const {
      weddingId,
      eventId,
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      category,
    } = body;

    if (!weddingId || !title) {
      return errorResponse('Missing required fields');
    }

    // Verify access
    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    const [task] = await db
      .insert(tasks)
      .values({
        weddingId,
        eventId: eventId || null,
        title,
        description,
        status: status || 'not_started',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo: assignedTo || null,
        category,
      })
      .returning();

    return successResponse(task, 201);
  } catch (error: any) {
    console.error('Error creating task:', error);
    return errorResponse(error.message || 'Failed to create task', 500);
  }
}

