import { NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';

export async function getCurrentUser() {
  try {
    const user = await stackServerApp.getUser();
    return user;
  } catch (error) {
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return user;
}

export function successResponse(data: any, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function notFoundResponse(message: string = 'Resource not found') {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

