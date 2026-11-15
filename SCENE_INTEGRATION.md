# Linh Birthday – v1.3 with approved scene coordinates

This release preserves the welcome and birthday-entry screens from v1.3.
The 19 movie keyframes (02–20) use the approved 390×780 JSON in `src/positions.json`.
All coordinates are center-anchored, including image dimensions and scale.
The timeline interpolates between adjacent keyframes; the `four` element has one stable identity throughout.

Run: `npm install` then `npm run dev`.
Test the entire 27-second animation on a mobile-sized viewport.

Note: editor snapshots are fixed keyframes, so the precise animation *easing and timing* are reconstructed; they were not included in the JSON.
