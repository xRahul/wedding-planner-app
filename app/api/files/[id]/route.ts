import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { mediaFiles, weddings } from '@/lib/db/schema';
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

    const [file] = await db
      .select()
      .from(mediaFiles)
      .where(and(eq(mediaFiles.id, id), isNull(mediaFiles.deletedAt)))
      .limit(1);

    if (!file) {
      return notFoundResponse('File not found');
    }

    // Verify access
    if (file.weddingId) {
      const [wedding] = await db
        .select()
        .from(weddings)
        .where(and(eq(weddings.id, file.weddingId), isNull(weddings.deletedAt)))
        .limit(1);

      if (!wedding || wedding.ownerId !== user.id) {
        return errorResponse('Access denied', 403);
      }
    }

    return successResponse(file);
  } catch (error: any) {
    console.error('Error fetching file:', error);
    return errorResponse(error.message || 'Failed to fetch file', 500);
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

    // Verify file exists and access
    const [file] = await db
      .select()
      .from(mediaFiles)
      .where(and(eq(mediaFiles.id, id), isNull(mediaFiles.deletedAt)))
      .limit(1);

    if (!file) {
      return notFoundResponse('File not found');
    }

    if (file.weddingId) {
      const [wedding] = await db
        .select()
        .from(weddings)
        .where(and(eq(weddings.id, file.weddingId), isNull(weddings.deletedAt)))
        .limit(1);

      if (!wedding || wedding.ownerId !== user.id) {
        return errorResponse('Access denied', 403);
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.fileName !== undefined) updateData.fileName = body.fileName;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.entityType !== undefined) updateData.entityType = body.entityType;
    if (body.entityId !== undefined) updateData.entityId = body.entityId;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    const [updated] = await db
      .update(mediaFiles)
      .set(updateData)
      .where(eq(mediaFiles.id, id))
      .returning();

    return successResponse(updated);
  } catch (error: any) {
    console.error('Error updating file:', error);
    return errorResponse(error.message || 'Failed to update file', 500);
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

    // Verify file exists and access
    const [file] = await db
      .select()
      .from(mediaFiles)
      .where(and(eq(mediaFiles.id, id), isNull(mediaFiles.deletedAt)))
      .limit(1);

    if (!file) {
      return notFoundResponse('File not found');
    }

    if (file.weddingId) {
      const [wedding] = await db
        .select()
        .from(weddings)
        .where(and(eq(weddings.id, file.weddingId), isNull(weddings.deletedAt)))
        .limit(1);

      if (!wedding || wedding.ownerId !== user.id) {
        return errorResponse('Access denied', 403);
      }
    }

    // Soft delete
    await db
      .update(mediaFiles)
      .set({ deletedAt: new Date() })
      .where(eq(mediaFiles.id, id));

    return successResponse({ id });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return errorResponse(error.message || 'Failed to delete file', 500);
  }
}

