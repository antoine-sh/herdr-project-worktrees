# herdr-project-worktrees

A [Herdr](https://herdr.dev) mod that lists every git worktree of the project you are working on:

- all checkouts of the focused space's repository, with their branch
- a one-click jump to the space showing a worktree, or a new space for one that has none
- automatic spaces for worktrees created while the panel runs (an agent's `git worktree add`)

It follows the focused space, so it always shows the project you are looking at.

---

## 📑 Contents

- [Features](#-features)
- [Requirements](#-requirements)
- [Install](#-install)
- [Opening it](#-opening-it)
- [How it works](#-how-it-works)
- [Files](#-files)
- [License](#-license)

---

## ✨ Features

### 🌳 Listing

| Element | What it shows |
|---|---|
| 📌 **Header** | `<repo> worktrees`, named after the main checkout's folder. |
| 🌿 **Row** | One per worktree: its branch (`(detached)` for a detached HEAD). |
| 🏷️ **Badge** | `open` (accent color) when a space already shows that worktree, `main` for the main checkout, nothing otherwise. |
| 🎯 **Highlight** | The worktree of the focused space is selected. |

With no git project, or a project with a single checkout, the panel just says so.

### 🖱️ Switching

- Click a row to **select its space** if one shows that worktree.
- Otherwise a **new space** is created in that worktree's folder, on the same machine.

### 🤖 Auto-open

A worktree that appears while the panel runs gets its own space, **without taking focus**: the space is created, then focus goes back to where you were.

- It waits **one poll (5 s)** first, so a tool that makes the worktree and then its own space is not doubled.
- The main checkout and detached HEADs are skipped.
- Worktrees that already exist when a repository is first seen are not "new" and get no space.

### ⚡ Everyday

- 🔁 **Live**: re-reads `git worktree list` every 5 seconds, and when focus moves to another project.
- 🌐 **Remote spaces**: git runs on the space's machine.
- 🧭 **Nested checkouts**: a folder belongs to the deepest checkout that contains it.

---

## 📋 Requirements

- Herdr app
- `git` on the machine that holds the repository

---

## 📦 Install

```sh
git clone <repo-url> ~/.config/herdr-app/mods/project-worktrees
herdr-app check ~/.config/herdr-app/mods/project-worktrees
```

## 🚀 Opening it

The mod has `"place": "none"`, so it does not appear on its own. Pick one of these:

**🪟 As a pane beside your terminal**

```sh
herdr-app do pane.split --direction right --mod project-worktrees
```

**💬 As a dialog, toggled**

```sh
herdr-app do mod.open --name project-worktrees
```

**🧩 Docked in a layout** — add a block to your layout file. Shipped layouts are read-only, so clone one first (`herdr-app do layout.clone '{"name":"main","as":"my-layout"}'`).

```json
{ "id": "worktrees", "type": "block", "size": { "px": 220 }, "content": { "mod": "project-worktrees" } }
```

**⌨️ With a key** — add to `keys.json`:

```json
{ "global": { "ctrl-shift-w": "mod.open:project-worktrees" } }
```

> [!NOTE]
> Auto-open only runs while a copy of the mod is alive. Dock it in a layout, or keep it open, to have new worktrees get spaces.

---

## ⚙️ How it works

1. The focused space's folder is its focused pane's `cwd`, else its first terminal's live folder, else the folder it was made in.
2. `git rev-parse --git-common-dir` finds the main checkout, then `git worktree list --porcelain` lists every checkout.
3. Bare and prunable entries are skipped.
4. A space "shows" a worktree when its folder is inside it and not inside a deeper checkout.
5. On a failed poll (git missing, machine offline) the last good list stays on screen.

---

## 📁 Files

| File | Purpose |
|---|---|
| `main.js` | the panel: polling, rendering, click to switch or open |
| `git.js` | runs git (here or on a machine) and lists a project's checkouts |
| `locate.js` | matches spaces to checkouts: where a space is now, which space shows a checkout |
| `autoopen.js` | opens a space for each newly appeared worktree, without stealing focus |
| `mod.json` | placement (`none`) and title |
| `gpui-kit.d.ts`, `jsconfig.json` | editor types, rewritten by Herdr on start (safe to git-ignore) |

---

## 📄 License

Add a license before publishing, for example MIT.
