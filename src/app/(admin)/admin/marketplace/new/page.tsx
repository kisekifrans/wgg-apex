import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ListingForm } from "@/components/admin/marketplace/listing-form";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "New listing",
};

export default function NewMarketplaceListingPage() {
  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        render={<Link href="/admin/marketplace" />}
      >
        <ArrowLeft className="size-4" data-icon="inline-start" />
        Back to marketplace
      </Button>

      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Create account listing
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add images, pricing, rank, and platform details.
        </p>
      </div>

      <ListingForm mode="create" />
    </div>
  );
}
