# Q-GEO map catalog

`signed-envelope.json` lists the offline map packs the Q-P1NG app can download. It is signed with Ed25519
(key id `qp1ng-maps-2026`); the app ships the public key and accepts a catalog only when the signature, the
schema, the expiry and a revision no lower than the last one it saw all check out. Otherwise it keeps its
built-in catalog.

- Revision 7, valid until 2027-10-22.
- Each map file is pinned by size and SHA-256; files under `../samples/<date>/` are never replaced.
- A new catalog gets a higher revision and a fresh signature; the signing key is kept offline.

Map data © OpenStreetMap contributors (ODbL), see the attribution next to each map.
