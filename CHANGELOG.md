# Changelog

## 0.5.1 — 2026-11-18

- **Gentler glints.** The surface highlight was too strong on the live map;
  `spec` 0.05 → 0.035. Nothing else changed.

## 0.5.0 — 2026-11-18

- **Surface highlight.** Sun glints on the wave crests: the crests of the
  open-water noise, masked by a soft vignette centred on the view so the light
  gathers under the eye and fades to the edge. Four blends — additive, screen,
  colour (the glints take the water's own hue) and warm — with amount,
  sharpness, size and inversion.
- **A shader per quality tier.** Each tier now compiles its own variant, so a
  feature it does not use is compiled out instead of merely switched off:
  `medium` drops the parallax ray march, `low` and `extra-low` also drop the
  warp, the second noise layer and the LOD current fetches. Same picture, less
  work.
- **New map.** The colour map is re-rendered from the `interesting_v2` preset
  (same depth palette and height field, different filters), with a new asset
  version so caches pick it up.
- **Whale.** A touch lighter and less saturated; the ground now occludes the
  body where the water is shallower than it; the surface roll is staged (breach,
  hold, roll, unroll) on top of the swim loop instead of replacing it.
- **Parallax pull-back.** The deep water no longer spreads quite so far from the
  view centre (0.976 → 0.78).
- **Loading grain.** Darker, and erased by the depth reveal at full resolution —
  the shader draws the grain itself and the placeholder only covers the
  pre-texture phase, so the intro no longer stutters while the textures decode.
- **Defaults.** Adaptive fps is on by default (idle draws at 30), brightness
  defaults to 110, and the bench button is gone from the panel.
- **Smaller bundle.** Comments are stripped in the build: 179 KB → 137 KB.

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
