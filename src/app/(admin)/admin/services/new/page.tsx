import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ServiceForm } from "@/components/admin/services/service-form";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "New service",
};

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        render={<Link href="/admin/services" />}
      >
        <ArrowLeft className="size-4" data-icon="inline-start" />
        Back to services
      </Button>

      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Add service
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new product line, then add pricing rows on the edit screen.
        </p>
      </div>

      <ServiceForm mode="create" />
    </div>
  );
}
