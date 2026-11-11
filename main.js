// Project worktrees: every git worktree of the focused space's project, listed
// automatically. Click one to switch to its space, or open it as a new space.
// A worktree that appears while the panel runs gets its own space (autoopen.js).

import { View, div } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import { run, theme, spaces, panes, focused } from "herdr";
import { checkouts, withStates } from "./git.js";
import { inside, place, spaceOf } from "./locate.js";
import { autoOpener } from "./autoopen.js";

export default class ProjectWorktrees extends View {
  init(_props, cx) {
    this.repo = null;
    this.key = "";
    this.autoOpen = autoOpener();
    cx.timer.every(5000, (cx) => this.refresh(cx));
    this.refresh(cx);
  }

  current() {
    const f = focused();
    const s = spaces().find((x) => x.id === f?.space);
    if (!s) return null;
    return { folder: f.cwd || place(s, panes()), on: s.machine ?? null };
  }

  refresh(cx) {
    const cur = this.current();
    if (!cur?.folder) return;
    cx.spawn(async (cx) => {
      try {
        const found = await checkouts(cur.folder, cur.on);
        const repo = found && await withStates(found, cur.on);
        const key = JSON.stringify([cur.on, repo]);
        if (repo) this.autoOpen(repo, cur.on);
        if (key !== this.key) { this.key = key; this.repo = repo; this.on = cur.on; cx.notify(); }
      } catch { /* git missing or machine offline: keep what is shown */ }
    });
  }

  open(c) {
    const s = spaceOf(c.path, this.repo.list, this.on, spaces(), panes());
    if (s) run("space.select", { id: s.id });
    else run("space.new", { folder: c.path, machine: this.on });
  }

  render(cx) {
    const t = theme();
    const cur = this.current();
    // Re-read when focus moves to another project.
    if (cur?.folder && this.repo && !this.repo.list.some((c) => inside(cur.folder, c.path))) this.refresh(cx);
    const repo = this.repo;
    if (!repo || repo.list.length < 2) {
      return v_flex().size_full().p(10).text_size(12).text_color(t.dim).child(repo ? `${repo.name}: no other worktrees` : "No git project");
    }
    const ss = spaces(), ps = panes();
    return v_flex().size_full().p(8).gap(2).text_size(12).child(
      div().mx(-8).mt(-8).px(16).h(41).pt(14).pb(5).flex_none().text_size(11.5).font_medium().text_color(t.dim).child("Worktrees"),
    ).child(
      v_flex().flex_1().overflow_y_scrollbar().children(repo.list.map((c) => {
        const here = cur?.folder && spaceOf(c.path, repo.list, this.on, ss, ps)?.id === focused()?.space;
        return h_flex().id(`wt-${c.path}`).px(6).py(4).gap(8).rounded(6).items_center()
          .hover((x) => x.bg(t.hover)).when(here, (el) => el.bg(t.selected))
          .on_click(() => this.open(c))
          .child(div().flex_none().text_size(14).text_color(c.state === "changes" ? t.ansi10 : c.state === "merged" ? t.ansi13 : t.muted).child("●"))
          .child(div().truncate().text_color(here ? t.foreground : t.muted).child(c.branch))
          .child(div().flex_1())
          .child(div().flex_none().text_size(10).text_color(t.dim).child(c.main ? "main" : ""));
      })),
    );
  }
}
