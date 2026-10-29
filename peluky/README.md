# Peluky · Soft Glass app design

High-fidelity UI for **Peluky**, an Indonesian companion app for the first 1,000 days
(planning → pregnancy → baby's 2nd birthday). In-app copy is Bahasa Indonesia; design
notes are in English.

Open `index.html` in a browser (no build step). It has four views:

| View | Hash | What it is |
|---|---|---|
| Prototype | `#welcome`, `#pregHome`, … | Clickable 390×844 prototype of all 38 screens (A–G), with design notes and state controls (stage, Ditanggung, Tanya quota, reduced motion) in the right panel. Desktop portals (G37–38) render in a 1280 frame you can narrow to 1024 / 768 / 390. |
| All screens | `#all` | Every screen grouped A–G, plus key states (sheets, danger panel, errors, covered, empty). Click a frame to open it. |
| Design system | `#system` | Colour tokens with live worst-case contrast, type scale, spacing, radii, glass recipe, motion, components. |
| Contrast & placeholders | `#notes` | Worst-case contrast per text style, failing pairs and the rule that keeps each out, and the placeholder register for content/clinical review. |

## Structure

```
peluky/
  index.html            viewer shell
  css/peluky.css        tokens + app components (the design itself)
  css/viewer.css        prototype browser + docs pages
  js/core.js            state, icons, logo, components, router, sheets (dialogs), toasts
  js/screens-ab.js      A Getting started · B Planning
  js/screens-cd.js      C Pregnancy · D Safety net (danger panel, Tanya, Bidan, Konsultasi, Emergency, Loss)
  js/screens-efg.js     E After birth · F Account & family · G Partner portals (desktop)
  js/docs.js            design-system page + contrast/placeholder note (contrast computed from tokens)
  js/viewer.js          viewer, overview grid, hash routing
  tools/build-single.mjs  inlines everything into one HTML fragment for sharing
```

## Prototype controls (right panel)

Mother's stage, returning vs new user, phone clock (09:41 / 02:14, which drives the automatic night display), night display (auto / on / off), Ditanggung, Tanya quota, test-session content (fictional names and travel times marked “(contoh)”), reduced motion, and **Full-screen test mode** for sessions with mothers (also `index.html?test`). Press Escape or “Exit test mode” to leave it.

## Prototype conventions

- "Today" is fixed at 29 Oct 2026 so weeks, calendar and baby age stay consistent.
- Calls (119, doctor, support line), directions, share and payment show a toast instead of leaving the page.
- Sign-up: any 6-digit code works except `000000` (wrong-code state). Office code: anything ≥4 chars except `SALAH1`.
- The danger triage test set (colloquial phrasing → danger / crisis / ask-first / none) is on the `#notes` view, computed live.
- All placeholders are in square brackets (`[RS A]`, `[Rp …]`, `[Layanan dukungan]` …). The full register is on the `#notes` view.
- Only the sourced figures from the brief are used, each shown with its source and date.
