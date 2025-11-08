import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { guestTravelDetails, guests, weddings } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('weddingId');
    const guestId = searchParams.get('guestId');

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

    // Build query
    if (guestId) {
      // Get travel details for specific guest
      const travelDetails = await db
        .select()
        .from(guestTravelDetails)
        .where(eq(guestTravelDetails.guestId, guestId));

      return successResponse(travelDetails);
    } else {
      // Get all travel details for wedding guests
      const allGuests = await db
        .select()
        .from(guests)
        .where(and(eq(guests.weddingId, weddingId), isNull(guests.deletedAt)));

      const travelDetailsList = await Promise.all(
        allGuests.map(async (guest) => {
          const travelDetails = await db
            .select()
            .from(guestTravelDetails)
            .where(eq(guestTravelDetails.guestId, guest.id));

          return {
            guest: {
              id: guest.id,
              firstName: guest.firstName,
              lastName: guest.lastName,
            },
            travelDetails,
          };
        })
      );

      return successResponse(travelDetailsList);
    }
  } catch (error: any) {
    console.error('Error fetching travel details:', error);
    return errorResponse(error.message || 'Failed to fetch travel details', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const body = await request.json();
    const {
      guestId,
      travelType,
      departureCity,
      arrivalCity,
      departureDate,
      arrivalDate,
      departureTime,
      arrivalTime,
      bookingReference,
      airline,
      flightNumber,
      seatNumber,
      returnDepartureDate,
      returnArrivalDate,
      returnFlightNumber,
      notes,
    } = body;

    if (!guestId) {
      return errorResponse('guestId is required');
    }

    // Verify guest belongs to user's wedding
    const [guest] = await db
      .select()
      .from(guests)
      .where(and(eq(guests.id, guestId), isNull(guests.deletedAt)))
      .limit(1);

    if (!guest) {
      return errorResponse('Guest not found', 404);
    }

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, guest.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    // Create travel details
    const [travelDetail] = await db
      .insert(guestTravelDetails)
      .values({
        guestId,
        travelType: travelType || null,
        departureCity: departureCity || null,
        arrivalCity: arrivalCity || null,
        departureDate: departureDate ? new Date(departureDate) : null,
        arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
        departureTime: departureTime || null,
        arrivalTime: arrivalTime || null,
        bookingReference: bookingReference || null,
        airline: airline || null,
        flightNumber: flightNumber || null,
        seatNumber: seatNumber || null,
        returnDepartureDate: returnDepartureDate ? new Date(returnDepartureDate) : null,
        returnArrivalDate: returnArrivalDate ? new Date(returnArrivalDate) : null,
        returnFlightNumber: returnFlightNumber || null,
        notes: notes || null,
      })
      .returning();

    return successResponse(travelDetail, 201);
  } catch (error: any) {
    console.error('Error creating travel details:', error);
    return errorResponse(error.message || 'Failed to create travel details', 500);
  }
}

