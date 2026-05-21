export const FASTING_COLORS = {
  strict: {
    bg: "bg-[var(--fast-strict)]",
    text: "text-white",
    ring: "ring-[var(--fast-strict)]",
  },
  regular: {
    bg: "bg-[var(--fast-regular)]",
    text: "text-white",
    ring: "ring-[var(--fast-regular)]",
  },
  feast: {
    bg: "bg-[var(--fast-feast)]",
    text: "text-white",
    ring: "ring-[var(--fast-feast)]",
  },
} as const;

export const RAW_COLORS = {
  primary: "#722F37",
  secondary: "#4A7C59",
  accent: "#C9A96E",
  border: "#E8DFD5",
  background: "#FDF8F3",
  card: "#FAF5ED",
  strict: "#722F37",
  regular: "#C9A96E",
  feast: "#4A7C59",
} as const;

export const QUERY_LIMITS = {
  meals: 12,
  mealPicker: 20,
  snacks: 12,
} as const;

export const CUISINE_OPTIONS = [
  "Egyptian",
  "Italian",
  "Mexican",
  "Lebanese",
  "American",
  "Turkish",
  "Chinese",
  "Japanese",
  "Greek",
  "Middle Eastern",
  "Spanish",
] as const;

export const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
] as const;