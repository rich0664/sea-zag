# Changelog

## 0.4.0 — 2026-11-16

- **The whale.** One whale roams the deep water on a pre-computed loop: it
  follows the currents, dives, surfaces every few minutes, and takes its clock
  from the server so every visitor sees it in the same place. Rendered on the
  map's texel grid as a shaded 3D body.
- **Depth tint.** The whale takes the map's own depth palette, darkening with
  the water beneath it; the trim and the waterline band stay readable.
- **Static when tabbed out.** A page that is hidden or unfocused for more than
  two seconds stops the sea loop and leaves the last frame on screen — the
  waves and the whale freeze with it — and coming back resumes.
- **Frame cap.** `off / 60 / 30`, applied on top of the adaptive frame rate, so
  a 144 Hz display no longer draws a pan at 144 fps.
- **Exploration map only.** The sea, its menu and the whale render only on the
  main exploration map; the record shop, community and supporters maps fail
  closed.
- **Half-texel alignment.** The sea now lines up with the map edge instead of
  sitting half a texel high.
- **Rename to `sea-zag`.** The script, its namespace, the bundle
  (`dist/sea-zag.user.js`) and the assets (`sea-zag-*`) are renamed.
  Pre-release testers must uninstall the old "zig~zag sea depth" script once,
  because Tampermonkey treats the rename as a new script.

## 0.3.1

- First working sea: depth, currents, shore waves, parallax, quality modes, HUD.
