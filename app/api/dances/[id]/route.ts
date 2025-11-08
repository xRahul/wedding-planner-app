import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { dancePerformances, weddings } from '@/lib/db/schema';
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

    const [performance] = await db
      .select()
      .from(dancePerformances)
      .where(eq(dancePerformances.id, id))
      .limit(1);

    if (!performance) {
      return notFoundResponse('Dance performance not found');
    }

    // Verify access
    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, performance.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    // Get participants
    const { performanceParticipants, guests } = await import('@/lib/db/schema');
    const participants = await db
      .select({
        id: performanceParticipants.id,
        performanceId: performanceParticipants.performanceId,
        guestId: performanceParticipants.guestId,
        participantName: performanceParticipants.participantName,
        role: performanceParticipants.role,
        notes: performanceParticipants.notes,
      })
      .from(performanceParticipants)
      .leftJoin(guests, eq(performanceParticipants.guestId, guests.id))
      .where(eq(performanceParticipants.performanceId, id));

    return successResponse({ ...performance, participants });
  } catch (error: any) {
    console.error('Error fetching dance performance:', error);
    return errorResponse(error.message || 'Failed to fetch dance performance', 500);
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

    // Get performance and verify access
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

    // Update performance
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.eventId !== undefined) updateData.eventId = body.eventId;
    if (body.danceType !== undefined) updateData.danceType = body.danceType;
    if (body.songName !== undefined) updateData.songName = body.songName;
    if (body.songArtist !== undefined) updateData.songArtist = body.songArtist;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.isFamilyLed !== undefined) updateData.isFamilyLed = body.isFamilyLed;
    if (body.choreographerName !== undefined) updateData.choreographerName = body.choreographerName;
    if (body.rehearsalSchedule !== undefined) updateData.rehearsalSchedule = body.rehearsalSchedule;
    if (body.costumeRequirements !== undefined) updateData.costumeRequirements = body.costumeRequirements;
    if (body.musicUrl !== undefined) updateData.musicUrl = body.musicUrl;
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const [updatedPerformance] = await db
      .update(dancePerformances)
      .set(updateData)
      .where(eq(dancePerformances.id, id))
      .returning();

    // Get participants
    const { performanceParticipants, guests } = await import('@/lib/db/schema');
    const participants = await db
      .select()
      .from(performanceParticipants)
      .where(eq(performanceParticipants.performanceId, id));

    return successResponse({ ...updatedPerformance, participants });
  } catch (error: any) {
    console.error('Error updating dance performance:', error);
    return errorResponse(error.message || 'Failed to update dance performance', 500);
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

    // Get performance and verify access
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

    // Delete performance (cascade will delete participants)
    await db.delete(dancePerformances).where(eq(dancePerformances.id, id));

    return successResponse({ message: 'Dance performance deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting dance performance:', error);
    return errorResponse(error.message || 'Failed to delete dance performance', 500);
  }
}

