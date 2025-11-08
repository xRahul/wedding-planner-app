import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for food item
const FoodItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(["Vegetarian", "Non-Veg", "Dessert", "Beverage"]),
  weddingId: z.string().min(1, "Wedding ID is required"),
  eventId: z.string().optional(),
  description: z.string().optional(),
  servingSize: z.string().optional(),
  cost: z.number().nonnegative().optional(),
  quantity: z.number().int().nonnegative()
});

// Validation schema for bulk operations
const BulkFoodItemsSchema = z.object({
  items: z.array(FoodItemSchema)
});

// GET handler - List all food items with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const weddingId = searchParams.get("weddingId");
    const eventId = searchParams.get("eventId");

    if (!weddingId) {
      return NextResponse.json(
        { error: "Wedding ID is required" },
        { status: 400 }
      );
    }

    // Build the where clause based on filters
    const where = {
      weddingId,
      ...(eventId ? { eventId } : {})
    };

    // Fetch food items with the filters
    const foodItems = await prisma.foodMenu.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    // Calculate total cost
    const totalCost = foodItems.reduce((sum, item) => {
      return sum + (item.cost?.toNumber() || 0) * item.quantity;
    }, 0);

    return NextResponse.json({
      items: foodItems,
      totalCost,
      count: foodItems.length
    });

  } catch (error) {
    console.error("Error fetching food items:", error);
    return NextResponse.json(
      { error: "Failed to fetch food items" },
      { status: 500 }
    );
  }
}

// POST handler - Create new food item(s)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if it's a bulk operation
    if (Array.isArray(body)) {
      // Validate bulk items
      const validation = BulkFoodItemsSchema.safeParse({ items: body });
      if (!validation.success) {
        return NextResponse.json(
          { error: "Invalid food items data", details: validation.error },
          { status: 400 }
        );
      }

      // Create all items in a transaction
      const createdItems = await prisma.$transaction(
        body.map(item => 
          prisma.foodMenu.create({
            data: item
          })
        )
      );

      return NextResponse.json(createdItems, { status: 201 });
    }

    // Single item creation
    const validation = FoodItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid food item data", details: validation.error },
        { status: 400 }
      );
    }

    const foodItem = await prisma.foodMenu.create({
      data: validation.data
    });

    return NextResponse.json(foodItem, { status: 201 });

  } catch (error) {
    console.error("Error creating food item(s):", error);
    return NextResponse.json(
      { error: "Failed to create food item(s)" },
      { status: 500 }
    );
  }
}

// PUT handler - Update food item(s)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Bulk update operation
    if (Array.isArray(body)) {
      const validation = BulkFoodItemsSchema.safeParse({ items: body });
      if (!validation.success) {
        return NextResponse.json(
          { error: "Invalid food items data", details: validation.error },
          { status: 400 }
        );
      }

      // Update all items in a transaction
      const updatedItems = await prisma.$transaction(
        body.map(item => 
          prisma.foodMenu.update({
            where: { id: item.id },
            data: {
              name: item.name,
              category: item.category,
              description: item.description,
              servingSize: item.servingSize,
              cost: item.cost,
              quantity: item.quantity,
              eventId: item.eventId
            }
          })
        )
      );

      return NextResponse.json(updatedItems);
    }

    // Single item update
    if (!id) {
      return NextResponse.json(
        { error: "Food item ID is required" },
        { status: 400 }
      );
    }

    const validation = FoodItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid food item data", details: validation.error },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.foodMenu.update({
      where: { id },
      data: validation.data
    });

    return NextResponse.json(updatedItem);

  } catch (error) {
    console.error("Error updating food item(s):", error);
    return NextResponse.json(
      { error: "Failed to update food item(s)" },
      { status: 500 }
    );
  }
}

// DELETE handler - Delete food item
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Food item ID is required" },
        { status: 400 }
      );
    }

    await prisma.foodMenu.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting food item:", error);
    return NextResponse.json(
      { error: "Failed to delete food item" },
      { status: 500 }
    );
  }
}