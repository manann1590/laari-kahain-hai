import type { Metadata } from "next";
import { LoginForm } from "@/app/admin/login/LoginForm";
import { getSafeAdminRedirectPath } from "@/lib/data/admin";

export const metadata: Metadata = {
  title: "Admin Login",
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = getSafeAdminRedirectPath(getSingleParam(params.next));
  const error = getSingleParam(params.error) === "invalid" ? "Invalid admin email or password." : "";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-xs font-black uppercase tracking-normal text-civic-teal">Admin moderation</p>
          <h1 className="mt-2 text-3xl font-black text-civic-text">Admin access</h1>
          <p className="mt-3 text-sm leading-6 text-civic-muted">
            Admin access is required to review and publish vendor listings.
          </p>
        </div>
        <LoginForm next={next} error={error} />
      </div>
    </div>
  );
}
