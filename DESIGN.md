---
name: TimePath
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e3e2e2'
  on-secondary-container: '#646464'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1c'
  on-tertiary-container: '#838484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  surface-pure: '#FFFFFF'
  surface-subtle: '#EEEEEE'
  medium-gray: '#9E9E9E'
  border-gray: '#E0E0E0'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
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
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  DEFAULT: 0.125rem
  lg: 0.25rem
  xl: 0.5rem
  full: 0.75rem
spacing:
  base: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is defined by an uncompromising **Minimalist** aesthetic that leans into architectural precision and executive focus. It targets power users who value clarity, speed, and a distraction-free environment. By stripping away color, the interface moves the user's focus entirely toward content structure and hierarchy.

The brand personality is authoritative, sophisticated, and quiet. It evokes an emotional response of "controlled efficiency"—where the UI feels like a premium, well-engineered tool rather than a consumer app. The style utilizes heavy white space and a rigorous monochrome palette to create a high-end, gallery-like experience for professional workflows.

## Colors
This is a strictly monochrome system. Color is used only as a functional indicator of state, never as decoration.

- **Primary (#000000):** Reserved for the highest priority elements, including primary action buttons, main headings, and active navigation states.
- **Secondary (#757575):** Used for supporting text, secondary icons, and UI elements that require visibility without competing for attention.
- **Surface & Backgrounds:** The foundation is built on pure White (#FFFFFF). Very light grays (#F5F5F5 and #EEEEEE) are used to differentiate functional zones and container levels.
- **Accents:** Grays ranging from #9E9E9E to #BDBDBD handle tertiary information and subtle borders. 
- **Replacement Rule:** All previous blue and chromatic accents are replaced with Black for high-contrast actions or Dark Gray for systemic indicators.

## Typography
The system uses **Inter** exclusively to maintain a professional, neutral, and systematic character. The typographic hierarchy relies on weight and contrast rather than color to distinguish information.

- **Headlines:** Set with tight tracking and bold weights to create high-impact "anchors" on the page.
- **Body:** Prioritizes legibility with standard weights and generous line-heights.
- **Labels:** Use uppercase and increased letter-spacing for small-scale clarity, typically rendered in secondary gray to keep them subordinate to primary content.

## Layout & Spacing
The layout follows a **12-column fixed grid** on desktop (centered) and a **4-column fluid grid** on mobile. The spacing rhythm is strictly based on a 4px baseline, ensuring mathematical harmony across all components.

- **Desktop:** 40px outer margins with 16px gutters.
- **Mobile:** 16px outer margins with 12px gutters.
- **Hierarchy through Space:** Large-scale sections are separated by 64px+ to emphasize the minimalist "gallery" feel. Data clusters use tight 4px and 8px increments to maintain visual grouping.

## Elevation & Depth
Elevation is expressed through **Tonal Layers** and **Low-contrast Outlines** to maintain a flat, high-performance aesthetic.

- **Level 0:** Base background (#FFFFFF).
- **Level 1:** Sub-containers and sidebars (#F5F5F5).
- **Level 2:** Cards and active elements. These use a 1px solid border (#EEEEEE or #E0E0E0) instead of shadows.
- **Depth Exception:** Only transient elements (modals, dropdowns) may use a sharp 1px black outline or a very subtle, tight 4px blur shadow (5% opacity) to denote an overlay state without disrupting the flat minimalist look.

## Shapes
The shape language is **Sharp (2px)**, reinforcing the architectural, minimal character of the monochrome palette rather than softening it.

- **Primary UI:** Buttons and input fields use a near-flat 2px radius (`rounded`, DEFAULT).
- **Cards & containers:** Use `rounded-lg` (4px) to `rounded-xl` (8px) depending on size — still close to square.
- **Strictness:** Corners stay tight everywhere; nothing in the interface should read as soft or playful.

## Components

### Buttons
- **Primary:** Solid Black background with White text. Bold and authoritative.
- **Secondary:** White background with a 1px Black border and Black text.
- **Tertiary:** Pure text in Black or Gray with an underline on hover.

### Input Fields
Inputs use a White background with a 1px gray border (#BDBDBD). On focus, the border thickens to 2px Black. Placeholders are set in #9E9E9E.

### Cards
Cards are defined by a 1px border (#EEEEEE) or a subtle light gray fill (#F5F5F5). They should not use shadows. Information within cards is separated by 1px horizontal gray dividers.

### Chips & Tags
Chips use a light gray fill (#EEEEEE) with Black text. Active or selected chips flip to a Black background with White text.

### Progress & Status
Since color is removed, progress is shown via a solid Black bar against a Light Gray (#EEEEEE) track. Success states are indicated by bold check icons; errors are indicated by heavy 2px borders or a "high-contrast" inverted black block.

### Lists
List items are separated by a 1px border (#EEEEEE). Selected items use a subtle #F5F5F5 background and a 4px black vertical "indicator" on the left edge.