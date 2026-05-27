# Mobile v3.2 Prototype

Primary file: `mobile_v3.2.html`

## What changed in v3.2
- Split into HTML/CSS/JS assets for cleaner iteration and patching.
- Introduces a guided 7-step mobile flow focused on field execution.
- Uses soft completion guidance (no hard finalize block).
- Finalize outputs SA + WOLI-linked structured callout handoff payload.

## Run
Serve from a local web server so JSON fetch works:

```powershell
cd prototype/mobile_v3.2
python -m http.server 5510
```

Open: `http://localhost:5510/mobile_v3.2.html`
