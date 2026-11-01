export const MONSI_LIMITS = {
  maxTemperatureC: 120,
  allowedTemperaturesC: [37, 50, 60, 70, 80, 90, 95, 100, 110, 120]
};

export function validateTemperature(temperatureC?: number | null) {
  if (temperatureC == null) return { ok: true, temperatureC: null, adjusted: false };

  if (temperatureC > MONSI_LIMITS.maxTemperatureC) {
    return {
      ok: false,
      temperatureC: MONSI_LIMITS.maxTemperatureC,
      adjusted: true,
      message: `La Monsi no pasa de ${MONSI_LIMITS.maxTemperatureC} °C. Ajustado automáticamente.`
    };
  }

  return { ok: true, temperatureC, adjusted: false };
}

export function phaseLabel(phase: { action: string; speed?: number | null; reverse?: boolean; temperatureC?: number | null; minutes: number }) {
  const parts: string[] = [];
  if (phase.temperatureC != null) parts.push(`${phase.temperatureC} °C`);
  if (phase.speed != null) parts.push(`Vel. ${phase.speed}`);
  if (phase.reverse) parts.push("Marcha atrás");
  parts.push(`${phase.minutes} min`);
  return parts.join(" · ");
}
