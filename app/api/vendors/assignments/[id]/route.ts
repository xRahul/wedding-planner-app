import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { vendorAssignments, vendors, weddingEvents, weddings } from '@/lib/db/schema';
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

    const [assignment] = await db
      .select()
      .from(vendorAssignments)
      .where(eq(vendorAssignments.id, id))
      .limit(1);

    if (!assignment) {
      return notFoundResponse('Assignment not found');
    }

    // Verify access
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(and(eq(vendors.id, assignment.vendorId), isNull(vendors.deletedAt)))
      .limit(1);

    if (!vendor) {
      return errorResponse('Vendor not found', 404);
    }

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, vendor.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.serviceId !== undefined) updateData.serviceId = body.serviceId;
    if (body.startTime !== undefined) updateData.startTime = body.startTime ? new Date(body.startTime) : null;
    if (body.endTime !== undefined) updateData.endTime = body.endTime ? new Date(body.endTime) : null;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const [updated] = await db
      .update(vendorAssignments)
      .set(updateData)
      .where(eq(vendorAssignments.id, id))
      .returning();

    return successResponse(updated);
  } catch (error: any) {
    console.error('Error updating vendor assignment:', error);
    return errorResponse(error.message || 'Failed to update vendor assignment', 500);
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

    const [assignment] = await db
      .select()
      .from(vendorAssignments)
      .where(eq(vendorAssignments.id, id))
      .limit(1);

    if (!assignment) {
      return notFoundResponse('Assignment not found');
    }

    // Verify access
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(and(eq(vendors.id, assignment.vendorId), isNull(vendors.deletedAt)))
      .limit(1);

    if (!vendor) {
      return errorResponse('Vendor not found', 404);
    }

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, vendor.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    await db.delete(vendorAssignments).where(eq(vendorAssignments.id, id));

    return successResponse({ id });
  } catch (error: any) {
    console.error('Error deleting vendor assignment:', error);
    return errorResponse(error.message || 'Failed to delete vendor assignment', 500);
  }
}

