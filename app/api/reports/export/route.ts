import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import {
  weddings,
  guests,
  vendors,
  budgetCategories,
  budgetItems,
  expenses,
  tasks,
  weddingEvents,
  menus,
  menuItems,
  dancePerformances,
  guestTravelDetails,
  accommodationBookings,
  transportationArrangements,
} from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('weddingId');
    const type = searchParams.get('type'); // 'guests', 'vendors', 'budget', 'tasks', 'events', 'menus', 'dances', 'travel', 'all'

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

    const reportData: any = {};

    if (type === 'guests' || type === 'all') {
      const guestsList = await db
        .select()
        .from(guests)
        .where(and(eq(guests.weddingId, weddingId), isNull(guests.deletedAt)));

      reportData.guests = guestsList.map((g) => ({
        'First Name': g.firstName,
        'Last Name': g.lastName || '',
        'Email': g.email || '',
        'Phone': g.phone || '',
        'RSVP Status': g.rsvpStatus,
        'Plus One': g.plusOne ? 'Yes' : 'No',
        'Plus One Name': g.plusOneName || '',
        'Dietary Preferences': JSON.stringify(g.dietaryPreferences || {}),
        'Accommodation Needed': g.accommodationNeeded ? 'Yes' : 'No',
        'Role': g.role || '',
        'Notes': g.notes || '',
      }));
    }

    if (type === 'vendors' || type === 'all') {
      const vendorsList = await db
        .select()
        .from(vendors)
        .where(and(eq(vendors.weddingId, weddingId), isNull(vendors.deletedAt)));

      reportData.vendors = vendorsList.map((v) => ({
        'Name': v.name,
        'Category': v.category,
        'Contact Name': v.contactName || '',
        'Email': v.email || '',
        'Phone': v.phone || '',
        'Status': v.status,
        'Rating': v.rating || '',
        'Notes': v.notes || '',
      }));
    }

    if (type === 'budget' || type === 'all') {
      const categories = await db
        .select()
        .from(budgetCategories)
        .where(eq(budgetCategories.weddingId, weddingId));

      const expensesList = await db
        .select()
        .from(expenses)
        .where(
          and(
            eq(expenses.weddingId, weddingId),
            isNull(expenses.deletedAt)
          )
        );

      reportData.budget = {
        categories: categories.map((c) => ({
          'Category': c.name,
          'Allocated Amount': c.allocatedAmount || '0',
        })),
        expenses: expensesList.map((e) => ({
          'Description': e.description,
          'Amount': e.amount,
          'Currency': e.currency || 'INR',
          'Date': e.expenseDate?.toISOString().split('T')[0] || '',
          'Payment Method': e.paymentMethod || '',
        })),
      };
    }

    if (type === 'tasks' || type === 'all') {
      const tasksList = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.weddingId, weddingId), isNull(tasks.deletedAt)));

      reportData.tasks = tasksList.map((t) => ({
        'Title': t.title,
        'Description': t.description || '',
        'Status': t.status,
        'Priority': t.priority,
        'Due Date': t.dueDate?.toISOString().split('T')[0] || '',
        'Category': t.category || '',
        'Completed At': t.completedAt?.toISOString().split('T')[0] || '',
      }));
    }

    if (type === 'events' || type === 'all') {
      const eventsList = await db
        .select()
        .from(weddingEvents)
        .where(and(eq(weddingEvents.weddingId, weddingId), isNull(weddingEvents.deletedAt)));

      reportData.events = eventsList.map((e) => ({
        'Name': e.name,
        'Event Type': e.eventType,
        'Date': e.date?.toISOString().split('T')[0] || '',
        'Start Time': e.startTime || '',
        'End Time': e.endTime || '',
        'Location': e.location || '',
        'Venue': e.venue || '',
        'Expected Guests': e.expectedGuests || '',
        'Description': e.description || '',
      }));
    }

    if (type === 'menus' || type === 'all') {
      const menusList = await db
        .select()
        .from(menus)
        .where(eq(menus.weddingId, weddingId));

      const menusWithItems = await Promise.all(
        menusList.map(async (menu) => {
          const items = await db
            .select()
            .from(menuItems)
            .where(eq(menuItems.menuId, menu.id));

          return {
            'Menu Name': menu.name,
            'Description': menu.description || '',
            'Approved': menu.approved ? 'Yes' : 'No',
            'Items Count': items.length,
            'Items': items.map((i) => i.name).join(', '),
          };
        })
      );

      reportData.menus = menusWithItems;
    }

    if (type === 'dances' || type === 'all') {
      const dancesList = await db
        .select()
        .from(dancePerformances)
        .where(eq(dancePerformances.weddingId, weddingId));

      reportData.dances = dancesList.map((d) => ({
        'Name': d.name,
        'Dance Type': d.danceType || '',
        'Song Name': d.songName || '',
        'Song Artist': d.songArtist || '',
        'Duration (minutes)': d.duration || '',
        'Family Led': d.isFamilyLed ? 'Yes' : 'No',
        'Choreographer': d.choreographerName || '',
        'Costume Requirements': d.costumeRequirements || '',
      }));
    }

    if (type === 'travel' || type === 'all') {
      // Get all guests first
      const guestsList = await db
        .select()
        .from(guests)
        .where(and(eq(guests.weddingId, weddingId), isNull(guests.deletedAt)));

      const travelDetails = await Promise.all(
        guestsList.map(async (guest) => {
          const travel = await db
            .select()
            .from(guestTravelDetails)
            .where(eq(guestTravelDetails.guestId, guest.id));

          return travel.map((t) => ({
            'Guest Name': `${guest.firstName} ${guest.lastName || ''}`,
            'Travel Type': t.travelType || '',
            'Departure City': t.departureCity || '',
            'Arrival City': t.arrivalCity || '',
            'Departure Date': t.departureDate?.toISOString().split('T')[0] || '',
            'Arrival Date': t.arrivalDate?.toISOString().split('T')[0] || '',
            'Flight Number': t.flightNumber || '',
            'Airline': t.airline || '',
            'Booking Reference': t.bookingReference || '',
          }));
        })
      );

      reportData.travel = travelDetails.flat();

      // Accommodation
      const accommodations = await db
        .select()
        .from(accommodationBookings)
        .where(eq(accommodationBookings.weddingId, weddingId));

      reportData.accommodations = accommodations.map((a) => ({
        'Hotel Name': a.hotelName,
        'Address': a.address || '',
        'Check-in Date': a.checkInDate?.toISOString().split('T')[0] || '',
        'Check-out Date': a.checkOutDate?.toISOString().split('T')[0] || '',
        'Total Rooms': a.totalRooms || '',
        'Booked Rooms': a.bookedRooms || '',
        'Rate per Night': a.ratePerNight || '',
      }));

      // Transportation
      const transportation = await db
        .select()
        .from(transportationArrangements)
        .where(eq(transportationArrangements.weddingId, weddingId));

      reportData.transportation = transportation.map((t) => ({
        'Vehicle Type': t.vehicleType || '',
        'Vehicle Count': t.vehicleCount || '',
        'Pickup Location': t.pickupLocation || '',
        'Drop-off Location': t.dropoffLocation || '',
        'Pickup Time': t.pickupTime?.toISOString() || '',
        'Drop-off Time': t.dropoffTime?.toISOString() || '',
      }));
    }

    return successResponse(reportData);
  } catch (error: any) {
    console.error('Error generating report:', error);
    return errorResponse(error.message || 'Failed to generate report', 500);
  }
}

