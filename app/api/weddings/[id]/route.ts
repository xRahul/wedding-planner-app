import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { weddings } from '@/lib/db/schema';
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
    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, id), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding) {
      return notFoundResponse('Wedding not found');
    }

    // Check access
    if (wedding.ownerId !== user.id) {
      // TODO: Check if user is a member via wedding_users table
      return errorResponse('Access denied', 403);
    }

    return successResponse(wedding);
  } catch (error: any) {
    console.error('Error fetching wedding:', error);
    return errorResponse(error.message || 'Failed to fetch wedding', 500);
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

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, id), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding) {
      return notFoundResponse('Wedding not found');
    }

    if (wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.brideName !== undefined) updateData.brideName = body.brideName;
    if (body.groomName !== undefined) updateData.groomName = body.groomName;
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate);
    if (body.location !== undefined) updateData.location = body.location;
    if (body.venue !== undefined) updateData.venue = body.venue;
    if (body.theme !== undefined) updateData.theme = body.theme;
    if (body.colorScheme !== undefined) updateData.colorScheme = body.colorScheme;
    if (body.defaultGuestCount !== undefined) updateData.defaultGuestCount = body.defaultGuestCount;
    if (body.budget !== undefined) updateData.budget = body.budget;

    const [updated] = await db
      .update(weddings)
      .set(updateData)
      .where(eq(weddings.id, id))
      .returning();

    return successResponse(updated);
  } catch (error: any) {
    console.error('Error updating wedding:', error);
    return errorResponse(error.message || 'Failed to update wedding', 500);
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
    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, id), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding) {
      return notFoundResponse('Wedding not found');
    }

    if (wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    await db
      .update(weddings)
      .set({ deletedAt: new Date() })
      .where(eq(weddings.id, id));

    return successResponse({ message: 'Wedding deleted' });
  } catch (error: any) {
    console.error('Error deleting wedding:', error);
    return errorResponse(error.message || 'Failed to delete wedding', 500);
  }
}

