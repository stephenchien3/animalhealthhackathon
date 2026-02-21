/**
 * Demo shipments — domestic (truck) and international (plane) routes to US mills.
 */
import { PLANTS } from "./plants";

export type ShipmentStatus = "in_transit" | "delivered" | "cancelled";
export type ShipmentMode = "truck" | "plane";

export interface Shipment {
  id: string;
  plantCode: string;
  mode: ShipmentMode;
  originName: string;
  originRegion: string;
  originLat: number;
  originLng: number;
  soybeanType: string;
  quantityTonnes: number;
  vehicleId: string;
  status: ShipmentStatus;
  departedAt: string;
  eta: string;
}

export const DEMO_SHIPMENTS: Shipment[] = [
  // ── Domestic (truck) ──────────────────────────────────────
  {
    id: "SH-001",
    plantCode: "PL-001",
    mode: "truck",
    originName: "Springfield Grain Elevator",
    originRegion: "Missouri, US",
    originLat: 37.2090,
    originLng: -93.2923,
    soybeanType: "Whole Soybean",
    quantityTonnes: 84,
    vehicleId: "TRK-4417",
    status: "in_transit",
    departedAt: "2026-02-21T06:00:00Z",
    eta: "2026-02-21T18:00:00Z",
  },
  {
    id: "SH-002",
    plantCode: "PL-002",
    mode: "truck",
    originName: "Sioux Falls Storage",
    originRegion: "South Dakota, US",
    originLat: 43.5446,
    originLng: -96.7311,
    soybeanType: "Soybean Meal",
    quantityTonnes: 120,
    vehicleId: "TRK-2281",
    status: "in_transit",
    departedAt: "2026-02-20T14:00:00Z",
    eta: "2026-02-21T08:00:00Z",
  },
  {
    id: "SH-003",
    plantCode: "PL-003",
    mode: "truck",
    originName: "Fort Wayne Depot",
    originRegion: "Indiana, US",
    originLat: 41.0793,
    originLng: -85.1394,
    soybeanType: "Whole Soybean",
    quantityTonnes: 62,
    vehicleId: "TRK-0893",
    status: "in_transit",
    departedAt: "2026-02-21T09:30:00Z",
    eta: "2026-02-21T14:00:00Z",
  },
  {
    id: "SH-004",
    plantCode: "PL-001",
    mode: "truck",
    originName: "Champaign Farm Co-op",
    originRegion: "Illinois, US",
    originLat: 40.1164,
    originLng: -88.2434,
    soybeanType: "Soybean Hull",
    quantityTonnes: 95,
    vehicleId: "TRK-7710",
    status: "delivered",
    departedAt: "2026-02-19T07:00:00Z",
    eta: "2026-02-19T11:00:00Z",
  },
  {
    id: "SH-005",
    plantCode: "PL-002",
    mode: "truck",
    originName: "Omaha Terminal",
    originRegion: "Nebraska, US",
    originLat: 41.2565,
    originLng: -95.9345,
    soybeanType: "Whole Soybean",
    quantityTonnes: 150,
    vehicleId: "TRK-3345",
    status: "in_transit",
    departedAt: "2026-02-21T04:00:00Z",
    eta: "2026-02-21T16:00:00Z",
  },
  // ── International (plane) ─────────────────────────────────
  {
    id: "SH-006",
    plantCode: "PL-001",
    mode: "plane",
    originName: "Santos Port Terminal",
    originRegion: "Sao Paulo, Brazil",
    originLat: -23.9608,
    originLng: -46.3336,
    soybeanType: "Soybean Meal",
    quantityTonnes: 2400,
    vehicleId: "FLT-AA712",
    status: "in_transit",
    departedAt: "2026-02-20T02:00:00Z",
    eta: "2026-02-22T10:00:00Z",
  },
  {
    id: "SH-007",
    plantCode: "PL-002",
    mode: "plane",
    originName: "Rosario Export Hub",
    originRegion: "Santa Fe, Argentina",
    originLat: -32.9468,
    originLng: -60.6393,
    soybeanType: "Whole Soybean",
    quantityTonnes: 1800,
    vehicleId: "FLT-UA305",
    status: "in_transit",
    departedAt: "2026-02-19T22:00:00Z",
    eta: "2026-02-22T06:00:00Z",
  },
  {
    id: "SH-008",
    plantCode: "PL-003",
    mode: "plane",
    originName: "Indore Soy Exchange",
    originRegion: "Madhya Pradesh, India",
    originLat: 22.7196,
    originLng: 75.8577,
    soybeanType: "Soybean Hull",
    quantityTonnes: 950,
    vehicleId: "FLT-DL118",
    status: "in_transit",
    departedAt: "2026-02-20T14:00:00Z",
    eta: "2026-02-23T08:00:00Z",
  },
];

/** Resolve a shipment's destination (US mill/plant) coordinates. */
export function getShipmentDestination(shipment: Shipment) {
  const plant = PLANTS.find((p) => p.code === shipment.plantCode);
  return plant ? { lat: plant.latitude, lng: plant.longitude } : null;
}

/**
 * Generate a curved arc between two points.
 * Arc height scales with distance.
 */
export function generateArc(
  startLng: number, startLat: number,
  endLng: number, endLat: number,
  steps = 50,
): [number, number][] {
  const dist = Math.sqrt((endLng - startLng) ** 2 + (endLat - startLat) ** 2);
  const arcHeight = Math.min(dist * 0.25, 12);
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lng = startLng + (endLng - startLng) * t;
    const lat = startLat + (endLat - startLat) * t + Math.sin(t * Math.PI) * arcHeight;
    coords.push([lng, lat]);
  }
  return coords;
}
