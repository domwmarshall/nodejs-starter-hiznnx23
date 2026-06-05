function getBadgeType(value) {
  const text = String(value).toLowerCase();

  if (
    text.includes("high") ||
    text.includes("overdue") ||
    text.includes("governance") ||
    text.includes("unfilled") ||
    text.includes("gap") ||
    text.includes("conflict") ||
    text.includes("rejected")
  ) {
    return "danger";
  }

  if (
    text.includes("medium") ||
    text.includes("due") ||
    text.includes("planned") ||
    text.includes("locum") ||
    text.includes("pending")
  ) {
    return "warning";
  }

  if (
    text.includes("low") ||
    text.includes("approved") ||
    text.includes("up to date") ||
    text.includes("live") ||
    text.includes("enabled") ||
    text.includes("none") ||
    text.includes("on")
  ) {
    return "success";
  }

  return "neutral";
}

export function Badge({ children }) {
  const badgeType = getBadgeType(children);

  return <span className={"badge badge-" + badgeType}>{children}</span>;
}