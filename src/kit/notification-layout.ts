/** Fit a prefix into the available height, reserving room for queued-count feedback. */
export function fitNotificationCount(heights: number[], budget: number, gap = 8, badgeHeight = 36) {
  if (!heights.length) return 0;
  const total = heights.reduce((sum, height) => sum + height, 0) + gap * (heights.length - 1);
  const available = total <= budget ? budget : Math.max(0, budget - badgeHeight - gap);
  let used = 0;
  let count = 0;
  for (const height of heights) {
    const next = used + (count ? gap : 0) + height;
    if (count && next > available) break;
    used = next;
    count++;
  }
  return Math.max(1, count);
}
export function notificationBudget(viewportHeight: number) {
  return Math.max(120, Math.min(560, viewportHeight - 32, viewportHeight * .65));
}
