import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { menus, menuItems, weddings, weddingEvents } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('weddingId');
    const eventId = searchParams.get('eventId');

    if (!weddingId) {
      return errorResponse('weddingId is required');
    }

    // Verify access to wedding
    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, weddingId), isNull(weddings.deletedAt)))
      .limit(1);

    if (!wedding || wedding.ownerId !== user.id) {
      return errorResponse('Access denied', 403);
    }

    // Build query conditions
    const conditions = [
      eq(menus.weddingId, weddingId),
      isNull(menus.deletedAt),
    ];

    if (eventId) {
      conditions.push(eq(menus.eventId, eventId));
    }

    const menusList = await db
      .select()
      .from(menus)
      .where(and(...conditions))
      .orderBy(menus.createdAt);

    // Get menu items for each menu
    const menusWithItems = await Promise.all(
      menusList.map(async (menu) => {
        const items = await db
          .select()
          .from(menuItems)
          .where(eq(menuItems.menuId, menu.id))
          .orderBy(menuItems.order);

        return {
          ...menu,
          items,
        };
      })
    );

    return successResponse(menusWithItems);
  } catch (error: any) {
    console.error('Error fetching menus:', error);
    return errorResponse(error.message || 'Failed to fetch menus', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof Response) return user;

    const body = await request.json();
    const { weddingId, eventId, name, description, items } = body;

    if (!weddingId || !name) {
      return errorResponse('weddingId and name are required');
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

    // Verify event if provided
    if (eventId) {
      const [event] = await db
        .select()
        .from(weddingEvents)
        .where(
          and(
            eq(weddingEvents.id, eventId),
            eq(weddingEvents.weddingId, weddingId),
            isNull(weddingEvents.deletedAt)
          )
        )
        .limit(1);

      if (!event) {
        return errorResponse('Event not found', 404);
      }
    }

    // Create menu
    const [menu] = await db
      .insert(menus)
      .values({
        weddingId,
        eventId: eventId || null,
        name,
        description: description || null,
        approved: false,
      })
      .returning();

    // Create menu items if provided
    if (items && Array.isArray(items) && items.length > 0) {
      await db.insert(menuItems).values(
        items.map((item: any, index: number) => ({
          menuId: menu.id,
          name: item.name,
          description: item.description || null,
          category: item.category || null,
          isVegetarian: item.isVegetarian ?? true,
          isVegan: item.isVegan ?? false,
          isJain: item.isJain ?? false,
          isGlutenFree: item.isGlutenFree ?? false,
          servingSize: item.servingSize || null,
          quantity: item.quantity || null,
          order: item.order ?? index,
        }))
      );
    }

    // Fetch menu with items
    const menuItemsList = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.menuId, menu.id))
      .orderBy(menuItems.order);

    return successResponse({ ...menu, items: menuItemsList }, 201);
  } catch (error: any) {
    console.error('Error creating menu:', error);
    return errorResponse(error.message || 'Failed to create menu', 500);
  }
}

