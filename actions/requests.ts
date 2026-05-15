// actions/requests.ts
"use server";

import { db } from "@/db";
import { serviceRequests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getServiceRequests() {
  try {
    return await db.query.serviceRequests.findMany({
      orderBy: [desc(serviceRequests.createdAt)],
      limit: 50,
    });
  } catch {
    return [];
  }
}

export async function markRequestsAsResolved() {
  // Execute the update, but DO NOT return the raw database response
  await db.update(serviceRequests)
    .set({ status: 'resolved' })
    .where(eq(serviceRequests.status, 'pending'));

  // Return a simple, plain JSON object instead
  return { success: true };
}

export async function markRequestAsResolved(id: number) {
  await db.update(serviceRequests)
    .set({ status: 'resolved' })
    .where(eq(serviceRequests.id, id));

  return { success: true };
}

export async function createServiceRequest(tableNumber: number) {
  // .returning() ensures this returns the inserted row as a plain object, not the raw connection
  const newRequest = await db.insert(serviceRequests)
    .values({ tableNumber })
    .returning();
    
  return newRequest[0];
}