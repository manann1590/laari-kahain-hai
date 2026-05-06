import { ISSUE_TYPES, STATUS_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function AdminFilters({
  status,
  issueType,
  search,
}: {
  status?: string;
  issueType?: string;
  search?: string;
}) {
  return (
    <form className="grid gap-3 rounded-lg border border-civic-line bg-civic-soft/85 p-3 shadow-sm sm:p-4 md:grid-cols-[1fr_1fr_2fr_auto]">
      <Select
        label="Status"
        name="status"
        defaultValue={status || "all"}
        options={[
          { value: "all", label: "All statuses" },
          ...Object.entries(STATUS_LABELS).map(([value, item]) => ({
            value,
            label: item.label,
          })),
        ]}
      />
      <Select
        label="Cuisine"
        name="issue_type"
        defaultValue={issueType || "all"}
        options={[
          { value: "all", label: "All cuisines" },
          ...Object.entries(ISSUE_TYPES).map(([value, item]) => ({
            value,
            label: item.label,
          })),
        ]}
      />
      <Input label="Search" name="search" defaultValue={search} placeholder="Area, district, address" />
      <Button type="submit" className="w-full self-end md:w-auto">
        Apply
      </Button>
    </form>
  );
}
