import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export function LoginForm({ next, error }: { next: string; error?: string }) {
  return (
    <Card variant="elevated" title="Sign in" description="Use the configured admin credentials from server environment variables.">
      <form className="space-y-4" action="/api/admin/login" method="post">
        <input type="hidden" name="next" value={next} />
        <Input label="Email" name="email" type="email" autoComplete="email" required />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {error ? <p className="rounded-md bg-violet-50 p-3 text-sm text-civic-red">{error}</p> : null}
        <p className="rounded-lg border border-civic-line bg-civic-bg p-3 text-xs leading-5 text-civic-muted">
          Review vendor listings for food relevance, image safety, and valid location before publishing.
        </p>
        <Button type="submit" className="w-full">
          <LogIn className="h-4 w-4" aria-hidden="true" />
          Login
        </Button>
      </form>
    </Card>
  );
}
