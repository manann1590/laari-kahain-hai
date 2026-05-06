import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageShell } from "@/components/layout/PageShell";

export default function NotFound() {
  return (
    <PageShell>
      <EmptyState
        title="Vendor not found"
        description="This listing may still be pending review, rejected, or unavailable."
        action={<Button href="/map">Return to map</Button>}
      />
    </PageShell>
  );
}
