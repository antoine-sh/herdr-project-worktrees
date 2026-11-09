// Matching spaces to checkouts: where a space is now, and which space shows a checkout.

export const inside = (p, dir) => p === dir || p.startsWith(dir + "/");

// Where a space is now: its first terminal's live folder, else where it was made.
export function place(s, ps) {
  const tabs = new Set((s.tabs ?? []).map((c) => c.id));
  return ps.find((p) => tabs.has(p.tab) && p.cwd)?.cwd || s.folder;
}

// The space showing a checkout (the deepest checkout containing its folder wins).
export function spaceOf(path, all, on, ss, ps) {
  return ss.find((s) => (s.machine ?? null) === (on ?? null) && (() => {
    const at = place(s, ps)?.replace(/\\/g, "/");
    return at && inside(at, path) && !all.some((c) => c.path !== path && c.path.length > path.length && inside(at, c.path));
  })());
}
