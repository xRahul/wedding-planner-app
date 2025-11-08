import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { expenses, weddings } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const body = await request.json();
    const {
      weddingId,
      categoryId,
      budgetItemId,
      vendorId,
      amount,
      currency,
      description,
      expenseDate,
      receiptUrl,
      paymentMethod,
      notes,
    } = body;

    if (!weddingId || !amount || !description) {
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

    const [expense] = await db
      .insert(expenses)
      .values({
        weddingId,
        categoryId: categoryId || null,
        budgetItemId: budgetItemId || null,
        vendorId: vendorId || null,
        amount,
        currency: currency || 'INR',
        description,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        receiptUrl: receiptUrl || null,
        paymentMethod: paymentMethod || null,
        notes: notes || null,
      })
      .returning();

    return successResponse(expense, 201);
  } catch (error: any) {
    console.error('Error creating expense:', error);
    return errorResponse(error.message || 'Failed to create expense', 500);
  }
}

