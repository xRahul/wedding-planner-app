import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { notes, weddings } from '@/lib/db/schema';
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

    const [note] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), isNull(notes.deletedAt)))
      .limit(1);

    if (!note) {
      return notFoundResponse('Note not found');
    }

    // Verify access
    if (note.weddingId) {
      const [wedding] = await db
        .select()
        .from(weddings)
        .where(and(eq(weddings.id, note.weddingId), isNull(weddings.deletedAt)))
        .limit(1);

      if (!wedding || wedding.ownerId !== user.id) {
        return errorResponse('Access denied', 403);
      }
    }

    return successResponse(note);
  } catch (error: any) {
    console.error('Error fetching note:', error);
    return errorResponse(error.message || 'Failed to fetch note', 500);
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

    const [note] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), isNull(notes.deletedAt)))
      .limit(1);

    if (!note) {
      return notFoundResponse('Note not found');
    }

    // Verify access
    if (note.weddingId) {
      const [wedding] = await db
        .select()
        .from(weddings)
        .where(and(eq(weddings.id, note.weddingId), isNull(weddings.deletedAt)))
        .limit(1);

      if (!wedding || wedding.ownerId !== user.id) {
        return errorResponse('Access denied', 403);
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.content !== undefined) updateData.content = body.content;

    const [updated] = await db
      .update(notes)
      .set(updateData)
      .where(eq(notes.id, id))
      .returning();

    return successResponse(updated);
  } catch (error: any) {
    console.error('Error updating note:', error);
    return errorResponse(error.message || 'Failed to update note', 500);
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

    const [note] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), isNull(notes.deletedAt)))
      .limit(1);

    if (!note) {
      return notFoundResponse('Note not found');
    }

    // Verify access
    if (note.weddingId) {
      const [wedding] = await db
        .select()
        .from(weddings)
        .where(and(eq(weddings.id, note.weddingId), isNull(weddings.deletedAt)))
        .limit(1);

      if (!wedding || wedding.ownerId !== user.id) {
        return errorResponse('Access denied', 403);
      }
    }

    // Soft delete
    await db
      .update(notes)
      .set({ deletedAt: new Date() })
      .where(eq(notes.id, id));

    return successResponse({ id });
  } catch (error: any) {
    console.error('Error deleting note:', error);
    return errorResponse(error.message || 'Failed to delete note', 500);
  }
}

