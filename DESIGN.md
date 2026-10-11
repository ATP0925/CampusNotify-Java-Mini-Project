---
name: CampusNotify Design System
version: 1.0.0
archetype: Vercel / Stripe Enterprise Academic ERP
target: Web App & Mobile Responsive
primary_colors:
  dark:
    background: "#0b1120"
    surface: "#151e32"
    surface_hover: "#1c2742"
    border: "#27354f"
    text_primary: "#f8fafc"
    text_secondary: "#94a3b8"
    accent_primary: "#3b82f6"
    accent_hover: "#2563eb"
  light:
    background: "#f1f5f9"
    surface: "#ffffff"
    surface_hover: "#f8fafc"
    border: "#e2e8f0"
    text_primary: "#0f172a"
    text_secondary: "#475569"
    accent_primary: "#2563eb"
typography:
  display_font: "'Plus Jakarta Sans', system-ui, sans-serif"
  body_font: "'Plus Jakarta Sans', system-ui, sans-serif"
  mono_font: "'JetBrains Mono', monospace"
---

# CampusNotify (CNMS) — DESIGN.md

> **Official Visual Identity & UI Design System Specification**  
> *Grounded in Enterprise GovTech / Academic ERP Standards (Inspired by Vercel & Stripe Design Systems)*

---

## 1. Design Philosophy & Authentic Fit ("Sacha Reference")

### Why "Vercel + Stripe Enterprise" is the True Fit
CampusNotify is an **official academic and administrative notification system**. It deals with sensitive circulars, examination schedules, placement notices, and regulatory compliance (DPDP Act 2023).
- **No Gimmicks / No Slop**: Academic portals must never use playful gaming aesthetics or distracting bouncy animations.
- **High Information Density**: Faculty and students need to scan 10+ circulars in seconds. Clear visual hierarchy, departmental tagging, and tabular reference IDs are paramount.
- **Zero-Emoji Vector Precision**: Replaced playful raw emojis with 2px stroke, pixel-aligned SVG vector glyphs for authoritative governance.
- **Printable Formal Letterhead**: Academic notices require physical paper printability with university crest, seal watermark, and signature verification blocks.

---

## 2. Color Palette & Semantic System

### 2.1 Core Neutral & Background Tokens
| Token | Dark Mode (Default) | Light Mode | Usage |
| :--- | :--- | :--- | :--- |
| `--bg-page` | `#0b1120` (Deep Slate Navy) | `#f1f5f9` (Crisp Paper Tint) | Page backdrop |
| `--bg-card` | `#151e32` (Elevated Panel) | `#ffffff` (Pure White Card) | Notice cards, Modals, Tables |
| `--bg-card-hover` | `#1c2742` (Interactive Hover) | `#f8fafc` (Ghost Gray) | Card hover feedback |
| `--bg-subtle` | `#0f172a` (Subtle Recess) | `#f8fafc` (Muted Area) | Sidebar, Inset controls |
| `--border-color` | `#27354f` (1px Hairline) | `#e2e8f0` (Border Slate) | Structural division lines |

### 2.2 Departmental Identification Palette
Every academic division carries an immutable color signature across tags, badges, and filters:
- **Examination Cell**: `#f43f5e` (Rose) | Background: `rgba(244, 63, 94, 0.12)`
- **Academic Affairs**: `#3b82f6` (Indigo Blue) | Background: `rgba(59, 130, 246, 0.12)`
- **Training & Placement**: `#10b981` (Emerald) | Background: `rgba(16, 185, 129, 0.12)`
- **Dean's Office / Admin**: `#8b5cf6` (Royal Violet) | Background: `rgba(139, 92, 246, 0.12)`
- **Sports & Athletics**: `#f59e0b` (Amber Gold) | Background: `rgba(245, 158, 11, 0.12)`
- **Student Welfare / Events**: `#ec4899` (Fuchsia) | Background: `rgba(236, 72, 153, 0.12)`

### 2.3 Priority Signaling
- **Urgent**: `#ef4444` (Vivid Crimson) + Pulse beacon
- **High Priority**: `#f59e0b` (Caution Amber)
- **Routine Announcement**: `#3b82f6` (Informative Sapphire)

---

## 3. Typography Scale & Hierarchy

### Fonts
- **Primary / UI**: `'Plus Jakarta Sans'`, system-ui, -apple-system, sans-serif
- **Code & Reference Numbers**: `'JetBrains Mono'`, monospace (for `CNMS/2026/001` auditable IDs)

### Fluid CSS Clamp Typography
Layout dynamically scales without sudden jumps across mobile, tablet, and 4K displays:
```css
--font-2xs:  clamp(0.60rem, 1.4vw, 0.68rem); /* Micro metadata, stamps */
--font-xs:   clamp(0.68rem, 1.7vw, 0.75rem); /* Badges, pill tags */
--font-sm:   clamp(0.76rem, 1.9vw, 0.84rem); /* Body secondary, timestamp */
--font-base: clamp(0.85rem, 2.1vw, 0.94rem); /* Standard body text */
--font-md:   clamp(0.95rem, 2.4vw, 1.05rem); /* Subheadings, card titles */
--font-lg:   clamp(1.05rem, 2.8vw, 1.25rem); /* Section headers */
--font-xl:   clamp(1.20rem, 3.4vw, 1.45rem); /* Modal headers */
--font-2xl:  clamp(1.35rem, 4.0vw, 1.75rem); /* Hero title */
```

---

## 4. Layout, Spacing & Elevation

### Spacing Tokens
- Base unit: `4px`
- Paddings: `8px`, `12px`, `16px`, `24px`, `32px`

### Radii Hierarchy
- Inner buttons & badges: `6px` (`--radius-sm`)
- Standard cards & inputs: `10px` (`--radius-md`)
- Modals & parent hero containers: `14px` (`--radius-lg`)
- Pills & status dots: `9999px` (`--radius-full`)

### Elevation & Depth
- Light mode uses crisp 1px borders with subtle diffuse drop shadow: `0 4px 14px rgba(0,0,0,0.06)`
- Dark mode relies on border luminance (`#27354f`) rather than heavy drop shadows, maintaining clean OLED contrast.

---

## 5. UI Component Specifications

### 5.1 Circular Card
- **Header**: Top row with Ref No (`CNMS/2026/XXX` in monospace) + Department Pill Badge + Priority Beacon.
- **Body**: Title (font-weight: 700) + Clean excerpt + Issuing Authority Stamp.
- **Action Bar**: Read acknowledgement counter, official inquiry button, download attachment button, print letterhead action.

### 5.2 Zero-Access Privacy Gate
- Unauthenticated users receive a cryptographic privacy shield card.
- Visual elements: Frosted glass backdrop (`backdrop-filter: blur(12px)`), 256-bit lock crest, and immediate sign-in gateway button.

### 5.3 Official Letterhead View
- Formal university header with dual crest alignment.
- Watermarked background with subtle opacity (`0.04`).
- Authentic signature ledger at bottom right for Dean/Controller of Examinations.

---

## 6. Micro-Interactions & Animation Rules
- **Hover Transitions**: Maximum `200ms` with ease curve `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Card Lift**: Subtle `-2px` translateY on hover with border highlight transition.
- **Zero Motion Overload**: Strictly respect `prefers-reduced-motion` for accessibility (WCAG 2.2 AA compliance).
