import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import { setupPartnerAction } from "@/app/partner/actions";
import { getPartnerBySetupToken } from "@/lib/data/partners";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Partner Setup",
};

export default async function PartnerSetupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const token = params.token || "";
  const partner = await getPartnerBySetupToken(token).catch(() => null);

  if (!partner) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          icon={LockKeyhole}
          title="Setup link is invalid"
          description="This partner setup link may be expired, already used, or not approved by admin."
          action={<Button href="/partner">Request partner access</Button>}
          secondaryAction={<Button href="/partner/login" variant="secondary">Partner login</Button>}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Card
        variant="elevated"
        title={`Set up ${partner.business_name}`}
        description="Confirm your mobile number, create a password, and add the location customers should see."
      >
        <form action={setupPartnerAction} className="grid gap-4">
          <input type="hidden" name="token" value={token} />
          <Input label="Approved mobile number" name="mobile" type="tel" required autoComplete="tel" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Create password" name="password" type="password" required autoComplete="new-password" helperText="Use at least 8 characters." />
            <Input label="Confirm password" name="confirm_password" type="password" required autoComplete="new-password" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Area" name="area" defaultValue={partner.area || ""} placeholder="Satellite" />
            <Input label="District" name="district" defaultValue={partner.district || "Ahmedabad"} />
          </div>
          <Input label="Address or landmark" name="address_text" defaultValue={partner.address_text || ""} />
          <Button type="submit" size="lg" className="w-full">
            Activate partner account
          </Button>
        </form>
      </Card>
    </main>
  );
}
