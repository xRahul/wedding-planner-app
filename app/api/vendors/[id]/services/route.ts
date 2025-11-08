import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { vendorServices, vendors, weddings } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { id } = await params;

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

    const services = await db
      .select()
      .from(vendorServices)
      .where(eq(vendorServices.vendorId, id))
      .orderBy(vendorServices.createdAt);

    return successResponse(services);
  } catch (error: any) {
    console.error('Error fetching vendor services:', error);
    return errorResponse(error.message || 'Failed to fetch vendor services', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { id } = await params;
    const body = await request.json();
    const { serviceName, description, rate, unit, metadata } = body;

    if (!serviceName) {
      return errorResponse('serviceName is required');
    }

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

    const [service] = await db
      .insert(vendorServices)
      .values({
        vendorId: id,
        serviceName,
        description: description || null,
        rate: rate || null,
        unit: unit || null,
        metadata: metadata || null,
      })
      .returning();

    return successResponse(service, 201);
  } catch (error: any) {
    console.error('Error creating vendor service:', error);
    return errorResponse(error.message || 'Failed to create vendor service', 500);
  }
}

