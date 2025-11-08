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
  name: string;
  date: Date;
  startTime: string;
  endTime: string;
  venue: string;
  theme?: string;
  brideEntry: boolean;
  brideEntryTime?: string;
  groomEntry: boolean;
  groomEntryTime?: string;
  description?: string;
}

export interface FoodMenu {
  id: string;
  name: string;
  category: string;
  cost?: number;
  quantity: number;
  servingSize?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  contact: string;
  email?: string;
  cost?: number;
  company?: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  contact?: string;
  email?: string;
  dietaryRequirements?: string;
}

export interface Gift {
  id: string;
  description: string;
  value?: number;
  received: boolean;
  thankyouSent: boolean;
  guestId: string;
}

export interface SangeetItem {
  id: string;
  songName: string;
  singer: string;
  performers: string[];
  duration: string;
  choreographyNotes?: string;
}