/**
 * Shared TypeScript types for the CleanFeed application.
 * Only includes types actively used by components, hooks, and services.
 */

// ── Base aliases ────────────────────────────────────────────
export type UUID = string;
export type ISODateString = string;

// ── Corporation ─────────────────────────────────────────────
export type CorporationTier = "multinational" | "regional" | "local";

export interface Corporation {
  id: UUID;
  name: string;
  contactEmail: string;
  country: string;
  tier: CorporationTier;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ── Shed ────────────────────────────────────────────────────
export type SoybeanType = "meal" | "whole" | "hull" | "other";
export type ShedStatus = "operational" | "maintenance" | "offline";

export interface Shed {
  id: UUID;
  corporationId: UUID;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  address: string;
  imageUrl: string | null;
  soybeanType: SoybeanType;
  soybeanCount: number;
  moisturePct: number;
  temperature: number;
  capacityTonnes: number;
  status: ShedStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateShedInput {
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  address: string;
  imageUrl?: string;
  soybeanType: SoybeanType;
  soybeanCount: number;
  moisturePct: number;
  temperature: number;
  capacityTonnes: number;
  status: ShedStatus;
}

export type UpdateShedInput = Partial<CreateShedInput>;

// ── Map ─────────────────────────────────────────────────────
export interface MapMarker {
  shedId: UUID;
  latitude: number;
  longitude: number;
  name: string;
  code: string;
  status: ShedStatus;
  imageUrl: string | null;
}

// ── Summary ─────────────────────────────────────────────────
export type Severity = "info" | "warning" | "critical";

export interface ImprovementSuggestion {
  shedId: UUID;
  shedCode: string;
  message: string;
  severity: Severity;
}

export interface SoybeanTypeStat {
  soybeanType: SoybeanType;
  totalTonnes: number;
  shedCount: number;
}

export interface DashboardSummary {
  totalSheds: number;
  totalSoybeanTonnes: number;
  avgMoisturePct: number;
  avgTemperature: number;
  shedsAtCapacity: number;
  alertCount: { critical: number; warning: number; info: number };
  statsByType: SoybeanTypeStat[];
  improvements: ImprovementSuggestion[];
}
