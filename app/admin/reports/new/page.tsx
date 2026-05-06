import type { Metadata } from "next";
import { requireAdmin } from "@/lib/data/admin";
import { createReportAction } from "@/app/admin/actions";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { AdminReportForm } from "@/components/admin/AdminReportForm";

export const metadata: Metadata = {
  title: "Add Vendor",
};

export default async function NewAdminReportPage() {
  await requireAdmin();

  return (
    <PageShell
      eyebrow="Admin"
      title="Add food vendor"
      description="Manually create a vendor listing from a verified photo and location. New listings start as pending until approved."
    >
      <Card variant="elevated">
        <AdminReportForm action={createReportAction} />
      </Card>
    </PageShell>
  );
}
