import { db } from "./db";
import { destinations } from "../shared/schema";
import { eq } from "drizzle-orm";

/**
 * Helper function to get destination data and prepare it for activity insertion
 */
export async function getDestinationForActivity(destinationId: number) {
  const destination = await db
    .select()
    .from(destinations)
    .where(eq(destinations.id, destinationId))
    .limit(1);

  if (destination.length === 0) {
    throw new Error(`Destino com ID ${destinationId} não encontrado`);
  }

  const dest = destination[0];
  
  return {
    destination_id: dest.id,
    destination_name: dest.name,
    city: dest.name,
    state: dest.state,
    country: dest.country,
    country_type: dest.country_type as "nacional" | "internacional",
    region: dest.region,
    continent: dest.continent
  };
}

/**
 * Validate that a destination exists and is active
 */
export async function validateDestination(destinationId: number): Promise<boolean> {
  const destination = await db
    .select({ id: destinations.id, is_active: destinations.is_active })
    .from(destinations)
    .where(eq(destinations.id, destinationId))
    .limit(1);

  return destination.length > 0 && destination[0].is_active;
}