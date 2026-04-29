import { NextResponse } from 'next/server';
import { db } from '@/db';
import { serviceRequests } from '@/db/schema';

export async function POST(req: Request) {
  try {
    const { tableNumber } = await req.json();

    if (!tableNumber) {
      return NextResponse.json({ error: 'Table number is required' }, { status: 400 });
    }

    const newRequest = await db.insert(serviceRequests).values({
      tableNumber: parseInt(tableNumber),
      status: 'pending',
    }).returning();

    return NextResponse.json(newRequest[0], { status: 201 });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}