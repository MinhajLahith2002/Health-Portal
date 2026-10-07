type ClassValue = string | number | boolean | undefined | null | { [key: string]: boolean | undefined | null } | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const inner = cn(...input);
      if (inner) classes.push(inner);
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(" ");
}

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return "N/A";
  const d = new Date(date);
  return isNaN(d.getTime())
    ? "N/A"
    : d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

export function formatCurrency(amount: number | string | undefined | null, currency = "LKR"): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (numericAmount === undefined || numericAmount === null || isNaN(numericAmount)) return `${currency} 0.00`;
  return `${currency} ${numericAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
