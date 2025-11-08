import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { notes, weddings } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('weddingId');
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

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

    const conditions = [
      eq(notes.weddingId, weddingId),
      isNull(notes.deletedAt),
    ];

    if (entityType) {
      conditions.push(eq(notes.entityType, entityType));
    }

    if (entityId) {
      conditions.push(eq(notes.entityId, entityId));
    }

    const notesList = await db
      .select()
      .from(notes)
      .where(and(...conditions))
      .orderBy(notes.createdAt);

    return successResponse(notesList);
  } catch (error: any) {
    console.error('Error fetching notes:', error);
    return errorResponse(error.message || 'Failed to fetch notes', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const body = await request.json();
    const { weddingId, entityType, entityId, content } = body;

    if (!weddingId || !content) {
      return errorResponse('weddingId and content are required');
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

    const [note] = await db
      .insert(notes)
      .values({
        weddingId,
        entityType: entityType || null,
        entityId: entityId || null,
        content,
        createdBy: user.id,
      })
      .returning();

    return successResponse(note, 201);
  } catch (error: any) {
    console.error('Error creating note:', error);
    return errorResponse(error.message || 'Failed to create note', 500);
  }
}

