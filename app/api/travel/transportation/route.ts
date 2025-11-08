import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { transportationArrangements, weddings } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('weddingId');
    const eventId = searchParams.get('eventId');

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

    // Build query
    const conditions = [eq(transportationArrangements.weddingId, weddingId)];
    if (eventId) {
      conditions.push(eq(transportationArrangements.eventId, eventId));
    }

    const transportation = await db
      .select()
      .from(transportationArrangements)
      .where(and(...conditions))
      .orderBy(transportationArrangements.pickupTime);

    return successResponse(transportation);
  } catch (error: any) {
    console.error('Error fetching transportation:', error);
    return errorResponse(error.message || 'Failed to fetch transportation', 500);
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
      vehicleType,
      vehicleCount,
      pickupLocation,
      dropoffLocation,
      pickupTime,
      dropoffTime,
      vendorId,
      guestIds,
      notes,
    } = body;

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

    // Create transportation arrangement
    const [transportation] = await db
      .insert(transportationArrangements)
      .values({
        weddingId,
        eventId: eventId || null,
        vehicleType: vehicleType || null,
        vehicleCount: vehicleCount || 1,
        pickupLocation: pickupLocation || null,
        dropoffLocation: dropoffLocation || null,
        pickupTime: pickupTime ? new Date(pickupTime) : null,
        dropoffTime: dropoffTime ? new Date(dropoffTime) : null,
        vendorId: vendorId || null,
        guestIds: guestIds || null,
        notes: notes || null,
      })
      .returning();

    return successResponse(transportation, 201);
  } catch (error: any) {
    console.error('Error creating transportation:', error);
    return errorResponse(error.message || 'Failed to create transportation', 500);
  }
}

