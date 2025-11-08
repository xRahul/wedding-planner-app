import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { guests, weddings } from '@/lib/db/schema';
import { eq, and, isNull, or, like, ilike } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('weddingId');
    const search = searchParams.get('search');
    const rsvpStatus = searchParams.get('rsvpStatus');

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

    let query = db
      .select()
      .from(guests)
      .where(
        and(
          eq(guests.weddingId, weddingId),
          isNull(guests.deletedAt)
        )
      );

    if (search) {
      query = query.where(
        and(
          eq(guests.weddingId, weddingId),
          isNull(guests.deletedAt),
          or(
            like(guests.firstName, `%${search}%`),
            like(guests.lastName, `%${search}%`),
            ilike(guests.email, `%${search}%`)
          )
        )
      ) as any;
    }

    if (rsvpStatus) {
      query = query.where(
        and(
          eq(guests.weddingId, weddingId),
          isNull(guests.deletedAt),
          eq(guests.rsvpStatus, rsvpStatus as any)
        )
      ) as any;
    }

    const guestList = await query;

    return successResponse(guestList);
  } catch (error: any) {
    console.error('Error fetching guests:', error);
    return errorResponse(error.message || 'Failed to fetch guests', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const body = await request.json();
    const {
      weddingId,
      groupId,
      firstName,
      lastName,
      email,
      phone,
      rsvpStatus,
      plusOne,
      plusOneName,
      dietaryPreferences,
      accommodationNeeded,
      accommodationDetails,
      role,
      notes,
    } = body;

    if (!weddingId || !firstName) {
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

    const [guest] = await db
      .insert(guests)
      .values({
        weddingId,
        groupId: groupId || null,
        firstName,
        lastName,
        email,
        phone,
        rsvpStatus: rsvpStatus || 'pending',
        plusOne: plusOne || false,
        plusOneName,
        dietaryPreferences,
        accommodationNeeded: accommodationNeeded || false,
        accommodationDetails,
        role,
        notes,
      })
      .returning();

    return successResponse(guest, 201);
  } catch (error: any) {
    console.error('Error creating guest:', error);
    return errorResponse(error.message || 'Failed to create guest', 500);
  }
}

