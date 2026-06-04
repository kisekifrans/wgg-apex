import { z } from "zod";

import { PRICING_ENGINES } from "@/types/services";

export const serviceSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  shortDescription: z.string().max(300).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  pricingEngine: z.enum(PRICING_ENGINES),
  icon: z.string().min(1).max(40),
  href: z.string().min(1).max(200),
  priceLabel: z.string().max(80).optional().nullable(),
  isActive: z.coerce.boolean().optional().default(true),
  isFeatured: z.coerce.boolean().optional().default(false),
  features: z.string().optional().nullable(),
  thumbnailPath: z
    .string()
    .max(200)
    .optional()
    .nullable()
    .refine(
      (value) =>
        !value?.trim() ||
        (value.startsWith("/") && !value.includes("..")),
      "Thumbnail path must start with / (e.g. /heroes/thumbnail2.jpg)"
    ),
});

export const pricingItemSchema = z.object({
  name: z.string().min(1).max(120),
  subtitle: z.string().max(120).optional().nullable(),
  priceDollars: z.coerce.number().nonnegative("Price must be 0 or greater"),
  etaLabel: z.string().max(80).optional().nullable(),
  difficulty: z.string().max(40).optional().nullable(),
  features: z.string().optional().nullable(),
  isFeatured: z.coerce.boolean().optional().default(false),
  isActive: z.coerce.boolean().optional().default(true),
});

export function buildServiceDisplayConfig(input: {
  features?: string | null;
  thumbnailPath?: string | null;
}): { homepage_section?: string; features: string[]; thumbnail_path?: string } {
  const config: {
    homepage_section?: string;
    features: string[];
    thumbnail_path?: string;
  } = {
    features: parseFeatures(input.features),
  };
  const thumbnail = input.thumbnailPath?.trim();
  if (thumbnail) {
    config.thumbnail_path = thumbnail;
  }
  return config;
}

export function parseFeatures(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 20);
}
