# Desktop v3.2 Prototype

Primary file: `desktop_v3.2.html`

## What changed in v3.2
- Split into HTML/CSS/JS assets for cleaner iteration and patching.
- Default landing is `Handoff Review` sorted by newest completed SA.
- Keeps desktop as config/setup/output support surface.
- Preserves baseline seed data cloned from v3.1 for continuity.

## Run
Serve from a local web server so JSON fetch works:

```powershell
cd prototype/desktop_v3.2
python -m http.server 5520
```

Open: `http://localhost:5520/desktop_v3.2.html`
