/**
 * @returns {string} reasonably unique id without external deps
 */
export function createId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * @param {string} text
 * @returns {string} first line or fallback
 */
export function getTitleFromText(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) return "Untitled note";
  const firstLine = trimmed.split("\n")[0].trim();
  return firstLine.length > 64 ? `${firstLine.slice(0, 64)}…` : firstLine;
}

/**
 * @param {Array<{id:string, text:string, createdAt:number, updatedAt:number}>} notes
 * @returns {Array<...>} sorted notes (newest updated first)
 */
export function sortNotes(notes) {
  return [...notes].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

/**
 * @param {Array<{id:string, text:string}>} notes
 * @param {string} query
 * @returns {Array<...>}
 */
export function filterNotes(notes, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return notes;
  return notes.filter((n) => (n.text || "").toLowerCase().includes(q));
}
