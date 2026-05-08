import type { Metadata } from "next";
import { LockKeyhole, MapPinned, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Partner Required",
  description: "FoodRadar listings can only be created by approved partners.",
};

export default function NewPublicReportPage() {
  return (
    <PageShell
      eyebrow="Partner required"
      title="Only approved partners can list food spots"
      description="The public can search and view the FoodRadar map anytime. New listings are created from the partner dashboard after admin approval."
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <EmptyState
          icon={LockKeyhole}
          title="Listing is partner-gated"
          description="To keep the map trustworthy, FoodRadar no longer accepts open public listing submissions. Vendors log in with mobile and password, then admin approval unlocks listing tools."
          action={<Button href="/partner/login">Vendor login</Button>}
          secondaryAction={<Button href="/map" variant="secondary">Explore food map</Button>}
        />

        <div className="grid gap-4">
          <Card title="Why partner-gated?">
            <div className="space-y-4">
              {[
                [ShieldCheck, "Admin-approved supply", "Partners are reviewed before they can create listings."],
                [MapPinned, "Cleaner public map", "Customers see verified food spots instead of random or duplicate submissions."],
                [LockKeyhole, "Secure partner account", "Partners use mobile login and a private dashboard to manage their place."],
              ].map(([Icon, title, copy]) => (
                <div key={title as string} className="flex gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-civic-orange" aria-hidden="true" />
                  <div>
                    <p className="font-black text-civic-text">{title as string}</p>
                    <p className="mt-1 text-sm leading-6 text-civic-muted">{copy as string}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Button href="/map" variant="outline" className="w-full">
            Explore public food map
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
