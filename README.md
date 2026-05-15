# 🌌 PROJECT: VOID
### **The Sovereign Intelligence Node**
> *Decentralized. Zero-Cost. 100% Private. local-first AI.*

---

## 🛸 The Vision
**Project: VOID** is not just an AI assistant; it is a **Sovereign Intelligence Node**. Most AI today (OpenAI, Anthropic, Google) is built on a "Master-Slave" architecture where you must ask permission and pay a toll to access intelligence. 

**VOID flips the script.** 

By leveraging WebGPU and the local browser environment, VOID runs high-performance models entirely on your hardware. It researches the web, analyzes files, and "sees" images without ever sending a single pixel or prompt to an external server. It is unkillable, uncensorable, and completely free.

---

## ⚡ Key Capabilities

### 👁️ **Phase 6: Multi-Modal Optics**
VOID isn't just text. It can **see**. Using a local `ViT-GPT2` optics engine, you can drop any image into the terminal. VOID parses the visual data locally and uses that context to answer complex reasoning questions about the image.

### 📎 **Phase 7: The Omni-Parser**
Intelligence requires context. VOID features a universal file ingestion system:
- **PDFs:** Deep text extraction using Mozilla's `pdfjs-dist`.
- **Documents:** Microsoft Word (`.docx`) parsing via `mammoth.js`.
- **Data/Code:** JSON, CSV, Python, TS, and Markdown reading.
- **Privacy:** Files are never uploaded. They are "mounted" into the local RAG memory.

### 🛰️ **Swarm Intelligence (P2P Mesh)**
VOID nodes connect directly to each other via **PeerJS (WebRTC)**. This creates a decentralized "Hive Mind." If you research a topic, and your friend (Node B) asks about it later, your node can share its local memory context directly with them over an encrypted P2P tunnel, saving bandwidth and compounding intelligence.

### 📡 **Offline Sovereignty (PWA)**
VOID is a **Progressive Web App**. Once installed, it caches the entire 1GB+ engine and UI. You can run full AI research and multi-modal analysis in the middle of a desert with zero Wi-Fi.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Inference Engine** | `Transformers.js` (WebGPU/WASM) |
| **Aesthetics** | React + CSS Grid HUD (Sci-Fi Command UI) |
| **Memory (RAG)** | `Orama` Vector DB + IndexedDB Persistence |
| **Communication** | `PeerJS` (Serverless WebRTC Swarm) |
| **Optical AI** | `Xenova/vit-gpt2-image-captioning` |
| **Large Language Model**| `Qwen1.5-0.5B-Chat` (Quantized) |

---

## 🚀 Deployment & Installation

### **Standard Installation**
1. **Clone the repository:**
   ```bash
   git clone https://github.com/subhakantrout/subhakantrout.github.io.git
   cd project-void
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Launch the Node:**
   ```bash
   npm run dev
   ```

### **Manual Build**
To generate a production-ready node:
```bash
npm run build
```
The output will be in the `dist/` folder, ready for hosting on any static provider (GitHub Pages, Vercel, Netlify).

---

## 🔒 The Privacy Protocol
- **Zero Prompt Tracking:** Your ideas remain on your silicon.
- **Zero Image Storage:** Visual data is processed in RAM and purged.
- **Zero API Keys:** No accounts. No subscriptions. No credit cards.

---

## 📜 Development Log (The Evolution)
- **Phase 1-3:** Established core RAG, WebWorker architecture, and the Sci-Fi Command HUD.
- **Phase 4:** Integrated the WebRTC P2P Swarm Mesh.
- **Phase 5:** Implemented the Offline PWA installation protocol.
- **Phase 6:** Deployed the Multi-Modal Vision Optics.
- **Phase 7:** Engineered the Omni-Parser for universal document ingestion.

---
**Designed for the Next Generation of Sovereign Developers.**
*Built by subhakantrout // Powered by VOID Engine.*
