import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { menus, menuItems, weddings } from '@/lib/db/schema';
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

    // Get menu item and verify access
    const [item] = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, id))
      .limit(1);

    if (!item) {
      return notFoundResponse('Menu item not found');
    }

    const [menu] = await db
      .select()
      .from(menus)
      .where(and(eq(menus.id, item.menuId), isNull(menus.deletedAt)))
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

    // Update menu item
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.isVegetarian !== undefined) updateData.isVegetarian = body.isVegetarian;
    if (body.isVegan !== undefined) updateData.isVegan = body.isVegan;
    if (body.isJain !== undefined) updateData.isJain = body.isJain;
    if (body.isGlutenFree !== undefined) updateData.isGlutenFree = body.isGlutenFree;
    if (body.servingSize !== undefined) updateData.servingSize = body.servingSize;
    if (body.quantity !== undefined) updateData.quantity = body.quantity;
    if (body.order !== undefined) updateData.order = body.order;

    const [updatedItem] = await db
      .update(menuItems)
      .set(updateData)
      .where(eq(menuItems.id, id))
      .returning();

    return successResponse(updatedItem);
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    return errorResponse(error.message || 'Failed to update menu item', 500);
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

    // Get menu item and verify access
    const [item] = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, id))
      .limit(1);

    if (!item) {
      return notFoundResponse('Menu item not found');
    }

    const [menu] = await db
      .select()
      .from(menus)
      .where(and(eq(menus.id, item.menuId), isNull(menus.deletedAt)))
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

    // Delete menu item
    await db.delete(menuItems).where(eq(menuItems.id, id));

    return successResponse({ message: 'Menu item deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    return errorResponse(error.message || 'Failed to delete menu item', 500);
  }
}

