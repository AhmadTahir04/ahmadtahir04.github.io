# Ahmad Tahir - Personal Portfolio

A fast, accessible, single-page portfolio for software engineering new-grad
applications. Dark/light themes, an experience timeline, and curated projects.

**Stack:** plain HTML + CSS + vanilla JS (no build step, no dependencies).

```
index.html      # markup + content
styles.css      # theme tokens, layout, components
script.js       # theme toggle, scroll-spy nav, reveal animations, spotlight
resume.pdf      # linked from the sidebar and Experience section
```

## Run locally

Any static server works. For example:

```bash
python3 -m http.server 4321
```

Then open <http://localhost:4321>.

## Deploy (pick one)

**Vercel** - fastest for a custom domain:

```bash
npm i -g vercel
vercel
```

**GitHub Pages** - free on your existing account:

1. Create a repo named `ahmadtahir04.github.io` (or any repo + enable Pages).
2. Push these files to the `main` branch.
3. Settings → Pages → Source: `main` / root.
4. Live at `https://ahmadtahir04.github.io`.

**Netlify** - drag the folder onto <https://app.netlify.com/drop>.

## Editing content

- All copy lives in `index.html`; sections are `#about`, `#experience`, `#projects`.
- Colors/theme are CSS variables at the top of `styles.css` (`--accent`, `--bg`, …).
- To add a project, copy an `<a class="proj">…</a>` block in the project grid.
- Replace `resume.pdf` with an updated version anytime (keep the filename).

## Ideas to take it further

- Buy a custom domain (e.g. `ahmadtahir.dev`) and point Vercel/Pages at it.
- Add a project screenshot/GIF to the two featured cards.
- Add an Open Graph preview image (`og:image`) so links unfurl nicely on LinkedIn.
