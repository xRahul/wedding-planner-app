import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { vendors, weddings } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('weddingId');
    const category = searchParams.get('category');

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

    let query = db
      .select()
      .from(vendors)
      .where(
        and(
          eq(vendors.weddingId, weddingId),
          isNull(vendors.deletedAt)
        )
      );

    if (category) {
      query = query.where(
        and(
          eq(vendors.weddingId, weddingId),
          isNull(vendors.deletedAt),
          eq(vendors.category, category)
        )
      ) as any;
    }

    const vendorList = await query;

    return successResponse(vendorList);
  } catch (error: any) {
    console.error('Error fetching vendors:', error);
    return errorResponse(error.message || 'Failed to fetch vendors', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const body = await request.json();
    const {
      weddingId,
      name,
      category,
      contactName,
      email,
      phone,
      address,
      status,
      notes,
    } = body;

    if (!weddingId || !name || !category) {
      return errorResponse('Missing required fields');
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

    const [vendor] = await db
      .insert(vendors)
      .values({
        weddingId,
        name,
        category,
        contactName,
        email,
        phone,
        address,
        status: status || 'pending_quote',
        notes,
      })
      .returning();

    return successResponse(vendor, 201);
  } catch (error: any) {
    console.error('Error creating vendor:', error);
    return errorResponse(error.message || 'Failed to create vendor', 500);
  }
}

