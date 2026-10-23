<p align="center">
  <img src="Qp1ng_logo.png" alt="Q-P1NG logo" width="220">
</p>

<h1 align="center">Q-P1NG</h1>

<p align="center">
  <b>A private messenger for Android. No account, no phone number, no server that holds your messages.</b><br>
  <i>ghost signals for a nomadic network. Here. Then gone.</i>
</p>

<p align="center">
  <a href="https://www.qp1ng.com">Website</a> ·
  <a href="https://www.qp1ng.com/pro/">Get Pro</a> ·
  <a href="https://www.qp1ng.com/privacy.html">Privacy</a> ·
  <a href="SECURITY.md">Security</a> ·
  <a href="#support-development">Support development</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Android-8.0%2B-3DDC84?style=flat-square&logo=android&logoColor=white" alt="Android 8.0 or later">
  <img src="https://img.shields.io/badge/Tor-built%20in-7D4698?style=flat-square&logo=torproject&logoColor=white" alt="Tor built in">
  <img src="https://img.shields.io/badge/account-none-00B8C4?style=flat-square" alt="No account">
  <img src="https://img.shields.io/badge/tracking-none-00B8C4?style=flat-square" alt="No tracking">
</p>

---

## What Q-P1NG is

Q-P1NG is a messenger for people whose conversations have to stay theirs: journalists, activists, researchers, and
anyone who would rather not hand a phone number to a chat app. Your identity is a set of keys created on your phone.
Messages go straight from phone to phone over Tor onion services, over a Bluetooth and Wi-Fi mesh when there is no
internet, or over LoRa radio.

## Editions

| | Core | Pro |
|---|:---:|:---:|
| Price | Free | €9.99 once on the website, or the paid app on Google Play |
| Encrypted chat, voice notes, files, voice and video calls | ✓ | ✓ |
| Offline mesh, Q-Feed, Q-Cast listening, Secure Live, secure keyboard, panic wipe | ✓ | ✓ |
| On-device AI, dictation and voices, radio tools, offline maps | | ✓ |
| Bitcoin vault, counter-surveillance, automations, Q-Cast broadcasting, every theme | | ✓ |

Two ways to get it:

- **Website edition** ([www.qp1ng.com](https://www.qp1ng.com)): carries every feature of its edition, including the
  Linux sandbox in Pro, and updates itself with signed releases published in this repository. Pro is unlocked with a
  licence key.
- **Google Play** (in preparation): Core and Pro as two apps, with Pro paid through Google Play. The Play builds leave
  out what Google Play does not allow, such as the Linux sandbox and self-updates.

## Features

### Core

- End-to-end encrypted messages, voice notes, files, voice and video calls
- Delivery directly between phones over Tor onion services; when a contact is offline, a sealed envelope waits on a
  relay that cannot read it
- Mesh chat with nearby phones over Bluetooth and Wi-Fi Direct, and calls on a local Wi-Fi network, with no internet
- **Q-Feed**: a public feed on Nostr, with reporting, mute and block
- **Q-Cast**: listen to live audio stations
- **Secure Live**: share live video with faces blurred on the phone
- A keyboard that makes no network connections
- Panic wipe, duress PIN and accessibility themes
- Bitcoin requests and addresses in chat, opened in your own wallet

### Pro

- **Q-Brain**: chat, vision and image generation with models that run on your phone; online providers only if you add
  them with your own API key
- Whisper dictation, natural reading voices, a voice changer in calls and voice-note effects
- **Radio**: SDR receivers, LoRa and the GhostWave acoustic modem
- **Q-Cast live**: broadcast your own audio station
- **Q-GEO**: offline maps
- Private file sharing between contacts
- A non-custodial Bitcoin vault
- **Q-SWEEP**: counter-surveillance and a tracker guard
- Automations and every theme
- A Linux sandbox (website edition only)

## How it protects you

- **No account.** No phone number, email or name. Your identity is a key pair generated on your phone and kept in the
  Android Keystore.
- **End-to-end encryption.** Each message is encrypted with a fresh AES-256-GCM key, sealed for the recipient's
  RSA-2048 key and signed by the sender. Messages are padded to a fixed size.
- **Calls and Secure Live.** Audio and video travel directly between phones or, over Tor, through a relay on the
  called contact's phone, never through our servers. The DTLS 1.3 handshake offers the hybrid post-quantum key
  exchange X25519MLKEM768.
- **Tor built in.** Tor runs inside the app; Orbot is not needed.
- **No message servers.** Q-P1NG runs no server that stores or routes your messages. Envelopes for offline contacts
  wait on our Nostr relay, an onion service that keeps no logs and deletes them after 7 days, or on public Nostr
  relays reached through Tor.
- **Encrypted storage.** An SQLCipher database, keys in the Android Keystore, and backups encrypted with Argon2id and
  AES-256-GCM.
- **No tracking.** No analytics, advertising or crash-reporting SDKs, and the app's own code writes no logs.
- **Panic wipe.** Keys are destroyed first, then private storage is overwritten and checked; a duress PIN does the
  same without announcing it.

What it cannot hide: relays see the public keys, time and size of an envelope, and services reached without Tor see
your IP address. The [privacy policy](https://www.qp1ng.com/privacy.html) lists every service the app contacts and
what each one sees.

## Download

- **Website edition**: from [www.qp1ng.com](https://www.qp1ng.com). Releases are published on this repository's
  Releases page with their SHA-256; before installing an update, the app checks its signature, size, hash and
  signing certificate.
- **Google Play**: coming soon.
- **Pro licence**: at [www.qp1ng.com/pro](https://www.qp1ng.com/pro/), with Bitcoin today and by card soon. The key
  is checked offline on your phone and is not tied to a device.

Requirements: Android 8.0 or later on a 64-bit ARM phone (arm64-v8a).

## What's in this repository

The app's source code is not public. This repository holds what the website and the app publish:

| Path | Content |
|---|---|
| `docs/` | The website [www.qp1ng.com](https://www.qp1ng.com), also mirrored on IPFS (`ipns://qp1ng.com`) |
| `docs/pro/` | The Pro checkout page |
| `docs/manifest.json`, `docs/categories/` | The catalog of on-device AI models |
| `docs/maps/` | Q-GEO sample maps and the signed map catalog |
| `docs/firmware/` | LoRa firmware for the LilyGO T-Deck, with a browser installer |
| `docs/updates/` | The signed update manifest of the website edition (from the first release) |
| Releases | The APKs of the website edition |

## Security

Please report vulnerabilities privately, not in a public issue: see [SECURITY.md](SECURITY.md).

## Support development

Q-P1NG is built by a small independent team. If you want to support its development, you can send bitcoin to this
address:

<p align="center">
  <img src=".github/assets/btc-qr.svg" width="180" alt="QR code of the Bitcoin address below">
</p>

```
374KXiCjuvSr5aWXf1tzCB8fUzXhHanngi
```

A contribution is voluntary: it does not buy a licence or unlock Pro.

## Legal

Q-P1NG is commercial software, © 2026 ZonkeyNet, distributed under the [EULA](LICENSE). Q-P1NG and Quantum P1NG are
trademarks of ZonkeyNet.

[Terms](https://www.qp1ng.com/terms.html) · [Privacy](https://www.qp1ng.com/privacy.html) ·
[Refunds](https://www.qp1ng.com/refund.html) · [Licence](https://www.qp1ng.com/license.html)

Contact: support@qp1ng.com · legal@qp1ng.com

<p align="center">
  <i>In the nomadic network, the only trace left is the one you choose to leave.</i>
</p>
