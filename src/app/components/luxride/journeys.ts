import { IMAGES } from "./data";
import type { PublicTripType } from "./data";
import type { Lang } from "./i18n";
import luxorDayTrip1 from "../../../assets/experiences/luxor-day-trip-1.webp";
import luxorDayTrip2 from "../../../assets/experiences/luxor-day-trip-2.webp";
import luxorDayTrip3 from "../../../assets/experiences/luxor-day-trip-3.webp";
import luxorDayTrip4 from "../../../assets/experiences/luxor-day-trip-4.webp";
import luxorDayTrip5 from "../../../assets/experiences/luxor-day-trip-5.webp";
import portGhalibTransfer from "../../../assets/experiences/port-ghalib-transfer.jpg";

export interface FeaturedTransfer {
  id: string;
  createdAt: string;
  images: string[];
  routeType: Record<Lang, string>;
  title: Record<Lang, string>;
  vehicle: Record<Lang, string>;
  excerpt: Record<Lang, string>;
  description: Record<Lang, string>;
  imagePosition?: string;
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
    id: "hurghada-luxor-unforgettable-day-trip",
    createdAt: "2026-08-09",
    images: [luxorDayTrip3, luxorDayTrip1, luxorDayTrip5, luxorDayTrip2, luxorDayTrip4],
    routeType: { EN: "Round Trip Transfer", AR: "توصيلة ذهاب وعودة" },
    title: {
      EN: "A Featured Journey: An Unforgettable Day Trip to Luxor",
      AR: "رحلة مميزة: يوم لا يُنسى إلى الأقصر",
    },
    vehicle: { EN: "Mitsubishi Xpander 2027", AR: "Mitsubishi Xpander 2027" },
    excerpt: {
      EN: "A recent full-day Hurghada to Luxor transfer with punctual pickup, a sparkling clean air-conditioned vehicle, cold drinks, flexible sightseeing, and a smooth hotel drop-off.",
      AR: "توصيلة حديثة ليوم كامل من الغردقة إلى الأقصر مع استلام دقيق، وسيارة مكيفة ونظيفة، ومشروبات باردة، ومرونة في الجولة، وعودة سلسة إلى الفندق.",
    },
    description: {
      EN: "We’d love to share the story of a recent trip with one of our valued guests who chose us for a full-day journey from Hurghada to Luxor.\n\nFrom the very start, our driver arrived right on the dot, greeting them with a sparkling clean, fully air-conditioned vehicle built for absolute comfort in the desert heat. To make the long drive even more enjoyable, we had a cold box ready and packed with refreshing drinks and tasty treats.\n\nAs they crossed the desert, whenever the drinks ran low, the driver didn't wait to be asked—he proactively pulled over at a local store to restock cold beverages, keeping everyone refreshed throughout the ride.\n\nDuring their tour of ancient Luxor, the guests enjoyed complete flexibility, exploring at their own pace without ever feeling rushed. Communication was smooth and easy in basic English, and for any extra questions, translation apps made the conversation completely effortless.\n\nThey wrapped up the day feeling relaxed, refreshed, and full of great memories, finishing with a smooth drop-off right back at their hotel door. For us, it’s never just about getting you from point A to point B—it’s about taking care of every single detail so you can truly enjoy the ride.",
      AR: "نود مشاركة قصة رحلة حديثة مع أحد ضيوفنا الكرام الذي اختارنا ليوم كامل من الغردقة إلى الأقصر.\n\nمنذ البداية وصل السائق في الموعد تماماً، واستقبل الضيوف بسيارة نظيفة ولامعة ومكيفة بالكامل، ومجهزة لراحة عالية في حرارة الطريق الصحراوي. ولجعل الرحلة الطويلة أكثر متعة، كانت هناك حقيبة تبريد جاهزة ومليئة بالمشروبات الباردة والوجبات الخفيفة.\n\nوأثناء عبور الصحراء، عندما بدأت المشروبات تنفد، لم ينتظر السائق أن يُطلب منه ذلك؛ بل توقف من تلقاء نفسه عند متجر محلي لإعادة تزويد السيارة بالمشروبات الباردة، ليبقى الجميع منتعشين طوال الطريق.\n\nوخلال جولتهم في آثار الأقصر القديمة، استمتع الضيوف بمرونة كاملة واستكشفوا على وتيرتهم الخاصة من دون أي شعور بالاستعجال. كان التواصل سهلاً وواضحاً بالإنجليزية الأساسية، وأي أسئلة إضافية جعلت تطبيقات الترجمة المحادثة أكثر سلاسة.\n\nاختتم الضيوف يومهم وهم مرتاحون ومنتعشون وممتلئون بذكريات جميلة، مع توصيل سلس حتى باب الفندق. بالنسبة لنا، الأمر لا يقتصر على نقلك من نقطة إلى أخرى؛ بل على الاهتمام بكل تفصيلة حتى تستمتع بالرحلة حقاً.",
    },
    tags: { EN: ["#Luxor", "#PrivateTransfer"], AR: ["#الأقصر", "#توصيلة_خاصة"] },
    booking: { from: "Hurghada", to: "Luxor", trip: "roundTrip" },
  },
  {
    id: "hurghada-wadi-el-gemal-overday",
    createdAt: "2026-08-07",
    images: [IMAGES.wadiElGemal],
    routeType: { EN: "Round Trip Transfer", AR: "توصيلة ذهاب وعودة" },
    title: { EN: "Nature Escape Transfer: Hurghada to Wadi El Gemal", AR: "توصيلة طبيعية خاصة: من الغردقة إلى وادي الجمال" },
    vehicle: { EN: "Mitsubishi Xpander 2027", AR: "Mitsubishi Xpander 2027" },
    excerpt: {
      EN: "A private round trip from Hurghada to the Wadi El Gemal area with clear route planning and fixed pricing.",
      AR: "توصيلة خاصة ذهاباً وعودة من الغردقة إلى منطقة وادي الجمال مع تخطيط واضح وسعر ثابت.",
    },
    description: {
      EN: "A private transfer designed for guests heading from Hurghada to the Wadi El Gemal area with a calm pickup, clear route planning, comfortable air-conditioned seating, and fixed pricing shown before the request is sent.",
      AR: "توصيلة خاصة للضيوف المتجهين من الغردقة إلى منطقة وادي الجمال مع استلام هادئ، وتخطيط واضح للمسار، ومقاعد مكيفة مريحة، وسعر ثابت يظهر قبل إرسال الطلب.",
    },
    tags: { EN: ["#WadiElGemal", "#PrivateTransfer"], AR: ["#وادي_الجمال", "#توصيلة_خاصة"] },
    booking: { from: "Hurghada", to: "Wadi El Gemal", trip: "roundTrip" },
  },
  {
    id: "hurghada-luxor-dendera-overday",
    createdAt: "2026-08-06",
    images: [IMAGES.luxorDetail],
    routeType: { EN: "Round Trip Transfer", AR: "توصيلة ذهاب وعودة" },
    title: { EN: "Historical Private Transfer: Hurghada to Luxor & Dendera", AR: "توصيلة تاريخية خاصة: من الغردقة إلى الأقصر ودندرة" },
    vehicle: { EN: "Mitsubishi Xpander 2027", AR: "Mitsubishi Xpander 2027" },
    excerpt: {
      EN: "A full-day private transfer from Hurghada through the desert road to Luxor and Dendera.",
      AR: "توصيلة خاصة ليوم كامل من الغردقة عبر الطريق الصحراوي إلى الأقصر ودندرة.",
    },
    description: {
      EN: "A full-day private transfer for a German family from Hurghada through the desert road to Luxor, with time planned for the Valley of the Kings and a return stop near Dendera. The transfer keeps the practical details visible: fixed price, private vehicle, planned breaks, and direct booking support.",
      AR: "توصيلة خاصة ليوم كامل لعائلة ألمانية من الغردقة عبر الطريق الصحراوي إلى الأقصر، مع وقت مخطط لوادي الملوك وتوقف في طريق العودة قرب دندرة. تعرض التوصيلة التفاصيل العملية بوضوح: سعر ثابت، سيارة خاصة، استراحات مخططة، ودعم مباشر للحجز.",
    },
    tags: { EN: ["#Luxor", "#DenderaTemple", "#PrivateTransfer"], AR: ["#الأقصر", "#معبد_دندرة", "#توصيلة_خاصة"] },
    booking: { from: "Hurghada", to: "Luxor", trip: "roundTrip" },
  },
  {
    id: "hurghada-port-ghalib-marina-overday",
    createdAt: "2026-08-08",
    images: [portGhalibTransfer],
    routeType: { EN: "Round Trip Transfer", AR: "توصيلة ذهاب وعودة" },
    title: { EN: "Marina Escape Transfer: Hurghada to Porto Ghalib", AR: "توصيلة مارينا خاصة: من الغردقة إلى بورتو غالب" },
    vehicle: { EN: "Mitsubishi Xpander 2027", AR: "Mitsubishi Xpander 2027" },
    excerpt: {
      EN: "A comfortable private transfer from Hurghada to Porto Ghalib Marina, planned around relaxed Red Sea views and clear fixed pricing.",
      AR: "توصيلة خاصة ومريحة من الغردقة إلى مارينا بورتو غالب، مع رحلة هادئة على ساحل البحر الأحمر وسعر ثابت واضح.",
    },
    description: {
      EN: "A private Red Sea transfer for guests heading from Hurghada to Porto Ghalib Marina, with comfortable air-conditioned seating, space for luggage, planned pickup details, and fixed pricing prepared before the booking request is sent.",
      AR: "توصيلة خاصة على ساحل البحر الأحمر للضيوف المتجهين من الغردقة إلى مارينا بورتو غالب، مع مقاعد مكيفة ومريحة، ومساحة للأمتعة، وتفاصيل استلام واضحة، وسعر ثابت يظهر قبل إرسال طلب الحجز.",
    },
    imagePosition: "center 72%",
    tags: { EN: ["#PortoGhalib", "#PrivateTransfer"], AR: ["#بورتو_غالب", "#توصيلة_خاصة"] },
    booking: { from: "Hurghada", to: "Marsa Ghaleb", trip: "roundTrip" },
  },
  {
    id: "hurghada-sharm-one-way",
    createdAt: "2026-08-05",
    images: [IMAGES.sharm],
    routeType: { EN: "One Way Transfer", AR: "توصيلة ذهاب فقط" },
    title: { EN: "Direct Private Transfer: Hurghada to Sharm El Sheikh", AR: "توصيلة خاصة مباشرة: من الغردقة إلى شرم الشيخ" },
    vehicle: { EN: "Mitsubishi Xpander 2027", AR: "Mitsubishi Xpander 2027" },
    excerpt: {
      EN: "A smooth direct private overland transfer from Hurghada to Sharm El Sheikh.",
      AR: "توصيلة برية خاصة ومباشرة من الغردقة إلى شرم الشيخ.",
    },
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
