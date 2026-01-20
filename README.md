<p align="center">
  <img src="https://github.com/zonkeynet/Quantum-P1NG/blob/main/Qp1ng_logo.png?raw=true" 
       alt="Quantum P1NG logo" 
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
  <img src="https://img.shields.io/badge/status-GOLD-00F2FF?style=flat-square" alt="Status" />
</p>

<p align="center">
  <a href="#-mission">Mission</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-security-protocols">Security</a> •
  <a href="#-setup">Setup</a> •
  <a href="#-server-side-deployment-bypass-mode">Server</a> •
  <a href="#-legal--compliance">Legal</a>
</p>

---

## 📡 Mission

**Quantum P1NG** is not just a chat application.  
It is a **digital survival instrument** engineered for communication in hostile network environments.

Designed for journalists, activists, researchers, and anyone who must protect **identity, sources, and conversations** under surveillance, censorship, or repression.

Unlike traditional secure messengers, Quantum P1NG assumes that:

- networks are monitored  
- servers are compromised  
- devices may be seized  

For this reason, it focuses not only on encryption, but on **anti-forensics, metadata denial, and operational security**.

> *“We do not store what we cannot see. We do not see what is encrypted.”*

---

## 🛠 Tech Stack

To maintain operational security (OpSec) and minimize attack surface, exact library versions are intentionally abstracted.

### Client Node (Android)

- **Architecture:** Native Android (Kotlin + Jetpack Compose)  
- **Network:** Tor Circuit Integration (Orbot required)  
- **Storage:** AES-256 encrypted local database  
- **Cryptography:** Hybrid cryptography  
  - RSA-2048 (handshake & identity)  
  - AES-256-GCM (payload encryption)  
- **Hardening:**  
  - FLAG_SECURE (screen capture prevention)  
  - background auto-lock  
  - stealth session termination  

---

### Relay Node (Server)

- **Framework:** Hardened asynchronous API (Python / FastAPI)  
- **Protocol:** Blind relay interface  
- **Policy:** **Zero-log architecture**  
- **Traffic:** Encrypted opaque payloads only  
- **Topology:**  
  - clearnet HTTPS gateway  
  - native Tor .onion hidden service  

The relay is intentionally blind.  
It cannot identify users, decode messages, or build metadata profiles.

---

## 🛡 Security Protocols

### 1. Onion Transport Layer 🧅

All traffic is routed through **Tor (Orbot)**.

- No real IP exposure  
- Network-level anonymity  
- Onion service compatibility  
- Infrastructure decoupling  

---

### 2. End-to-End Encryption 🔐

- All keys are generated locally  
- Private keys never leave the device  
- All payloads are encrypted before transport  
- The server handles only ciphertext  

The relay only sees noise.

---

### 3. Anti-Forensics Layer 💀

- Burn-on-read messages  
- Remote cryptographic wipe  
- Local emergency purge  
- Background execution lock  
- Session integrity checks  

Quantum P1NG is designed to protect the **operator**, not only the data.

---

## 🚀 Setup

### System Requirements

- Android 8.0+ (API 26 → 35)  
- Android Studio or SDK CLI  
- JDK 17+  
- **Orbot installed and active**

---

### Installation (from source)

```bash
git clone https://github.com/zonkeynet/Quantum-P1NG.git
cd Quantum-P1NG
./gradlew assembleRelease
```

---

## 🖥 Server-Side Deployment (Bypass Mode)

To deploy your own hardened Relay Node on a clean Debian/Ubuntu VPS:

```bash
wget https://raw.githubusercontent.com/zonkeynet/Quantum-P1NG/main/install_qp1ng_complete.sh
chmod +x install_qp1ng_complete.sh
sudo ./install_qp1ng_complete.sh
```

---

## ⚖️ Legal & Compliance

**License:** GNU AGPLv3  
**Copyright:** © 2026 ZonkeyNet / Quantum P1NG Team  

**Contact:** quantump1ng@proton.me  

Privacy & legal documentation will be published under `/docs/legal/`.

---

<p align="center">
  <i>"In the nomadic network, the only trace left is the one you choose to leave."</i>
</p>
