import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { dancePerformances, performanceParticipants, weddings, guests } from '@/lib/db/schema';
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

    // Verify performance access
    const [performance] = await db
      .select()
      .from(dancePerformances)
      .where(eq(dancePerformances.id, id))
      .limit(1);

    if (!performance) {
      return notFoundResponse('Dance performance not found');
    }

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, performance.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    // Get participants
    const participantsList = await db
      .select()
      .from(performanceParticipants)
      .where(eq(performanceParticipants.performanceId, id));

    // Get guest details
    const participantsWithGuests = await Promise.all(
      participantsList.map(async (p) => {
        if (p.guestId) {
          const [guest] = await db
            .select({
              id: guests.id,
              firstName: guests.firstName,
              lastName: guests.lastName,
            })
            .from(guests)
            .where(eq(guests.id, p.guestId))
            .limit(1);
          return { ...p, guest };
        }
        return { ...p, guest: null };
      })
    );

    return successResponse(participantsWithGuests);
  } catch (error: any) {
    console.error('Error fetching participants:', error);
    return errorResponse(error.message || 'Failed to fetch participants', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { id } = await params;
    const body = await request.json();

    // Verify performance access
    const [performance] = await db
      .select()
      .from(dancePerformances)
      .where(eq(dancePerformances.id, id))
      .limit(1);

    if (!performance) {
      return notFoundResponse('Dance performance not found');
    }

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, performance.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    if (!body.guestId && !body.participantName) {
      return errorResponse('Either guestId or participantName is required');
    }

    // Create participant
    const [participant] = await db
      .insert(performanceParticipants)
      .values({
        performanceId: id,
        guestId: body.guestId || null,
        participantName: body.participantName || null,
        role: body.role || null,
        notes: body.notes || null,
      })
      .returning();

    return successResponse(participant, 201);
  } catch (error: any) {
    console.error('Error creating participant:', error);
    return errorResponse(error.message || 'Failed to create participant', 500);
  }
}

