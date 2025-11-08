import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { vendorContracts, vendors, weddings } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse, notFoundResponse } from '@/lib/api-helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contractId: string }> }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { id, contractId } = await params;
    const body = await request.json();

    // Verify vendor access
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(and(eq(vendors.id, id), isNull(vendors.deletedAt)))
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

    const [contract] = await db
      .select()
      .from(vendorContracts)
      .where(eq(vendorContracts.id, contractId))
      .limit(1);

    if (!contract) {
      return notFoundResponse('Contract not found');
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.depositPaid !== undefined) {
      updateData.depositPaid = body.depositPaid;
      if (body.depositPaid) {
        updateData.depositPaidDate = new Date();
      }
    }
    if (body.advancePaid !== undefined) {
      updateData.advancePaid = body.advancePaid;
      if (body.advancePaid) {
        updateData.advancePaidDate = new Date();
      }
    }
    if (body.finalPaid !== undefined) {
      updateData.finalPaid = body.finalPaid;
      if (body.finalPaid) {
        updateData.finalPaidDate = new Date();
      }
    }
    if (body.notes !== undefined) updateData.notes = body.notes;

    const [updated] = await db
      .update(vendorContracts)
      .set(updateData)
      .where(eq(vendorContracts.id, contractId))
      .returning();

    return successResponse(updated);
  } catch (error: any) {
    console.error('Error updating contract:', error);
    return errorResponse(error.message || 'Failed to update contract', 500);
  }
}

