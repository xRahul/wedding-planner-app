import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for Event
const EventSchema = z.object({
  weddingId: z.string().min(1, "Wedding ID is required"),
  name: z.string().min(1, "Event name is required"),
  date: z.string().transform((date: string) => new Date(date)),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  venue: z.string().min(1, "Venue is required"),
  theme: z.string().optional(),
  description: z.string().optional(),
  budget: z.number().optional(),
  brideEntry: z.boolean().default(false),
  brideEntryTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional(),
  brideEntryDescription: z.string().optional(),
  groomEntry: z.boolean().default(false),
  groomEntryTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional(),
  groomEntryDescription: z.string().optional(),
});

// GET - List all events for a wedding
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const weddingId = searchParams.get("weddingId");

    if (!weddingId) {
      return NextResponse.json(
        { error: "Wedding ID is required" },
        { status: 400 }
      );
    }

    const events = await prisma.event.findMany({
      where: { weddingId },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = EventSchema.parse(body);

    // Check if wedding exists
    const wedding = await prisma.wedding.findUnique({
      where: { id: validatedData.weddingId },
    });

    if (!wedding) {
      return NextResponse.json(
        { error: "Wedding not found" },
        { status: 404 }
      );
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        ...validatedData,
        budget: validatedData.budget ? Number(validatedData.budget) : undefined,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }

    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}