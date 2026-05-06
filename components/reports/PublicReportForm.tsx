"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useFormStatus } from "react-dom";
import {
  CakeSlice,
  CheckCircle2,
  Coffee,
  CookingPot,
  Crosshair,
  CupSoda,
  Dessert,
  ExternalLink,
  ImageOff,
  Moon,
  MapPin,
  Pizza,
  Sandwich,
  ShieldCheck,
  Soup,
  Store,
  Send,
  Utensils,
  X,
} from "lucide-react";
import { getCopy, categoryDescription, categoryLabel, type Locale } from "@/lib/i18n";
import { compressFormImage } from "@/lib/client/image-compression";
import { getCurrentCoordinates } from "@/lib/client/geolocation";
import { googleMapsLink, isValidLatLng } from "@/lib/geo";
import { parseGoogleMapsLink } from "@/lib/validators/report";
import {
  ACCEPTED_UPLOAD_IMAGE_TYPES,
  MAX_UPLOAD_IMAGE_LABEL,
} from "@/lib/image-upload";
import type { FoodCategory } from "@/lib/supabase/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";

const DRAFT_KEY = "lari_local_vendor_draft";

type DraftData = {
  category?: FoodCategory;
  title?: string;
  description?: string;
  vendor_phone?: string;
  vendor_whatsapp?: string;
  cuisine_tags?: string;
  price_range?: string;
  hours_text?: string;
  area?: string;
  district?: string;
  latitude?: string;
  longitude?: string;
};

function saveDraft(data: DraftData) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable in some environments
  }
}

function loadDraft(): DraftData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DraftData;
  } catch {
    return null;
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function SubmitButton({ isPreparing, locale }: { isPreparing: boolean; locale: Locale }) {
  const { pending } = useFormStatus();
  const t = getCopy(locale);
  const isBusy = pending || isPreparing;
  return (
    <Button type="submit" size="lg" disabled={isBusy} className="w-full sm:w-auto">
      <Send className="h-4 w-4" aria-hidden="true" />
      {isPreparing ? t.reportForm.preparingPhoto : pending ? t.reportForm.submitting : t.reportForm.submitReview}
    </Button>
  );
}

const issueOptions = [
  "chaat_snacks",
  "tea_coffee",
  "meals_thali",
  "fast_food",
  "south_indian",
  "desserts",
  "juice_shakes",
  "street_chinese",
  "breakfast",
  "late_night",
] as const;

const issueIcons: Record<FoodCategory, typeof MapPin> = {
  chaat_snacks: Sandwich,
  tea_coffee: Coffee,
  meals_thali: Utensils,
  fast_food: Pizza,
  south_indian: Soup,
  desserts: Dessert,
  juice_shakes: CupSoda,
  street_chinese: CookingPot,
  breakfast: CakeSlice,
  late_night: Moon,
  other: Store,
};

export function PublicReportForm({
  action,
  locale,
}: {
  action: (formData: FormData) => void | Promise<void>;
  locale: Locale;
}) {
  const t = getCopy(locale);
  const [selectedIssue, setSelectedIssue] = useState<FoodCategory>("chaat_snacks");
  const [vendorName, setVendorName] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorWhatsapp, setVendorWhatsapp] = useState("");
  const [cuisineTags, setCuisineTags] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [hoursText, setHoursText] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [area, setArea] = useState("");
  const [district, setDistrict] = useState("Ahmedabad");
  const [description, setDescription] = useState("");
  const [locationError, setLocationError] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [imageError, setImageError] = useState("");
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [mapsLinkInput, setMapsLinkInput] = useState("");
  const [mapsLinkMessage, setMapsLinkMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const lat = Number(latitude);
  const lng = Number(longitude);
  const validLocation = Number.isFinite(lat) && Number.isFinite(lng) && isValidLatLng(lat, lng);
  const mapsHref = useMemo(() => (validLocation ? googleMapsLink(lat, lng) : "#"), [validLocation, lat, lng]);

  // Restore draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      if (draft.category) setSelectedIssue(draft.category);
      if (draft.title) setVendorName(draft.title);
      if (draft.description) setDescription(draft.description);
      if (draft.vendor_phone) setVendorPhone(draft.vendor_phone);
      if (draft.vendor_whatsapp) setVendorWhatsapp(draft.vendor_whatsapp);
      if (draft.cuisine_tags) setCuisineTags(draft.cuisine_tags);
      if (draft.price_range) setPriceRange(draft.price_range);
      if (draft.hours_text) setHoursText(draft.hours_text);
      if (draft.area !== undefined) setArea(draft.area);
      if (draft.district !== undefined) setDistrict(draft.district);
      if (draft.latitude) setLatitude(draft.latitude);
      if (draft.longitude) setLongitude(draft.longitude);
      setDraftRestored(true);
    }
  }, []);

  // Autosave draft on every relevant change
  useEffect(() => {
    if (!draftRestored && !selectedIssue && !description && !area && !latitude && !longitude) return;
    saveDraft({
      category: selectedIssue,
      title: vendorName,
      description,
      vendor_phone: vendorPhone,
      vendor_whatsapp: vendorWhatsapp,
      cuisine_tags: cuisineTags,
      price_range: priceRange,
      hours_text: hoursText,
      area,
      district,
      latitude,
      longitude,
    });
  }, [selectedIssue, vendorName, description, vendorPhone, vendorWhatsapp, cuisineTags, priceRange, hoursText, area, district, latitude, longitude, draftRestored]);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function onPhotoChange(event: ChangeEvent<HTMLInputElement>) {
    setImageError("");
    const file = event.target.files?.[0];
    if (!file) {
      setPreviewUrl("");
      setFileName("");
      return;
    }

    setFileName(file.name);
    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
      return nextPreviewUrl;
    });
  }

  function clearPhoto() {
    setPreviewUrl("");
    setFileName("");
    setImageError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

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

  function parseMapsLink() {
    setMapsLinkMessage(null);
    const result = parseGoogleMapsLink(mapsLinkInput);
    if (result) {
      setLatitude(result.lat.toFixed(7));
      setLongitude(result.lng.toFixed(7));
      setMapsLinkMessage({ type: "success", text: t.reportForm.extracted });
    } else {
      setMapsLinkMessage({
        type: "error",
        text: t.reportForm.extractFailed,
      });
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
      clearDraft();
    } finally {
      setIsPreparingImage(false);
    }
  }

  return (
    <form action={submitWithCompressedImage} className="space-y-6">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <input type="hidden" name="category" value={selectedIssue} />

      <Card title="1. Vendor details" description="Tell people who you are, what to call you, and when to show up." className="p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Food truck / lari name · Required"
            name="title"
            required
            placeholder="Raju Bhai Cheese Vada Pav"
            value={vendorName}
            onChange={(event) => setVendorName(event.target.value)}
          />
          <Input
            label="Public phone number · Required"
            name="vendor_phone"
            required
            type="tel"
            placeholder="+91 98765 43210"
            value={vendorPhone}
            onChange={(event) => setVendorPhone(event.target.value)}
            helperText="Customers can call this number from your public listing."
          />
          <Input
            label="WhatsApp number"
            name="vendor_whatsapp"
            type="tel"
            placeholder="Leave blank to use same number"
            value={vendorWhatsapp}
            onChange={(event) => setVendorWhatsapp(event.target.value)}
          />
          <Input
            label="Open hours"
            name="hours_text"
            placeholder="6 PM - 11:30 PM, Mon-Sat"
            value={hoursText}
            onChange={(event) => setHoursText(event.target.value)}
          />
          <Input
            label="Price range"
            name="price_range"
            placeholder="₹50-₹180"
            value={priceRange}
            onChange={(event) => setPriceRange(event.target.value)}
          />
          <Input
            label="Search tags"
            name="cuisine_tags"
            placeholder="veg, cheesy, spicy, late night"
            value={cuisineTags}
            onChange={(event) => setCuisineTags(event.target.value)}
          />
        </div>
      </Card>

      <Card title={t.reportForm.chooseTitle} description={t.reportForm.chooseDescription} className="p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {issueOptions.map((issueType) => {
            const Icon = issueIcons[issueType];
            const selected = selectedIssue === issueType;
            return (
              <button
                key={issueType}
                type="button"
                onClick={() => setSelectedIssue(issueType)}
                className={`flex min-h-20 items-center gap-3 rounded-lg border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-civic-orange/20 ${
                  selected
                    ? "border-civic-orange bg-civic-orange/10 text-civic-text shadow-soft ring-1 ring-civic-orange/30"
                    : "border-civic-line bg-white text-civic-text hover:border-civic-orange/40 hover:bg-civic-bg"
                }`}
                aria-pressed={selected}
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-civic-orange text-white" : "bg-civic-orange/10 text-civic-orange"}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-bold">{categoryLabel(locale, issueType)}</span>
                  <span className={`mt-1 block text-xs leading-5 text-civic-muted`}>
                    {categoryDescription(locale, issueType)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card title={t.reportForm.photoTitle} description={t.reportForm.photoDescription} className="p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_0.9fr]">
          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-civic-text">{t.reportForm.photoOptional}</span>
            <input
              ref={fileInputRef}
              id="image_file"
              name="image_file"
              type="file"
              accept={ACCEPTED_UPLOAD_IMAGE_TYPES}
              capture="environment"
              required
              onChange={onPhotoChange}
              className="min-h-11 w-full rounded-lg border border-civic-line bg-white px-3 py-2 text-base text-civic-text outline-none transition placeholder:text-civic-muted focus:border-civic-orange focus:ring-2 focus:ring-civic-orange/20 file:mr-3 file:rounded-md file:border-0 file:bg-civic-orange file:px-3 file:py-1.5 file:text-sm file:font-black file:text-white sm:text-sm"
            />
            <p className="text-xs text-civic-muted">
              {t.reportForm.uploadHelp.replace("{max}", MAX_UPLOAD_IMAGE_LABEL)}
            </p>
            {imageError ? <p className="text-xs text-red-700">{imageError}</p> : null}
          </label>
          <div className="relative overflow-hidden rounded-lg border border-dashed border-civic-line bg-civic-bg">
            {previewUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt={t.reportForm.selectedPreviewAlt} className="h-52 w-full object-cover" />
                <button
                  type="button"
                  onClick={clearPhoto}
                  aria-label={t.reportForm.removePhoto}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </>
            ) : (
              <div className="flex h-52 flex-col items-center justify-center p-5 text-center">
                <ImageOff className="h-8 w-8 text-civic-muted" aria-hidden="true" />
                <p className="mt-3 text-sm font-black text-civic-text">{t.reportForm.noPhoto}</p>
                <p className="mt-1 text-xs leading-5 text-civic-muted">{t.reportForm.noPhotoCopy}</p>
              </div>
            )}
          </div>
        </div>
        {fileName ? <p className="mt-3 text-xs text-civic-muted">{t.reportForm.selected}: {fileName}</p> : null}
      </Card>

      <Card title={t.reportForm.pinTitle} description={t.reportForm.pinDescription} className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant={validLocation ? "success" : "secondary"}
            onClick={useCurrentLocation}
            disabled={isLocating}
            className="w-full sm:w-auto"
          >
            {validLocation ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <Crosshair className="h-4 w-4" aria-hidden="true" />}
            {isLocating ? t.reportForm.gettingLocation : validLocation ? t.reportForm.locationCaptured : t.reportForm.useMyLocation}
          </Button>
          {validLocation ? (
            <Button href={mapsHref} variant="ghost" className="w-full sm:w-auto">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              {t.reportForm.previewMaps}
            </Button>
          ) : null}
        </div>

        {/* Google Maps link / coordinates parser */}
        <div className="mt-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-civic-text">{t.reportForm.pasteMaps}</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={mapsLinkInput}
                onChange={(e) => {
                  setMapsLinkInput(e.target.value);
                  setMapsLinkMessage(null);
                }}
                placeholder={t.reportForm.mapsPlaceholder}
                className="h-11 flex-1 rounded-lg border border-civic-line bg-white px-3 text-base text-civic-text outline-none transition placeholder:text-civic-muted focus:border-civic-orange focus:ring-2 focus:ring-civic-orange/20 sm:text-sm"
              />
              <Button type="button" variant="secondary" onClick={parseMapsLink} className="shrink-0">
                {t.reportForm.parse}
              </Button>
            </div>
            {mapsLinkMessage ? (
              <p className={`text-xs ${mapsLinkMessage.type === "success" ? "text-civic-leaf" : "text-red-700"}`}>
                {mapsLinkMessage.text}
              </p>
            ) : null}
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input
            label={t.reportForm.latitudeRequired}
            name="latitude"
            type="number"
            step="any"
            required
            value={latitude}
            onChange={(event) => setLatitude(event.target.value)}
          />
          <Input
            label={t.reportForm.longitudeRequired}
            name="longitude"
            type="number"
            step="any"
            required
            value={longitude}
            onChange={(event) => setLongitude(event.target.value)}
          />
        </div>

        {!validLocation && (latitude || longitude) ? (
          <p className="mt-3 text-sm text-red-700">{t.reportForm.captureBeforeSubmit}</p>
        ) : null}
        {locationError ? <p className="mt-3 text-sm leading-6 text-red-700">{locationError}</p> : null}

        <div className="mt-5 rounded-lg border border-civic-line bg-civic-bg p-4">
          <p className="text-sm font-black text-civic-text">{t.reportForm.locationDetails}</p>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <Input
              label={t.common.area}
              name="area"
              placeholder={t.reportForm.areaPlaceholder}
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
            <Input
              label={t.common.district}
              name="district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
            <Input label={t.common.city} name="city" defaultValue="Ahmedabad" />
            <Input label={t.reportForm.addressLabel} name="address_text" placeholder={t.reportForm.addressPlaceholder} />
          </div>
        </div>
      </Card>

      <Card title={t.reportForm.describeTitle} description={t.reportForm.describeDescription} className="p-4 sm:p-5">
        <Textarea
          label={t.reportForm.descriptionRequired}
          name="description"
          required
          placeholder={t.reportForm.descriptionPlaceholder}
          helperText={t.reportForm.descriptionHelp}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="mt-4 rounded-lg border border-civic-orange/25 bg-civic-orange/8 p-4 text-sm leading-6 text-civic-text">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p>
              {t.reportForm.safetyCopy}
            </p>
          </div>
        </div>

        <div className="mt-5 hidden flex-col-reverse gap-3 sm:flex sm:flex-row sm:items-center sm:justify-end">
          <Button href="/map" variant="secondary" size="lg" className="w-full sm:w-auto">
            {t.common.viewMap}
          </Button>
          <SubmitButton isPreparing={isPreparingImage} locale={locale} />
        </div>
      </Card>

      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.6rem)] z-30 border-t border-civic-line bg-white/95 p-3 shadow-[0_-10px_30px_rgba(43,27,18,0.12)] backdrop-blur sm:hidden">
        <SubmitButton isPreparing={isPreparingImage} locale={locale} />
      </div>
    </form>
  );
}
