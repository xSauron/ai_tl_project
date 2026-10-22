/**
 * Live WCAG contrast measurement for the Foundations → Color page.
 * Doc-only helper (rule 5 exception): lives under `.storybook/`, never
 * exported from the package.
 */

export type Rgb = { r: number; g: number; b: number };

let probeEl: HTMLDivElement | null = null;

function getProbe(): HTMLDivElement {
  if (!probeEl) {
    probeEl = document.createElement("div");
    probeEl.style.position = "absolute";
    probeEl.style.visibility = "hidden";
    probeEl.style.pointerEvents = "none";
    document.body.appendChild(probeEl);
  }
  return probeEl;
}

/** Resolves any CSS color (a `var(--token)` reference or a literal) to its computed rgb() string, inside `scopeEl` (so theme classes on an ancestor apply). */
export function resolveColor(cssColor: string, scopeEl?: HTMLElement): string {
  const probe = getProbe();
  if (scopeEl) scopeEl.appendChild(probe);
  probe.style.color = "";
  probe.style.color = cssColor;
  return getComputedStyle(probe).color;
}

export function parseRgb(rgbString: string): Rgb {
  const match = /rgba?\(([^)]+)\)/.exec(rgbString);
  if (!match) return { r: 0, g: 0, b: 0 };
  const parts = match[1]!.split(",").map((part) => parseFloat(part.trim()));
  return { r: parts[0] ?? 0, g: parts[1] ?? 0, b: parts[2] ?? 0 };
}

function channelLuminance(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Measures the contrast between two CSS colors as actually rendered in `scopeEl` (so `.dark` ancestors apply the dark-theme token values). */
export function measureContrast(foreground: string, background: string, scopeEl?: HTMLElement): number {
  const fg = parseRgb(resolveColor(foreground, scopeEl));
  const bg = parseRgb(resolveColor(background, scopeEl));
  return contrastRatio(fg, bg);
}
