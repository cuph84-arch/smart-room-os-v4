# Arsitektur

LocalEngine
                      │
                      │
              PollingEngine
                      │
                      ▼
              EventEngine
                      │
                      ▼
             StateManager
                      │
                      ▼
            FirebaseWriter
                      │
                      ▼
                Firebase Cloud

────────────────────────────────────────────

             Runtime Hybrid Pipeline

            DeviceFactory
                  │
                  ▼
             TuyaDriver
                  │
                  ▼
         HybridTuyaDriver
          │             │
          ▼             ▼
 LocalTuyaAdapter   CloudTuyaAdapter
          │             │
          └──────┬──────┘
                 ▼
        ResponseClassifier
                 ▼
          FallbackPolicy
                 ▼
        StateNormalizer
                 ▼
       runtime/state.json


---

Komponen

Local Engine

Loop utama aplikasi.

Tugas:

polling device

detect perubahan

update state

push Firebase

menjalankan Runtime Hybrid Pipeline setiap 60 detik



---

Runtime Hybrid Pipeline

Bertugas:

membaca status device

normalisasi local/cloud

atomic write runtime/state.json


Pipeline ini TIDAK mengirim command.


---

Hybrid Driver

Driver kompatibel terhadap interface lama.

Public API:

status()

set_power()

turn_on()

turn_off()



---

Response Classifier

Mengklasifikasikan hasil TinyTuya menjadi:

local_success

local_failed_retryable

local_failed_non_retryable



---

Fallback Policy

Menentukan apakah cloud boleh digunakan.

Saat ini device:

Lampu

Termometer

Bardi Smart Plug


diizinkan fallback.


---

Firebase

Firebase hanya menerima hasil state.

Tidak digunakan untuk kontrol device.


---

Runtime

File runtime:

runtime/state.json

ditulis menggunakan atomic write.


---

Local First

Prioritas:

1. TinyTuya Local


2. Cloud Fallback


3. unavailable




---

Cloud

Cloud hanya digunakan bila:

classifier mengizinkan

fallback policy mengizinkan



---

Deployment

python main.py

atau menjalankan LocalEngine.


---

Environment

Python

TinyTuya

Firebase

JSON Runtime

---

# architecture.md

````markdown
# Smart Room OS V4 Architecture

---

# High Level Architecture

LocalEngine
                  │
     ┌────────────┴────────────┐
     ▼                         ▼

PollingEngine              Runtime Hybrid │                         │ ▼                         ▼ EventEngine                 DeviceFactory │                         │ ▼                         ▼ StateManager               HybridTuyaDriver │                   │           │ ▼                   ▼           ▼ FirebaseWriter       Local Adapter  Cloud Adapter │                   │           │ ▼                   └─────┬─────┘ Firebase                   Response Classifier │ ▼ Fallback Policy │ ▼ State Normalizer │ ▼ runtime/state.json

---

# Layer

## Engine Layer

LocalEngine

mengontrol seluruh runtime.

Interval polling default:

5 detik.

Hybrid pipeline:

60 detik.

---

## Driver Layer

TuyaDriver │ ▼ HybridTuyaDriver

TuyaDriver hanyalah compatibility wrapper.

Seluruh implementasi berada pada HybridTuyaDriver.

---

## Adapter Layer

LocalTuyaAdapter

CloudTuyaAdapter

---

## Decision Layer

ResponseClassifier

↓

FallbackPolicy

↓

StateNormalizer

---

## Runtime Layer

runtime/state.json

Atomic write.

---

# Data Flow

Device

↓

TinyTuya

↓

Response Classifier

↓

Fallback Policy

↓

Cloud (optional)

↓

Normalizer

↓

runtime/state.json

↓

Firebase

---

# Public API

TuyaDriver

status(device)

set_power(device,power_dp,value)

turn_on(device,power_dp)

turn_off(device,power_dp)

---

# Cloud Rules

Cloud bukan jalur utama.

Cloud hanya digunakan jika:

- local gagal
- retryable
- policy mengizinkan

---

# Safety

Runtime Pipeline:

- tidak mengontrol Smart Plug
- tidak mengirim command
- hanya membaca state


