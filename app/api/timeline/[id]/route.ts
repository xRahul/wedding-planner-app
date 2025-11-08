import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { eventTimeline, weddingEvents, weddings } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse, notFoundResponse } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { id } = await params;

    const [timelineItem] = await db
      .select()
      .from(eventTimeline)
      .where(eq(eventTimeline.id, id))
      .limit(1);

    if (!timelineItem) {
      return notFoundResponse('Timeline item not found');
    }

    // Verify access
    const [event] = await db
      .select()
      .from(weddingEvents)
      .where(and(eq(weddingEvents.id, timelineItem.eventId), isNull(weddingEvents.deletedAt)))
      .limit(1);

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, event.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    return successResponse(timelineItem);
  } catch (error: any) {
    console.error('Error fetching timeline item:', error);
    return errorResponse(error.message || 'Failed to fetch timeline item', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { id } = await params;
    const body = await request.json();

    const [timelineItem] = await db
      .select()
      .from(eventTimeline)
      .where(eq(eventTimeline.id, id))
      .limit(1);

    if (!timelineItem) {
      return notFoundResponse('Timeline item not found');
    }

    // Verify access
    const [event] = await db
      .select()
      .from(weddingEvents)
      .where(and(eq(weddingEvents.id, timelineItem.eventId), isNull(weddingEvents.deletedAt)))
      .limit(1);

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, event.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.time !== undefined) updateData.time = body.time;
    if (body.activity !== undefined) updateData.activity = body.activity;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo;
    if (body.vendorId !== undefined) updateData.vendorId = body.vendorId;
    if (body.order !== undefined) updateData.order = body.order;

    const [updated] = await db
      .update(eventTimeline)
      .set(updateData)
      .where(eq(eventTimeline.id, id))
      .returning();

    return successResponse(updated);
  } catch (error: any) {
    console.error('Error updating timeline item:', error);
    return errorResponse(error.message || 'Failed to update timeline item', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { id } = await params;

    const [timelineItem] = await db
      .select()
      .from(eventTimeline)
      .where(eq(eventTimeline.id, id))
      .limit(1);

    if (!timelineItem) {
      return notFoundResponse('Timeline item not found');
    }

    // Verify access
    const [event] = await db
      .select()
      .from(weddingEvents)
      .where(and(eq(weddingEvents.id, timelineItem.eventId), isNull(weddingEvents.deletedAt)))
      .limit(1);

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, event.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    await db.delete(eventTimeline).where(eq(eventTimeline.id, id));

    return successResponse({ id });
  } catch (error: any) {
    console.error('Error deleting timeline item:', error);
    return errorResponse(error.message || 'Failed to delete timeline item', 500);
  }
}

