import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { weddings, weddingUsers } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { getCurrentUser, requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    // Get weddings where user is owner or has access
    const userWeddings = await db
      .select({
        wedding: weddings,
      })
      .from(weddings)
      .leftJoin(weddingUsers, eq(weddings.id, weddingUsers.weddingId))
      .where(
        and(
          isNull(weddings.deletedAt),
          eq(weddings.ownerId, user.id)
        )
      );

    // Also get weddings where user is a member
    const memberWeddings = await db
      .select({
        wedding: weddings,
      })
      .from(weddingUsers)
      .innerJoin(weddings, eq(weddingUsers.weddingId, weddings.id))
      .where(
        and(
          eq(weddingUsers.userId, user.id),
          isNull(weddings.deletedAt)
        )
      );

    const allWeddings = [
      ...userWeddings.map((w) => w.wedding),
      ...memberWeddings.map((w) => w.wedding),
    ];

    // Remove duplicates
    const uniqueWeddings = Array.from(
      new Map(allWeddings.map((w) => [w.id, w])).values()
    );

    return successResponse(uniqueWeddings);
  } catch (error: any) {
    console.error('Error fetching weddings:', error);
    return errorResponse(error.message || 'Failed to fetch weddings', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const body = await request.json();
    const {
      name,
      brideName,
      groomName,
      startDate,
      endDate,
      location,
      venue,
      theme,
      colorScheme,
      defaultGuestCount,
      budget,
    } = body;

    if (!name || !brideName || !groomName || !startDate || !endDate) {
      return errorResponse('Missing required fields');
    }

    const [wedding] = await db
      .insert(weddings)
      .values({
        name,
        brideName,
        groomName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        venue,
        theme,
        colorScheme,
        defaultGuestCount: defaultGuestCount || 0,
        budget: budget || null,
        ownerId: user.id,
      })
      .returning();

    // Add owner to wedding_users
    await db.insert(weddingUsers).values({
      weddingId: wedding.id,
      userId: user.id,
      role: 'owner',
      joinedAt: new Date(),
    });

    return successResponse(wedding, 201);
  } catch (error: any) {
    console.error('Error creating wedding:', error);
    return errorResponse(error.message || 'Failed to create wedding', 500);
  }
}

