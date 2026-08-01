import logoSrc from "../../../imports/LuxRide-Logo-SVG-1.svg";

export function LuxRideLogo({ className = "h-12 w-auto" }: { className?: string }) {
  return (
    <img
      src={logoSrc}
      alt="LuxRide"
      className={`${className} object-contain`}
      width="160"
      height="160"
    />
  );
}
