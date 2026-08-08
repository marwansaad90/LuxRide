import { IMAGES } from "./data";
import type { PublicTripType } from "./data";
import type { Lang } from "./i18n";

export interface FeaturedTransfer {
  id: string;
  createdAt: string;
  images: string[];
  routeType: Record<Lang, string>;
  title: Record<Lang, string>;
  vehicle: Record<Lang, string>;
  description: Record<Lang, string>;
  tags: Record<Lang, string[]>;
  booking: {
    from: string;
    to: string;
    trip: PublicTripType;
  };
}

export type FeaturedJourney = FeaturedTransfer;

export const FEATURED_TRANSFERS: FeaturedTransfer[] = [
  {
    id: "hurghada-wadi-el-gemal-overday",
    createdAt: "2026-08-08",
    images: [IMAGES.wadiElGemal, IMAGES.marsaAlam, IMAGES.soma],
    routeType: { EN: "Round Trip Transfer", AR: "توصيلة ذهاب وعودة" },
    title: { EN: "Nature Escape Transfer: Hurghada to Wadi El Gemal", AR: "توصيلة طبيعية خاصة: من الغردقة إلى وادي الجمال" },
    vehicle: { EN: "Mitsubishi Xpander 2027", AR: "Mitsubishi Xpander 2027" },
    description: {
      EN: "A private transfer designed for guests heading from Hurghada to the Wadi El Gemal area with a calm pickup, clear route planning, comfortable air-conditioned seating, and fixed pricing shown before the request is sent.",
      AR: "توصيلة خاصة للضيوف المتجهين من الغردقة إلى منطقة وادي الجمال مع استلام هادئ، وتخطيط واضح للمسار، ومقاعد مكيفة مريحة، وسعر ثابت يظهر قبل إرسال الطلب.",
    },
    tags: { EN: ["#WadiElGemal", "#PrivateTransfer"], AR: ["#وادي_الجمال", "#توصيلة_خاصة"] },
    booking: { from: "Hurghada", to: "Wadi El Gemal", trip: "roundTrip" },
  },
  {
    id: "hurghada-luxor-dendera-overday",
    createdAt: "2026-08-07",
    images: [IMAGES.luxor, IMAGES.cairo, IMAGES.hurghada],
    routeType: { EN: "Round Trip Transfer", AR: "توصيلة ذهاب وعودة" },
    title: { EN: "Historical Private Transfer: Hurghada to Luxor & Dendera", AR: "توصيلة تاريخية خاصة: من الغردقة إلى الأقصر ودندرة" },
    vehicle: { EN: "Mitsubishi Xpander 2027", AR: "Mitsubishi Xpander 2027" },
    description: {
      EN: "A full-day private transfer for a German family from Hurghada through the desert road to Luxor, with time planned for the Valley of the Kings and a return stop near Dendera. The transfer keeps the practical details visible: fixed price, private vehicle, planned breaks, and direct booking support.",
      AR: "توصيلة خاصة ليوم كامل لعائلة ألمانية من الغردقة عبر الطريق الصحراوي إلى الأقصر، مع وقت مخطط لوادي الملوك وتوقف في طريق العودة قرب دندرة. تعرض التوصيلة التفاصيل العملية بوضوح: سعر ثابت، سيارة خاصة، استراحات مخططة، ودعم مباشر للحجز.",
    },
    tags: { EN: ["#Luxor", "#DenderaTemple", "#PrivateTransfer"], AR: ["#الأقصر", "#معبد_دندرة", "#توصيلة_خاصة"] },
    booking: { from: "Hurghada", to: "Luxor", trip: "roundTrip" },
  },
  {
    id: "airport-el-gouna-one-way",
    createdAt: "2026-08-06",
    images: [IMAGES.elGouna, IMAGES.hurghada, IMAGES.villageRoad],
    routeType: { EN: "One Way Transfer", AR: "توصيلة ذهاب فقط" },
    title: { EN: "Airport Arrival Transfer: Hurghada Airport to El Gouna", AR: "توصيلة وصول من المطار: مطار الغردقة إلى الجونة" },
    vehicle: { EN: "Toyota Corolla / Mitsubishi Xpander", AR: "Toyota Corolla / Mitsubishi Xpander" },
    description: {
      EN: "A clean arrival transfer from Hurghada Airport to El Gouna, with flight monitoring, fixed airport pickup details, and a clear one-way price before submission.",
      AR: "توصيلة وصول منظمة من مطار الغردقة إلى الجونة، مع متابعة الرحلة الجوية، وتفاصيل استلام واضحة من المطار، وسعر ذهاب فقط ظاهر قبل الإرسال.",
    },
    tags: { EN: ["#AirportTransfer", "#ElGouna"], AR: ["#توصيلة_مطار", "#الجونة"] },
    booking: { from: "Hurghada Airport", to: "El Gouna", trip: "oneWay" },
  },
  {
    id: "hurghada-sharm-one-way",
    createdAt: "2026-08-05",
    images: [IMAGES.sharm, IMAGES.soma, IMAGES.marsaAlam],
    routeType: { EN: "One Way Transfer", AR: "توصيلة ذهاب فقط" },
    title: { EN: "Direct Private Transfer: Hurghada to Sharm El Sheikh", AR: "توصيلة خاصة مباشرة: من الغردقة إلى شرم الشيخ" },
    vehicle: { EN: "Mitsubishi Xpander 2027", AR: "Mitsubishi Xpander 2027" },
    description: {
      EN: "A smooth overland private transfer for guests traveling directly from Hurghada to Sharm El Sheikh, with luggage space, air-conditioned comfort, and fixed pricing without hidden surprises.",
      AR: "توصيلة برية خاصة وسلسة للضيوف المسافرين مباشرة من الغردقة إلى شرم الشيخ، مع مساحة للأمتعة وراحة مكيفة وسعر ثابت دون مفاجآت مخفية.",
    },
    tags: { EN: ["#SharmElSheikh", "#DoorToDoor"], AR: ["#شرم_الشيخ", "#من_الباب_إلى_الباب"] },
    booking: { from: "Hurghada", to: "Sharm El Sheikh", trip: "oneWay" },
  },
];

export const FEATURED_JOURNEYS = FEATURED_TRANSFERS;

export function newestFeaturedTransfers(): FeaturedTransfer[] {
  return [...FEATURED_TRANSFERS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function journeyBookingQuery(journey: FeaturedTransfer): string {
  return new URLSearchParams(journey.booking).toString();
}
