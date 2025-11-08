import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { mediaFiles, weddings } from '@/lib/db/schema';
import { eq, and, isNull, or, like } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('weddingId');
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const fileType = searchParams.get('fileType');

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

    // Build query conditions
    const conditions = [
      eq(mediaFiles.weddingId, weddingId),
      isNull(mediaFiles.deletedAt),
    ];

    if (entityType) {
      conditions.push(eq(mediaFiles.entityType, entityType));
    }

    if (entityId) {
      conditions.push(eq(mediaFiles.entityId, entityId));
    }

    if (fileType) {
      conditions.push(eq(mediaFiles.fileType, fileType));
    }

    const files = await db
      .select()
      .from(mediaFiles)
      .where(and(...conditions))
      .orderBy(mediaFiles.createdAt);

    return successResponse(files);
  } catch (error: any) {
    console.error('Error fetching files:', error);
    return errorResponse(error.message || 'Failed to fetch files', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const body = await request.json();
    const {
      weddingId,
      fileName,
      fileUrl,
      fileType,
      mimeType,
      fileSize,
      entityType,
      entityId,
      description,
      metadata,
    } = body;

    if (!weddingId || !fileName || !fileUrl) {
      return errorResponse('weddingId, fileName, and fileUrl are required');
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

    const [file] = await db
      .insert(mediaFiles)
      .values({
        weddingId,
        fileName,
        fileUrl,
        fileType: fileType || null,
        mimeType: mimeType || null,
        fileSize: fileSize || null,
        entityType: entityType || null,
        entityId: entityId || null,
        description: description || null,
        metadata: metadata || null,
        uploadedBy: user.id,
      })
      .returning();

    return successResponse(file, 201);
  } catch (error: any) {
    console.error('Error creating file:', error);
    return errorResponse(error.message || 'Failed to create file', 500);
  }
}

