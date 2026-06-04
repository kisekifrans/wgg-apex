# WGG Apex — UI/UX Plan

**Version:** 1.0  
**Status:** Design documentation only — no implementation  
**Last updated:** 2026-06-04  
**Aligned with:** `PROJECT_SPECIFICATION.md`, `DATABASE_SCHEMA.md`

---

## 1. Design philosophy

WGG Apex should feel like a **premium SaaS product that happens to serve gamers** — not a gaming forum with a checkout button. The mental model is: *Linear’s clarity + Stripe’s trust + Raycast’s polish + Vercel’s restraint + Elgato’s hardware-grade finish*, applied to a dark boosting marketplace.

### 1.1 What we borrow from each reference

| Reference | Take | Avoid |
|-----------|------|--------|
| **Stripe** | Confident whitespace, pricing clarity, security cues, crisp forms | Over-corporate blandness |
| **Linear** | Dark layers, subtle borders, keyboard-first admin, status as first-class UI | Issue-tracker jargon in customer copy |
| **Raycast** | Glass depth, focused hero, command-palette energy in admin search | Literal command bar on marketing pages |
| **Vercel** | Typography hierarchy, grid discipline, performance-first layout | Developer-only inside jokes |
| **Elgato** | Product-grade surfaces, controlled accent glow, “pro gear” confidence | RGB circus, mascot energy |

### 1.2 Brand adjectives

**Yes:** Precise, calm, fast, trustworthy, professional, tactical (subtle).  
**No:** Childish, meme-heavy, neon overload, cluttered badges, aggressive “EPIC WIN” copy.

### 1.3 Experience principles

1. **Clarity over spectacle** — Rank tiers and prices are scannable in under 5 seconds.
2. **Trust at every step** — Stripe, SSL, refund policy, human support visible before pay.
3. **Progress is visible** — Order tracking feels like a shipment tracker, not a black box.
4. **Density where pros work** — Admin is information-dense; marketing is breathable.
5. **Motion with purpose** — Transitions confirm state; nothing bounces for fun.

---

## 2. Design system foundation

### 2.1 Color palette

**Base (background stack)**

| Token | Hex (reference) | Usage |
|-------|-----------------|--------|
| `bg-base` | `#09090B` | Page background |
| `bg-elevated` | `#0F0F12` | Sections, footer |
| `bg-subtle` | `#141418` | Alternating bands |

**Surfaces (cards, panels)**

| Token | Hex | Usage |
|-------|-----|--------|
| `surface-1` | `#18181B` | Primary cards |
| `surface-2` | `#1F1F23` | Hover / nested panels |
| `border-default` | `#27272A` | 1px hairlines |
| `border-subtle` | `#1C1C1F` | Dividers inside cards |

**Text**

| Token | Hex | Usage |
|-------|-----|--------|
| `text-primary` | `#FAFAFA` | Headlines, values |
| `text-secondary` | `#A1A1AA` | Body, descriptions |
| `text-tertiary` | `#71717A` | Labels, hints |
| `text-disabled` | `#52525B` | Disabled controls |

**Accent (single primary — pick one direction for build)**

| Option | Hex | Character |
|--------|-----|-----------|
| **Teal (recommended)** | `#2DD4BF` / hover `#14B8A6` | Modern, tech, Apex-adjacent without cliché |
| **Amber (alt)** | `#F59E0B` | Warm premium, Elgato-adjacent |

Use accent at **≤ 8% of visible pixels** on any screen. Secondary accent for status only (see §2.4).

**Semantic status colors** (muted, not neon)

| Status | Color | Use |
|--------|-------|-----|
| Success | `#22C55E` at 90% opacity on dark | Paid, completed |
| Warning | `#EAB308` muted | Paused, action needed |
| Error | `#EF4444` muted | Failed payment |
| Info | `#3B82F6` muted | In progress, neutral updates |

### 2.2 Typography

**Primary sans:** Geist Sans or Inter — UI, body, buttons.  
**Display (optional):** Geist Mono or a restrained geometric sans for H1 only — never more than one display face.  
**Monospace:** Geist Mono — order numbers (`WGG-2026-00042`), IDs, admin table keys.

| Scale | Size / line | Weight | Use |
|-------|-------------|--------|-----|
| Display | 48–56px / 1.05 | 600 | Homepage hero (desktop) |
| H1 | 36–40px / 1.1 | 600 | Page titles |
| H2 | 24–28px / 1.2 | 600 | Section headers |
| H3 | 18–20px / 1.3 | 500 | Card titles |
| Body | 15–16px / 1.6 | 400 | Paragraphs |
| Small | 13–14px / 1.5 | 400 | Captions, legal |
| Label | 12px / 1.4 | 500, +0.02em tracking | Form labels, table headers |

**Rules**

- Max line length: 65ch on marketing prose.
- Sentence case for UI; title case only for marketing H1/H2.
- Tabular nums for prices and order tables (`font-feature-settings: "tnum"`).

### 2.3 Glass & depth

Glass is a **premium layer**, not wallpaper.

**Glass panel recipe (conceptual)**

- Background: `surface-1` at 72% opacity over blurred backdrop
- `backdrop-blur`: 12–20px (marketing hero, nav, sticky summary)
- Border: 1px `rgba(255,255,255,0.06)` top highlight + `border-default` outer
- Shadow: soft `0 8px 32px rgba(0,0,0,0.4)` — no colored glow stacks

**Where to use glass**

- Sticky navigation after scroll
- Order page summary sidebar (desktop)
- Login card container
- Admin top bar (optional)

**Where not to use glass**

- Long-form readability blocks (FAQ answers)
- Data tables (admin) — solid surfaces for scanability
- Mobile checkout (performance + clarity → solid card)

### 2.4 Texture & atmosphere

- **Background:** Very subtle dot grid or noise at 2–3% opacity (Vercel/Linear style), not hexagons or circuit boards.
- **Hero accent:** Single soft radial gradient behind headline (teal/amber at 15% opacity, 600px blur).
- **Imagery:** Abstract rank iconography or minimalist legend silhouettes — desaturated, low contrast. No busy screenshots behind text.

### 2.5 Iconography & illustration

- **Icons:** Lucide-style, 1.5px stroke, 20–24px inline.
- **Service icons:** Simple geometric badges (trophy, trending arrow, target) — monochrome with accent on hover.
- **No:** Cartoon legends, meme stickers, pulsing skulls.

### 2.6 Motion

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Hover states | 150ms | ease-out |
| Page section reveal (marketing) | 200ms | ease-out, stagger 50ms |
| Stepper step change | 200ms | ease-in-out |
| Modal / sheet | 250ms | spring-light |
| Status timeline new event | 300ms | fade + slide 8px |

Respect `prefers-reduced-motion`: disable stagger and parallax.

### 2.7 Spacing & layout grid

- Base unit: **4px**
- Content max-width: **1200px** (marketing), **1400px** (admin)
- Section vertical rhythm: **80px** desktop / **48px** mobile between major blocks
- Card padding: **24px** desktop / **16px** mobile
- Form field gap: **16px**; group gap: **32px**

### 2.8 Core components (pattern library)

| Component | Behavior |
|-----------|----------|
| **Primary button** | Solid accent, 40–44px height, subtle inner highlight |
| **Secondary button** | Ghost + border, hover `surface-2` |
| **Input** | Dark inset surface, focus ring accent at 40% opacity |
| **Select / combobox** | Rank tier picker with search (Raycast-style filter) |
| **Stepper** | Horizontal on desktop order flow; compact dots on mobile |
| **Status badge** | Pill + icon + label; never color alone |
| **Timeline** | Vertical, left rail, monospace timestamps |
| **Data table** | Admin: zebra optional off; row hover `surface-2` |
| **Toast** | Top-right, glass, auto-dismiss 5s |
| **Skeleton** | Shimmer on `surface-2`, not white flash |

### 2.9 Voice & microcopy

- **Tone:** Direct, professional, reassuring. “Your booster is assigned” not “LET’S GOOO”.
- **Error example:** “We couldn’t calculate that rank range. Check your current and target tier.”
- **CTA examples:** “Get started”, “Continue to checkout”, “View order status”.

---

## 3. Global chrome (all pages)

### 3.1 Navigation (marketing + app shell)

**Desktop**

- Left: WGG wordmark + small “Apex” sublabel (muted)
- Center: Services, How it works, FAQ (marketing only)
- Right: Sign in (ghost) + **Get boosted** (primary)

**Scrolled state**

- Nav becomes glass bar, 64px height, bottom border `border-subtle`
- Slight backdrop blur

**Mobile**

- Hamburger → full-height sheet (solid `bg-elevated`, not glass)
- Sticky bottom CTA on service/order pages: “Continue” / price chip

### 3.2 Footer

Four columns (collapse to accordion on mobile):

1. Brand + one-line trust statement  
2. Services links  
3. Legal (Terms, Privacy, Refund)  
4. Support (email, Discord link Phase 2)

Bottom bar: © year, “Payments secured by Stripe”, social icons monochrome.

### 3.3 Authenticated app shell

- Slim sidebar (customer): Dashboard, Orders, Account
- Collapsed icons on tablet; bottom tab bar on mobile
- User menu: avatar, email, sign out

---

## 4. Homepage (`/`)

**Goal:** Establish premium trust, explain the offer in 10 seconds, route to service selection.  
**Primary conversion:** Click “Get boosted” or a featured service card.

### 4.1 Section: Hero

**Layout**

- Full viewport min-height **85vh** (not forced 100vh — avoids mobile URL bar jump)
- Two columns desktop: copy left (55%), visual right (45%)
- Single column mobile: copy first, visual below fold

**Content**

- **Eyebrow** (small, tertiary): “Professional Apex Legends boosting”
- **H1:** “Rank up with a team you can trust.” (or variant emphasizing discretion + speed)
- **Subhead** (secondary, max 2 lines): Transparent pricing, pro boosters, live order tracking — no scripts, no shortcuts that risk your account.
- **CTAs:** Primary “Browse services” + Secondary “How it works” (anchor scroll)
- **Trust strip** inline under CTAs: ★ rating aggregate, “Stripe checkout”, “SSL encrypted” — icons + micro labels

**Visual**

- Abstract glass card floating with **example order summary** (blurred gamertag): Rank Gold II → Platinum IV, ETA 3–5 days, $XX — demonstrates product without clutter
- Soft teal radial behind visual only

**Interaction**

- Hero text fades in on load (200ms); visual parallax **off** on mobile
- Primary CTA hover: subtle brightness, no scale bounce

### 4.2 Section: Social proof bar

**Layout:** Horizontal logo strip or metric chips — centered, `border-default` top/bottom.

**Content (3–4 chips)**

- “2,400+ orders completed” (placeholder until real data)
- “Avg. start time &lt; 2 hours”
- “Manual verification on every order”
- Optional: curated review score

**Design:** Monospace numbers, secondary labels — Elgato spec-sheet aesthetic.

### 4.3 Section: How it works

**Layout:** Three equal cards, icon on top, title, 2-line description.

| Step | Title | Copy direction |
|------|-------|----------------|
| 1 | Choose your service | Rank, RP, wins, or badges — upfront pricing. |
| 2 | Configure & pay | Secure checkout; you’ll confirm platform and goals. |
| 3 | Track to completion | Live status updates until your order is done. |

**Design:** Solid `surface-1` cards, not glass. Connector line between steps on desktop (dashed, tertiary).

### 4.4 Section: Featured services

**Layout:** Section H2 “Boosting services” + “View all” link → `/services`  
Grid: 2×2 desktop, 1-column mobile.

**Each card**

- Service name (H3)
- One-line description
- “From $XX” — monospace price
- ETA range chip (e.g. “3–7 days”)
- Hover: border brightens to accent at 30%, arrow appears
- Click → `/services/[slug]` or order start

**Services shown:** Rank Boost (featured/larger optional), RP, Win, Badge.

### 4.5 Section: Why WGG (differentiators)

**Layout:** Split — left sticky H2 on desktop, right stacked feature rows.

**Rows (icon + title + paragraph)**

- **Verified progress** — Status timeline on every order.
- **Transparent pricing** — Server-calculated quotes, no checkout surprises.
- **Account safety** — Clear policies; optional duo/play-with-booster modes explained honestly.
- **Human support** — Real ops team, not a ticket black hole.

**Tone:** Factual, no superlatives like “#1 cheapest”.

### 4.6 Section: Testimonials

**Layout:** Carousel or 2-column cards, glass optional on cards only.

**Card content**

- Quote (2–3 sentences)
- Avatar placeholder or initials
- Rank achieved label (e.g. “Gold → Diamond”)
- No fake celebrity names

**Control:** Dots + swipe mobile; reduced motion = static grid of 2.

### 4.7 Section: FAQ preview

**Layout:** Accordion, 5–6 top questions, link “View all FAQ”.

**Topics:** Safety, timing, refunds, platform support, duo vs piloted, what you need to provide.

**Design:** Linear-style accordion — chevron rotate, content slide 200ms.

### 4.8 Section: Final CTA band

**Layout:** Full-width `bg-elevated`, centered copy.

- H2: “Ready to climb?”
- Primary CTA → `/services`
- Secondary: Contact support

### 4.9 Homepage — states & SEO

- **Loading:** Hero skeleton + service card skeletons
- **SEO block** (not visible as hero clutter): meta title/description in spec; on-page one H1 only
- **Empty testimonials:** Hide section until content exists

---

## 5. Services (`/services` + `/services/[slug]`)

### 5.1 Services index

**Goal:** Compare offerings and enter the correct order flow.

#### Header area

- H1: “Services”
- Subhead: Choose what you want to improve — prices update based on your selections.
- Optional filter chips (Phase 2): All | Rank | RP | Wins — MVP show all

#### Service grid

**Layout:** List-cards (Stripe pricing table feel) rather than playful tiles.

**Each row/card**

| Zone | Content |
|------|---------|
| Left | Icon + name + description (2 lines max) |
| Center | Bullet chips: Solo/Duo, All platforms, ETA range |
| Right | “From $XX” + chevron CTA “Configure” |

**Hover:** Row background `surface-2`, accent left border 2px.

#### Comparison strip (optional MVP+)

- Table: Service | Starting price | Typical ETA | Best for
- Sticky header on scroll for long lists

#### Bottom

- Help card: “Not sure which service?” → link to FAQ or contact

### 5.2 Service detail (`/services/[slug]`)

**Goal:** Persuade and push to order form with correct expectations.

#### Hero (service-specific)

- Breadcrumb: Services → Rank Boost
- H1: Service name
- Short value prop (2 lines)
- **From $XX** + “Price calculated at checkout”
- Primary CTA: “Start order” → `/order/[slug]` or anchored form
- Secondary: “Read refund policy”

#### Two-column layout (desktop)

**Left (60%)**

1. **What’s included** — checklist (ranked games played, progress reports, etc.)
2. **How pricing works** — plain language per service type
3. **Requirements** — Platform accounts, rank requirements, duo options
4. **FAQ** — 3–4 service-specific questions

**Right (40%) — sticky glass card**

- Mini order preview widget (disabled until configured): “Select tiers on next step”
- ETA estimate band
- Trust badges (Stripe, support response time)

#### Service-specific UX notes

| Service | Detail page emphasis |
|---------|-------------------|
| Rank Boost | Tier ladder visual (muted vertical step graphic) |
| RP Boost | RP band explainer |
| Win Boost | Per-win clarity, mode selector mention |
| Level Boost | Level delta calculator preview |
| Badge Boost | Grid of badge icons (monochrome), fixed prices |

#### Mobile

- Sticky bottom bar: price “From $XX” + “Start order”

---

## 6. Order Page (`/order/[slug]` or `/app/orders/new`)

**Goal:** Collect configuration, show live quote, advance to checkout with zero surprise pricing.  
**Layout paradigm:** **Stepper + live summary** (Stripe Checkout configuration feel).

### 6.1 Page header

- Breadcrumb: Services → Rank Boost → Configure
- H1: “Configure your order”
- Subtext: Step X of 4 — dynamic

### 6.2 Stepper structure

| Step | Name | Purpose |
|------|------|---------|
| 1 | Platform | PC / PlayStation / Xbox |
| 2 | Details | Service-specific (current rank, target rank, RP, wins, etc.) |
| 3 | Options | Duo, express priority, region, schedule notes |
| 4 | Review | Confirm + legal acknowledgments |

**Stepper UI**

- Desktop: horizontal with completed checkmarks (Linear-style)
- Mobile: compact progress bar + step title only
- Back navigation always available; state preserved

### 6.3 Step 1 — Platform

**Controls**

- Three large selectable tiles (not tiny radios)
- Each: platform icon, label, optional note (“Requires EA account login”)

**Validation**

- Required before continue
- Error inline under group if skipped

### 6.4 Step 2 — Details (service-specific)

**Rank Boost example**

- **Current rank:** Searchable combobox grouped by tier (Bronze IV … Predator)
- **Target rank:** Same component; filter to ranks above current only
- Visual mini-ladder between selections showing divisions to climb (muted, updates on change)

**RP / Win / Level**

- Numeric inputs with increment buttons
- Mode toggles where applicable (BR / Arenas)
- Real-time validation bounds from `service_tiers`

**Badge Boost**

- Selectable grid of badges with fixed prices

**Assistive copy**

- Tooltip icons: “Predator orders may require longer ETA”

### 6.5 Step 3 — Options

| Field | Control | Notes |
|-------|---------|-------|
| Region | Select | NA, EU, OCE, etc. |
| Duo / Piloted | Segmented control | Explain difference in 1 line each |
| Priority | Standard vs Express cards | Express shows $ modifier and ETA delta |
| Customer notes | Textarea | Placeholder: availability windows, legends preference |
| Policy ack | Checkbox | Required: account sharing terms + refund policy link |

### 6.6 Live summary panel (critical)

**Desktop:** Sticky right column, glass card.  
**Mobile:** Collapsible “Order summary” drawer above sticky CTA.

**Summary contents**

- Service name
- Configuration recap (From → To, platform, duo, priority)
- **Line items** with monospace amounts
- Subtotal, discounts (if any), **Total** large
- ETA estimate (range, e.g. “3–5 business days”)
- “Quote updates as you configure” footnote

**Quote states**

| State | UI |
|-------|-----|
| Calculating | Skeleton on price lines |
| Valid | Total highlighted accent |
| Invalid | Error message in summary + disabled CTA |
| Stale | Brief “Updating…” shimmer on price |

### 6.7 Step 4 — Review

- Read-only recap of all steps with “Edit” links per section
- Policy checkbox repeated if not locked from step 3
- Primary CTA: **Continue to checkout** (requires auth if guest — modal prompt)

### 6.8 Auth gate (if guest)

- Inline card: “Sign in to complete your order”
- Email magic link + Google/Discord OAuth buttons
- Copy: “We’ll save your configuration”

### 6.9 Error & edge states

- Invalid rank range → inline error on target field + summary message
- Session expired draft → toast + reload draft if possible
- Service inactive → redirect to services with banner

### 6.10 Accessibility

- Step changes announced to screen readers (`aria-live="polite"`)
- Focus management: focus first field on step enter
- All inputs labeled; combobox keyboard navigable

---

## 7. Checkout (`/app/checkout/[draftId]`)

**Goal:** Final confirmation before Stripe; maximize trust and reduce abandonment.

### 7.1 Layout

**Desktop:** Two columns — 55% review / 45% payment card  
**Mobile:** Single column, payment CTA sticky bottom

### 7.2 Left column — Order review

- H1: “Checkout”
- Order number preview if allocated, else “Draft order”
- Full configuration recap (same as order step 4)
- Editable link: “Edit configuration” → back to order form with draft id

**Line items table**

- Description | Qty | Amount — right-aligned monospace

**Totals block**

- Subtotal, discount, tax (if ever), **Total due today** (largest text on page)

### 7.3 Right column — Payment card (solid surface)

**Contents**

- H2: “Payment”
- Accepted methods pictogram: Card, Apple Pay, Google Pay (via Stripe)
- Primary button: **Pay $XXX.XX** — full width, 48px height
- Under button: “You’ll be redirected to Stripe’s secure checkout”
- Security copy: lock icon + “256-bit SSL” + Stripe wordmark
- Links: Refund policy, Terms

**Not on page**

- Card input fields (Stripe hosted) — never embed PAN in WGG UI

### 7.4 Trust sidebar elements

- Support email with “Typical reply under 2h”
- What happens next: numbered list (Pay → Confirmation email → Booster assigned → Track in dashboard)

### 7.5 Checkout states

| State | Experience |
|-------|------------|
| Loading draft | Full-page skeleton |
| Draft expired | Empty state + CTA “Start new order” |
| Creating session | Button loading spinner, disabled double-click |
| Redirecting | Overlay “Redirecting to secure checkout…” |
| Cancel return (`/checkout/cancel`) | Banner “Payment cancelled” + retry + edit order |
| Success return | Redirect to success page (below) |

### 7.6 Success page (`/app/checkout/success`)

- Checkmark icon (muted green)
- H1: “Payment received”
- Order number monospace prominent
- CTA: “Track your order” → `/app/orders/[id]`
- Secondary: “Back to dashboard”
- Set expectations: “We’ll email you when your order is assigned.”

---

## 8. Order Tracking (`/app/orders/[id]` + optional `/track/[token]`)

**Goal:** Customer anxiety reduction — always know status, what’s next, and how to get help.

### 8.1 Page header

- Breadcrumb: Dashboard → Orders → `WGG-2026-00042`
- Order number (monospace) + copy-to-clipboard icon
- **Status hero** — large badge (icon + label + short description)

**Status hero copy examples**

| Status | Headline | Subtext |
|--------|----------|---------|
| paid | Payment confirmed | We’re preparing your order for assignment. |
| in_queue | In queue | You’re next — a booster will start soon. |
| in_progress | Boost in progress | Your order is actively being worked on. |
| paused | Temporarily paused | We’ve noted an issue — check updates below or contact support. |
| completed | Completed | Verify your rank in-game. We’d love your feedback. |

### 8.2 Progress stepper (horizontal)

Steps: Paid → Queued → In progress → Completed  
- Completed steps: accent check  
- Current: accent ring pulse (subtle, respects reduced motion)  
- Future: tertiary

Paused overlays on current step without breaking layout.

### 8.3 Main content — two columns desktop

#### Left: Activity timeline (primary)

**Vertical timeline** (Linear/GitHub commit style)

Each event card:

- Timestamp (relative + absolute on hover)
- Title: status change or custom admin message
- Body: customer-visible message (if any)
- Icon by event type (system vs human update)

**Empty:** “No updates yet — you’ll see progress here soon.”

**Realtime (Phase 1.5):** New events slide in; toast “Order updated”.

#### Right: Order details card (solid)

- Service + configuration snapshot
- Platform, region, duo/priority
- ETA if set (`estimated_completion_at`)
- Total paid (masked partial refund note if applicable)
- **Actions:** Contact support (mailto or form), download receipt (Phase 2)

### 8.4 Public tracking (`/track/[token]`)

- Minimal header — WGG logo only, no account nav
- Same status hero + stepper + **customer-visible timeline only**
- No email, no internal notes, no payment amount optional (configurable privacy)
- CTA: “Create account to manage orders”

### 8.5 Mobile layout

- Status hero full width
- Stepper becomes vertical compact list
- Timeline first; details in accordion below

### 8.6 Edge states

- Refunded: banner + timeline event + link to refund policy
- Cancelled: muted hero, support CTA
- Long in_progress: empathetic copy, not alarmist

---

## 9. Admin Dashboard (`/admin` + child routes)

**Goal:** Ops speed — find orders, update status, add notes in minimal clicks.  
**Aesthetic:** Linear density + Raycast search — **no glass on tables**.

### 9.1 Global admin shell

**Layout**

- Fixed left sidebar 240px: Overview, Orders, Customers, Services, Payments, Settings
- Top bar: global search (orders by number, email), notifications bell (Phase 2), admin avatar

**Keyboard (Phase 1.5)**

- `⌘K` command palette: jump to order, change status

**Mobile**

- Sidebar → hamburger; tables become card lists

### 9.2 Overview (`/admin`)

#### KPI row (4 cards)

| KPI | Visualization |
|-----|----------------|
| Paid awaiting start | Number + link to filtered queue |
| In progress | Number |
| Completed today | Number |
| Revenue today | Monospace currency |

Cards: solid `surface-1`, sparkline optional (7-day).

#### Recent activity feed

- Last 10 status changes across orders — click → order detail

#### Quick actions

- “View paid queue”, “Create manual order” (Phase 2)

### 9.3 Orders queue (`/admin/orders`)

**Primary workspace — optimize for scan speed.**

#### Toolbar

- Search input (order #, email)
- Filters: Status (multi), Service, Platform, Priority, Date range
- Sort: Oldest paid first (default), Created desc, Total desc
- Export CSV (Phase 2)

#### Table columns

| Column | Width | Content |
|--------|-------|---------|
| Order | fixed | Monospace number, link |
| Customer | flex | Name + email truncated |
| Service | flex | Rank Boost + tier shorthand |
| Platform | narrow | Icon |
| Total | narrow | Right-aligned |
| Status | medium | Badge |
| Created | narrow | Relative time |
| Actions | icon | Chevron |

**Row hover:** `surface-2`; click row → detail (except actions menu).

**Bulk actions (Phase 2):** Select rows → change status.

**Empty queue:** Illustration minimal + “No orders match filters”.

#### Status badge colors

Use semantic colors from §2.1 — always paired with text label.

### 9.4 Order detail (`/admin/orders/[id]`)

**Layout:** Three zones — header, main split, footer actions.

#### Header

- Order number + status badge (editable dropdown inline)
- Customer link → customer profile
- Timestamps: created, paid, ETA
- Flags: fraud review, VIP (chip from `internal_flags`)

#### Main — 60/40 split

**Left column**

1. **Configuration panel** — read-only snapshot from `order_items.configuration`
2. **Status update form**
   - New status select
   - Customer-visible message textarea
   - Checkbox: “Notify customer via email”
   - Button: “Update status” → appends `status_updates`
3. **Timeline** — all events including internal-only (muted badge “Internal”)

**Right column**

1. **Customer card** — email, discord, order history link
2. **Payment card** — Stripe IDs (copy), amount, link to Stripe Dashboard
3. **Assignment** (Phase 1.5) — booster select
4. **Admin notes**
   - List reverse chronological
   - Add note: textarea + pin option
   - Notes never shown to customer

#### Footer action bar (sticky)

- Secondary: Issue refund (→ Stripe)
- Primary: Save status (if form dirty)

### 9.5 Customers (`/admin/customers/[id]`)

- Profile summary + lifetime orders + total spend
- Table of past orders
- Admin-only notes on customer (Phase 2)

### 9.6 Services admin (`/admin/services`)

- List services with active toggle
- Edit tiers inline table (sort order, code, name)
- Pricing matrix editor (from/to → price) — spreadsheet-like, monospace cells

### 9.7 Payments (`/admin/payments`)

- Filter by status, date
- Row: order #, amount, Stripe PI, status, created
- Actions: View in Stripe, refund

### 9.8 Settings (`/admin/settings`)

- General: business name, support email
- Notifications: toggle templates (Phase 2)
- Tabbed, boring on purpose — Stripe settings vibe

### 9.9 Admin — empty, loading, permissions

- **Loading:** Table skeleton rows
- **403:** “You don’t have access” — clean, no stack trace
- **Optimistic UI:** Status update shows pending spinner until server confirms

---

## 10. Login (`/login` + auth callbacks)

**Goal:** Fast, trustworthy auth with minimal friction before checkout.

### 10.1 Layout

- Centered card max-width **400px** on `bg-base`
- Subtle radial accent behind card (same as homepage)
- Glass card container with logo on top

### 10.2 Content

- H1: “Sign in to WGG Apex”
- Subtext: “Track orders and complete secure checkout.”
- **OAuth buttons:** Google, Discord (stacked, full width, brand icons allowed but desaturated buttons dark-themed)
- Divider: “or continue with email”
- Email input + “Send magic link” primary button
- Legal footnote: “By continuing you agree to Terms and Privacy” — links

### 10.3 States

| State | UI |
|-------|-----|
| Default | Form ready |
| Sending link | Button loading |
| Email sent | Replace form with success message + “Check your inbox” + resend cooldown |
| Error | Inline alert banner on card |
| Redirect after login | Return to checkout or `redirectTo` query param |

### 10.4 Register vs login

- Single page — no separate “sign up” for MVP
- Copy: “New here? Enter your email — we’ll create your account.”

### 10.5 Security UX

- No password fields in MVP — reduces breach surface; communicate magic link security tip: “Link expires in 15 minutes”

### 10.6 Mobile

- Card full-width with 16px margin; OAuth buttons 48px touch height

---

## 11. Customer dashboard (`/app/dashboard`) — supporting page

Brief inclusion for continuity:

- **Welcome** + active order count
- **Active orders** cards: status, service, ETA, CTA track
- **Past orders** collapsed list
- **Empty:** CTA “Browse services”

Matches order tracking visual language.

---

## 12. Responsive breakpoints

| Token | Width | Behavior summary |
|-------|-------|------------------|
| `sm` | 640px | Single column, bottom CTAs |
| `md` | 768px | Sidebar collapses (app) |
| `lg` | 1024px | Two-column order + checkout |
| `xl` | 1280px | Max-width content centers |
| `2xl` | 1536px | Admin tables breathe |

**Touch targets:** Minimum 44×44px on all interactive elements.

---

## 13. Accessibility checklist (global)

- WCAG 2.1 AA contrast on `text-secondary` against `surface-1`
- Visible focus rings (accent outline 2px offset)
- Status never by color alone — icon + text
- Form errors linked with `aria-describedby`
- Skip link: “Skip to main content”
- Admin tables: proper `<th scope="col">` and caption for screen readers

---

## 14. Email & notification UI (cross-channel)

Transactional emails mirror dark UI:

- Black background `#09090B`, card `#18181B`
- Monospace order number
- Primary CTA button accent color
- Plain-text fallback required

Templates: Order confirmed, Status changed, Payment failed, Completed.

---

## 15. Page map & priority

| Priority | Page | Fidelity for MVP |
|----------|------|------------------|
| P0 | Homepage | High |
| P0 | Services index + detail | High |
| P0 | Order Page | High |
| P0 | Checkout + Success | High |
| P0 | Login | Medium |
| P0 | Order Tracking | High |
| P0 | Admin Orders + Detail | High |
| P1 | Admin Overview | Medium |
| P1 | Customer Dashboard | Medium |
| P2 | Public tracking token | Medium |

---

## 16. Design deliverables (pre-development)

Before implementation, produce:

1. **Figma library** — tokens, components (§2.8), 5 breakpoints
2. **Wireframes** — all P0 pages grayscale
3. **High-fidelity mocks** — Homepage, Order, Checkout, Tracking (dark + glass)
4. **Prototype** — Order stepper → checkout happy path
5. **Content doc** — final microcopy for heroes, statuses, errors

---

## 17. Open design decisions

| # | Question | Recommendation |
|---|----------|----------------|
| 1 | Primary accent: teal vs amber? | Teal — more SaaS; amber if brand leans Elgato-warm |
| 2 | Display font for H1? | Geist Sans only for MVP — add display later |
| 3 | Booster persona in UI Phase 1? | Hide until portal exists |
| 4 | Show gamertag on tracking? | Yes, customer-provided label only — never password |
| 5 | Live chat widget? | Phase 2 — footer email sufficient for MVP |

---

*End of UI/UX plan. No code generated per project directive.*
