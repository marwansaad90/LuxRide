import { TRIPADVISOR_URL } from "./data";

export const SOCIAL_LOGOS = {
  tripadvisor:
    "https://www.tripadvisor.com/img/cdsi/img2/branding/v2/Tripadvisor_lockup_horizontal_secondary_registered-18034-2.svg",
  facebook:
    "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
  instagram:
    "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
  whatsapp:
    "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
} as const;

export function SocialLogoCircle({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-transparent ${className}`}>
      <img src={src} alt={alt} className="max-h-7 max-w-7 object-contain" loading="lazy" />
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

export { TRIPADVISOR_URL };
