import { Check, Info } from "lucide-react";
import { isVehicleSelectable, Vehicle, VehicleId } from "./data";
import { useVehicles } from "./cms";
import { Lang } from "./i18n";

const LABELS: Record<VehicleId, { en: string; ar: string; model: string }> = {
  corolla: { en: "Sedan", ar: "سيدان", model: "Toyota Corolla" },
  xpander: { en: "MPV", ar: "MPV", model: "Mitsubishi Xpander 2027" },
  hiace: { en: "Mini Van", ar: "ميني فان", model: "Toyota HiAce" },
};

export function vehicleSegmentLabel(vehicle: Vehicle, lang: Lang): string {
  const label = LABELS[vehicle.id] ?? { en: vehicle.category, ar: vehicle.categoryAr, model: vehicle.name };
  return lang === "AR" ? label.ar : label.en;
}

function modelName(vehicle: Vehicle): string {
  return LABELS[vehicle.id]?.model ?? vehicle.name;
}

export function VehicleSegmentedSelector({
  id,
  lang,
  value,
  onChange,
}: {
  id: string;
  lang: Lang;
  value: VehicleId;
  onChange: (value: VehicleId) => void;
}) {
  const isAR = lang === "AR";
  const vehicles = useVehicles();
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === value) ?? vehicles[0];
  const helperId = `${id}-capacity`;

  return (
    <div>
      <div
        role="radiogroup"
        aria-describedby={helperId}
        aria-label={isAR ? "نوع السيارة" : "Vehicle type"}
        className="grid grid-cols-1 gap-1 overflow-visible rounded-xl border border-gray-200 bg-gray-100 p-1 sm:grid-cols-3"
      >
        {vehicles.map((vehicle) => {
          const selected = vehicle.id === value;
          const disabled = !isVehicleSelectable(vehicle);
          const descId = `${id}-${vehicle.id}-desc`;
          return (
            <button
              key={vehicle.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-disabled={disabled}
              aria-describedby={`${descId} ${helperId}`}
              title={`${modelName(vehicle)} · ${isAR ? vehicle.capacityAr : vehicle.capacityEn}`}
              onClick={() => {
                if (!disabled) onChange(vehicle.id);
              }}
              onKeyDown={(event) => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                event.preventDefault();
                const step = event.key === "ArrowRight" ? 1 : -1;
                const enabled = vehicles.filter(isVehicleSelectable);
                if (!enabled.length) return;
                const currentEnabled = Math.max(0, enabled.findIndex((item) => item.id === value));
                const next = (currentEnabled + step + enabled.length) % enabled.length;
                if (enabled[next]) onChange(enabled[next].id);
              }}
              className={`group relative min-h-9 rounded-lg px-2 py-1.5 text-center text-sm font-semibold transition-all focus-visible:z-10 ${
                disabled
                  ? selected
                    ? "cursor-not-allowed border border-gray-200 bg-gray-200 text-gray-500 opacity-70"
                    : "cursor-not-allowed text-gray-400 opacity-60"
                  : selected
                    ? "bg-lux-green text-white shadow-sm"
                    : "text-gray-700 hover:bg-white hover:text-lux-green"
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                {selected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                {vehicleSegmentLabel(vehicle, lang)}
              </span>
              <span id={descId} className="sr-only">
                {modelName(vehicle)}. {isAR ? vehicle.capacityAr : vehicle.capacityEn}.
                {disabled ? (isAR ? " غير متاحة للحجز حالياً." : " Temporarily unavailable for booking.") : ""}
              </span>
              <span
                className="pointer-events-none absolute bottom-[calc(100%+0.45rem)] left-1/2 z-30 hidden w-56 -translate-x-1/2 rounded-lg bg-lux-dark px-3 py-2 text-xs font-normal leading-relaxed text-white shadow-xl group-hover:block group-focus-visible:block max-md:hidden"
                role="tooltip"
              >
                <span className="mb-1 flex items-center justify-center gap-1 font-semibold">
                  <Info className="h-3 w-3" aria-hidden="true" />
                  {modelName(vehicle)}
                </span>
                {isAR ? vehicle.capacityAr : vehicle.capacityEn}
                {disabled && <span className="mt-1 block text-lux-client-accent">{isAR ? "غير متاحة للحجز حالياً" : "Temporarily unavailable"}</span>}
              </span>
            </button>
          );
        })}
      </div>
      <p id={helperId} className="mt-1 min-h-4 text-xs font-medium text-gray-600 max-md:mt-1.5" aria-live="polite">
        {selectedVehicle ? `${modelName(selectedVehicle)} · ${isAR ? selectedVehicle.capacityAr : selectedVehicle.capacityEn}` : ""}
      </p>
    </div>
  );
}
