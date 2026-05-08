import type { Metadata } from "next";
import { Clock3, LogIn, MapPinned, Send, ShieldCheck, Store } from "lucide-react";
import { loginPartnerAction, requestPartnerAction } from "@/app/partner/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Vendor Access",
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
  const vendorSteps = [
    { icon: LogIn, label: "Login with mobile and password" },
    { icon: Clock3, label: "Wait for admin approval" },
    { icon: MapPinned, label: "Add or change your food spot details" },
    { icon: ShieldCheck, label: "Public only after review" },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
        <section className="overflow-hidden rounded-lg border border-civic-line bg-civic-ink text-white shadow-soft">
          <div className="h-1 ticket-edge" aria-hidden="true" />
          <div className="p-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black text-white">
              <Store className="h-3.5 w-3.5" aria-hidden="true" />
              Vendor pass
            </p>
            <h1 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">
              One login. Admin approval. Then your live food spot.
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/75">
              Vendors use mobile number and password to enter the dashboard. Before approval,
              the dashboard becomes a waiting room. After approval, menu, location, phone,
              WhatsApp, website, and photos unlock.
            </p>

            <div className="mt-6 grid gap-3">
              {vendorSteps.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.07] px-3 py-3">
                  <Icon className="h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
                  <span className="text-sm font-bold text-white">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <Card
            variant="elevated"
            title="Vendor login"
            description="Use the mobile number and password you created for FoodRadar."
          >
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

          <Card
            variant="elevated"
            title="New vendor request"
            description="Create your vendor login first. Admin approval unlocks listing tools."
          >
            <form action={requestPartnerAction} className="grid gap-4">
              <Input label="Food spot name" name="business_name" required placeholder="Raju Bhai Cheese Vada Pav" />
              <Input label="Owner or manager name" name="owner_name" placeholder="Raju Bhai" />
              <Input label="Mobile number" name="mobile" required type="tel" autoComplete="tel" placeholder="+91 98765 43210" />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <Input label="Password" name="password" type="password" required autoComplete="new-password" helperText="Use at least 8 characters." />
                <Input label="Confirm password" name="confirm_password" type="password" required autoComplete="new-password" />
              </div>
              <Input label="WhatsApp number" name="whatsapp" type="tel" placeholder="Leave blank if same as mobile" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Area" name="area" placeholder="Satellite" />
                <Input label="District" name="district" defaultValue="Ahmedabad" />
              </div>
              <Input label="Address or landmark" name="address_text" placeholder="Near crossroad, park, school, etc." />
              <Button type="submit" className="w-full">
                <Send className="h-4 w-4" aria-hidden="true" />
                Request admin approval
              </Button>
            </form>
          </Card>
        </section>
      </div>
    </main>
  );
}
