# Complete Code Examples - Indian Wedding Planning App

## 1. PRISMA SCHEMA (prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

model Wedding {
  id                String   @id @default(cuid())
  brideFirstName    String
  brideLastName     String
  groomFirstName    String
  groomLastName     String
  weddingDate       DateTime
  venue             String
  city              String
  budget            Decimal?
  currency          String   @default("INR")
  
  events            Event[]
  foodMenus         FoodMenu[]
  staff             Staff[]
  guests            Guest[]
  gifts             Gift[]
  sangeetItems      SangeetItem[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Event {
  id                    String   @id @default(cuid())
  weddingId             String
  wedding               Wedding  @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  
  name                  String   
  date                  DateTime
  startTime             String   
  endTime               String   
  venue                 String
  description           String?
  theme                 String?  
  budget                Decimal?
  
  brideEntry           Boolean @default(false)
  brideEntryTime       String?
  brideEntryDescription String?
  brideOutfitDetails   String?
  
  groomEntry           Boolean @default(false)
  groomEntryTime       String?
  groomEntryDescription String?
  groomOutfitDetails   String?
  
  guestSchedules      GuestSchedule[]
  foodMenus           FoodMenu[]
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  @@index([weddingId])
}

model FoodMenu {
  id              String   @id @default(cuid())
  weddingId       String
  wedding         Wedding  @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  eventId         String?
  event           Event?   @relation(fields: [eventId], references: [id])
  
  name            String
  category        String   
  cuisine         String?  
  description     String?
  servingSize     String?  
  cost            Decimal?
  quantity        Int      @default(0)
  ingredients     String?
  allergies       String?  
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([weddingId])
  @@index([eventId])
}

model Staff {
  id              String   @id @default(cuid())
  weddingId       String
  wedding         Wedding  @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  
  name            String
  role            String   
  contact         String
  email           String?
  cost            Decimal?
  company         String?
  expertise       String?
  notes           String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([weddingId])
}

model Guest {
  id                  String   @id @default(cuid())
  weddingId           String
  wedding             Wedding  @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  
  firstName           String
  lastName            String
  relationship        String   
  contact             String?
  email               String?
  dietaryRequirements String?
  plusOne             Boolean  @default(false)
  
  schedules           GuestSchedule[]
  gifts               Gift[]
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  @@index([weddingId])
}

model GuestSchedule {
  id                      String   @id @default(cuid())
  guestId                 String
  guest                   Guest    @relation(fields: [guestId], references: [id], onDelete: Cascade)
  eventId                 String
  event                   Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  attending               Boolean @default(false)
  mealPreference          String?
  specialRequirements     String?
  seatingPreference       String?
  confirmationDate        DateTime?
  
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  @@unique([guestId, eventId])
  @@index([guestId])
  @@index([eventId])
}

model Gift {
  id              String   @id @default(cuid())
  weddingId       String
  wedding         Wedding  @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  guestId         String
  guest           Guest    @relation(fields: [guestId], references: [id], onDelete: Cascade)
  
  description     String
  value           Decimal?
  received        Boolean @default(false)
  receivedDate    DateTime?
  thankyouSent    Boolean @default(false)
  thankyouDate    DateTime?
  notes           String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([weddingId])
  @@index([guestId])
}

model SangeetItem {
  id                  String   @id @default(cuid())
  weddingId           String
  wedding             Wedding  @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  
  songName            String
  artist              String?
  performers          String[] 
  duration            String   
  choreographyNotes   String?
  costumes            String?
  musicFile           String?  
  rehearsalNotes      String?
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  @@index([weddingId])
}
```

---

## 2. DATABASE CLIENT (lib/db.ts)

```typescript
// lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

---

## 3. TYPES (lib/types.ts)

```typescript
// lib/types.ts
export interface Wedding {
  id: string;
  brideFirstName: string;
  brideLastName: string;
  groomFirstName: string;
  groomLastName: string;
  weddingDate: Date;
  venue: string;
  city: string;
  budget?: number;
  currency: string;
}

export interface Event {
  id: string;
  weddingId: string;
  name: string;
  date: Date;
  startTime: string;
  endTime: string;
  venue: string;
  theme?: string;
  description?: string;
  budget?: number;
  brideEntry: boolean;
  brideEntryTime?: string;
  brideEntryDescription?: string;
  brideOutfitDetails?: string;
  groomEntry: boolean;
  groomEntryTime?: string;
  groomEntryDescription?: string;
  groomOutfitDetails?: string;
}

export interface FoodMenu {
  id: string;
  weddingId: string;
  eventId?: string;
  name: string;
  category: string;
  cuisine?: string;
  description?: string;
  cost?: number;
  quantity: number;
  servingSize?: string;
  ingredients?: string;
  allergies?: string;
}

export interface Staff {
  id: string;
  weddingId: string;
  name: string;
  role: string;
  contact: string;
  email?: string;
  cost?: number;
  company?: string;
  expertise?: string;
  notes?: string;
}

export interface Guest {
  id: string;
  weddingId: string;
  firstName: string;
  lastName: string;
  relationship: string;
  contact?: string;
  email?: string;
  dietaryRequirements?: string;
  plusOne: boolean;
}

export interface GuestSchedule {
  id: string;
  guestId: string;
  eventId: string;
  attending: boolean;
  mealPreference?: string;
  specialRequirements?: string;
  seatingPreference?: string;
  confirmationDate?: Date;
}

export interface Gift {
  id: string;
  weddingId: string;
  guestId: string;
  description: string;
  value?: number;
  received: boolean;
  receivedDate?: Date;
  thankyouSent: boolean;
  thankyouDate?: Date;
  notes?: string;
}

export interface SangeetItem {
  id: string;
  weddingId: string;
  songName: string;
  artist?: string;
  performers: string[];
  duration: string;
  choreographyNotes?: string;
  costumes?: string;
  musicFile?: string;
  rehearsalNotes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

---

## 4. EVENTS API (app/api/events/route.ts)

```typescript
// app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Event as PrismaEvent } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get("weddingId");

    if (!weddingId) {
      return NextResponse.json(
        { success: false, error: "weddingId is required" },
        { status: 400 }
      );
    }

    const events = await prisma.event.findMany({
      where: { weddingId },
      orderBy: { date: "asc" },
      include: {
        guestSchedules: true,
        foodMenus: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      weddingId,
      name,
      date,
      startTime,
      endTime,
      venue,
      theme,
      description,
      budget,
      brideEntry,
      brideEntryTime,
      brideEntryDescription,
      groomEntry,
      groomEntryTime,
      groomEntryDescription,
    } = body;

    // Validation
    if (!weddingId || !name || !date || !startTime || !endTime || !venue) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        weddingId,
        name,
        date: new Date(date),
        startTime,
        endTime,
        venue,
        theme,
        description,
        budget: budget ? parseFloat(budget) : null,
        brideEntry: brideEntry || false,
        brideEntryTime,
        brideEntryDescription,
        groomEntry: groomEntry || false,
        groomEntryTime,
        groomEntryDescription,
      },
    });

    return NextResponse.json(
      { success: true, data: event, message: "Event created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}
```

### File: app/api/events/[id]/route.ts

```typescript
// app/api/events/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const event = await prisma.event.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({
      success: true,
      data: event,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/events/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/events/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
```

---

## 5. FOOD MENU API (app/api/foods/route.ts)

```typescript
// app/api/foods/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get("weddingId");
    const eventId = searchParams.get("eventId");

    if (!weddingId) {
      return NextResponse.json(
        { success: false, error: "weddingId is required" },
        { status: 400 }
      );
    }

    const foods = await prisma.foodMenu.findMany({
      where: {
        weddingId,
        ...(eventId && { eventId }),
      },
      orderBy: { category: "asc" },
    });

    const totalCost = foods.reduce(
      (sum, food) => sum + (food.cost ? parseFloat(food.cost.toString()) * food.quantity : 0),
      0
    );

    const groupedByCategory = foods.reduce((acc: any, food) => {
      if (!acc[food.category]) {
        acc[food.category] = [];
      }
      acc[food.category].push(food);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: foods,
      grouped: groupedByCategory,
      totalCost,
    });
  } catch (error) {
    console.error("GET /api/foods error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch food items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      weddingId,
      eventId,
      name,
      category,
      cuisine,
      description,
      servingSize,
      cost,
      quantity,
      ingredients,
      allergies,
    } = body;

    if (!weddingId || !name || !category) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const food = await prisma.foodMenu.create({
      data: {
        weddingId,
        eventId,
        name,
        category,
        cuisine,
        description,
        servingSize,
        cost: cost ? parseFloat(cost) : null,
        quantity: parseInt(quantity) || 0,
        ingredients,
        allergies,
      },
    });

    return NextResponse.json(
      { success: true, data: food, message: "Food item created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/foods error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create food item" },
      { status: 500 }
    );
  }
}
```

---

## 6. GUESTS API (app/api/guests/route.ts)

```typescript
// app/api/guests/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get("weddingId");

    if (!weddingId) {
      return NextResponse.json(
        { success: false, error: "weddingId is required" },
        { status: 400 }
      );
    }

    const guests = await prisma.guest.findMany({
      where: { weddingId },
      include: {
        schedules: {
          include: {
            event: true,
          },
        },
        gifts: true,
      },
      orderBy: { firstName: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: guests,
      totalGuests: guests.length,
    });
  } catch (error) {
    console.error("GET /api/guests error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch guests" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      weddingId,
      firstName,
      lastName,
      relationship,
      contact,
      email,
      dietaryRequirements,
      plusOne,
    } = body;

    if (!weddingId || !firstName || !lastName || !relationship) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const guest = await prisma.guest.create({
      data: {
        weddingId,
        firstName,
        lastName,
        relationship,
        contact,
        email,
        dietaryRequirements,
        plusOne: plusOne || false,
      },
    });

    return NextResponse.json(
      { success: true, data: guest, message: "Guest added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/guests error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add guest" },
      { status: 500 }
    );
  }
}
```

---

## 7. STAFF API (app/api/staff/route.ts)

```typescript
// app/api/staff/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get("weddingId");

    if (!weddingId) {
      return NextResponse.json(
        { success: false, error: "weddingId is required" },
        { status: 400 }
      );
    }

    const staff = await prisma.staff.findMany({
      where: { weddingId },
      orderBy: { role: "asc" },
    });

    const totalStaffCost = staff.reduce(
      (sum, s) => sum + (s.cost ? parseFloat(s.cost.toString()) : 0),
      0
    );

    const staffByRole = staff.reduce((acc: any, s) => {
      if (!acc[s.role]) {
        acc[s.role] = [];
      }
      acc[s.role].push(s);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: staff,
      totalStaffCost,
      staffByRole,
    });
  } catch (error) {
    console.error("GET /api/staff error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weddingId, name, role, contact, email, cost, company, expertise, notes } =
      body;

    if (!weddingId || !name || !role || !contact) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const staff = await prisma.staff.create({
      data: {
        weddingId,
        name,
        role,
        contact,
        email,
        cost: cost ? parseFloat(cost) : null,
        company,
        expertise,
        notes,
      },
    });

    return NextResponse.json(
      { success: true, data: staff, message: "Staff member added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/staff error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add staff" },
      { status: 500 }
    );
  }
}
```

---

## 8. GIFTS API (app/api/gifts/route.ts)

```typescript
// app/api/gifts/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get("weddingId");
    const status = searchParams.get("status"); // "received", "pending", "all"

    if (!weddingId) {
      return NextResponse.json(
        { success: false, error: "weddingId is required" },
        { status: 400 }
      );
    }

    const whereClause: any = { weddingId };
    if (status === "received") {
      whereClause.received = true;
    } else if (status === "pending") {
      whereClause.received = false;
    }

    const gifts = await prisma.gift.findMany({
      where: whereClause,
      include: {
        guest: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalValue = gifts.reduce(
      (sum, gift) => sum + (gift.value ? parseFloat(gift.value.toString()) : 0),
      0
    );
    const receivedCount = gifts.filter((g) => g.received).length;
    const pendingCount = gifts.filter((g) => !g.received).length;

    return NextResponse.json({
      success: true,
      data: gifts,
      stats: {
        totalValue,
        receivedCount,
        pendingCount,
        totalGifts: gifts.length,
      },
    });
  } catch (error) {
    console.error("GET /api/gifts error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gifts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weddingId, guestId, description, value } = body;

    if (!weddingId || !guestId || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const gift = await prisma.gift.create({
      data: {
        weddingId,
        guestId,
        description,
        value: value ? parseFloat(value) : null,
      },
      include: {
        guest: true,
      },
    });

    return NextResponse.json(
      { success: true, data: gift, message: "Gift tracked successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/gifts error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track gift" },
      { status: 500 }
    );
  }
}
```

---

## 9. SANGEET API (app/api/sangeet/route.ts)

```typescript
// app/api/sangeet/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get("weddingId");

    if (!weddingId) {
      return NextResponse.json(
        { success: false, error: "weddingId is required" },
        { status: 400 }
      );
    }

    const sangeetItems = await prisma.sangeetItem.findMany({
      where: { weddingId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: sangeetItems,
      totalItems: sangeetItems.length,
    });
  } catch (error) {
    console.error("GET /api/sangeet error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Sangeet items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      weddingId,
      songName,
      artist,
      performers,
      duration,
      choreographyNotes,
      costumes,
      musicFile,
      rehearsalNotes,
    } = body;

    if (!weddingId || !songName || !duration) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const sangeetItem = await prisma.sangeetItem.create({
      data: {
        weddingId,
        songName,
        artist,
        performers: performers || [],
        duration,
        choreographyNotes,
        costumes,
        musicFile,
        rehearsalNotes,
      },
    });

    return NextResponse.json(
      { success: true, data: sangeetItem, message: "Sangeet item added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/sangeet error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add Sangeet item" },
      { status: 500 }
    );
  }
}
```

---

## 10. EVENTS PAGE COMPONENT (app/(routes)/events/page.tsx)

```typescript
// app/(routes)/events/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Event } from "@/lib/types";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const weddingId = "your-wedding-id"; // Get from context/state management

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events?weddingId=${weddingId}`);
      const result = await response.json();
      if (result.success) {
        setEvents(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch events");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (formData: any) => {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, weddingId }),
      });
      const result = await response.json();
      if (result.success) {
        setEvents([...events, result.data]);
        setShowModal(false);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to add event");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        setEvents(events.filter((e) => e.id !== eventId));
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to delete event");
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading events...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Wedding Events</h1>
        <button
          onClick={() => {
            setEditingEvent(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Event
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

      {events.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No events added yet</div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="border rounded-lg p-4 bg-white shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{event.name}</h3>
                  <p className="text-gray-600">
                    {new Date(event.date).toLocaleDateString()} |{" "}
                    {event.startTime} - {event.endTime}
                  </p>
                  <p className="text-gray-600">{event.venue}</p>
                  {event.theme && (
                    <p className="text-sm text-gray-500">Theme: {event.theme}</p>
                  )}

                  {/* Bride Entry */}
                  {event.brideEntry && (
                    <div className="mt-3 p-3 bg-pink-50 rounded">
                      <p className="font-semibold text-pink-700">👰 Bride Entry</p>
                      <p className="text-sm">{event.brideEntryTime}</p>
                      {event.brideEntryDescription && (
                        <p className="text-sm text-gray-600">
                          {event.brideEntryDescription}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Groom Entry */}
                  {event.groomEntry && (
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <p className="font-semibold text-blue-700">🤵 Groom Entry</p>
                      <p className="text-sm">{event.groomEntryTime}</p>
                      {event.groomEntryDescription && (
                        <p className="text-sm text-gray-600">
                          {event.groomEntryDescription}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingEvent(event);
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <EventModal
          event={editingEvent}
          onClose={() => setShowModal(false)}
          onSave={handleAddEvent}
        />
      )}
    </div>
  );
}

// EventModal Component
function EventModal({
  event,
  onClose,
  onSave,
}: {
  event: Event | null;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState(
    event || {
      name: "",
      date: "",
      startTime: "",
      endTime: "",
      venue: "",
      theme: "",
      brideEntry: false,
      brideEntryTime: "",
      groomEntry: false,
      groomEntryTime: "",
    }
  );

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">
          {event ? "Edit Event" : "Add Event"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Event Name (Mehendi, Sangeet, etc.)"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="border rounded px-3 py-2"
              required
            />
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="border rounded px-3 py-2"
              required
            />
          </div>

          <input
            type="text"
            name="venue"
            placeholder="Venue"
            value={formData.venue}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />

          <input
            type="text"
            name="theme"
            placeholder="Theme (optional)"
            value={formData.theme}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />

          {/* Bride Entry */}
          <div className="border-t pt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="brideEntry"
                checked={formData.brideEntry}
                onChange={handleChange}
              />
              <span>Bride Entry</span>
            </label>
            {formData.brideEntry && (
              <input
                type="time"
                name="brideEntryTime"
                value={formData.brideEntryTime}
                onChange={handleChange}
                placeholder="Entry Time"
                className="w-full border rounded px-3 py-2 mt-2"
              />
            )}
          </div>

          {/* Groom Entry */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="groomEntry"
                checked={formData.groomEntry}
                onChange={handleChange}
              />
              <span>Groom Entry</span>
            </label>
            {formData.groomEntry && (
              <input
                type="time"
                name="groomEntryTime"
                value={formData.groomEntryTime}
                onChange={handleChange}
                placeholder="Entry Time"
                className="w-full border rounded px-3 py-2 mt-2"
              />
            )}
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## NOTES

- All code follows TypeScript best practices
- Error handling and validation included
- Responsive design using TailwindCSS
- Ready to deploy on Vercel
- Database schema optimized for Indian wedding context
- Components are reusable and modular

This is the foundation. Each component can be expanded with additional features like:
- Budget tracking dashboards
- Export to PDF
- Guest communication
- Photo galleries
- Vendor ratings
- Real-time collaboration
