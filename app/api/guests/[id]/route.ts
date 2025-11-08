import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { guests, weddings } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse, notFoundResponse } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { id } = await params;
    const [guest] = await db
      .select()
      .from(guests)
      .where(and(eq(guests.id, id), isNull(guests.deletedAt)))
      .limit(1);

    if (!guest) {
      return notFoundResponse('Guest not found');
    }

    // Verify access
    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, guest.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    return successResponse(guest);
  } catch (error: any) {
    console.error('Error fetching guest:', error);
    return errorResponse(error.message || 'Failed to fetch guest', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { id } = await params;
    const body = await request.json();

    const [guest] = await db
      .select()
      .from(guests)
      .where(and(eq(guests.id, id), isNull(guests.deletedAt)))
      .limit(1);

    if (!guest) {
      return notFoundResponse('Guest not found');
    }

    // Verify access
    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, guest.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.rsvpStatus !== undefined) updateData.rsvpStatus = body.rsvpStatus;
    if (body.plusOne !== undefined) updateData.plusOne = body.plusOne;
    if (body.plusOneName !== undefined) updateData.plusOneName = body.plusOneName;
    if (body.dietaryPreferences !== undefined) updateData.dietaryPreferences = body.dietaryPreferences;
    if (body.accommodationNeeded !== undefined) updateData.accommodationNeeded = body.accommodationNeeded;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const [updated] = await db
      .update(guests)
      .set(updateData)
      .where(eq(guests.id, id))
      .returning();

    return successResponse(updated);
  } catch (error: any) {
    console.error('Error updating guest:', error);
    return errorResponse(error.message || 'Failed to update guest', 500);
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
    const [guest] = await db
      .select()
      .from(guests)
      .where(and(eq(guests.id, id), isNull(guests.deletedAt)))
      .limit(1);

    if (!guest) {
      return notFoundResponse('Guest not found');
    }

    // Verify access
    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, guest.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    await db
      .update(guests)
      .set({ deletedAt: new Date() })
      .where(eq(guests.id, id));

    return successResponse({ message: 'Guest deleted' });
  } catch (error: any) {
    console.error('Error deleting guest:', error);
    return errorResponse(error.message || 'Failed to delete guest', 500);
  }
}

