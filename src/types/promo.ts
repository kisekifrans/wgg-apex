export type PromoCode = {
  id: string;
  code: string;
  description: string | null;
  discountCents: number;
  serviceSlug: string | null;
  isFeatured: boolean;
  maxRedemptions: number | null;
  redemptionCount: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FeaturedPromo = {
  code: string;
  description: string | null;
  discountCents: number;
  serviceSlug: string | null;
};
