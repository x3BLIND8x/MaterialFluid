import { test, expect } from "@playwright/test";

test("palette sliders update fills, preserve readable ink and survive reload", async ({
  page,
}) => {
  await page.goto("/#/components/button");
  const button = page.getByRole("button", {
    name: "Primary",
    exact: true,
  });
  await button.waitFor();
  const read = async () =>
    button.evaluate((el) => {
      const css = getComputedStyle(el);
      return { background: css.backgroundColor, text: css.color };
    });
  const original = await read();
  const ink = await page
    .locator(".mf-root")
    .evaluate((el) => getComputedStyle(el).getPropertyValue("--mf-primary"));
  await page
    .getByRole("button", { name: "Showcase preferences", exact: true })
    .click();
  await expect(page.getByRole("slider")).toHaveCount(10);
  const brightness = page.getByRole("slider", {
    name: "Light action brightness",
    exact: true,
  });
  await expect(brightness).toHaveAttribute("aria-valuenow", "85");
  await expect(
    page.getByRole("slider", { name: "Dark action brightness", exact: true }),
  ).toHaveAttribute("aria-valuenow", "90");
  await brightness.focus();
  await page.keyboard.press("End");
  await expect(brightness).toHaveAttribute("aria-valuenow", "95");
  await expect.poll(read).not.toEqual(original);
  expect(
    await page
      .locator(".mf-root")
      .evaluate((el) => getComputedStyle(el).getPropertyValue("--mf-primary")),
  ).toBe(ink);
  await page.reload();
  await page
    .getByRole("button", { name: "Showcase preferences", exact: true })
    .click();
  await expect(
    page.getByRole("slider", { name: "Light action brightness", exact: true }),
  ).toHaveAttribute("aria-valuenow", "95");
  await page.getByRole("button", { name: "Reset colors", exact: true }).click();
  await expect.poll(read).toEqual(original);
  const hue = page.getByRole("slider", {
    name: "Secondary hue shift",
    exact: true,
  });
  await hue.focus();
  await page.keyboard.press("Home");
  await expect(hue).toHaveAttribute("aria-valuetext", "-180°");
});

test("accent selection is hue-only and persists without black or white shifts", async ({
  page,
}) => {
  await page.goto("/#/components/button");
  await page
    .getByRole("button", { name: "Showcase preferences", exact: true })
    .click();
  const hue = page.getByRole("slider", { name: "Accent hue", exact: true });
  await hue.focus();
  await page.keyboard.press("Home");
  await expect(page.locator(".accent-control code")).toHaveText("#FF0000");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".accent-control code")).toHaveText("#FF0400");
  await page.reload();
  await page
    .getByRole("button", { name: "Showcase preferences", exact: true })
    .click();
  await expect(page.locator(".accent-control code")).toHaveText("#FF0400");
  await page
    .locator(".accent-control")
    .getByRole("button", { name: "Reset", exact: true })
    .click();
  await expect(page.locator(".accent-control code")).toHaveText("#EEDD96");
});

test("selected controls, progress and calendar use Primary fills in each theme", async ({
  page,
}) => {
  for (const theme of ["light", "dark"]) {
    await page.goto("/");
    await page.evaluate(
      ({ theme }) =>
        localStorage.setItem(
          "materialfluid.preferences",
          JSON.stringify({ theme, accentSeed: "#ff0000" }),
        ),
      { theme },
    );
    await page.reload();
    await expect(page.locator(".mf-root")).toHaveAttribute("data-theme", theme);
    for (const [route, selector] of [
      ["checkbox", '.mf-checkbox[data-state="checked"] .mf-choice-fill'],
      ["switch", '.mf-switch[data-state="checked"]'],
      ["slider", ".mf-slider-range"],
      ["progress", ".mf-progress-fill"],
      ["calendar", ".rdp-selected .rdp-day_button"],
    ]) {
      await page.goto(`/#/components/${route}`);
      const demo = page.locator(".demo-primary");
      if (route === "checkbox")
        await demo.getByRole("checkbox").first().click();
      if (route === "switch") await demo.getByRole("switch").first().click();
      await expect(demo.locator(selector).first()).toBeVisible();
      for (const [, role] of [
        ["Primary", "primary"],
      ]) {
        await expect
          .poll(() =>
            demo
              .locator(selector)
              .first()
              .evaluate((el, role) => {
                const expected = document.createElement("span");
                expected.style.backgroundColor = `var(--mf-palette-${role}-fill)`;
                el.appendChild(expected);
                const matches =
                  getComputedStyle(el).backgroundColor ===
                  getComputedStyle(expected).backgroundColor;
                expected.remove();
                return matches;
              }, role),
          )
          .toBe(true);
      }
    }
  }
});

test("mobile Persian palette controls scroll, mirror and keep values clear of labels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/components/button");
  await page.getByRole("button", { name: "More options" }).click();
  await page
    .getByRole("button", { name: "Switch to Persian", exact: true })
    .click();
  await page
    .getByRole("button", { name: "ترجیحات نمایش", exact: true })
    .click();
  const brightness = page.getByRole("slider", {
    name: "روشنایی دکمه‌ها در حالت روشن",
    exact: true,
  });
  await brightness.focus();
  await page.keyboard.press("End");
  await expect(brightness).toHaveAttribute("aria-valuenow", "95");
  const contrast = page.getByRole("slider", { name: "کنتراست", exact: true });
  await contrast.focus();
  await page.keyboard.press("End");
  await expect(contrast).toHaveAttribute("aria-valuenow", "100");
  const row = page.locator(".color-setting:visible").last();
  const clear = await row.evaluate((el) => {
    const label = el
      .querySelector(".mf-field-heading")!
      .getBoundingClientRect();
    const output = el.querySelector("output")!.getBoundingClientRect();
    return {
      outputLeft: output.left,
      labelRight: label.right,
      rowRight: el.getBoundingClientRect().right,
    };
  });
  expect(clear.outputLeft).toBeLessThan(clear.rowRight - 100);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.getByText("نقش‌های رنگی پیشرفته", { exact: true }).click();
  const border = page.getByRole("slider", {
    name: "روشنایی حاشیه‌ها در حالت تیره",
    exact: true,
  });
  await border.focus();
  await page.keyboard.press("End");
  await expect(border).toHaveAttribute("aria-valuenow", "100");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});

for (const theme of ["light", "dark"] as const) {
  test(`advanced roles change icons, active navigation and neutrals independently (${theme})`, async ({
    page,
  }) => {
    await page.addInitScript((theme) => {
      if (!localStorage.getItem("materialfluid.preferences"))
        localStorage.setItem(
          "materialfluid.preferences",
          JSON.stringify({ theme }),
        );
    }, theme);
    await page.goto("/#/components/button");
    const read = () =>
      page.evaluate(() => {
        const css = getComputedStyle(document.querySelector(".mf-root")!);
        return Object.fromEntries(
          [
            "primary-fill",
            "primary",
            "primary-container",
            "canvas",
            "on-surface",
            "outline",
          ].map((role) => [role, css.getPropertyValue(`--mf-${role}`)]),
        );
      });
    const initial = await read();
    const iconBefore = await page
      .locator(".brand-mark .mf-animated-icon")
      .evaluate((el) => getComputedStyle(el).color);
    const navBefore = await page
      .locator('.catalogue-link[aria-current="page"] .mf-selection')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    await page
      .getByRole("button", { name: "Showcase preferences", exact: true })
      .click();
    await page.getByText("Advanced color roles", { exact: true }).click();
    await expect(page.getByRole("slider")).toHaveCount(24);
    const prefix = theme === "light" ? "Light" : "Dark";
    for (const [label, key, end] of [
      ["icon & accent ink", "primary", theme === "dark"],
      ["selection & containers", "primary-container", theme === "light"],
      ["neutral backgrounds", "canvas", theme === "dark"],
      ["neutral text", "on-surface", theme === "dark"],
      ["borders", "outline", theme !== "dark"],
    ] as const) {
      const before = await read();
      const slider = page.getByRole("slider", {
        name: `${prefix} ${label}`,
        exact: true,
      });
      await slider.focus();
      await page.keyboard.press(end ? "End" : "Home");
      await expect.poll(async () => (await read())[key]).not.toBe(before[key]);
      expect((await read())["primary-fill"]).toBe(initial["primary-fill"]);
    }
    expect(
      await page
        .locator(".brand-mark .mf-animated-icon")
        .evaluate((el) => getComputedStyle(el).color),
    ).toBe(iconBefore);
    expect(
      await page
        .locator('.catalogue-link[aria-current="page"] .mf-selection')
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe(navBefore);
    const tuned = await read();
    await page.reload();
    expect(await read()).toEqual(tuned);
    await page
      .getByRole("button", { name: "Showcase preferences", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Reset colors", exact: true })
      .click();
    expect(await read()).toEqual(initial);
  });
}

test("colored icons and Outline/Ghost toolbar icons use independent brightness roles", async ({
  page,
}) => {
  for (const theme of ["light", "dark"]) {
    await page.goto("/#/components/icon-button");
    await page.evaluate(
      (theme) =>
        localStorage.setItem(
          "materialfluid.preferences",
          JSON.stringify({ theme }),
        ),
      theme,
    );
    await page.reload();
    await expect(page.locator(".mf-root")).toHaveAttribute("data-theme", theme);
    const top = page.locator(".showcase-topbar .mf-animated-icon").first();
    const search = page.locator(".nav-search .mf-animated-icon").first();
    const colored = page
      .locator(".demo-primary .mf-icon-button .mf-animated-icon")
      .first();
    const plainColor = await top.evaluate((el) => getComputedStyle(el).color);
    const coloredColor = await colored.evaluate(
      (el) => getComputedStyle(el).color,
    );
    if (theme === "dark") expect(plainColor).not.toBe(coloredColor);
    const searchColor = await search.evaluate(el => getComputedStyle(el).color);
    await expect(search).toHaveCSS("color", searchColor);
    for (const variant of ["outline", "ghost"]) {
      const action = page.locator(`.demo-primary .mf-icon-button.mf-variant--${variant}`);
      const expected = variant === "outline" && theme === "dark" ? await action.evaluate(el => getComputedStyle(el).color) : plainColor;
      await expect(action.locator(".mf-animated-icon")).toHaveCSS("color", expected);
    }
    await page
      .getByRole("button", { name: "Showcase preferences", exact: true })
      .click();
    await page.getByText("Advanced color roles", { exact: true }).click();
    const prefix = theme === "light" ? "Light" : "Dark";
    const ink = page.getByRole("slider", {
      name: `${prefix} icon & accent ink`,
      exact: true,
    });
    const plain = page.getByRole("slider", {
      name: `${prefix} Outline / Ghost ink`,
      exact: true,
    });
    await expect(ink).toHaveAttribute(
      "aria-valuenow",
      theme === "light" ? "40" : "50",
    );
    await expect(plain).toHaveAttribute(
      "aria-valuenow",
      theme === "light" ? "40" : "90",
    );
    await ink.focus();
    await page.keyboard.press("Home");
    await expect(colored).toHaveCSS("color", "rgb(0, 0, 0)");
    await expect(top).toHaveCSS("color", plainColor);
    await plain.focus();
    await page.keyboard.press("End");
    await expect(top).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(search).toHaveCSS("color", searchColor);
    await expect(colored).toHaveCSS("color", "rgb(0, 0, 0)");
    await page
      .getByRole("button", { name: "Reset colors", exact: true })
      .click();
    await expect(colored).toHaveCSS("color", coloredColor);
    await expect(top).toHaveCSS("color", plainColor);
    await page.keyboard.press("Escape");
    await page.goto("/#/components/animated-icon");
    const tile = page.locator(".icon-gallery-tile").first();
    const tileInk = theme === "dark" ? await tile.evaluate(el => getComputedStyle(el).color) : plainColor;
    await expect(tile.locator(".mf-animated-icon")).toHaveCSS("color", tileInk);
    await expect(
      page.locator(".icon-preview-button .mf-animated-icon").first(),
    ).toHaveCSS("color", coloredColor);
  }
});

test("danger uses solid red and white foregrounds in actions and surfaces", async ({
  page,
}) => {
  for (const theme of ["light", "dark"]) {
    await page.goto("/");
    await page.evaluate(
      (theme) =>
        localStorage.setItem(
          "materialfluid.preferences",
          JSON.stringify({ theme }),
        ),
      theme,
    );
    await page.reload();
    await expect(page.locator(".mf-root")).toHaveAttribute("data-theme", theme);
    for (const [route, selector, background, foreground] of [
      ["button", ".mf-button", "error-fill", "on-error-fill"],
      ["icon-button", ".mf-icon-button", "error-fill", "on-error-fill"],
    ]) {
      await page.goto(`/#/components/${route}`);
      const component = page.locator(`.demo-primary ${selector}.mf-variant--danger`).first();
      await expect
        .poll(() =>
          component.evaluate(
            (el, { background, foreground }) => {
              const sample = document.createElement("span");
              sample.style.backgroundColor = `var(--mf-palette-${background})`;
              sample.style.color = `var(--mf-palette-${foreground})`;
              el.appendChild(sample);
              const css = getComputedStyle(el),
                expected = getComputedStyle(sample);
              const icon = el.querySelector(".mf-animated-icon");
              const pairMatches =
                css.backgroundColor === expected.backgroundColor &&
                css.color === expected.color;
              sample.style.color = "var(--mf-icon-ink)";
              const result =
                pairMatches &&
                (!icon ||
                  getComputedStyle(icon).color ===
                    getComputedStyle(sample).color);
              sample.remove();
              return result;
            },
            { background, foreground },
          ),
        )
        .toBe(true);
    }
  }
});
