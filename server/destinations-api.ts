import { db } from "./db";
import { destinations } from "../shared/schema";
import { eq } from "drizzle-orm";

/**
 * API endpoint to get all available destinations
 */
export async function getAllDestinations() {
  return await db
    .select()
    .from(destinations)
    .where(eq(destinations.is_active, true))
    .orderBy(destinations.name);
}

/**
 * API endpoint to get destination by ID
 */
export async function getDestinationById(id: number) {
  const destination = await db
    .select()
    .from(destinations)
    .where(eq(destinations.id, id))
    .limit(1);

  return destination.length > 0 ? destination[0] : null;
}