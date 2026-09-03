---
name: TimePath (Blue Draft — unused)
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#424754'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#5c5f60'
  on-secondary: '#ffffff'
  secondary-container: '#dee0e2'
  on-secondary-container: '#606365'
  tertiary: '#924700'
  on-tertiary: '#ffffff'
  tertiary-container: '#b75b00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e1e2e4'
  secondary-fixed-dim: '#c5c6c8'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
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
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
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

The design system is engineered for high-performance productivity, targeting professionals who require a tool that feels like an extension of their cognitive workflow. The brand personality is disciplined, precise, and unobtrusive, prioritizing the user's data over the interface's ego.

The design style is **Minimalist** with a focus on functional utility. It utilizes generous whitespace to reduce cognitive load and sharp, intentional visual hierarchies to guide the eye toward the "next most important task." The aesthetic avoids decorative flourishes, opting instead for a systematic approach where every pixel serves a purpose in the user's execution cycle.

## Colors

The palette is anchored by a **Calming Blue** primary color, chosen to represent focus and executive function without the urgency of red or the softness of green. The background architecture relies on a "Soft Gray" secondary color to create distinct functional zones without the harshness of high-contrast black and white.

- **Primary (#3B82F6):** Used for primary actions, active states, and progress indicators.
- **Secondary (#F3F4F6):** Used for large surface areas, time-block backgrounds, and sidebars.
- **Neutral (#1F2937):** Used for primary text and structural borders to ensure maximum legibility.
- **Functional Accents:** High-contrast Red (#EF4444) and Yellow (#F59E0B) are reserved exclusively for priority levels and "at-risk" deadlines to ensure immediate visual triage.

## Typography

The typography system uses **Inter** for its exceptional legibility and neutral, systematic character. The scale is designed to create a clear information hierarchy, allowing users to scan schedules rapidly.

A secondary monospace font, **JetBrains Mono**, is introduced for time-stamps and duration counters to ensure numeric alignment in tabular layouts and time-blocks. Headlines use tight letter-spacing for a modern, compact look, while labels use expanded tracking for clarity at small sizes.

## Layout & Spacing

This design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The spacing rhythm is based on a 4px baseline, ensuring all components align to a consistent mathematical scale.

- **Timeline Layout:** Uses a fixed-width left gutter for time-stamps (64px) with a fluid content area for task blocks.
- **Task Rescheduling:** Elements are padded with "Safe Zones" (16px) to accommodate drag-and-drop handles without accidental triggering of adjacent actions.
- **Review Cards:** Utilize a 24px internal padding to provide "visual breathing room" for data-heavy visualizations.

## Elevation & Depth

Elevation in this design system is communicated through **Tonal Layering** rather than traditional shadows. This keeps the interface feeling "flat" and fast.

- **Level 0 (Base):** The main application background (White #FFFFFF).
- **Level 1 (Sub-surface):** Sidebars and inactive time-slots (#F3F4F6).
- **Level 2 (Active Surface):** Task cards and modals. These use a 1px solid border (#E5E7EB) to define boundaries.
- **Interaction Depth:** Only active "Dragging" states utilize a soft, diffused shadow (10% opacity, 8px blur) to indicate the element has been lifted from the grid.

## Shapes

The shape language is **Soft (0.25rem)**. This provides a professional, geometric feel that avoids the "toylike" appearance of highly rounded corners while remaining more modern and approachable than sharp 90-degree angles.

- **Inputs & Buttons:** Use the standard `rounded` (4px).
- **Time-block Cards:** Use `rounded-lg` (8px) to create a distinct container feel against the timeline.
- **Progress Rings:** Use perfectly circular strokes (100% radius) to contrast against the rectangular grid.

## Components

### Time-block Cards
Cards feature a 3px vertical accent bar on the left edge. The color of this bar indicates the priority (Primary Blue, High Red, or Medium Yellow). Content is padded 12px from the bar.

### Progress Rings
Rings use a 4px stroke width. The background track is #E5E7EB, and the active progress uses the Primary Blue. For completed tasks, the ring is replaced with a solid Primary Blue checkmark icon.

### Stepper-style Lists (SOP)
SOP steps are connected by a 2px vertical "thread" line. Incomplete steps use a hollow circle; current steps use a solid Blue circle with a white number; completed steps use a filled Blue circle with a check.

### Data Visualization
Charts must use a "Clean Data" approach: no grid lines, minimal axis labels, and high-contrast data points. Use Primary Blue for the main trend line and Soft Gray for the area fill.

### Drag-and-Drop Handles
Handles are represented by a 2x3 grid of 2px dots. They appear only on hover or in "Edit Mode" to reduce visual noise during standard execution.

### Buttons
- **Primary:** Solid Blue background, White text. No gradient.
- **Secondary:** Ghost style (Transparent background) with a 1px Blue border.
- **Tertiary:** Text-only with no border, used for low-priority actions like "Cancel" or "Clear All."