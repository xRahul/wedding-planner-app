import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { accommodationBookings, weddings } from '@/lib/db/schema';
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

    // Verify access
    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    const accommodations = await db
      .select()
      .from(accommodationBookings)
      .where(eq(accommodationBookings.weddingId, weddingId))
      .orderBy(accommodationBookings.checkInDate);

    return successResponse(accommodations);
  } catch (error: any) {
    console.error('Error fetching accommodations:', error);
    return errorResponse(error.message || 'Failed to fetch accommodations', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const body = await request.json();
    const {
      weddingId,
      hotelName,
      address,
      checkInDate,
      checkOutDate,
      roomBlock,
      totalRooms,
      bookedRooms,
      ratePerNight,
      contactName,
      contactPhone,
      contactEmail,
      notes,
    } = body;

    if (!weddingId || !hotelName) {
      return errorResponse('weddingId and hotelName are required');
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

    // Create accommodation booking
    const [accommodation] = await db
      .insert(accommodationBookings)
      .values({
        weddingId,
        hotelName,
        address: address || null,
        checkInDate: checkInDate ? new Date(checkInDate) : null,
        checkOutDate: checkOutDate ? new Date(checkOutDate) : null,
        roomBlock: roomBlock || null,
        totalRooms: totalRooms || null,
        bookedRooms: bookedRooms || 0,
        ratePerNight: ratePerNight || null,
        contactName: contactName || null,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        notes: notes || null,
      })
      .returning();

    return successResponse(accommodation, 201);
  } catch (error: any) {
    console.error('Error creating accommodation:', error);
    return errorResponse(error.message || 'Failed to create accommodation', 500);
  }
}

