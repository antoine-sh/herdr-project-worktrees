// A worktree that appears while the panel runs (an agent's `git worktree add`)
// gets its own space by itself, without taking focus.

import { run, spaces, panes, focused } from "herdr";
import { spaceOf } from "./locate.js";

// Returns check(repo, on): call it on every poll. It opens a space for each
// checkout new since the last poll, after waiting one poll first, so a tool
// that makes the worktree and then its space isn't doubled.
export function autoOpener() {
  const known = new Map(); // repo -> checkout paths already seen
  const pending = new Set(); // new checkouts waiting one poll for their own space

  return function check(repo, on) {
    const id = `${on ?? ""}:${repo.list[0]?.path}`;
    const seen = known.get(id);
    known.set(id, new Set(repo.list.map((c) => c.path)));
    if (!seen) return; // first look at this repo: what exists is not new
    const ss = spaces(), ps = panes();
    for (const c of repo.list) {
      if (c.main || c.branch === "(detached)" || spaceOf(c.path, repo.list, on, ss, ps)) { pending.delete(c.path); continue; }
      if (!seen.has(c.path)) { pending.add(c.path); continue; }
      if (!pending.delete(c.path)) continue;
      const back = focused()?.space;
      run("space.new", { folder: c.path, machine: on ?? "" });
      if (back) run("space.select", { id: back });
    }
  };
}
