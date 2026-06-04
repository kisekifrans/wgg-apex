import { z } from "zod";

export const marketplaceListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().max(5000).optional().nullable(),
  rankLabel: z.string().min(1, "Rank is required").max(80),
  rpLabel: z.string().max(80).optional().nullable(),
  platform: z.enum(["pc", "playstation", "xbox", "switch"]),
  priceDollars: z.coerce.number().positive("Price must be greater than 0"),
  heirloomCount: z.coerce.number().int().min(0).max(99),
  status: z.enum(["draft", "available", "reserved", "sold"]),
  isFeatured: z.coerce.boolean().optional().default(false),
  tags: z.string().optional().nullable(),
});

export type MarketplaceListingInput = z.infer<typeof marketplaceListingSchema>;

export function parseTags(tags: string | null | undefined): string[] {
  if (!tags?.trim()) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}
