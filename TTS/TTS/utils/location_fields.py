"""Read/write city, state, country on tables that may use JSON location and/or dedicated columns."""
from __future__ import annotations

import json
from typing import Any, Dict, Optional, Tuple


def _table_has_column(table: str, column: str, cache: Dict[str, bool]) -> bool:
    key = f"{table}.{column}"
    if key not in cache:
        try:
            import pyodbc
            from config.settings import settings

            with pyodbc.connect(settings.database_connection_string) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT COL_LENGTH(?, ?)",
                    f"dbo.{table}",
                    column,
                )
                row = cursor.fetchone()
                cache[key] = row is not None and row[0] is not None
        except Exception:
            cache[key] = False
    return cache[key]


_COLUMN_CACHE: Dict[str, bool] = {}


def parse_location_parts(
    location: Any = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    country: Optional[str] = None,
) -> Tuple[str, str, str]:
    loc = location
    if isinstance(loc, str):
        try:
            loc = json.loads(loc)
        except Exception:
            if "," in loc:
                parts = [p.strip() for p in loc.split(",", 1)]
                city = city or (parts[0] if parts else "")
                state = state or (parts[1] if len(parts) > 1 else "")
            loc = {}
    if isinstance(loc, dict):
        city = city or loc.get("city") or loc.get("location_city") or ""
        state = state or loc.get("state") or loc.get("location_state") or ""
        country = country or loc.get("country") or loc.get("location_country") or ""

    city = (city or "").strip()
    state = (state or "").strip()
    country = (country or "IN").strip() or "IN"
    return city, state, country


def enrich_row_location(
    data: Dict[str, Any],
    *,
    table: str,
    json_field: str = "location",
    city_col: str = "locationcity",
    state_col: str = "locationstate",
    country_col: str = "locationcountry",
) -> Dict[str, Any]:
    city, state, country = parse_location_parts(
        data.get(json_field),
        data.get(city_col),
        data.get(state_col),
        data.get(country_col),
    )
    data[json_field] = {"city": city, "state": state, "country": country}
    if _table_has_column(table, city_col, _COLUMN_CACHE):
        data[city_col] = city
        data[state_col] = state
        data[country_col] = country
    return data


def apply_location_to_payload(
    data: Dict[str, Any],
    *,
    table: str,
    json_field: str = "location",
    city_col: str = "locationcity",
    state_col: str = "locationstate",
    country_col: str = "locationcountry",
    city: Optional[str] = None,
    state: Optional[str] = None,
    country: Optional[str] = None,
) -> Dict[str, Any]:
    """Merge location into data dict for INSERT/UPDATE (JSON + optional dedicated columns)."""
    if table == "employers":
        city_col, state_col, country_col = "headquarterscity", "headquartersstate", "headquarterscountry"

    loc_in = data.pop(json_field, None)
    city, state, country = parse_location_parts(
        loc_in,
        city
        or data.pop(city_col, None)
        or data.pop("location_city", None)
        or data.pop("headquarters_city", None),
        state
        or data.pop(state_col, None)
        or data.pop("location_state", None)
        or data.pop("headquarters_state", None),
        country
        or data.pop(country_col, None)
        or data.pop("location_country", None)
        or data.pop("headquarters_country", None),
    )

    if table == "candidates":
        data[json_field] = json.dumps({"city": city, "state": state, "country": country})
    elif _table_has_column(table, json_field, _COLUMN_CACHE):
        combined = ", ".join(p for p in (city, state) if p)
        # employers.location is NOT NULL in production schema
        data[json_field] = combined if combined else ""

    if _table_has_column(table, city_col, _COLUMN_CACHE):
        data[city_col] = city or None
        data[state_col] = state or None
        data[country_col] = country or None

    return data


def enrich_employer_location(data: Dict[str, Any]) -> Dict[str, Any]:
    city, state, country = parse_location_parts(
        data.get("location"),
        data.get("headquarterscity"),
        data.get("headquartersstate"),
        data.get("headquarterscountry"),
    )
    combined = ", ".join(p for p in (city, state) if p)
    if combined:
        data["location"] = combined
    if _table_has_column("employers", "headquarterscity", _COLUMN_CACHE):
        data["headquarterscity"] = city
        data["headquartersstate"] = state
        data["headquarterscountry"] = country
    return data
