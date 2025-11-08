import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { eventTimeline, weddingEvents, weddings } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return errorResponse('eventId is required');
    }

    // Verify access through event -> wedding
    const [event] = await db
      .select()
      .from(weddingEvents)
      .where(and(eq(weddingEvents.id, eventId), isNull(weddingEvents.deletedAt)))
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

    const timeline = await db
      .select()
      .from(eventTimeline)
      .where(eq(eventTimeline.eventId, eventId))
      .orderBy(eventTimeline.order, eventTimeline.time);

    return successResponse(timeline);
  } catch (error: any) {
    console.error('Error fetching timeline:', error);
    return errorResponse(error.message || 'Failed to fetch timeline', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const body = await request.json();
    const { eventId, time, activity, description, assignedTo, vendorId, order } = body;

    if (!eventId || !time || !activity) {
      return errorResponse('eventId, time, and activity are required');
    }

    // Verify access through event -> wedding
    const [event] = await db
      .select()
      .from(weddingEvents)
      .where(and(eq(weddingEvents.id, eventId), isNull(weddingEvents.deletedAt)))
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

    const [timelineItem] = await db
      .insert(eventTimeline)
      .values({
        eventId,
        time,
        activity,
        description: description || null,
        assignedTo: assignedTo || null,
        vendorId: vendorId || null,
        order: order || 0,
      })
      .returning();

    return successResponse(timelineItem, 201);
  } catch (error: any) {
    console.error('Error creating timeline item:', error);
    return errorResponse(error.message || 'Failed to create timeline item', 500);
  }
}

