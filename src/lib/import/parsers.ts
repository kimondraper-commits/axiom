import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { ParsedFile, ColumnSample, RawRow } from "./types";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export async function parseCSV(file: File): Promise<ParsedFile> {
  if (file.size > MAX_FILE_SIZE) throw new Error("File exceeds 50 MB limit.");

  return new Promise((resolve, reject) => {
    Papa.parse<RawRow>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete(results) {
        const headers = results.meta.fields ?? [];
        resolve({
          rows: results.data,
          headers,
          rowCount: results.data.length,
          fileType: "csv",
          fileName: file.name,
          fileSizeBytes: file.size,
        });
      },
      error(err) {
        reject(new Error(err.message));
      },
    });
  });
}

export async function parseXLSX(file: File): Promise<ParsedFile> {
  if (file.size > MAX_FILE_SIZE) throw new Error("File exceeds 50 MB limit.");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        const wb = XLSX.read(data, { type: "array" });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<RawRow>(ws, { defval: null });
        const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
        resolve({
          rows,
          headers,
          rowCount: rows.length,
          fileType: "xlsx",
          fileName: file.name,
          fileSizeBytes: file.size,
        });
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Failed to parse XLSX file."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsArrayBuffer(file);
  });
}

export async function parseGeoJSON(file: File): Promise<ParsedFile> {
  if (file.size > MAX_FILE_SIZE) throw new Error("File exceeds 50 MB limit.");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const geojson = JSON.parse(text);
        const features = geojson.features ?? [];
        const rows: RawRow[] = features.map((f: { properties: RawRow; geometry?: { coordinates?: number[] } }) => {
          const props = f.properties ?? {};
          const coords = f.geometry?.coordinates;
          if (coords && coords.length >= 2) {
            props.longitude = coords[0];
            props.latitude = coords[1];
          }
          return props;
        });
        const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
        resolve({
          rows,
          headers,
          rowCount: rows.length,
          fileType: "geojson",
          fileName: file.name,
          fileSizeBytes: file.size,
        });
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Failed to parse GeoJSON file."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(file);
  });
}

export function parsePaste(text: string): ParsedFile {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("No data to parse.");

  const firstLine = trimmed.split("\n")[0];
  const delimiter = firstLine.includes("\t") ? "\t" : ",";

  const result = Papa.parse<RawRow>(trimmed, {
    header: true,
    delimiter,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const headers = result.meta.fields ?? [];
  return {
    rows: result.data,
    headers,
    rowCount: result.data.length,
    fileType: "paste",
    fileName: "pasted-data",
    fileSizeBytes: new Blob([text]).size,
  };
}

export function getColumnSamples(parsed: ParsedFile): ColumnSample[] {
  return parsed.headers.map((header) => {
    const values = parsed.rows
      .map((row) => row[header])
      .filter((v) => v !== null && v !== undefined && v !== "")
      .slice(0, 3) as (string | number | null)[];

    const inferredType = inferType(values);

    return { header, samples: values, inferredType };
  });
}

function inferType(values: (string | number | null)[]): "string" | "number" | "date" | "coordinate" {
  if (values.length === 0) return "string";

  const nonNull = values.filter((v) => v !== null);

  if (nonNull.every((v) => typeof v === "number")) {
    // Check coordinate range
    const nums = nonNull as number[];
    const allLat = nums.every((n) => n >= -90 && n <= 90);
    const allLng = nums.every((n) => n >= -180 && n <= 180);
    if (allLat && allLng && nums.some((n) => Math.abs(n) < 90)) return "coordinate";
    return "number";
  }

  const datePattern = /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/;
  if (nonNull.some((v) => typeof v === "string" && datePattern.test(String(v)))) return "date";

  return "string";
}
