<p align="center">
  <img src="https://github.com/zonkeynet/Quantum-P1NG/blob/main/logo_quantum.png?raw=true" 
       alt="quantum P1NG logo" 
       width="260"/>
</p>

<h1 align="center">Quantum P1NG</h1>
<p align="center">
  <i>ghost signals for a nomadic network</i><br>
  <strong>Here. Then gone.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Android-3DDC84?style=flat-square&logo=android" alt="Android" />
  <img src="https://img.shields.io/badge/network-Tor%20Onion-7D4698?style=flat-square&logo=tor-browser" alt="Tor" />
  <img src="https://img.shields.io/badge/encryption-E2E%20AES--256-blue?style=flat-square&logo=letsencrypt" alt="Encryption" />
  <img src="https://img.shields.io/badge/status-ALPHA-orange?style=flat-square" alt="Status" />
</p>

<p align="center">
  <a href="#-mission">Mission</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-security-protocols">Security</a> •
  <a href="#-setup">Setup</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

---

## 📡 Mission

**Quantum P1NG** is not just a chat application; it's a survival tool for digital communication in hostile environments. Designed for anonymity, resilience, and anti-forensics, it operates exclusively through the **Tor Network** to ensure metadata obfuscation.

Unlike traditional secure messengers, Quantum P1NG assumes the device might be physically compromised. It features **Burn-on-Read**, **Duress Modes**, and **Integrity Checks** to protect the operator, not just the data.

> "We do not store what we cannot see. We do not see what is encrypted."

## 🛠 Tech Stack

To maintain operational security (OpSec) and minimize attack surfaces, exact library versions are abstracted.

### Client Node (Android)
* **Architecture:** Native Android (Kotlin/Compose).
* **Network:** Tor Circuit Integration (Orbot required).
* **Storage:** AES-256 Encrypted Local Database.
* **Cryptography:** Hybrid Cryptography (RSA-2048 Handshake + AES-GCM Payload).
* **Hardening:** Root Detection, Emulator Detection, Screen Shield (FLAG_SECURE).

### Relay Node (Server)
* **Protocol:** Blind Relay Interface.
* **Policy:** **Zero-Log Architecture**. Messages are treated as ephemeral streams.
* **Traffic:** Handles only encrypted payloads (Noise).
* **Topology:** Distributable, location-agnostic nodes.

## 🛡 Security Protocols

### 1. The Onion Layer 🧅
All traffic is routed through **Tor (Orbot)**.
* **No IP Leaks:** The relay never sees the user's real IP address.
* **Location Agnostic:** Nodes can be geographically distributed without affecting user reachability.

### 2. End-to-End Encryption 🔐
* **Asymmetric Handshake:** Keys are generated locally on the device. Private keys never leave the secure storage.
* **Payload Encryption:** Messages are encrypted on the device before transmission. The relay sees only Base64 noise.

### 3. Anti-Forensics 💀
* **Integrity Check:** The app self-terminates if it detects a compromised environment or attached debuggers.
* **Auto-Lock:** Immediate session termination when the app moves to background.
* **Duress PIN:** Entering a specific fake PIN triggers a decoy UI or data wipe.

## 🚀 Setup

### System Requirements
* **Target Device:** Android 8.0 (API 26) up to Android 15.
* **Build Env:** JDK 17+, Android SDK Command-line Tools.
* **Network:** **Orbot** must be installed and active (Tor connection).

### Configuration
> [!WARNING]
> **CONFIGURATION REQUIRED:** Before building, you must define your Relay Node URL.
> Create a `local.properties` file in the root directory and add:
> `QUANTUM_RELAY_URL="https://your-relay-node.com"`

### Installation (Source)

```bash
# 1. Clone the repository
git clone [https://github.com/zonkeynet/Quantum-P1NG.git](https://github.com/zonkeynet/Quantum-P1NG.git)

# 2. Initialize project
cd Quantum-P1NG

# 3. Build Debug APK
./gradlew assembleDebug

# 4. Deploy via ADB (Physical connection recommended)
adb install -r app/build/outputs/apk/debug/app-debug.apk
