# Workflow

---

# Workflow Local Engine

```
Start

↓

PollingEngine

↓

EventEngine

↓

Ada perubahan?

├── Tidak
│
│ sleep
│
└── Ya

↓

StateManager

↓

Firebase Push

↓

Sleep
```

---

# Workflow Hybrid Pipeline

```
Start

↓

DeviceFactory

↓

Ambil Device

↓

Hybrid Driver

↓

TinyTuya Local

↓

Classifier

↓

Success ?

├── Ya
│
│ Normalize Local
│
└── Tidak
│
▼

Fallback Policy

↓

Allowed ?

├── Tidak
│
│ unavailable
│
└── Ya
│
▼

Cloud

↓

Normalize

↓

runtime/state.json

↓

Firebase
```

---

# Workflow Driver

```
status()

↓

Local Adapter

↓

Classifier

↓

Fallback

↓

Cloud

↓

Return Response
```

---

# Runtime State

```
runtime/

└── state.json
```

Struktur:

```json
{
  "updated_at":"...",
  "devices":{
      "lamp":{
          "state":{}
      },
      "climate":{
          "state":{}
      }
  }
}
```

---

# Response Classification

```
Local Response

↓

Has DPS

↓

SUCCESS

────────────

Error 900-914

↓

RETRYABLE

↓

Cloud

────────────

Unknown

↓

NON RETRYABLE
```

---

# Device Priority

1. Local TinyTuya

↓

2. Cloud

↓

3. unavailable

---

# Atomic Write

runtime/state.tmp.json

↓

replace()

↓

runtime/state.json

Tidak pernah menulis langsung ke file final.