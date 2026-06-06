# WGG Apex — public asset map

| File | Section | Usage |
|------|---------|--------|
| `/logo/wgg.png` | Navbar, footer, login, admin sidebar, favicon | Official WGG lockup (`Logo` component); transparent backdrop for tab icon |
| `/images/wgg-brand-hero.png` | Hero / CTA (planned) | Wide brand banner; OG image candidate |
| `/ranks/predator.png` | Homepage `#badges` | Maps to catalog item **Apex Predator Badge** |
| `/badges/20kill.png` | Homepage `#badges` | Maps to catalog item **20 Kill Badge** |
| `/badges/4kdamage.png` | Homepage `#badges` | Maps to catalog item **4000 Damage Badge** |
| `/ranks/rookie.png` … `/ranks/predator.png` | `#rank-pricing`, hero preview, predator rank tracker, marketplace cards | Maps to tier name (Rookie, Bronze, Silver, Gold, Platinum, Diamond, Master, Predator) |
| `/images/wgg-brand-hero.png` | Hero (desktop), bottom CTA | Valkyrie + WGG banner behind order preview |
| `/heroes/thumbnail1.png` | Services **Ranked Boosting** card | Default; overridable in Admin → Services → Card thumbnail |
| `/heroes/thumbnail2.jpg` | Services **Predator Maintenance** card | Default; overridable in Admin → Services → Card thumbnail |
| `/heroes/thumbnail3.jpg` | Services **Badge Boosting** card | Default; overridable in Admin → Services → Card thumbnail |
| `/heroes/thumbnail4.jpg` | Services **Account Marketplace** card | Default; overridable in Admin → Services → Card thumbnail |
| `/heroes/thumbnail5.png` | Services **Apex Unban** card | Default; overridable in Admin → Services → Card thumbnail |
| `/heroes/thumbnail6.jpg` | Services **Duo Ranked Boost** card | Default; overridable in Admin → Services → Card thumbnail (`display_config.thumbnail_path`) |

## Rank tier files

| File | Catalog / usage |
|------|-----------------|
| `bronze.png` | Ranked boost tier **Bronze** |
| `silver.png` | **Silver** |
| `gold.png` | **Gold**, hero preview “Gold II” |
| `platinum.png` | **Platinum** |
| `diamond.png` | **Diamond**, hero preview “Diamond IV” |
| `master.png` | **Master** |
| `predator.png` | **Predator** tier + Predator maintenance plans |

Marketplace listings: first word of `rankLabel` is matched (e.g. “Diamond” from “Diamond II”).

## Favicon

- App icon: `src/app/icon.png` (copy of `logo/wgg.png` for Next.js metadata)
- Regenerate multi-size favicons: use [realfavicongenerator.net](https://realfavicongenerator.net/) with `public/logo/wgg.png`, then replace `src/app/icon.png` and add `favicon.ico` if needed.
