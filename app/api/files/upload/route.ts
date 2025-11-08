import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { mediaFiles, weddings } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

// This endpoint accepts file metadata and URL
// In production, you would integrate with Vercel Blob, AWS S3, or similar
// For now, we accept the file URL that was uploaded elsewhere
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const formData = await request.formData();
    const weddingId = formData.get('weddingId') as string;
    const fileUrl = formData.get('fileUrl') as string;
    const fileName = formData.get('fileName') as string;
    const fileType = formData.get('fileType') as string;
    const mimeType = formData.get('mimeType') as string;
    const fileSize = formData.get('fileSize') ? parseInt(formData.get('fileSize') as string) : null;
    const entityType = formData.get('entityType') as string;
    const entityId = formData.get('entityId') as string;
    const description = formData.get('description') as string;

    if (!weddingId || !fileUrl || !fileName) {
      return errorResponse('weddingId, fileUrl, and fileName are required');
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

    // In production, handle actual file upload here
    // For now, we just store the metadata
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
        uploadedBy: user.id,
      })
      .returning();

    return successResponse(file, 201);
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return errorResponse(error.message || 'Failed to upload file', 500);
  }
}

