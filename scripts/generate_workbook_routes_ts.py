#!/usr/bin/env python3
"""Generate the React workbook route snapshot from the dry-run import JSON."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def numeric(value: Any) -> int | float:
    number = float(value)
    return int(number) if number.is_integer() else number


def route_row(route: dict[str, Any]) -> dict[str, Any]:
    prices = route["prices"]
    return {
        "id": f"wb-{int(route['source_row']):03d}-{route['route_code']}",
        "sourceRow": route["source_row"],
        "pickup": route["pickup_label"],
        "destination": route["destination_label"],
        "pickupAr": route["pickup_label_ar"],
        "destinationAr": route["destination_label_ar"],
        "sedanOneWay": numeric(prices["sedan"]["one_way"]),
        "sedanRoundTrip": numeric(prices["sedan"]["round_trip"]),
        "mpvOneWay": numeric(prices["mpv"]["one_way"]),
        "mpvRoundTrip": numeric(prices["mpv"]["round_trip"]),
        "minivanOneWay": numeric(prices["minivan"]["one_way"]),
        "minivanRoundTrip": numeric(prices["minivan"]["round_trip"]),
        "outboundTripName": route["outbound_trip_name"],
        "outboundTripNameAr": route["outbound_trip_name_ar"],
        "returnTripName": route["return_trip_name"],
        "returnTripNameAr": route["return_trip_name_ar"],
        "recommendedTripType": route["recommended_trip_type"],
        "roundTripClassification": route["round_trip_classification"],
        "airportFeeApplicable": route["airport_fee_applicable"],
        "permitRequired": route["permit_required"],
        "draftStatus": "confirmed",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json-in", default="build/luxride-workbook-import.json")
    parser.add_argument("--out", default="src/app/components/luxride/workbookRoutes.ts")
    args = parser.parse_args()

    payload = json.loads(Path(args.json_in).read_text(encoding="utf-8"))
    summary = payload["summary"]
    source_file = summary.get("source_file") or Path(summary["workbook"]).name
    meta = {
        "sourceFile": source_file,
        "sha256": summary["sha256"],
        "sheetName": summary["parsed_sheet"],
        "sourceRows": summary["raw_data_rows"],
        "confirmedRows": summary["valid_rows"],
        "provisionalRows": 0,
        "vehiclePricing": "exact_workbook_values",
    }
    rows = [route_row(route) for route in payload["routes"]]

    lines = [
        f"// Generated from {source_file}. Do not hand-edit route values.",
        "// Source values are exact workbook prices; no vehicle ratio derivation is used.",
        "",
        'export type WorkbookDraftStatus = "confirmed" | "provisional";',
        'export type WorkbookTripRecommendation = "one_way" | "round_trip";',
        'export type WorkbookRoundTripClassification = "overday" | "overnight";',
        "",
        "export interface WorkbookRouteRow {",
        "  id: string;",
        "  sourceRow: number;",
        "  pickup: string;",
        "  destination: string;",
        "  pickupAr: string;",
        "  destinationAr: string;",
        "  sedanOneWay: number;",
        "  sedanRoundTrip: number;",
        "  mpvOneWay: number;",
        "  mpvRoundTrip: number;",
        "  minivanOneWay: number;",
        "  minivanRoundTrip: number;",
        "  outboundTripName: string;",
        "  outboundTripNameAr: string;",
        "  returnTripName: string;",
        "  returnTripNameAr: string;",
        "  recommendedTripType: WorkbookTripRecommendation;",
        "  roundTripClassification: WorkbookRoundTripClassification;",
        "  airportFeeApplicable: boolean;",
        "  permitRequired: boolean;",
        "  draftStatus: WorkbookDraftStatus;",
        "}",
        "",
        "export const WORKBOOK_PRICE_LIST_META = "
        + json.dumps(meta, ensure_ascii=False, indent=2)
        + " as const;",
        "",
        "export const WORKBOOK_PRICE_LIST_ROWS = [",
    ]
    for index, row in enumerate(rows):
        comma = "," if index < len(rows) - 1 else ""
        lines.append("  " + json.dumps(row, ensure_ascii=False) + comma)
    lines.append("] satisfies WorkbookRouteRow[];")

    Path(args.out).write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {args.out} with {len(rows)} routes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
