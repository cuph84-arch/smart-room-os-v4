function formatACModeLabel(value) {
  const mode = String(value || "--").trim().toLowerCase();

  if (mode === "--" || mode === "") return "--";
  if (mode.includes("cool")) return "Cooling";
  if (mode.includes("heat")) return "Heating";
  if (mode.includes("dry")) return "Dry";
  if (mode.includes("fan")) return "Fan";
  if (mode.includes("auto")) return "Auto";

  return toTitleCase(mode);
}

function formatFanLabel(value) {
  const fan = String(value || "--").trim().toLowerCase();

  if (fan === "--" || fan === "") return "--";
  if (fan.includes("auto")) return "Auto";
  if (fan.includes("low")) return "Low";
  if (fan.includes("mid")) return "Medium";
  if (fan.includes("medium")) return "Medium";
  if (fan.includes("high")) return "High";
  if (fan.includes("turbo")) return "Turbo";
  if (fan.includes("sleep")) return "Sleep";

  return toTitleCase(fan);
}

function formatLampModeLabel(value) {
  const mode = String(value || "--").trim().toLowerCase();

  if (mode === "--" || mode === "") return "--";
  if (mode.includes("white")) return "White";
  if (mode.includes("colour")) return "Color";
  if (mode.includes("color")) return "Color";
  if (mode.includes("scene")) return "Scene";
  if (mode.includes("music")) return "Music";
  if (mode.includes("night")) return "Night";

  return toTitleCase(mode);
}

function toTitleCase(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, character => character.toUpperCase());
}

function formatValue(value, suffix) {
  if (value === "--" || value === null || value === undefined || value === "") {
    return "--";
  }

  if (suffix === "°C" || suffix === "%") {
    return value + " " + suffix;
  }

  return value + suffix;
}

function formatKwh(value) {
  return Number(value || 0).toFixed(2) + " kWh";
}

function formatRupiah(value) {
  return "Rp " + Number(value || 0).toLocaleString("id-ID");
}

/* =========================
