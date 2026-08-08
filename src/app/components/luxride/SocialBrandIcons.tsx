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
    <span className={`flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 ${className}`}>
      <img src={src} alt={alt} className="max-h-6 max-w-6 object-contain" loading="lazy" />
    </span>
  );
}

export function TripadvisorLogoCircle() {
  return (
    <span className="flex h-11 min-w-11 items-center justify-center rounded-full bg-white px-3 shadow-sm ring-1 ring-black/5">
      <img src={SOCIAL_LOGOS.tripadvisor} alt="Tripadvisor" className="h-5 w-auto max-w-28 object-contain" loading="lazy" />
    </span>
  );
}

export { TRIPADVISOR_URL };
