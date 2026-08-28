import directory from "./location-data.json";

export type Location = {
  name: string;
  address: string;
  state: string;
  zip: string;
  slug: string;
  status?: "renovation" | "coming-soon";
  plannedFor?: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  hoursLabel?: string;
  opensAt?: number;
  closesAt?: number;
  coordinatePrecision?: "zip";
};

export const locations = directory.locations as Location[];
export const dataUpdatedAt = directory.updatedAt;
