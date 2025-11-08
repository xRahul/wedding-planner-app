import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { vendorAssignments, vendors, weddingEvents, weddings } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('weddingId');
    const vendorId = searchParams.get('vendorId');
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

    const conditions: any[] = [];

    if (vendorId) {
      conditions.push(eq(vendorAssignments.vendorId, vendorId));
    }

    if (eventId) {
      conditions.push(eq(vendorAssignments.eventId, eventId));
    }

    const assignments = await db
      .select()
      .from(vendorAssignments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(vendorAssignments.startTime);

    return successResponse(assignments);
  } catch (error: any) {
    console.error('Error fetching vendor assignments:', error);
    return errorResponse(error.message || 'Failed to fetch vendor assignments', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const body = await request.json();
    const { vendorId, eventId, serviceId, startTime, endTime, notes } = body;

    if (!vendorId || !eventId) {
      return errorResponse('vendorId and eventId are required');
    }

    // Verify vendor access
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(and(eq(vendors.id, vendorId), isNull(vendors.deletedAt)))
      .limit(1);

    if (!vendor) {
      return errorResponse('Vendor not found', 404);
    }

    // Verify event access
    const [event] = await db
      .select()
      .from(weddingEvents)
      .where(and(eq(weddingEvents.id, eventId), isNull(weddingEvents.deletedAt)))
      .limit(1);

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    // Verify wedding access
    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, vendor.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id || wedding.id !== event.weddingId) {
      return errorResponse('Access denied', 403);
    }

    const [assignment] = await db
      .insert(vendorAssignments)
      .values({
        vendorId,
        eventId,
        serviceId: serviceId || null,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        notes: notes || null,
      })
      .returning();

    return successResponse(assignment, 201);
  } catch (error: any) {
    console.error('Error creating vendor assignment:', error);
    return errorResponse(error.message || 'Failed to create vendor assignment', 500);
  }
}

