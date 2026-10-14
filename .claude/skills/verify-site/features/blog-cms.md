# Blog CMS

## Sub-features

- Page head with counts (live, drafts, featured), backup and sign out.
- Search and the essay list (one row per essay: status, title, excerpt, tags, date, edit / open / delete).
- New article and the editor: command bar, metadata panel, write and preview panes, cover tools.
- Unsaved-draft recovery notice (local storage snapshot).

## How to get to it (user POV)

Sign in, open `/editorial`, or press "Blog CMS" in the private header.

## Driving it with the browser pane

1. Navigate to `/editorial`. Expect the list of local essays from `data/`.
2. Type in the search field; the list filters.
3. Press the edit control on one essay. The editor opens with its title and body.
4. Type a character in the body; the preview updates. Press the back / close control; do not save.
5. Press "New article"; an empty editor opens. Leave without saving.

## Gotchas

- Save, publish and delete write to `data/` or Supabase. Do not press them during a visual check.
- AI fill and cover generation call external APIs; they fail without keys, which is expected locally.
