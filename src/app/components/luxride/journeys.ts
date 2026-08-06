import { IMAGES } from "./data";
import type { PublicTripType } from "./data";
import type { Lang } from "./i18n";

export interface FeaturedJourney {
  id: string;
  image: string;
  galleryCount: number;
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

export const FEATURED_JOURNEYS: FeaturedJourney[] = [
  {
    id: "hurghada-luxor-dendera-overday",
    image: IMAGES.luxor,
    galleryCount: 5,
    routeType: {
      EN: "Overday Tour",
      AR: "جولة يوم كامل - Overday",
    },
    title: {
      EN: "Full-Day Historical Tour: Hurghada to Luxor (Valley of the Kings) & Dendera Temple in Qena",
      AR: "جولة تاريخية فاخرة: من الغردقة إلى وادي الملوك بالأقصر ومعبد دندرة بقنا",
    },
    vehicle: {
      EN: "Mitsubishi Xpander 2027",
      AR: "Mitsubishi Xpander 2027",
    },
    description: {
      EN: "A private and seamless full-day excursion for a German family from Hurghada. The journey covered the breathtaking Valley of the Kings in Luxor, followed by a stop at the magnificent Dendera Temple in Qena on the way back. Smooth highway cruising, dual-zone A/C comfort, and zero stress from start to finish.",
      AR: "انطلقنا مع عائلة ألمانية في رحلة خاصة ومريحة من الغردقة في الصباح الباكر عبر طريق الصحراء. شملت الرحلة زيارة استكشافية لوادي الملوك ومقابر الفراعنة بالأقصر، ثم التوقف في طريق العودة لزيارة معبد دندرة الشهير بنقوشه الخالدة في قنا. توفير تكييف مزدوج طوال الطريق، محطات استراحة مريحة، والتزام كامل بالمواعيد حتى العودة للفندق.",
    },
    tags: {
      EN: ["#LuxorTour", "#DenderaTemple", "#DayTrip", "#PrivateTransfer"],
      AR: ["#الأقصر", "#معبد_دندرة", "#رحلات_يومية", "#نقل_خاص"],
    },
    booking: { from: "Hurghada", to: "Luxor", trip: "roundTrip" },
  },
  {
    id: "hurghada-sharm-one-way",
    image: IMAGES.soma,
    galleryCount: 4,
    routeType: {
      EN: "One Way Transfer",
      AR: "اتجاه واحد - One Way",
    },
    title: {
      EN: "Direct Private Transfer: Hurghada to Sharm El Sheikh (One Way)",
      AR: "توصيلة خاصة من الغردقة إلى شرم الشيخ عبر الطريق البري (ذهاب فقط)",
    },
    vehicle: {
      EN: "Mitsubishi Xpander 2027",
      AR: "Mitsubishi Xpander 2027",
    },
    description: {
      EN: "A smooth overland transfer for a couple traveling directly from their hotel in Hurghada to Sharm El Sheikh. Enjoying the scenic coastal highway, generous luggage space, dual A/C, and 100% fixed pricing without any hidden surprises.",
      AR: "خدمة نقل بري آمنة ومباشرة لزوجين مسافرين من مقر إقامتهم بالغردقة إلى منتجعهم في شرم الشيخ. تميزت الرحلة بسلاسة التنقل عبر الطريق الساحلي الجديد، مساحة واسعة للأمتعة والمعدات، ومتابعة لحظية للطريق لضمان وصول سريع ومريح بأسعار ثابتة بدون أي تكاليف خفية.",
    },
    tags: {
      EN: ["#SharmElSheikh", "#DoorToDoor", "#DirectTransfer", "#FixedPrice"],
      AR: ["#شرم_الشيخ", "#الغردقة", "#توصيلة_خاصة", "#أسعار_ثابتة"],
    },
    booking: { from: "Hurghada", to: "Sharm El Sheikh", trip: "oneWay" },
  },
];

export function journeyBookingQuery(journey: FeaturedJourney): string {
  return new URLSearchParams(journey.booking).toString();
}
