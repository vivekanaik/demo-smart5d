import { NextResponse } from 'next/server';
import { db } from '@/db';
import { serviceRequests } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // ✅ Type as a Promise
) {
  try {
    // ✅ Await the params before using them!
    const { id } = await params;

    const updated = await db.update(serviceRequests)
      .set({ status: 'resolved' })
      .where(eq(serviceRequests.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}