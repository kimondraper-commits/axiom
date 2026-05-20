import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  queryArcGISLayer,
  LAYER_URLS,
  buildZoneWhere,
  buildNumericWhere,
} from "@/lib/arcgis-query";
import {
  filterByStationDistance,
  parseStations,
} from "@/lib/aim/station-filter";
import { getCuratedTrainStations } from "@/lib/data-sources/tfnsw";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const searchSchema = z.object({
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  rules: z.object({
    zones: z.array(z.string()).optional(),
    minHeight: z.number().optional(),
    minFsr: z.number().optional(),
    minLotSize: z.number().optional(),
    maxStationDistKm: z.number().optional(),
  }),
  save: z
    .object({
      name: z.string().min(1),
    })
    .optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = searchSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { bbox, rules, save } = body;

  try {
    // Start with zone query as the base (most common filter)
    const queries: Promise<GeoJSON.FeatureCollection>[] = [];

    // 1. Zoning filter
    if (rules.zones && rules.zones.length > 0) {
      queries.push(
        queryArcGISLayer({
          url: LAYER_URLS.zoning,
          where: buildZoneWhere(rules.zones),
          bbox,
          outFields: [
            "SYM_CODE",
            "LAY_CLASS",
            "LGA_NAME",
            "EPI_NAME",
          ],
        })
      );
    } else {
      // No zone filter — fetch all zones in bbox
      queries.push(
        queryArcGISLayer({
          url: LAYER_URLS.zoning,
          bbox,
          outFields: [
            "SYM_CODE",
            "LAY_CLASS",
            "LGA_NAME",
            "EPI_NAME",
          ],
        })
      );
    }

    // 2. Height filter (enrichment — returned alongside zones)
    if (rules.minHeight !== undefined) {
      queries.push(
        queryArcGISLayer({
          url: LAYER_URLS.height,
          where: buildNumericWhere("MAX_B_H", ">=", rules.minHeight),
          bbox,
          outFields: ["MAX_B_H", "LAY_CLASS", "LGA_NAME"],
        })
      );
    }

    // 3. FSR filter
    if (rules.minFsr !== undefined) {
      queries.push(
        queryArcGISLayer({
          url: LAYER_URLS.fsr,
          where: buildNumericWhere("FSR", ">=", rules.minFsr),
          bbox,
          outFields: ["FSR", "LAY_CLASS", "LGA_NAME"],
        })
      );
    }

    // Run all queries in parallel
    const results = await Promise.all(queries);

    // Primary result is the zoning layer (index 0)
    let features = results[0].features;

    // If height/FSR filters were applied, we use their feature counts
    // to indicate how many matching areas exist (not spatial intersection —
    // that would require a full GIS engine). Instead, we return the zone
    // features and annotate with height/FSR availability.
    const heightFeatures = rules.minHeight !== undefined ? results[1]?.features ?? [] : [];
    const fsrFeatures = rules.minFsr !== undefined
      ? results[rules.minHeight !== undefined ? 2 : 1]?.features ?? []
      : [];

    // Annotate zone features with summary info
    features = features.map((f) => ({
      ...f,
      properties: {
        ...f.properties,
        zone: f.properties?.SYM_CODE,
        zoneClass: f.properties?.LAY_CLASS,
        lga: f.properties?.LGA_NAME,
        epiName: f.properties?.EPI_NAME,
        heightMatchesInArea: heightFeatures.length,
        fsrMatchesInArea: fsrFeatures.length,
      },
    }));

    // 4. Station distance filter (computed locally)
    if (rules.maxStationDistKm !== undefined) {
      const stationData = getCuratedTrainStations();
      const stations = parseStations(
        stationData.features.map((f) => [
          f.properties.name,
          f.geometry.coordinates[0],
          f.geometry.coordinates[1],
        ])
      );
      features = filterByStationDistance(
        features,
        stations,
        rules.maxStationDistKm
      );
    }

    const fc: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features,
    };

    // Save search if requested
    if (save) {
      await db.aimSearch.create({
        data: {
          userId: session.user.id!,
          name: save.name,
          filters: rules as any,
          resultCount: features.length,
        },
      });
    }

    return NextResponse.json({
      data: fc,
      meta: {
        total: features.length,
        heightMatches: heightFeatures.length,
        fsrMatches: fsrFeatures.length,
        bbox,
        rules,
      },
    });
  } catch (err) {
    console.error("[AIM] Search failed:", err);
    return NextResponse.json(
      { error: "AIM search failed" },
      { status: 500 }
    );
  }
}
