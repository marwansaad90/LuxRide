import { TRIPADVISOR_URL } from "./data";
import type { CSSProperties } from "react";
import facebookWhite from "../../../assets/icons/facebook-white.png";
import instagramWhite from "../../../assets/icons/instagram-white.png";
import whatsappWhite from "../../../assets/icons/whatsapp-white.png";

export const SOCIAL_LOGOS = {
  tripadvisor:
    "https://www.tripadvisor.com/img/cdsi/img2/branding/v2/Tripadvisor_lockup_horizontal_secondary_registered-18034-2.svg",
  facebook: facebookWhite,
  instagram: instagramWhite,
  whatsapp: whatsappWhite,
} as const;

export function SocialLogoCircle({
  src,
  alt,
  className = "",
  imgClassName = "",
  imgStyle,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  imgStyle?: CSSProperties;
}) {
  return (
    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-transparent ${className}`}>
      <img src={src} alt={alt} className={`max-h-7 max-w-7 object-contain ${imgClassName}`} style={imgStyle} loading="lazy" />
    </span>
  );
}

export function TripadvisorLogoCircle({
  className = "",
  imgClassName = "",
}: {
  className?: string;
  imgClassName?: string;
}) {
  return (
    <span className={`inline-flex h-12 min-w-[9rem] shrink-0 items-center justify-center rounded-xl bg-transparent ${className}`}>
      <img src={SOCIAL_LOGOS.tripadvisor} alt="Tripadvisor" className={`h-7 w-auto max-w-[8rem] object-contain ${imgClassName}`} loading="lazy" />
    </span>
  );
}

export function TripadvisorLogoMark({
  className = "",
  imgClassName = "",
}: {
  className?: string;
  imgClassName?: string;
}) {
  return (
    <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-start overflow-hidden rounded-full bg-transparent ${className}`}>
      <img
        src={SOCIAL_LOGOS.tripadvisor}
        alt="Tripadvisor"
        className={`h-6 min-w-[7.75rem] max-w-none object-contain object-left ${imgClassName}`}
        loading="lazy"
      />
    </span>
  );
}

export { TRIPADVISOR_URL };
