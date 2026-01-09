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

### Client (Android)
* **Core:** Kotlin, Jetpack Compose (Material3).
* **Network:** Retrofit + OkHttp (Tor Proxying via Orbot).
* **Local Storage:** SQLite (Room) with SQLCipher (256-bit AES encryption).
* **Cryptography:** `javax.crypto` & `java.security` (RSA-2048 + AES-GCM).
* **Security:** Root Detection, Emulator Detection, Screen Shield (Flag Secure).

### Server (The Relay)
* **Core:** Python (Flask).
* **Policy:** **Zero-Log Architecture**. The server acts as a blind relay. Messages are deleted immediately after delivery.

## 🛡 Security Protocols

### 1. The Onion Layer 🧅
All traffic is routed through **Tor (Orbot)**.
* **No IP Leaks:** The server never sees the user's real IP address.
* **Location Agnostic:** Nodes can be geographically distributed without affecting user reachability.

### 2. End-to-End Encryption 🔐
* **Asymmetric Handshake:** RSA-2048 keys generated locally on the device. Private keys never leave the Keystore.
* **Payload Encryption:** Messages are encrypted on the device before transmission. The server sees only Base64 noise.

### 3. Anti-Forensics 💀
* **Integrity Check:** The app self-terminates if it detects a rooted environment or a debugger attached.
* **Auto-Lock:** Immediate session termination when the app moves to background.
* **Duress PIN:** (Coming Soon) Entering a specific fake PIN wipes the database or loads a dummy UI.

## 🚀 Setup

### Prerequisites
1.  **Android Studio** (Koala or later).
2.  **Orbot** installed on the physical device/emulator (Required for Tor routing).

### Installation
```bash
# Clone the repository
git clone [https://github.com/zonkeynet/Quantum-P1NG.git](https://github.com/zonkeynet/Quantum-P1NG.git)

# Open in Android Studio and sync Gradle
cd Quantum-P1NG
