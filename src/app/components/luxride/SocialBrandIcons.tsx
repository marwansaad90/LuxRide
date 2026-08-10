import { TRIPADVISOR_URL } from "./data";
import type { CSSProperties } from "react";
import emailGlyph from "../../../assets/icons/luxride-email-glyph.png";
import facebookGlyph from "../../../assets/icons/luxride-facebook-glyph.png";
import instagramGlyph from "../../../assets/icons/luxride-instagram-glyph.png";
import locationGlyph from "../../../assets/icons/luxride-location-glyph.png";
import phoneGlyph from "../../../assets/icons/luxride-phone-glyph.png";
import tripadvisorLockup from "../../../assets/icons/tripadvisor-lockup-horizontal.svg";
import tripadvisorMark from "../../../assets/icons/tripadvisor-mark.svg";
import whatsappGlyph from "../../../assets/icons/luxride-whatsapp-glyph.png";

export const SOCIAL_LOGOS = {
  tripadvisor: tripadvisorLockup,
  tripadvisorMark,
  facebook: facebookGlyph,
  instagram: instagramGlyph,
  whatsapp: whatsappGlyph,
  phone: phoneGlyph,
  email: emailGlyph,
  location: locationGlyph,
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
      <img src={src} alt={alt} className={`max-h-full max-w-full object-contain ${imgClassName}`} style={imgStyle} loading="lazy" />
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
    <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-transparent ${className}`}>
      <img
        src={SOCIAL_LOGOS.tripadvisorMark}
        alt=""
        className={`h-6 w-6 object-contain ${imgClassName}`}
        loading="lazy"
      />
    </span>
  );
}

export { TRIPADVISOR_URL };
