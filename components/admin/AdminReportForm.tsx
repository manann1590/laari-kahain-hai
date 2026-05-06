"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Crosshair, ExternalLink, Save, ShieldAlert } from "lucide-react";
import { ISSUE_TYPES, SEVERITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { compressFormImage } from "@/lib/client/image-compression";
import { getCurrentCoordinates } from "@/lib/client/geolocation";
import type { Report } from "@/lib/supabase/types";
import { googleMapsLink, isValidLatLng } from "@/lib/geo";
import {
  ACCEPTED_UPLOAD_IMAGE_LABEL,
  ACCEPTED_UPLOAD_IMAGE_TYPES,
  MAX_UPLOAD_IMAGE_LABEL,
} from "@/lib/image-upload";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function SubmitButton({ label, isPreparing }: { label: string; isPreparing: boolean }) {
  const { pending } = useFormStatus();
  const isBusy = pending || isPreparing;
  return (
    <Button type="submit" disabled={isBusy}>
      <Save className="h-4 w-4" aria-hidden="true" />
      {isPreparing ? "Preparing..." : pending ? "Saving..." : label}
    </Button>
  );
}

export function AdminReportForm({
  report,
  action,
}: {
  report?: Report;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [latitude, setLatitude] = useState(report?.latitude?.toString() || "");
  const [longitude, setLongitude] = useState(report?.longitude?.toString() || "");
  const [locationError, setLocationError] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [imageError, setImageError] = useState("");
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const lat = Number(latitude);
  const lng = Number(longitude);
  const validLocation = Number.isFinite(lat) && Number.isFinite(lng) && isValidLatLng(lat, lng);
  const mapsHref = useMemo(() => (validLocation ? googleMapsLink(lat, lng) : "#"), [validLocation, lat, lng]);

  async function useCurrentLocation() {
    setLocationError("");

    setIsLocating(true);
    try {
      const position = await getCurrentCoordinates();
      setLatitude(position.coords.latitude.toFixed(7));
      setLongitude(position.coords.longitude.toFixed(7));
    } catch (error) {
      setLocationError(errorMessage(error));
    } finally {
      setIsLocating(false);
    }
  }

  async function submitWithCompressedImage(formData: FormData) {
    setImageError("");
    setIsPreparingImage(true);

    let preparedFormData: FormData;
    try {
      preparedFormData = await compressFormImage(formData, "image_file");
    } catch (error) {
      setImageError(errorMessage(error));
      setIsPreparingImage(false);
      return;
    }

    setIsPreparingImage(false);
    try {
      await action(preparedFormData);
    } finally {
      setIsPreparingImage(false);
    }
  }

  return (
    <form action={submitWithCompressedImage} className="space-y-6">
      <div className="rounded-lg border border-civic-amber/35 bg-civic-amber/10 p-4 text-sm text-civic-amber">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>
            Before publishing, ensure the image does not expose faces, vehicle plates,
            children, private documents, private property interiors, or harassment content.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Cuisine"
          name="issue_type"
          required
          defaultValue={report?.issue_type || "pothole"}
          options={Object.entries(ISSUE_TYPES).map(([value, item]) => ({
            value,
            label: item.label,
          }))}
        />
        <Select
          label="Review priority"
          name="severity"
          defaultValue={report?.severity || "medium"}
          options={Object.entries(SEVERITY_LABELS).map(([value, item]) => ({
            value,
            label: item.label,
          }))}
        />
        {report ? (
          <Select
            label="Status"
            name="status"
            defaultValue={report.status}
            options={Object.entries(STATUS_LABELS).map(([value, item]) => ({
              value,
              // De-duplicate labels by appending the key for same-label entries
              label: item.label,
            }))}
          />
        ) : null}
        <Input label="Vendor name" name="title" defaultValue={report?.title || ""} placeholder="Raju Bhai Cheese Vada Pav" />
        <Input label="Public phone" name="vendor_phone" type="tel" defaultValue={report?.vendor_phone || ""} />
        <Input label="WhatsApp" name="vendor_whatsapp" type="tel" defaultValue={report?.vendor_whatsapp || ""} />
        <Input label="Hours" name="hours_text" defaultValue={report?.hours_text || ""} placeholder="6 PM - 11 PM" />
        <Input label="Price range" name="price_range" defaultValue={report?.price_range || ""} placeholder="₹50-₹180" />
        <Input label="Search tags" name="cuisine_tags" defaultValue={report?.cuisine_tags || ""} placeholder="veg, spicy, late night" />
      </div>

      <Textarea
        label="Menu / description"
        name="description"
        defaultValue={report?.description || ""}
        helperText="Menu items, highlights, pricing notes, payment notes, and what customers should know."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Latitude"
          name="latitude"
          type="number"
          step="any"
          required
          value={latitude}
          onChange={(event) => setLatitude(event.target.value)}
          helperText="Use the latitude for the vendor's current or verified location."
        />
        <Input
          label="Longitude"
          name="longitude"
          type="number"
          step="any"
          required
          value={longitude}
          onChange={(event) => setLongitude(event.target.value)}
          helperText="Use the longitude for the vendor's current or verified location."
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={useCurrentLocation}
          disabled={isLocating}
          className="w-full sm:w-auto"
        >
          <Crosshair className="h-4 w-4" aria-hidden="true" />
          {isLocating ? "Getting location..." : "Use my current location"}
        </Button>
        <Button href={mapsHref} variant="secondary" aria-disabled={!validLocation} className="w-full sm:w-auto">
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Preview in Maps
        </Button>
        {!validLocation ? (
          <p className="text-sm text-red-700">Enter a valid latitude and longitude first.</p>
        ) : null}
        {locationError ? <p className="text-sm text-red-700">{locationError}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Address text" name="address_text" defaultValue={report?.address_text || ""} />
        <Input label="Area" name="area" defaultValue={report?.area || ""} />
        <Input label="District" name="district" defaultValue={report?.district || "Ahmedabad"} />
        <Input label="City" name="city" defaultValue={report?.city || "Ahmedabad"} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Image URL"
          name="image_url"
          type="url"
          defaultValue={report?.image_url || ""}
          helperText="Use this if the image is already hosted. Upload below otherwise."
        />
        <Input
          label="Upload image"
          name="image_file"
          type="file"
          accept={ACCEPTED_UPLOAD_IMAGE_TYPES}
          helperText={`${ACCEPTED_UPLOAD_IMAGE_LABEL} only. Resized before upload and limited to ${MAX_UPLOAD_IMAGE_LABEL}.`}
          error={imageError}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Submitter phone hash"
          name="reporter_phone_hash"
          defaultValue={report?.reporter_phone_hash || ""}
          helperText="Optional. Never store raw phone numbers."
        />
        {report ? (
          <Input
            label="Duplicate of listing ID"
            name="duplicate_of"
            defaultValue={report.duplicate_of || ""}
          />
        ) : null}
      </div>

      <Textarea
        label="Admin notes"
        name="admin_notes"
        defaultValue={report?.admin_notes || ""}
        helperText="Internal only. This is never shown publicly."
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button href="/admin" variant="secondary" className="w-full sm:w-auto">
          Cancel
        </Button>
        <SubmitButton label={report ? "Save changes" : "Create vendor"} isPreparing={isPreparingImage} />
      </div>
    </form>
  );
}
