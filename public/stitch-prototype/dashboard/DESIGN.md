---
name: Bureau Infrastructure Logic
colors:
  surface: '#f9f9fe'
  surface-dim: '#dad9de'
  surface-bright: '#f9f9fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f8'
  surface-container: '#eeedf2'
  surface-container-high: '#e8e8ed'
  surface-container-highest: '#e2e2e7'
  on-surface: '#1a1c1f'
  on-surface-variant: '#43474f'
  inverse-surface: '#2f3034'
  inverse-on-surface: '#f1f0f5'
  outline: '#737780'
  outline-variant: '#c3c6d1'
  surface-tint: '#3a5f94'
  primary: '#001e40'
  on-primary: '#ffffff'
  primary-container: '#003366'
  on-primary-container: '#799dd6'
  inverse-primary: '#a7c8ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#381300'
  on-tertiary: '#ffffff'
  tertiary-container: '#592300'
  on-tertiary-container: '#d8885c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#a7c8ff'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#1f477b'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb690'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#723610'
  background: '#f9f9fe'
  on-background: '#1a1c1f'
  surface-variant: '#e2e2e7'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-sm:
    fontFamily: jetbrainsMono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is engineered for utility, precision, and institutional trust. It serves a Smart Street Lighting Knowledge Management System (KMS), where information density must be balanced with rapid scannability. 

The design style is **Corporate / Modern** with a focus on **Systematic Functionalism**. It avoids unnecessary decoration in favor of clear data hierarchy and structural integrity. The aesthetic reflects a tool used by engineers, government officials, and maintenance crews: reliable, high-contrast, and performant. Whitespace is used strategically to separate complex data sets, ensuring the interface feels organized even under heavy information loads.

## Colors
The palette is anchored by **Bureau Blue (#003366)**, a deep, professional navy that evokes authority and technical stability. 

- **Primary:** Used for main actions, navigation states, and branding.
- **Secondary:** A cool slate grey used for secondary actions and meta-information.
- **Status Colors:** These follow industry standards for immediate recognition. **Green** signifies "Approved" or "Active," **Yellow** indicates "Pending" or "In Review," and **Red** is reserved for "Alerts" or "System Failures."
- **Neutrals:** A range of cool grays provides depth without adding visual noise. The background remains a very light off-white to reduce eye strain during prolonged use.

## Typography
The design system utilizes **Inter** for all primary UI elements due to its exceptional legibility on digital screens and neutral, professional tone. 

- **Headlines:** Set with tighter letter-spacing and heavier weights to provide clear section anchoring.
- **Body Text:** Optimized for long-form reading in technical manuals and documentation.
- **Labels:** Used for table headers and status badges, often in uppercase with slight tracking to distinguish them from body content.
- **Monospaced:** **JetBrains Mono** is introduced for Asset IDs, coordinates, and technical specifications to ensure character clarity (e.g., distinguishing '0' from 'O').

## Layout & Spacing
The layout follows a **Fluid Grid** system based on an 8px spatial rhythm. 

- **Desktop:** A 12-column grid with 24px gutters. Sidebars are fixed at 280px to maximize the workspace for data tables.
- **Mobile:** A 4-column grid with 16px margins. Complex data tables should collapse into "card-view" summaries on mobile devices.
- **Spacing Logic:** Use `md (16px)` for internal component padding and `lg (24px)` for vertical stack spacing between distinct content blocks.

## Elevation & Depth
This design system uses **Tonal Layers** and **Low-contrast Outlines** rather than heavy shadows to maintain a flat, professional interface.

- **Level 0 (Background):** The base canvas, #F8FAFC.
- **Level 1 (Cards/Surface):** White (#FFFFFF) with a 1px border (#E2E8F0). No shadow.
- **Level 2 (Dropdowns/Modals):** White with a subtle, 8px blurred ambient shadow (Opacity 5%) to indicate temporary overlay.
- **Dividers:** 1px solid lines using #F1F5F9 for subtle separation within components.

## Shapes
The design system uses **Soft** roundedness (4px) to provide a modern feel that still retains a sense of rigid, industrial precision.

- **Small Components:** Checkboxes and small tags use 2px radius.
- **Standard Components:** Buttons, input fields, and KPI cards use 4px (`rounded-md`).
- **Large Components:** Modals and main content containers use 8px (`rounded-lg`).

## Components
Consistent implementation of these components ensures the KMS remains intuitive:

- **KPI Cards:** Feature a large "Display" value, a secondary label, and a small trend indicator or status icon in the top right. Use a white surface with a Bureau Blue accent border (left-side, 4px) to denote importance.
- **Data Tables:** High-density rows (40px height). Zebra-striping is omitted in favor of thin dividers. Headers are sticky and use the `label-md` type style with a light grey background.
- **Mobile Search & Filters:** A persistent "Filter" fab (Floating Action Button) that triggers a full-screen drawer. Use large touch targets (min 44px) for field inputs.
- **Rich-Text Input:** Used for maintenance logs and knowledge articles. The toolbar remains pinned to the top of the container; use a subtle background-fill for the editor area to distinguish it from the page surface.
- **Status Chips:** Small, pill-shaped badges with low-opacity background fills and high-opacity text of the same hue (e.g., light green background with dark green text for "Approved").
- **Buttons:** 
    - *Primary:* Solid Bureau Blue with white text.
    - *Secondary:* Ghost style with Bureau Blue border and text.
    - *Destructive:* Solid Red for critical alerts or deletions.