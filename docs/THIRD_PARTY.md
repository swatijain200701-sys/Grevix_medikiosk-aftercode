# MediKiosk: Third-Party Dependencies & Attribution

All dependencies used in MediKiosk are standard open-source libraries compliant with hackathon submission guidelines.

| Package / Tool | Version | Purpose | License |
| :--- | :--- | :--- | :--- |
| **next** | `16.4.0` | React framework with App Router & server routes | MIT |
| **react** / **react-dom** | `19.3.0` | UI component rendering | MIT |
| **dexie** | `^4.0.11` | Client IndexedDB wrapper for offline drafts & sync queues | Apache 2.0 |
| **zod** | `^3.24.2` | Runtime schema validation for requests and LLM outputs | MIT |
| **better-sqlite3** | `^12.8.0` | Durable server-side SQLite repository storage | MIT |
| **lucide-react** | `^1.16.0` | Accessible icons | ISC |
| **vitest** | `^5.0.3` | Unit and integration test runner | MIT |
| **@playwright/test** | `^1.58.0` | End-to-end browser automation & offline network tests | Apache 2.0 |
| **tailwindcss** | `^4.0.0` | Utility CSS framework | MIT |

---

## Native Platform APIs Used (Zero External Dependency)
- **Web Crypto API (SubtleCrypto):** AES-GCM 256 client draft encryption.
- **Service Worker API:** Application shell caching (`/sw.js`).
- **Web Speech API (`SpeechRecognition`):** Browser-native voice dictation.
- **MediaStream / `MediaRecorder` API:** Offline local audio recording fallback.