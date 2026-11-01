# Plane Sim

A flight simulator that runs entirely inside the Desmos graphing calculator. There's no game engine and no JavaScript in the page, just Desmos expressions. The terrain, sky, runway, town, cockpit gauges and the plane itself are all drawn with math.

**Play it:** https://www.desmos.com/calculator/nffcaovrtq

![Cockpit view on final approach, with the runway ahead and the instrument panel](docs/images/cockpit.jpg)

## Controls

Open it on a laptop or desktop and close the expression list (arrow at the top left) so the cockpit fills the screen. Hit MENU, then TAKEOFF or FLY IN THE AIR.

- **Throttle:** drag the amber lever on the left, or use MAX, +, − and IDLE
- **Stick:** drag the knob in the bottom-right square. Left and right bank the plane, down pulls the nose up. The arrow buttons nudge it.
- **FLAPS:** more lift at low speed, for takeoff and landing
- **VIEW** (top left): cockpit or 3rd-person camera
- **TIME** (top right): day or night
- **STICK: REAL / INVERTED** flips up and down, **CENTER STICK** levels out

To take off, go full throttle and pull back at around 60 knots. To land, come in around 70 knots with flaps down and touch down gently on the runway (under 800 ft/min). Hills, water and hard landings count as crashes.

| 3rd-person view | Night |
|---|---|
| ![The plane banking toward the runway, seen from behind](docs/images/chase.jpg) | ![The plane with its navigation lights over the lit town at night](docs/images/night.jpg) |

## What's in it

- Hills, lakes and coastline from a sum of sine waves, with a new landscape every flight
- An airport with a fully marked 1,800 m runway, edge and approach lights, a tower, hangars and parked planes
- A town, forests and clouds
- Five working cockpit gauges and a heads-up readout
- A 3rd-person camera with a low-poly plane, spinning prop and ground shadow
- Night mode with stars, the moon, lit windows, runway lights and the plane's nav lights

## How it works

Desmos only draws 2D shapes, so the 3D is done by hand. Each tick the graph builds the camera's direction vectors from the plane's heading, pitch and roll, projects every point onto the screen, and draws shapes far to near so closer ones cover farther ones.

The terrain is a fan of points in front of the plane, dense up close and sparse near the horizon. The sky and mountains are defined by direction instead of position, so they're nearly free to draw.

A lot of the work went into speed. Desmos recomputes everything that depends on a changed value, so the graph keeps that count low: one-off helper expressions are folded into the ones that use them, repeated shapes are merged into single list expressions, and values like the current grid cell only update when they actually change.

The worst bug was the sim freezing after a minute or two of flying. Desmos compiles list math into JavaScript and writes long decimals straight into that code, so a constantly changing value like the sine of the heading meant thousands of new functions every second until the browser choked. Rounding every per-tick value to six decimals lets Desmos reuse the same compiled code, and the freezes are gone.

## Building it

The full graph is in `graph/plane-sim.json`. The scripts in `tools/` build it from an earlier version and check it for errors:

```
npm install
node tools/plane.mjs graph/plane-sim-v1.json graph/plane-sim.json
node tools/check.mjs graph/plane-sim.json
```

They use Playwright to drive Chrome, so Chrome needs to be installed. `chase.mjs` adds the 3rd-person view and `night.mjs` adds night mode.

Built on the [Desmos Graphing Calculator](https://www.desmos.com/calculator). Not affiliated with Desmos. MIT License.

Built by Kenneth Shi.
