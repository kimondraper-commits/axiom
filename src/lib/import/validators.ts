import type { RawRow } from "./types";

export interface RowError {
  row: number;
  field: string;
  message: string;
}

const NSW_LAT_MIN = -37.6;
const NSW_LAT_MAX = -28.1;
const NSW_LNG_MIN = 141.0;
const NSW_LNG_MAX = 153.7;

const NUMERIC_FIELDS = [
  "dwellings",
  "siteAreaHa",
  "constructionCostM",
  "greenSpaceHa",
  "commercialGfa",
  "buildingHeight",
  "storeys",
  "carParking",
];

export function validateProjectRow(row: RawRow, rowIndex: number): RowError[] {
  const errors: RowError[] = [];

  // title required
  if (!row.title || String(row.title).trim() === "") {
    errors.push({ row: rowIndex, field: "title", message: "Title is required." });
  }

  // at least one location field required
  const hasCity = row.city && String(row.city).trim() !== "";
  const hasAddress = row.address && String(row.address).trim() !== "";
  const hasLga = row.lga && String(row.lga).trim() !== "";
  if (!hasCity && !hasAddress && !hasLga) {
    errors.push({
      row: rowIndex,
      field: "city/address/lga",
      message: "At least one of city, address, or LGA is required.",
    });
  }

  // latitude NSW bounds
  if (row.latitude !== null && row.latitude !== undefined && row.latitude !== "") {
    const lat = Number(row.latitude);
    if (isNaN(lat) || lat < NSW_LAT_MIN || lat > NSW_LAT_MAX) {
      errors.push({
        row: rowIndex,
        field: "latitude",
        message: `Latitude ${lat} is outside NSW bounds (${NSW_LAT_MIN} to ${NSW_LAT_MAX}).`,
      });
    }
  }

  // longitude NSW bounds
  if (row.longitude !== null && row.longitude !== undefined && row.longitude !== "") {
    const lng = Number(row.longitude);
    if (isNaN(lng) || lng < NSW_LNG_MIN || lng > NSW_LNG_MAX) {
      errors.push({
        row: rowIndex,
        field: "longitude",
        message: `Longitude ${lng} is outside NSW bounds (${NSW_LNG_MIN} to ${NSW_LNG_MAX}).`,
      });
    }
  }

  // numeric fields must be >= 0
  for (const field of NUMERIC_FIELDS) {
    const val = row[field];
    if (val !== null && val !== undefined && val !== "") {
      const num = Number(val);
      if (isNaN(num) || num < 0) {
        errors.push({
          row: rowIndex,
          field,
          message: `${field} must be a non-negative number.`,
        });
      }
    }
  }

  return errors;
}
