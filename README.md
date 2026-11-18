# Sea-Zag

![Sea-Zag](banner.png)

An unofficial sea for the zig-zag.fm map.

Ever looked at the various archipelagoes on zigzag and try to imagine the Seas
between them? Sea-Zag paints the empty space between the archipelagos with the
blue abyss.

![The sea between the archipelagos](screenshot-map.jpg)

![The sea close to a coast](screenshot-coast.jpg)

## What it do:

- Procedurally generated sea with underwater features, formed through currents,
  erosion and some artistic licence.
- Currents calculated around the open bodies of water, pushing through the
  passages between the islands.
- Dynamic visual effects: Parallax occlusion mapping, waves hitting the coasts,
  water moving with the currents.

- easter egg?

## Install

1. Install Tampermonkey in your browser.
2. Open
   [`sea-zag.user.js`](https://raw.githubusercontent.com/rich0664/sea-zag/main/dist/sea-zag.user.js)
   and let Tampermonkey install it.
3. Open the exploration map on zig-zag.fm. A small pixel-wave button appears
   under the notifications button in the header.

Tampermonkey updates the script on its own, so you only need the link once. To
start over, remove the script from Tampermonkey and install it again. If the map
ever looks wrong after an update, reload the page once.

## Settings

Click the pixel-wave button under the notification button to open the panel.

![The sea settings panel](screenshot-settings.png)

