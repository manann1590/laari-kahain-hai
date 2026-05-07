import type { Metadata } from "next";
import { LogIn } from "lucide-react";
import { loginPartnerAction } from "@/app/partner/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Partner Login",
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PartnerLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = getSingleParam(params.next) || "/partner/dashboard";
  const error = getSingleParam(params.error) === "invalid" ? "Invalid mobile number or password." : "";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-xs font-black uppercase tracking-wide text-civic-orange">Partner portal</p>
          <h1 className="mt-2 text-3xl font-black text-civic-text">Partner login</h1>
          <p className="mt-3 text-sm leading-6 text-civic-muted">
            Approved partners can add and track their FoodRadar listing.
          </p>
        </div>
        <Card variant="elevated" title="Sign in" description="Use the mobile number and password from your partner setup.">
          <form action={loginPartnerAction} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <Input label="Mobile number" name="mobile" type="tel" required autoComplete="tel" />
            <Input label="Password" name="password" type="password" required autoComplete="current-password" />
            {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-civic-red">{error}</p> : null}
            <Button type="submit" className="w-full">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Login
            </Button>
          </form>
        </Card>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button href="/partner" variant="secondary" className="w-full">
            Request access
          </Button>
          <Button href="/map" variant="outline" className="w-full">
            Public map
          </Button>
        </div>
      </div>
    </main>
  );
}
