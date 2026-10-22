import { Slider, Button } from "../kit/controls";

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
  return Math.round((sector * 60 + 360) % 360);
}

/** The top-right corner of an HSV picker: saturation 100%, brightness 100%. */
export function seedFromHue(hue: number): string {
  const h = (((hue % 360) + 360) % 360) / 60;
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
      Math.round(channel * 255)
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
        <code>{value.toUpperCase()}</code>
        <Button variant="ghost" size="sm" onClick={() => onChange("#eedd96")}>
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
          ? "فقط فام را انتخاب کنید؛ اشباع و روشنایی همیشه ۱۰۰٪ هستند."
          : "Choose a hue. New selections always use 100% saturation and brightness."}
      </p>
    </section>
  );
}
