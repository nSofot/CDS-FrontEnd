export function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-GB");
  // en-GB = dd/mm/yyyy format
}