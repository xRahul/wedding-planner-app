import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { vendorServices, vendors, weddings } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse, notFoundResponse } from '@/lib/api-helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { serviceId } = await params;
    const body = await request.json();

    const [service] = await db
      .select()
      .from(vendorServices)
      .where(eq(vendorServices.id, serviceId))
      .limit(1);

    if (!service) {
      return notFoundResponse('Service not found');
    }

    // Verify access through vendor
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(and(eq(vendors.id, service.vendorId), isNull(vendors.deletedAt)))
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

    if (body.serviceName !== undefined) updateData.serviceName = body.serviceName;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.rate !== undefined) updateData.rate = body.rate;
    if (body.unit !== undefined) updateData.unit = body.unit;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    const [updated] = await db
      .update(vendorServices)
      .set(updateData)
      .where(eq(vendorServices.id, serviceId))
      .returning();

    return successResponse(updated);
  } catch (error: any) {
    console.error('Error updating vendor service:', error);
    return errorResponse(error.message || 'Failed to update vendor service', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { serviceId } = await params;

    const [service] = await db
      .select()
      .from(vendorServices)
      .where(eq(vendorServices.id, serviceId))
      .limit(1);

    if (!service) {
      return notFoundResponse('Service not found');
    }

    // Verify access through vendor
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(and(eq(vendors.id, service.vendorId), isNull(vendors.deletedAt)))
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

    await db.delete(vendorServices).where(eq(vendorServices.id, serviceId));

    return successResponse({ id: serviceId });
  } catch (error: any) {
    console.error('Error deleting vendor service:', error);
    return errorResponse(error.message || 'Failed to delete vendor service', 500);
  }
}

