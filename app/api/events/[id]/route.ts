import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { weddingEvents, weddings } from '@/lib/db/schema';
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

    const [event] = await db
      .select()
      .from(weddingEvents)
      .where(and(eq(weddingEvents.id, id), isNull(weddingEvents.deletedAt)))
      .limit(1);

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    // Verify access
    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, event.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    return successResponse(event);
  } catch (error: any) {
    console.error('Error fetching event:', error);
    return errorResponse(error.message || 'Failed to fetch event', 500);
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
      name,
      eventType,
      date,
      startTime,
      endTime,
      location,
      venue,
      description,
      expectedGuests,
    } = body;

    // Get event first to verify access
    const [event] = await db
      .select()
      .from(weddingEvents)
      .where(and(eq(weddingEvents.id, id), isNull(weddingEvents.deletedAt)))
      .limit(1);

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    // Verify access
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

    if (name !== undefined) updateData.name = name;
    if (eventType !== undefined) updateData.eventType = eventType;
    if (date !== undefined) updateData.date = new Date(date);
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (location !== undefined) updateData.location = location;
    if (venue !== undefined) updateData.venue = venue;
    if (description !== undefined) updateData.description = description;
    if (expectedGuests !== undefined) updateData.expectedGuests = expectedGuests;

    const [updatedEvent] = await db
      .update(weddingEvents)
      .set(updateData)
      .where(eq(weddingEvents.id, id))
      .returning();

    return successResponse(updatedEvent);
  } catch (error: any) {
    console.error('Error updating event:', error);
    return errorResponse(error.message || 'Failed to update event', 500);
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

    // Get event first to verify access
    const [event] = await db
      .select()
      .from(weddingEvents)
      .where(and(eq(weddingEvents.id, id), isNull(weddingEvents.deletedAt)))
      .limit(1);

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    // Verify access
    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, event.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    // Soft delete
    await db
      .update(weddingEvents)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(weddingEvents.id, id));

    return successResponse({ message: 'Event deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return errorResponse(error.message || 'Failed to delete event', 500);
  }
}

