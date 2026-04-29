import { NextResponse } from 'next/server';
import { db } from '@/db';
import { serviceRequests } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

// CRITICAL: Prevent Next.js from caching this route so polling works
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pending = await db.query.serviceRequests.findMany({
      where: eq(serviceRequests.status, 'pending'),
      orderBy: [asc(serviceRequests.createdAt)],
    });

    return NextResponse.json(pending, { status: 200 });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}