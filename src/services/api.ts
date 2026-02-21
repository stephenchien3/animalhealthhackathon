/**
 * Supabase data access layer.
 * All database queries and mutations for sheds, map markers, and corporations.
 * Handles camelCase ↔ snake_case conversion between TypeScript and PostgreSQL.
 */
import { supabase } from "@/lib/supabase";
import type { Shed, CreateShedInput, UpdateShedInput, MapMarker, Listing, Order, SoyRecord, CreateSoyRecordInput, UpdateSoyRecordInput } from "@/types";

// ── Helpers ─────────────────────────────────────────────────

/** Convert a camelCase key to snake_case. */
function toSnake(key: string): string {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

/** Map a Supabase row (snake_case) to a typed Shed (camelCase). */
function mapShed(row: Record<string, unknown>): Shed {
  return {
    id: row.id as string,
    corporationId: row.corporation_id as string,
    name: row.name as string,
    code: row.code as string,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    address: row.address as string,
    imageUrl: (row.image_url as string) ?? null,
    soybeanType: row.soybean_type as Shed["soybeanType"],
    soybeanCount: Number(row.soybean_count),
    moisturePct: Number(row.moisture_pct),
    temperature: Number(row.temperature),
    capacityTonnes: Number(row.capacity_tonnes),
    status: row.status as Shed["status"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/** Convert a CreateShedInput (camelCase) to a Supabase row (snake_case). */
function toShedRow(input: CreateShedInput | UpdateShedInput) {
  const row: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(input)) {
    if (val !== undefined) row[toSnake(key)] = val;
  }
  return row;
}

// ── Queries ─────────────────────────────────────────────────

/** Fetch all sheds for the current corporation, sorted by name. */
export async function fetchSheds(): Promise<Shed[]> {
  const { data, error } = await supabase
    .from("sheds")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []).map((d) => mapShed(d as Record<string, unknown>));
}

/** Fetch a single shed by ID. */
export async function fetchShedById(id: string): Promise<Shed> {
  const { data, error } = await supabase
    .from("sheds")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return mapShed(data as Record<string, unknown>);
}

/** Fetch lightweight marker data for the map view. */
export async function fetchMapMarkers(): Promise<MapMarker[]> {
  const { data, error } = await supabase
    .from("sheds")
    .select("id, latitude, longitude, name, code, status, image_url");
  if (error) throw error;
  return (data ?? []).map((d) => ({
    shedId: d.id,
    latitude: Number(d.latitude),
    longitude: Number(d.longitude),
    name: d.name,
    code: d.code,
    status: d.status as MapMarker["status"],
    imageUrl: (d.image_url as string) ?? null,
  }));
}

/** Fetch the current user's corporation via their profile. */
export async function fetchCorporation(): Promise<{ id: string; name: string } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("corporation_id, corporations(id, name)")
    .eq("user_id", user.id)
    .single();
  if (error) return null;

  return (data?.corporations as unknown as { id: string; name: string }) ?? null;
}

// ── Mutations ───────────────────────────────────────────────

/** Create a new shed, automatically associating it with the user's corporation. */
export async function createShed(input: CreateShedInput): Promise<Shed> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Always resolve corporation_id from profiles table (matches RLS policy)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("corporation_id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile?.corporation_id) {
    throw new Error("No corporation found for your account. Please contact support.");
  }

  const { data, error } = await supabase
    .from("sheds")
    .insert({ ...toShedRow(input), corporation_id: profile.corporation_id })
    .select()
    .single();
  if (error) throw error;
  return mapShed(data as Record<string, unknown>);
}

/** Partially update a shed by ID. Only changed fields are sent. */
export async function updateShed(id: string, input: UpdateShedInput): Promise<Shed> {
  const { data, error } = await supabase
    .from("sheds")
    .update(toShedRow(input))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapShed(data as Record<string, unknown>);
}

/** Delete a shed by ID. */
export async function deleteShed(id: string): Promise<void> {
  const { error } = await supabase.from("sheds").delete().eq("id", id);
  if (error) throw error;
}

// ── Marketplace ─────────────────────────────────────────────

function mapListing(row: Record<string, unknown>): Listing {
  const shed = row.sheds ? mapShed(row.sheds as Record<string, unknown>) : undefined;
  return {
    id: row.id as string,
    shedId: row.shed_id as string,
    listingType: row.listing_type as Listing["listingType"],
    title: row.title as string,
    soybeanType: row.soybean_type as Listing["soybeanType"],
    quantityTonnes: Number(row.quantity_tonnes),
    priceUsd: Number(row.price_usd),
    status: row.status as Listing["status"],
    imageUrl: (row.image_url as string) ?? null,
    createdAt: row.created_at as string,
    shed,
  };
}

/** Fetch all active listings with shed info. */
export async function fetchListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*, sheds(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((d) => mapListing(d as Record<string, unknown>));
}

/** Fetch credits for the current user's corporation. */
export async function fetchCredits(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { data, error } = await supabase
    .from("profiles")
    .select("corporations(credits_usd)")
    .eq("user_id", user.id)
    .single();
  if (error) return 0;
  const corp = data?.corporations as unknown as { credits_usd: number } | null;
  return Number(corp?.credits_usd ?? 0);
}

/** Place an order via the atomic RPC. */
export async function placeOrder(listingId: string, quantity: number): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!profile) throw new Error("Profile not found");

  const { data, error } = await supabase.rpc("place_order", {
    p_listing_id: listingId,
    p_buyer_profile_id: profile.id,
    p_quantity: quantity,
  });
  if (error) throw error;
  return data as string;
}

/** Fetch orders for the current user. */
export async function fetchMyOrders(): Promise<Order[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!profile) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*, listings(*, sheds(*))")
    .eq("buyer_id", profile.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((d) => {
    const row = d as Record<string, unknown>;
    const listing = row.listings ? mapListing(row.listings as Record<string, unknown>) : undefined;
    return {
      id: row.id as string,
      listingId: row.listing_id as string,
      buyerId: row.buyer_id as string,
      quantityTonnes: Number(row.quantity_tonnes),
      totalPriceUsd: Number(row.total_price_usd),
      status: row.status as Order["status"],
      createdAt: row.created_at as string,
      listing,
    };
  });
}

// ── Soy Records (Farmer) ───────────────────────────────────

function mapSoyRecord(row: Record<string, unknown>): SoyRecord {
  return {
    id: row.id as string,
    corporationId: row.corporation_id as string,
    shedId: row.shed_id as string,
    buyerCompany: row.buyer_company as string,
    soyType: row.soy_type as SoyRecord["soyType"],
    quantityTonnes: Number(row.quantity_tonnes),
    priceUsd: Number(row.price_usd),
    shedLocation: row.shed_location as string,
    status: row.status as SoyRecord["status"],
    soldAt: row.sold_at as string,
    createdAt: row.created_at as string,
  };
}

/** Fetch all soy sale records for the current corporation. */
export async function fetchSoyRecords(): Promise<SoyRecord[]> {
  const { data, error } = await supabase
    .from("soy_records")
    .select("*")
    .order("sold_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((d) => mapSoyRecord(d as Record<string, unknown>));
}

/** Create a new soy sale record. */
export async function createSoyRecord(input: CreateSoyRecordInput): Promise<SoyRecord> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("corporation_id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile?.corporation_id) {
    throw new Error("No corporation found for your account.");
  }

  const row: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(input)) {
    if (val !== undefined) row[toSnake(key)] = val;
  }

  const { data, error } = await supabase
    .from("soy_records")
    .insert({ ...row, corporation_id: profile.corporation_id })
    .select()
    .single();
  if (error) throw error;
  return mapSoyRecord(data as Record<string, unknown>);
}

/** Update a soy sale record. */
export async function updateSoyRecord(id: string, input: UpdateSoyRecordInput): Promise<SoyRecord> {
  const row: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(input)) {
    if (val !== undefined) row[toSnake(key)] = val;
  }

  const { data, error } = await supabase
    .from("soy_records")
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapSoyRecord(data as Record<string, unknown>);
}

/** Delete a soy sale record. */
export async function deleteSoyRecord(id: string): Promise<void> {
  const { error } = await supabase.from("soy_records").delete().eq("id", id);
  if (error) throw error;
}
