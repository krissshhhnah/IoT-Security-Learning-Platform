<div align="center">

<!-- Animated top banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=ff2a4d&height=200&section=header&text=ISLP&fontSize=80&fontColor=ffffff&fontAlignY=38&desc=IoT%20Security%20Learning%20Platform&descAlignY=60&descSize=20&animation=fadeIn" width="100%"/>

<!-- Logo -->
<img src="docs/logo.png" alt="ISLP Logo" width="80" style="margin-top: -40px"/>

<!-- Animated typing headline -->
<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Space+Mono&size=22&pause=1000&color=FF2A4D&center=true&vCenter=true&width=700&lines=Cyber-Physical+Attack+Simulation;17+OSI-Aligned+IoT+Attack+Vectors;Live+3D+Network+Topology+Engine;Real+Hardware+%2B+Digital+Twin+Mode" alt="Typing SVG" /></a>

<br/>

<!-- Badges -->
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black)](https://greensock.com/gsap/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![ESP32](https://img.shields.io/badge/ESP32-E7352C?style=for-the-badge&logo=espressif&logoColor=white)](https://espressif.com)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

<br/>

**Built at the Department of Computer Science & Engineering, NITK Surathkal**

</div>

---

## 🖥️ Screenshots

<div align="center">

### Hero — Command Center Landing
<img src="docs/ss_hero.png" alt="ISLP Hero Section" width="100%" style="border-radius: 8px; border: 1px solid #ff2a4d33"/>

### Attack Surface — 17 OSI-Aligned Vectors
<img src="docs/ss_attacks.png" alt="ISLP Attack Cards" width="100%" style="border-radius: 8px; border: 1px solid #ff2a4d33"/>

</div>

---

## 🔴 Overview

ISLP is an interactive IoT security learning platform that simulates **17 real-world cyber-physical attack vectors** on a live 3D network topology. It bridges the gap between theoretical security concepts and hands-on understanding through a visually-rich, command-center-style interface — complete with a real hardware integration layer using ESP32 nodes communicating over ESP-NOW.

> *"The best way to understand a cyberattack is to execute one — safely."*

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **17 Attack Simulations** | Spanning all OSI layers — Physical to Application |
| 🌐 **3D Live Topology** | Interactive Three.js WebGL canvas with real-time packet flows |
| 🚀 **GSAP Boot Sequence** | Cinematic terminal-style loader on app start |
| 🖱️ **Custom Cursor Engine** | Framer Motion neon targeting-reticle with spring physics |
| 📋 **Attack Info Modals** | TL;DR + Technical Deep Dive explanation for every attack |
| 🔗 **Digital Twin Mode** | Sync with real ESP32 hardware via Node.js WebSocket bridge |
| 📊 **Device Registry** | Live node table — IP, MAC, role, and real-time status |
| 💉 **Payload Injection** | Send custom attack payloads to physical hardware from the UI |

---

## 🏗️ Tech Stack

```
Frontend  →  React 18 + Vite + TypeScript + Tailwind CSS
3D Engine →  Three.js (WebGL) + OrbitControls
Animation →  GSAP 3 + Framer Motion
Backend   →  Node.js + Express + Socket.IO
Hardware  →  ESP32 (ESP-NOW protocol, Arduino firmware)
```

---

## 📂 Project Structure

```
attack_sim_v2/
├── hero-app/                     # Main React application (Vite)
│   ├── public/legacy/            # Vanilla JS simulation engine
│   │   ├── app.js                # Main application controller
│   │   ├── three-topology.js     # 3D WebGL network renderer
│   │   ├── simulator.js          # Attack simulation logic
│   │   └── serial-gateway.js     # ESP32 hardware bridge
│   └── src/
│       ├── components/
│       │   ├── DashboardUI.tsx    # Main simulation dashboard
│       │   ├── HeroSection.tsx    # Landing hero section
│       │   ├── LandingSections.tsx# Attack cards, Impact, Team
│       │   ├── AttackInfoModal.tsx# Attack detail modals
│       │   ├── Loader.tsx         # GSAP boot sequence
│       │   └── CustomCursor.tsx   # Framer Motion cursor
│       └── App.tsx
├── server/                       # Node.js WebSocket bridge
├── docs/                         # Screenshots & assets
└── README.md
```

---

## 🚀 Getting Started

### 1. Install & Run Frontend

```bash
cd hero-app
npm install
npm run dev
```

Open **http://localhost:5173**

### 2. Start Hardware Bridge *(optional)*

```bash
cd server
node index.js
```

> Listens on port `3001` — bridges WebSocket ↔ ESP32 serial for real-time hardware control.

### 3. Production Build

```bash
cd hero-app
npm run build
```

---

## 🎯 Attack Vectors

<div align="center">

<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Space+Mono&weight=700&size=24&pause=1000&color=00FF00&center=true&vCenter=true&width=600&lines=FULLY+SUPPORTED+PHYSICAL+ATTACKS;LIVE+ON+ESP32+HARDWARE" alt="Typing SVG" /></a>

<br/>

<img src="https://img.shields.io/badge/Man--in--the--Middle-000000?style=for-the-badge&logo=hackthebox&logoColor=00FF00" />
<img src="https://img.shields.io/badge/Eavesdropping-000000?style=for-the-badge&logo=hackthebox&logoColor=00FF00" />
<img src="https://img.shields.io/badge/Replay_Attack-000000?style=for-the-badge&logo=hackthebox&logoColor=00FF00" />
<img src="https://img.shields.io/badge/Spoofing_Attack-000000?style=for-the-badge&logo=hackthebox&logoColor=00FF00" />
<img src="https://img.shields.io/badge/Packet_Injection-000000?style=for-the-badge&logo=hackthebox&logoColor=00FF00" />
<br/>
<img src="https://img.shields.io/badge/Denial_of_Service-000000?style=for-the-badge&logo=hackthebox&logoColor=00FF00" />
<img src="https://img.shields.io/badge/Jamming_Attack-000000?style=for-the-badge&logo=hackthebox&logoColor=00FF00" />
<img src="https://img.shields.io/badge/Credential_Theft-000000?style=for-the-badge&logo=hackthebox&logoColor=00FF00" />
<img src="https://img.shields.io/badge/Session_Hacking-000000?style=for-the-badge&logo=hackthebox&logoColor=00FF00" />
<br/>
<img src="https://img.shields.io/badge/Rogue_Insertion-000000?style=for-the-badge&logo=hackthebox&logoColor=00FF00" />
<img src="https://img.shields.io/badge/Sensor_Tampering-000000?style=for-the-badge&logo=hackthebox&logoColor=00FF00" />
<img src="https://img.shields.io/badge/Delay_Attack-000000?style=for-the-badge&logo=hackthebox&logoColor=00FF00" />

<br/><br/>

<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Space+Mono&weight=700&size=24&pause=1000&color=FF0000&center=true&vCenter=true&width=600&lines=LOCKED+IN+DIGITAL+TWIN;IMPOSSIBLE+ON+CURRENT+HARDWARE" alt="Typing SVG" /></a>

<br/>

<img src="https://img.shields.io/badge/Distributed_DoS-000000?style=for-the-badge&logo=x&logoColor=FF0000" />
<img src="https://img.shields.io/badge/Routing_Attack-000000?style=for-the-badge&logo=x&logoColor=FF0000" />
<img src="https://img.shields.io/badge/Sybil_Attack-000000?style=for-the-badge&logo=x&logoColor=FF0000" />
<img src="https://img.shields.io/badge/Timing_Attack-000000?style=for-the-badge&logo=x&logoColor=FF0000" />
<img src="https://img.shields.io/badge/Physical_Access-000000?style=for-the-badge&logo=x&logoColor=FF0000" />

</div>

---

## 🔧 Hardware Setup

Three ESP32 nodes form the cyber-physical digital twin:

```
┌─────────────────┐    ESP-NOW     ┌─────────────────┐
│   Node A        │ ─────────────► │   Node B        │
│ Parking Sender  │                │ Parking Receiver│
│ (RFID + Sensor) │                │ (OLED + Gate)   │
└─────────────────┘                └─────────────────┘
         │                                  │
         └──────────────────────────────────┘
                         ▲
               ┌─────────────────┐
               │   Attacker ESP  │
               │  (Promiscuous   │◄──── Web UI (Socket.IO)
               │   Sniffer)      │
               └─────────────────┘
```

---

## 👥 Team

<div align="center">

| Role | Name | LinkedIn |
|---|---|---|
| 🎓 Project Supervisor | **Dr. K. V. Gangadharan** | [![LinkedIn](https://img.shields.io/badge/-kvganga-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/kvganga/) |
| 🧑‍🏫 Project Mentor | **Alisha A Joy** | [![LinkedIn](https://img.shields.io/badge/-alisha--joy25a-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/alisha-joy25a/) |
| 💻 Lead Developer | **Rudranarayan** | [![LinkedIn](https://img.shields.io/badge/-rudranarayan18-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/rudranarayan18) |
| 💻 Lead Developer | **Krishnendu Prasanth** | [![LinkedIn](https://img.shields.io/badge/-krishnendu--prasanth-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/krishnendu-prasanth) |

</div>

---

<div align="center">

**Department of Computer Science & Engineering**<br/>
National Institute of Technology Karnataka (NITK), Surathkal — 575025

<img src="https://capsule-render.vercel.app/api?type=waving&color=ff2a4d&height=100&section=footer" width="100%"/>

</div>
