/**
 * Manufacturing plants — origin points for shipments.
 * Blue markers on the map.
 */
export interface Plant {
  code: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  product: string;
}

export const PLANTS: Plant[] = [
  { code: "PL-001", name: "Decatur Soy Processing", state: "Illinois", latitude: 39.8403, longitude: -88.9548, product: "Soybean Meal" },
  { code: "PL-002", name: "Des Moines Crush Plant", state: "Iowa", latitude: 41.5868, longitude: -93.6250, product: "Soybean Oil & Meal" },
  { code: "PL-003", name: "Sidney Feed Mill", state: "Ohio", latitude: 40.2842, longitude: -84.1555, product: "Whole Soybean" },
];
