window.IS_OFFLINE_DEV = true;

window.OFFLINE_STATE = {
  climate: { temp: 27.5, humidity: 62 },
  smartplug: { power: 18.4, voltage: 220 },
  ac: { power: true, temp: 26, mode: "Cool", fan: "Auto" },
  lamp: { power: true, brightness: 70, mode: "White" },
  tv: { power: true, status: "Screen Saver", volume: 45 },
  nest: { online: true, status: "Idle", volume: 35 },
  cctv: {
    online: "ONLINE",
    motion: "No Motion",
    recording: "Recording",
    lastMotion: "2026-07-05 21:20",
    recordMode: "Event"
  },
  energy: {
    today: 0.42,
    week: 3.8,
    month: 14.6,
    todayCost: 254,
    weekCost: 2299,
    monthCost: 8833,
    monthRuntime: "38 Jam",
    tariffText: "Rp605/kWh"
  },
  lastAutomation: {
    scene: "Offline Dev Scene",
    timestamp: "2026-07-05 21:20"
  },

  summary: {
    summaryAC: "ON",
    summaryLamp: "ON",
    summaryTV: "ON",
    summaryCCTV: "ONLINE",
    summaryEnergy: "0.42 kWh • Rp254"
  },
  cards: {
    ac: {
      temperature_text: "26°C",
      temperature: 26,
      status: "Cooling",
      mode: "Cool",
      fan: "Auto"
    },
    lamp: {
      status: "ON",
      brightness_text: "70%",
      brightness: 70,
      mode: "White"
    },
    tv: {
      power: true,
      status: "Screen Saver",
      volume: 45
    },
    nest: {
      bindings: {
        nestPowerBadge: true,
        nestStatus: "Idle",
        nestVolume: "35%",
        nestVolumeBarFill: 35
      }
    },
    climate_power: {
      bindings: {
        roomTemp: "27.5°C",
        roomHumidity: "62%",
        plugPower: "18.4 W",
        plugVolt: "220 V"
      }
    },
    cctv: {
      bindings: {
        cctvOnline: "ONLINE",
        cctvMotion: "No Motion",
        cctvRecording: "Recording",
        cctvLastMotion: "5 menit lalu"
      }
    },
    energy: {
      bindings: {
        energyToday: "0.42 kWh",
        energyWeek: "3.8 kWh",
        energyMonth: "14.6 kWh",
        energyTodayCost: "Rp254",
        energyWeekCost: "Rp2.299",
        energyMonthCost: "Rp8.833",
        energyRuntimeMonth: "38 Jam",
        energyTariff: "Rp605/kWh"
      }
    }
  }
};

console.log("OS-OFFLINE-001G Dual Offline State Loaded");
