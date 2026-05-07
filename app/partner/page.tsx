import type { Metadata } from "next";
import { CheckCircle2, ClipboardCheck, LockKeyhole, MapPinned, ShieldCheck } from "lucide-react";
import { requestPartnerAction } from "@/app/partner/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Partner Onboarding",
};

export default async function PartnerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const requested = params.requested === "1";

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg border border-civic-line bg-white p-6 shadow-card">
          <p className="inline-flex rounded-full border border-civic-orange/25 bg-civic-orange/10 px-3 py-1 text-xs font-black text-civic-orange">
            FoodRadar partners
          </p>
          <h1 className="mt-4 text-3xl font-black leading-tight text-civic-text sm:text-5xl">
            Partner-approved vendors can list on FoodRadar.
          </h1>
          <p className="mt-4 text-base leading-8 text-civic-muted">
            Public visitors can search the food map anytime. New food spots are added only by
            approved partners, then reviewed by admin before publishing.
          </p>
          <div className="mt-6 grid gap-3">
            {[
              [ClipboardCheck, "Request onboarding", "Send your business details and mobile number to the admin team."],
              [ShieldCheck, "Admin approval", "Admin verifies the partner request before account setup is allowed."],
              [MapPinned, "List your place", "Approved partners add their own location, menu, phone, and photo."],
              [LockKeyhole, "Secure access", "Mobile numbers are encrypted for storage and passwords are stored as salted hashes."],
            ].map(([Icon, title, copy]) => (
              <div key={title as string} className="flex gap-3 rounded-lg border border-civic-line bg-civic-bg p-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-civic-orange" aria-hidden="true" />
                <div>
                  <p className="font-black text-civic-text">{title as string}</p>
                  <p className="mt-1 text-sm leading-6 text-civic-muted">{copy as string}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href="/partner/login" variant="secondary" className="w-full sm:w-auto">
              Partner login
            </Button>
            <Button href="/map" variant="outline" className="w-full sm:w-auto">
              View public map
            </Button>
          </div>
        </section>

        {requested ? (
          <EmptyState
            icon={CheckCircle2}
            title="Partner request sent"
            description="Your request is waiting for admin review. Once approved, admin will share a secure setup link so you can create your partner account."
            action={<Button href="/partner/login">Partner login</Button>}
            secondaryAction={<Button href="/map" variant="secondary">Explore food map</Button>}
          />
        ) : (
          <Card
            variant="elevated"
            title="Request partner access"
            description="Only approved partners can create vendor listings on FoodRadar."
          >
            <form action={requestPartnerAction} className="grid gap-4">
              <Input label="Business or food spot name" name="business_name" required placeholder="Raju Bhai Cheese Vada Pav" />
              <Input label="Owner or manager name" name="owner_name" placeholder="Raju Bhai" />
              <Input label="Mobile number" name="mobile" required type="tel" placeholder="+91 98765 43210" />
              <Input label="WhatsApp number" name="whatsapp" type="tel" placeholder="Leave blank if same as mobile" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Area" name="area" placeholder="Satellite" />
                <Input label="District" name="district" defaultValue="Ahmedabad" />
              </div>
              <Input label="Address or landmark" name="address_text" placeholder="Near crossroad, park, school, etc." />
              <Button type="submit" size="lg" className="w-full">
                Send request to admin
              </Button>
            </form>
          </Card>
        )}
      </div>
    </main>
  );
}
