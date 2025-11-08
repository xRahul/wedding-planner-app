import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { dancePerformances, performanceParticipants, weddings } from '@/lib/db/schema';
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

    // Get participant and verify access
    const [participant] = await db
      .select()
      .from(performanceParticipants)
      .where(eq(performanceParticipants.id, id))
      .limit(1);

    if (!participant) {
      return notFoundResponse('Participant not found');
    }

    const [performance] = await db
      .select()
      .from(dancePerformances)
      .where(eq(dancePerformances.id, participant.performanceId))
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

    // Update participant
    const updateData: any = {};

    if (body.guestId !== undefined) updateData.guestId = body.guestId;
    if (body.participantName !== undefined) updateData.participantName = body.participantName;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const [updatedParticipant] = await db
      .update(performanceParticipants)
      .set(updateData)
      .where(eq(performanceParticipants.id, id))
      .returning();

    return successResponse(updatedParticipant);
  } catch (error: any) {
    console.error('Error updating participant:', error);
    return errorResponse(error.message || 'Failed to update participant', 500);
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

    // Get participant and verify access
    const [participant] = await db
      .select()
      .from(performanceParticipants)
      .where(eq(performanceParticipants.id, id))
      .limit(1);

    if (!participant) {
      return notFoundResponse('Participant not found');
    }

    const [performance] = await db
      .select()
      .from(dancePerformances)
      .where(eq(dancePerformances.id, participant.performanceId))
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

    // Delete participant
    await db.delete(performanceParticipants).where(eq(performanceParticipants.id, id));

    return successResponse({ message: 'Participant deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting participant:', error);
    return errorResponse(error.message || 'Failed to delete participant', 500);
  }
}

