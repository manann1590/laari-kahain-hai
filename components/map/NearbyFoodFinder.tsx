"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Crosshair,
  ExternalLink,
  LocateFixed,
  MapPin,
  Navigation,
  SlidersHorizontal,
} from "lucide-react";
import { FOOD_CATEGORIES, FOOD_CATEGORY_VALUES } from "@/lib/constants";
import { getCurrentCoordinates } from "@/lib/client/geolocation";
import { distanceMeters, googleMapsLink, isValidLatLng } from "@/lib/geo";
import { categoryLabel, type Locale } from "@/lib/i18n";
import type { FoodCategory, PublicReport } from "@/lib/supabase/types";
import { titleFromLocation } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type NearbyFoodFinderProps = {
  reports: PublicReport[];
  locale: Locale;
};

type UserLocation = {
  latitude: number;
  longitude: number;
};

const defaultCategories = [
  "chaat_snacks",
  "tea_coffee",
  "meals_thali",
  "fast_food",
] satisfies FoodCategory[];

const radiusOptions = [1, 2, 3, 5, 8, 12] as const;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Could not capture your location.";
}

function formatDistance(meters: number) {
  if (meters < 950) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(meters < 5000 ? 1 : 0)} km`;
}

export function NearbyFoodFinder({ reports, locale }: NearbyFoodFinderProps) {
  const [selectedCategories, setSelectedCategories] = useState<FoodCategory[]>(defaultCategories);
  const [radiusKm, setRadiusKm] = useState(3);
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [latitudeInput, setLatitudeInput] = useState("");
  const [longitudeInput, setLongitudeInput] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const selectedCategorySet = useMemo(() => new Set(selectedCategories), [selectedCategories]);
  const suggestions = useMemo(() => {
    if (!location) return [];

    return reports
      .map((report) => ({
        report,
        distance: distanceMeters(location, {
          latitude: report.latitude,
          longitude: report.longitude,
        }),
      }))
      .filter(({ report, distance }) => {
        const matchesCategory = selectedCategorySet.size === 0 || selectedCategorySet.has(report.category);
        return matchesCategory && distance <= radiusKm * 1000;
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 8);
  }, [location, radiusKm, reports, selectedCategorySet]);

  const hasValidManualLocation = (() => {
    const latitude = Number(latitudeInput);
    const longitude = Number(longitudeInput);
    return Number.isFinite(latitude) && Number.isFinite(longitude) && isValidLatLng(latitude, longitude);
  })();

  async function captureLocation() {
    setLocationError("");
    setIsLocating(true);
    try {
      const position = await getCurrentCoordinates();
      const nextLocation = {
        latitude: Number(position.coords.latitude.toFixed(7)),
        longitude: Number(position.coords.longitude.toFixed(7)),
      };
      setLocation(nextLocation);
      setLatitudeInput(nextLocation.latitude.toString());
      setLongitudeInput(nextLocation.longitude.toString());
    } catch (error) {
      setLocationError(errorMessage(error));
    } finally {
      setIsLocating(false);
    }
  }

  function useManualLocation() {
    const latitude = Number(latitudeInput);
    const longitude = Number(longitudeInput);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !isValidLatLng(latitude, longitude)) {
      setLocationError("Enter a valid latitude and longitude.");
      return;
    }

    setLocationError("");
    setLocation({ latitude, longitude });
  }

  function toggleCategory(category: FoodCategory) {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="border-b border-civic-line p-4 lg:border-b-0 lg:border-r">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-civic-orange text-white shadow-glow">
              <LocateFixed className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="font-black text-civic-text">Nearby Radar</h2>
              <p className="mt-1 text-sm leading-6 text-civic-muted">
                Capture your location, pick cravings, and set how far you are willing to go.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <Button type="button" onClick={captureLocation} disabled={isLocating} className="w-full">
              <Crosshair className="h-4 w-4" aria-hidden="true" />
              {isLocating ? "Capturing location..." : location ? "Refresh my location" : "Capture my location"}
            </Button>

            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <Input
                id="nearby-latitude"
                label="Latitude"
                type="number"
                step="any"
                value={latitudeInput}
                onChange={(event) => setLatitudeInput(event.target.value)}
                placeholder="23.0225"
              />
              <Input
                id="nearby-longitude"
                label="Longitude"
                type="number"
                step="any"
                value={longitudeInput}
                onChange={(event) => setLongitudeInput(event.target.value)}
                placeholder="72.5714"
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant={hasValidManualLocation ? "secondary" : "ghost"}
                  onClick={useManualLocation}
                  className="w-full sm:w-auto"
                >
                  Use
                </Button>
              </div>
            </div>

            {locationError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-civic-red">
                {locationError}
              </p>
            ) : null}
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="nearby-radius" className="text-sm font-black text-civic-text">
                Distance radius
              </label>
              <span className="rounded-full bg-civic-ink px-3 py-1 text-xs font-black text-white">
                {radiusKm} km
              </span>
            </div>
            <input
              id="nearby-radius"
              type="range"
              min="1"
              max="15"
              step="1"
              value={radiusKm}
              onChange={(event) => setRadiusKm(Number(event.target.value))}
              className="mt-3 w-full accent-civic-orange"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {radiusOptions.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRadiusKm(value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-bold transition",
                    radiusKm === value
                      ? "border-civic-orange bg-civic-orange text-white"
                      : "border-civic-line bg-white text-civic-text hover:border-civic-orange/50",
                  )}
                >
                  {value} km
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center gap-2 text-sm font-black text-civic-text">
              <SlidersHorizontal className="h-4 w-4 text-civic-orange" aria-hidden="true" />
              Food categories
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {FOOD_CATEGORY_VALUES.map((category) => {
                const selected = selectedCategorySet.has(category);
                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleCategory(category)}
                    className={cn(
                      "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition",
                      selected
                        ? "border-civic-orange bg-civic-orange text-white"
                        : "border-civic-line bg-white text-civic-text hover:border-civic-orange/50 hover:bg-civic-orange/10",
                    )}
                  >
                    {selected ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                    {categoryLabel(locale, category)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="min-w-0 p-4">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-black text-civic-text">Suggested near you</p>
              <p className="mt-1 text-xs leading-5 text-civic-muted">
                {location
                  ? `${suggestions.length} match${suggestions.length === 1 ? "" : "es"} inside ${radiusKm} km`
                  : "Capture or enter location to unlock nearby suggestions"}
              </p>
            </div>
            {location ? (
              <Button href={googleMapsLink(location.latitude, location.longitude)} variant="secondary" size="sm">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Your pin
              </Button>
            ) : null}
          </div>

          <div className="mt-4 space-y-3">
            {!location ? (
              <div className="rounded-lg border border-dashed border-civic-line bg-civic-bg p-5 text-center">
                <LocateFixed className="mx-auto h-7 w-7 text-civic-muted" aria-hidden="true" />
                <p className="mt-3 text-sm font-black text-civic-text">Your personal food radar is waiting</p>
                <p className="mt-1 text-sm leading-6 text-civic-muted">
                  Location stays in your browser. FoodRadar only uses it here to rank nearby spots.
                </p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-civic-line bg-civic-bg p-5 text-center">
                <p className="text-sm font-black text-civic-text">No matching spots in this radius yet</p>
                <p className="mt-1 text-sm leading-6 text-civic-muted">
                  Try widening the radius or selecting more categories.
                </p>
              </div>
            ) : (
              suggestions.map(({ report, distance }) => (
                <article
                  key={report.id}
                  className="rounded-lg border border-civic-line bg-white p-3 shadow-sm transition hover:border-civic-orange/40 hover:shadow-card"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={
                            FOOD_CATEGORIES[report.category].badge +
                            " inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold"
                          }
                        >
                          {categoryLabel(locale, report.category)}
                        </span>
                        <span className="rounded-full border border-civic-line bg-civic-bg px-2.5 py-1 text-xs font-black text-civic-text">
                          {formatDistance(distance)}
                        </span>
                      </div>
                      <h3 className="mt-2 truncate font-black text-civic-text">
                        {report.title || titleFromLocation(report.area, report.district)}
                      </h3>
                      <p className="mt-1 line-clamp-1 text-sm text-civic-muted">
                        {report.menu_text || report.description || titleFromLocation(report.area, report.district)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button href={`/reports/${report.id}`} variant="secondary" size="sm">
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        View
                      </Button>
                      <Button href={googleMapsLink(report.latitude, report.longitude)} size="sm">
                        <Navigation className="h-4 w-4" aria-hidden="true" />
                        Go
                      </Button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
