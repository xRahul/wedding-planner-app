import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { communicationLog, weddings } from '@/lib/db/schema';
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

    const conditions = [eq(communicationLog.weddingId, weddingId)];

    if (entityType) {
      conditions.push(eq(communicationLog.entityType, entityType));
    }

    if (entityId) {
      conditions.push(eq(communicationLog.entityId, entityId));
    }

    const communications = await db
      .select()
      .from(communicationLog)
      .where(and(...conditions))
      .orderBy(communicationLog.date);

    return successResponse(communications);
  } catch (error: any) {
    console.error('Error fetching communication log:', error);
    return errorResponse(error.message || 'Failed to fetch communication log', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const body = await request.json();
    const {
      weddingId,
      entityType,
      entityId,
      communicationType,
      subject,
      content,
      date,
      outcome,
      metadata,
    } = body;

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

    const [communication] = await db
      .insert(communicationLog)
      .values({
        weddingId,
        entityType: entityType || null,
        entityId: entityId || null,
        communicationType: communicationType || null,
        subject: subject || null,
        content: content || null,
        date: date ? new Date(date) : new Date(),
        initiatedBy: user.id,
        outcome: outcome || null,
        metadata: metadata || null,
      })
      .returning();

    return successResponse(communication, 201);
  } catch (error: any) {
    console.error('Error creating communication log:', error);
    return errorResponse(error.message || 'Failed to create communication log', 500);
  }
}

