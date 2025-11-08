import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { budgetCategories, budgetItems, expenses, weddings } from '@/lib/db/schema';
import { eq, and, isNull, sum } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('weddingId');

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

    // Get categories with items
    const categories = await db
      .select()
      .from(budgetCategories)
      .where(eq(budgetCategories.weddingId, weddingId))
      .orderBy(budgetCategories.order);

    // Get all expenses
    const allExpenses = await db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.weddingId, weddingId),
          isNull(expenses.deletedAt)
        )
      );

    // Calculate totals
    const totalBudget = categories.reduce((sum, cat) => {
      return sum + parseFloat(cat.allocatedAmount || '0');
    }, 0);

    const totalSpent = allExpenses.reduce((sum, exp) => {
      return sum + parseFloat(exp.amount || '0');
    }, 0);

    return successResponse({
      categories,
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent,
      expenses: allExpenses,
    });
  } catch (error: any) {
    console.error('Error fetching budget:', error);
    return errorResponse(error.message || 'Failed to fetch budget', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const body = await request.json();
    const { weddingId, name, description, allocatedAmount } = body;

    if (!weddingId || !name) {
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

    const [category] = await db
      .insert(budgetCategories)
      .values({
        weddingId,
        name,
        description,
        allocatedAmount: allocatedAmount || '0',
      })
      .returning();

    return successResponse(category, 201);
  } catch (error: any) {
    console.error('Error creating budget category:', error);
    return errorResponse(error.message || 'Failed to create budget category', 500);
  }
}

