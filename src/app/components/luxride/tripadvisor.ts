export const TRIPADVISOR_PAGE_URL =
  "https://www.tripadvisor.com/Attraction_Review-g297549-d34457256-Reviews-LuxRide_Taxi-Hurghada_Red_Sea_and_Sinai.html";

export const TRIPADVISOR_LOCATION_ID = "34457256";
export const TRIPADVISOR_LANGUAGE = "en_US";
export const TRIPADVISOR_DISPLAY_VERSION = "2";

export type TripadvisorWidgetType =
  | "cdsratingsonlynarrow"
  | "cdswritereviewnew"
  | "cdsscrollingravenarrow";

export interface TripadvisorWidgetConfig {
  key: "rating" | "reviewStarter" | "raveReviews";
  widgetType: TripadvisorWidgetType;
  uniqueId: "470" | "935" | "782";
  titleEn: string;
  titleAr: string;
  fallbackLabelEn: string;
  fallbackLabelAr: string;
  border?: boolean;
}

export const TRIPADVISOR_WIDGETS: TripadvisorWidgetConfig[] = [
  {
    key: "rating",
    widgetType: "cdsratingsonlynarrow",
    uniqueId: "470",
    titleEn: "Your Rating",
    titleAr: "تقييمك",
    fallbackLabelEn: "View LuxRide on Tripadvisor",
    fallbackLabelAr: "عرض LuxRide على Tripadvisor",
    border: true,
  },
  {
    key: "reviewStarter",
    widgetType: "cdswritereviewnew",
    uniqueId: "935",
    titleEn: "Review Starter",
    titleAr: "ابدأ كتابة مراجعة",
    fallbackLabelEn: "Write a Review on Tripadvisor",
    fallbackLabelAr: "اكتب مراجعة على Tripadvisor",
  },
  {
    key: "raveReviews",
    widgetType: "cdsscrollingravenarrow",
    uniqueId: "782",
    titleEn: "Rave Reviews",
    titleAr: "مراجعات المسافرين",
    fallbackLabelEn: "Read LuxRide Reviews on Tripadvisor",
    fallbackLabelAr: "قراءة مراجعات LuxRide على Tripadvisor",
    border: true,
  },
];

export function tripadvisorWidgetScriptUrl(config: TripadvisorWidgetConfig): string {
  const params = new URLSearchParams({
    wtype: config.widgetType,
    uniq: config.uniqueId,
    locationId: TRIPADVISOR_LOCATION_ID,
    lang: TRIPADVISOR_LANGUAGE,
  });
  if (config.border) params.set("border", "true");
  params.set("display_version", TRIPADVISOR_DISPLAY_VERSION);
  return `https://www.jscache.com/wejs?${params.toString()}`;
}
