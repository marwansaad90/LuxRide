import { PackageCheck, Snowflake, Usb, Users, Wifi, X } from "lucide-react";
import { vehicleFeatureRows } from "./data";
import type { Vehicle } from "./data";
import type { Lang } from "./i18n";

const ICONS = {
  capacity: Users,
  airConditioning: Snowflake,
  usbCharging: Usb,
  wifi: Wifi,
  iceBox: PackageCheck,
} as const;

export function VehicleFeatures({ vehicle, lang }: { vehicle: Vehicle; lang: Lang }) {
  return (
    <ul className="mt-5 space-y-3 text-sm text-neutral-600">
      {vehicleFeatureRows(vehicle).map((feature) => {
        const Icon = feature.available === false && feature.key === "wifi" ? X : ICONS[feature.key];
        return (
          <li key={feature.key} className="flex items-center gap-3">
            <Icon className={`h-4 w-4 ${feature.available === false ? "text-neutral-300" : "text-lux-green"}`} />
            {lang === "AR" ? feature.ar : feature.en}
          </li>
        );
      })}
    </ul>
  );
}
