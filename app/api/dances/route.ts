import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { dancePerformances, performanceParticipants, weddings, weddingEvents, guests } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('weddingId');
    const eventId = searchParams.get('eventId');

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

    // Build query conditions
    const conditions = [
      eq(dancePerformances.weddingId, weddingId),
    ];

    if (eventId) {
      conditions.push(eq(dancePerformances.eventId, eventId));
    }

    const performances = await db
      .select()
      .from(dancePerformances)
      .where(and(...conditions))
      .orderBy(dancePerformances.createdAt);

    // Get participants for each performance
    const performancesWithParticipants = await Promise.all(
      performances.map(async (performance) => {
        const participants = await db
          .select()
          .from(performanceParticipants)
          .where(eq(performanceParticipants.performanceId, performance.id));

        // Get guest details for participants with guestId
        const participantsWithGuests = await Promise.all(
          participants.map(async (p) => {
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

        return {
          ...performance,
          participants: participantsWithGuests,
        };
      })
    );

    return successResponse(performancesWithParticipants);
  } catch (error: any) {
    console.error('Error fetching dance performances:', error);
    return errorResponse(error.message || 'Failed to fetch dance performances', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const body = await request.json();
    const {
      weddingId,
      eventId,
      name,
      danceType,
      songName,
      songArtist,
      duration,
      isFamilyLed,
      choreographerName,
      rehearsalSchedule,
      costumeRequirements,
      musicUrl,
      videoUrl,
      notes,
      participants,
    } = body;

    if (!weddingId || !name) {
      return errorResponse('weddingId and name are required');
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

    // Verify event if provided
    if (eventId) {
      const [event] = await db
        .select()
        .from(weddingEvents)
        .where(
          and(
            eq(weddingEvents.id, eventId),
            eq(weddingEvents.weddingId, weddingId),
            isNull(weddingEvents.deletedAt)
          )
        )
        .limit(1);

      if (!event) {
        return errorResponse('Event not found', 404);
      }
    }

    // Create performance
    const [performance] = await db
      .insert(dancePerformances)
      .values({
        weddingId,
        eventId: eventId || null,
        name,
        danceType: danceType || null,
        songName: songName || null,
        songArtist: songArtist || null,
        duration: duration || null,
        isFamilyLed: isFamilyLed ?? true,
        choreographerName: choreographerName || null,
        rehearsalSchedule: rehearsalSchedule || null,
        costumeRequirements: costumeRequirements || null,
        musicUrl: musicUrl || null,
        videoUrl: videoUrl || null,
        notes: notes || null,
      })
      .returning();

    // Create participants if provided
    if (participants && Array.isArray(participants) && participants.length > 0) {
      await db.insert(performanceParticipants).values(
        participants.map((p: any) => ({
          performanceId: performance.id,
          guestId: p.guestId || null,
          participantName: p.participantName || null,
          role: p.role || null,
          notes: p.notes || null,
        }))
      );
    }

    // Fetch performance with participants
    const participantsList = await db
      .select()
      .from(performanceParticipants)
      .where(eq(performanceParticipants.performanceId, performance.id));

    return successResponse({ ...performance, participants: participantsList }, 201);
  } catch (error: any) {
    console.error('Error creating dance performance:', error);
    return errorResponse(error.message || 'Failed to create dance performance', 500);
  }
}

