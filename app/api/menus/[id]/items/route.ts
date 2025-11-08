import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { menus, menuItems, weddings } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse, notFoundResponse } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { id } = await params;

    // Verify menu access
    const [menu] = await db
      .select()
      .from(menus)
      .where(and(eq(menus.id, id), isNull(menus.deletedAt)))
      .limit(1);

    if (!menu) {
      return notFoundResponse('Menu not found');
    }

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, menu.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    // Get menu items
    const items = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.menuId, id))
      .orderBy(menuItems.order);

    return successResponse(items);
  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    return errorResponse(error.message || 'Failed to fetch menu items', 500);
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

    // Verify menu access
    const [menu] = await db
      .select()
      .from(menus)
      .where(and(eq(menus.id, id), isNull(menus.deletedAt)))
      .limit(1);

    if (!menu) {
      return notFoundResponse('Menu not found');
    }

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, menu.weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    if (!body.name) {
      return errorResponse('name is required');
    }

    // Get current max order
    const existingItems = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.menuId, id));

    const maxOrder = existingItems.length > 0
      ? Math.max(...existingItems.map((item) => item.order || 0))
      : -1;

    // Create menu item
    const [item] = await db
      .insert(menuItems)
      .values({
        menuId: id,
        name: body.name,
        description: body.description || null,
        category: body.category || null,
        isVegetarian: body.isVegetarian ?? true,
        isVegan: body.isVegan ?? false,
        isJain: body.isJain ?? false,
        isGlutenFree: body.isGlutenFree ?? false,
        servingSize: body.servingSize || null,
        quantity: body.quantity || null,
        order: body.order ?? maxOrder + 1,
      })
      .returning();

    return successResponse(item, 201);
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    return errorResponse(error.message || 'Failed to create menu item', 500);
  }
}

