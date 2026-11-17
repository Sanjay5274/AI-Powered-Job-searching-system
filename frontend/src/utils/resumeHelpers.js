// Convert different backend response formats into arrays
export const toArray = (value) => {
  if (Array.isArray(value)) return value;

  if (typeof value === "string" && value.trim()) {
    return [value];
  }

  return [];
};

// Get the first available field from backend response
export const getField = (obj, keys, fallback = []) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) {
      return obj[key];
    }
  }

  return fallback;
};

// Display text from strings or objects
export const displayItem = (item) => {
  if (typeof item === "string") return item;

  return (
    item?.name ||
    item?.skill ||
    item?.title ||
    item?.job_title ||
    item?.role ||
    item?.description ||
    JSON.stringify(item)
  );
};