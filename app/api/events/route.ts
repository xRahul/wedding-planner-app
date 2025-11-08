import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { weddingEvents, weddings } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('weddingId');

    if (!weddingId) {
      return errorResponse('weddingId is required');
    }

    // Verify access to wedding
    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    const events = await db
      .select()
      .from(weddingEvents)
      .where(
        and(
          eq(weddingEvents.weddingId, weddingId),
          isNull(weddingEvents.deletedAt)
        )
      )
      .orderBy(weddingEvents.date);

    return successResponse(events);
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return errorResponse(error.message || 'Failed to fetch events', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const body = await request.json();
    const {
      weddingId,
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

    if (!weddingId || !name || !eventType || !date) {
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

    const [event] = await db
      .insert(weddingEvents)
      .values({
        weddingId,
        name,
        eventType,
        date: new Date(date),
        startTime,
        endTime,
        location,
        venue,
        description,
        expectedGuests,
      })
      .returning();

    return successResponse(event, 201);
  } catch (error: any) {
    console.error('Error creating event:', error);
    return errorResponse(error.message || 'Failed to create event', 500);
  }
}

