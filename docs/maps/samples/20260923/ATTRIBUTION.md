# Q-GEO example maps (20260923)

© OpenStreetMap contributors, https://www.openstreetmap.org/copyright
OpenStreetMap data under the Open Database License (ODbL 1.0):
https://opendatacommons.org/licenses/odbl/1-0/

Extracted from Protomaps' 2026-09-23 daily build (schema 4.15.2,
https://build.protomaps.com/20260923.pmtiles) with the official go-pmtiles v1.31.2
CLI. Zooms 0-14, native vector data, not imagery. Headers were edited only to set a
useful initial camera zoom.

- gaza.pmtiles: Gaza Strip, bounds 34.2,31.2 to 34.58,31.6
- kyiv.pmtiles: central Kyiv (Ukraine), bounds 30.36,50.34 to 30.7,50.56

Q-P1NG downloads these files only when the user taps Download in the offline map
manager, and installs them only if their size and SHA-256 match the values built
into the signed app (see SHA256SUMS.txt). Published files are never replaced: a new
build gets a new dated folder. These are small examples, not whole-country coverage;
there is no live conflict, road safety or accessibility information.
