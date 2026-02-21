/**
 * Supabase data access layer.
 * All database queries and mutations for sheds, map markers, and corporations.
 * Handles camelCase ↔ snake_case conversion between TypeScript and PostgreSQL.
 */
import { supabase } from "@/lib/supabase";
import type { Shed, CreateShedInput, UpdateShedInput, MapMarker } from "@/types";

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
    .select("id, latitude, longitude, name, code, status");
  if (error) throw error;
  return (data ?? []).map((d) => ({
    shedId: d.id,
    latitude: Number(d.latitude),
    longitude: Number(d.longitude),
    name: d.name,
    code: d.code,
    status: d.status as MapMarker["status"],
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
