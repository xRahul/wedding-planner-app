import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { guestTravelDetails, guests, weddings } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse, notFoundResponse } from '@/lib/api-helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { id } = await params;
    const body = await request.json();

    // Get travel detail and verify access
    const [travelDetail] = await db
      .select()
      .from(guestTravelDetails)
      .where(eq(guestTravelDetails.id, id))
      .limit(1);

    if (!travelDetail) {
      return notFoundResponse('Travel detail not found');
    }

    const [guest] = await db
      .select()
      .from(guests)
      .where(and(eq(guests.id, travelDetail.guestId), isNull(guests.deletedAt)))
      .limit(1);

    if (!guest) {
      return notFoundResponse('Guest not found');
    }

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, guest.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    // Update travel detail
    const updateData: any = {};

    if (body.travelType !== undefined) updateData.travelType = body.travelType;
    if (body.departureCity !== undefined) updateData.departureCity = body.departureCity;
    if (body.arrivalCity !== undefined) updateData.arrivalCity = body.arrivalCity;
    if (body.departureDate !== undefined) updateData.departureDate = body.departureDate ? new Date(body.departureDate) : null;
    if (body.arrivalDate !== undefined) updateData.arrivalDate = body.arrivalDate ? new Date(body.arrivalDate) : null;
    if (body.departureTime !== undefined) updateData.departureTime = body.departureTime;
    if (body.arrivalTime !== undefined) updateData.arrivalTime = body.arrivalTime;
    if (body.bookingReference !== undefined) updateData.bookingReference = body.bookingReference;
    if (body.airline !== undefined) updateData.airline = body.airline;
    if (body.flightNumber !== undefined) updateData.flightNumber = body.flightNumber;
    if (body.seatNumber !== undefined) updateData.seatNumber = body.seatNumber;
    if (body.returnDepartureDate !== undefined) updateData.returnDepartureDate = body.returnDepartureDate ? new Date(body.returnDepartureDate) : null;
    if (body.returnArrivalDate !== undefined) updateData.returnArrivalDate = body.returnArrivalDate ? new Date(body.returnArrivalDate) : null;
    if (body.returnFlightNumber !== undefined) updateData.returnFlightNumber = body.returnFlightNumber;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const [updated] = await db
      .update(guestTravelDetails)
      .set(updateData)
      .where(eq(guestTravelDetails.id, id))
      .returning();

    return successResponse(updated);
  } catch (error: any) {
    console.error('Error updating travel detail:', error);
    return errorResponse(error.message || 'Failed to update travel detail', 500);
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

    // Get travel detail and verify access
    const [travelDetail] = await db
      .select()
      .from(guestTravelDetails)
      .where(eq(guestTravelDetails.id, id))
      .limit(1);

    if (!travelDetail) {
      return notFoundResponse('Travel detail not found');
    }

    const [guest] = await db
      .select()
      .from(guests)
      .where(and(eq(guests.id, travelDetail.guestId), isNull(guests.deletedAt)))
      .limit(1);

    if (!guest) {
      return notFoundResponse('Guest not found');
    }

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, guest.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    await db.delete(guestTravelDetails).where(eq(guestTravelDetails.id, id));

    return successResponse({ message: 'Travel detail deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting travel detail:', error);
    return errorResponse(error.message || 'Failed to delete travel detail', 500);
  }
}

