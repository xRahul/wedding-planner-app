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

    const [menu] = await db
      .select()
      .from(menus)
      .where(and(eq(menus.id, id), isNull(menus.deletedAt)))
      .limit(1);

    if (!menu) {
      return notFoundResponse('Menu not found');
    }

    // Verify access
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

    return successResponse({ ...menu, items });
  } catch (error: any) {
    console.error('Error fetching menu:', error);
    return errorResponse(error.message || 'Failed to fetch menu', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const { id } = await params;
    const body = await request.json();

    // Get menu and verify access
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

    // Update menu
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.eventId !== undefined) updateData.eventId = body.eventId;
    if (body.approved !== undefined) {
      updateData.approved = body.approved;
      if (body.approved) {
        updateData.approvedBy = user.id;
        updateData.approvedAt = new Date();
      } else {
        updateData.approvedBy = null;
        updateData.approvedAt = null;
      }
    }

    const [updatedMenu] = await db
      .update(menus)
      .set(updateData)
      .where(eq(menus.id, id))
      .returning();

    // Get menu items
    const items = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.menuId, id))
      .orderBy(menuItems.order);

    return successResponse({ ...updatedMenu, items });
  } catch (error: any) {
    console.error('Error updating menu:', error);
    return errorResponse(error.message || 'Failed to update menu', 500);
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

    // Get menu and verify access
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

    // Soft delete menu (cascade will delete menu items)
    await db
      .update(menus)
      .set({ deletedAt: new Date() })
      .where(eq(menus.id, id));

    return successResponse({ message: 'Menu deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting menu:', error);
    return errorResponse(error.message || 'Failed to delete menu', 500);
  }
}

