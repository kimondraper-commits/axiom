export type FileType = "csv" | "xlsx" | "geojson" | "paste";
export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";
export type DestinationGroup = "Projects" | "Calculators" | "GIS Maps" | "Analytics" | "Skip";
export type RawRow = Record<string, string | number | null>;

export interface ParsedFile {
  rows: RawRow[];
  headers: string[];
  rowCount: number;
  fileType: FileType;
  fileName: string;
  fileSizeBytes: number;
}

export interface ColumnSample {
  header: string;
  samples: (string | number | null)[];
  inferredType: "string" | "number" | "date" | "coordinate";
}

export interface FieldMapping {
  sourceColumn: string;
  destinationField: string | null;
  destinationGroup: DestinationGroup;
  confidence: ConfidenceLevel;
  samples: (string | number | null)[];
}

export interface CalcSummary {
  population: number;
  constructionFTEs: number;
  ongoingJobs: number;
  sustainabilityScore: number;
}

export interface ImportResult {
  importId: string;
  projectsCreated: number;
  projectsUpdated: number;
  errorCount: number;
  errors: { row: number; field: string; message: string }[];
  calcSummary: CalcSummary | null;
}
