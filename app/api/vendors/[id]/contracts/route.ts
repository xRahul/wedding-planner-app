import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { vendorContracts, vendors, weddings } from '@/lib/db/schema';
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
      return requireAuth();
    }

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, vendor.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    const contracts = await db
      .select()
      .from(vendorContracts)
      .where(eq(vendorContracts.vendorId, id))
      .orderBy(vendorContracts.createdAt);

    return successResponse(contracts);
  } catch (error: any) {
    console.error('Error fetching contracts:', error);
    return errorResponse(error.message || 'Failed to fetch contracts', 500);
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

    const {
      totalAmount,
      depositAmount,
      advanceAmount,
      finalAmount,
      currency,
      notes,
    } = body;

    if (!totalAmount) {
      return errorResponse('totalAmount is required');
    }

    const [contract] = await db
      .insert(vendorContracts)
      .values({
        vendorId: id,
        totalAmount,
        depositAmount: depositAmount || null,
        advanceAmount: advanceAmount || null,
        finalAmount: finalAmount || null,
        currency: currency || 'INR',
        notes: notes || null,
      })
      .returning();

    return successResponse(contract, 201);
  } catch (error: any) {
    console.error('Error creating contract:', error);
    return errorResponse(error.message || 'Failed to create contract', 500);
  }
}

