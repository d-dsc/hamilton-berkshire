# hamilton berkshire

**Frontier consultancy. Technology, AI and commercial strategy.**

Single-page site. Frame-based architecture. Pure white with bold gold.

## Design

Clean white palette (`#fcfcfb`) with `#bf9b2e` gold accent at full strength. Fraunces serif at weight 520 for headlines. Inter for body. System mono for UI.

The HB brand mark becomes a persistent viewport frame. A 2px gold border that changes state as you move through six chapters. Alternating white/surface backgrounds create visual rhythm.

No stock photos, no social proof logos, no generic cards.

## Structure

```
/
├── index.html     Single page, 6 chapters
├── 404.html       Error page
├── css/style.css  Frame system + chapter styles
├── js/main.js     Frame controller + interactions
├── assets/
│   ├── favicon.svg
│   └── og-image.svg
└── README.md
```

## Deploy

Static HTML. Push to GitHub, connect Cloudflare Pages. No build step.
