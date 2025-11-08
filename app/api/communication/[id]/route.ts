import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { communicationLog, weddings } from '@/lib/db/schema';
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

    const [communication] = await db
      .select()
      .from(communicationLog)
      .where(eq(communicationLog.id, id))
      .limit(1);

    if (!communication) {
      return notFoundResponse('Communication log not found');
    }

    // Verify access
    if (communication.weddingId) {
      const [wedding] = await db
        .select()
        .from(weddings)
        .where(and(eq(weddings.id, communication.weddingId), isNull(weddings.deletedAt)))
        .limit(1);

      if (!wedding || wedding.ownerId !== user.id) {
        return errorResponse('Access denied', 403);
      }
    }

    return successResponse(communication);
  } catch (error: any) {
    console.error('Error fetching communication log:', error);
    return errorResponse(error.message || 'Failed to fetch communication log', 500);
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

    const [communication] = await db
      .select()
      .from(communicationLog)
      .where(eq(communicationLog.id, id))
      .limit(1);

    if (!communication) {
      return notFoundResponse('Communication log not found');
    }

    // Verify access
    if (communication.weddingId) {
      const [wedding] = await db
        .select()
        .from(weddings)
        .where(and(eq(weddings.id, communication.weddingId), isNull(weddings.deletedAt)))
        .limit(1);

      if (!wedding || wedding.ownerId !== user.id) {
        return errorResponse('Access denied', 403);
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.communicationType !== undefined) updateData.communicationType = body.communicationType;
    if (body.subject !== undefined) updateData.subject = body.subject;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.outcome !== undefined) updateData.outcome = body.outcome;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    const [updated] = await db
      .update(communicationLog)
      .set(updateData)
      .where(eq(communicationLog.id, id))
      .returning();

    return successResponse(updated);
  } catch (error: any) {
    console.error('Error updating communication log:', error);
    return errorResponse(error.message || 'Failed to update communication log', 500);
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

    const [communication] = await db
      .select()
      .from(communicationLog)
      .where(eq(communicationLog.id, id))
      .limit(1);

    if (!communication) {
      return notFoundResponse('Communication log not found');
    }

    // Verify access
    if (communication.weddingId) {
      const [wedding] = await db
        .select()
        .from(weddings)
        .where(and(eq(weddings.id, communication.weddingId), isNull(weddings.deletedAt)))
        .limit(1);

      if (!wedding || wedding.ownerId !== user.id) {
        return errorResponse('Access denied', 403);
      }
    }

    await db.delete(communicationLog).where(eq(communicationLog.id, id));

    return successResponse({ id });
  } catch (error: any) {
    console.error('Error deleting communication log:', error);
    return errorResponse(error.message || 'Failed to delete communication log', 500);
  }
}

