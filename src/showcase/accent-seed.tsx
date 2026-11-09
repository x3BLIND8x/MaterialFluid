import { Slider, Button } from "../kit/controls";

const defaultSeed = "#eedd96";
const defaultChannels = [1, 3, 5].map(offset => parseInt(defaultSeed.slice(offset, offset + 2), 16));
const brightness = Math.max(...defaultChannels);
const minimum = Math.min(...defaultChannels);

/** HSV hue, independent of the saved seed's saturation and brightness. */
export function seedHue(seed: string): number {
  const [r, g, b] = [1, 3, 5].map(
    (offset) => parseInt(seed.slice(offset, offset + 2), 16) / 255,
  );
  const max = Math.max(r, g, b),
    delta = max - Math.min(r, g, b);
  if (!delta) return 0;
  const sector =
    max === r
      ? (g - b) / delta
      : max === g
        ? (b - r) / delta + 2
        : (r - g) / delta + 4;
  return Math.round((sector * 60 + 360) % 360) % 360;
}

/** Rotate the owner's seed hue while retaining its HSV saturation/brightness. */
export function seedFromHue(hue: number): string {
  const normalized = ((hue % 360) + 360) % 360;
  // The integer label rounds 48.409…° to 48°. Preserve the original precision
  // at that displayed value so moving away and back restores every theme token.
  if (normalized === seedHue(defaultSeed)) return defaultSeed;
  const h = normalized / 60;
  const x = 1 - Math.abs((h % 2) - 1);
  const rgb =
    h < 1
      ? [1, x, 0]
      : h < 2
        ? [x, 1, 0]
        : h < 3
          ? [0, 1, x]
          : h < 4
            ? [0, x, 1]
            : h < 5
              ? [x, 0, 1]
              : [1, 0, x];
  return `#${rgb
    .map((channel) =>
      Math.round(minimum + channel * (brightness - minimum))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

export function AccentSeed({
  value,
  onChange,
  fa,
}: {
  value: string;
  onChange: (seed: string) => void;
  fa: boolean;
}) {
  const hue = seedHue(value);
  return (
    <section
      className="accent-picker"
      aria-label={fa ? "رنگ پایه" : "Accent seed"}
    >
      <div className="accent-control">
        <span
          className="accent-swatch"
          style={{ background: value }}
          aria-hidden="true"
        />
        <output dir="ltr">{hue.toLocaleString(fa ? "fa" : "en")}°</output>
        <Button variant="ghost" size="sm" onClick={() => onChange(defaultSeed)}>
          {fa ? "بازنشانی" : "Reset"}
        </Button>
      </div>
      <Slider
        label={fa ? "فام رنگ پایه" : "Accent hue"}
        size="sm"
        value={[hue]}
        min={0}
        max={359}
        step={1}
        aria-valuetext={`${hue}°`}
        showValue={false}
        onValueChange={([next]) => onChange(seedFromHue(next))}
      />
      <p className="settings-note">
        {fa
          ? "فام را تغییر دهید؛ اشباع و روشنایی رنگ طلایی پیش‌فرض حفظ می‌شوند. انتخاب ۴۸ درجه رنگ اصلی را دقیقاً برمی‌گرداند."
          : "Change the hue while keeping the default gold's saturation and brightness. Selecting 48° restores the exact original color."}
      </p>
    </section>
  );
}
