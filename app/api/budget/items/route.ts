import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { budgetItems, budgetCategories, weddings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const body = await request.json();
    const { categoryId, name, description, estimatedAmount, actualAmount, vendorId, notes } = body;

    if (!categoryId || !name || !estimatedAmount) {
      return errorResponse('Missing required fields');
    }

    // Verify category access
    const [category] = await db
      .select()
      .from(budgetCategories)
      .where(eq(budgetCategories.id, categoryId))
      .limit(1);

    if (!category) {
      return errorResponse('Category not found', 404);
    }

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(eq(weddings.id, category.weddingId))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    const [item] = await db
      .insert(budgetItems)
      .values({
        categoryId,
        name,
        description,
        estimatedAmount,
        actualAmount: actualAmount || null,
        vendorId: vendorId || null,
        notes: notes || null,
      })
      .returning();

    return successResponse(item, 201);
  } catch (error: any) {
    console.error('Error creating budget item:', error);
    return errorResponse(error.message || 'Failed to create budget item', 500);
  }
}

