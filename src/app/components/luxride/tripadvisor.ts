export const TRIPADVISOR_PAGE_URL =
  "https://www.tripadvisor.com/Attraction_Review-g297549-d34457256-Reviews-LuxRide_Taxi-Hurghada_Red_Sea_and_Sinai.html";

export const TRIPADVISOR_LOCATION_ID = "34457256";

export type TripadvisorWidgetKey = "rating" | "reviewStarter" | "raveReviews" | "selfServe";

export interface TripadvisorWidgetConfig {
  key: TripadvisorWidgetKey;
  widgetType: "cdsratingsonlynarrow" | "cdswritereviewnew" | "cdsscrollingravenarrow" | "selfserveprop";
  uniqueId: "470" | "935" | "782" | "489";
  containerId: string;
  scriptId: string;
  scriptUrl: string;
}

export const TRIPADVISOR_WIDGETS: TripadvisorWidgetConfig[] = [
  {
    key: "rating",
    widgetType: "cdsratingsonlynarrow",
    uniqueId: "470",
    containerId: "TA_cdsratingsonlynarrow470",
    scriptId: "tripadvisor-rating-script-470",
    scriptUrl:
      "https://www.jscache.com/wejs?wtype=cdsratingsonlynarrow&uniq=470&locationId=34457256&lang=en_US&border=true&display_version=2",
  },
  {
    key: "reviewStarter",
    widgetType: "cdswritereviewnew",
    uniqueId: "935",
    containerId: "TA_cdswritereviewnew935",
    scriptId: "tripadvisor-review-starter-script-935",
    scriptUrl:
      "https://www.jscache.com/wejs?wtype=cdswritereviewnew&uniq=935&locationId=34457256&lang=en_US&display_version=2",
  },
  {
    key: "raveReviews",
    widgetType: "cdsscrollingravenarrow",
    uniqueId: "782",
    containerId: "TA_cdsscrollingravenarrow782",
    scriptId: "tripadvisor-rave-reviews-script-782",
    scriptUrl:
      "https://www.jscache.com/wejs?wtype=cdsscrollingravenarrow&uniq=782&locationId=34457256&lang=en_US&border=true&display_version=2",
  },
  {
    key: "selfServe",
    widgetType: "selfserveprop",
    uniqueId: "489",
    containerId: "TA_selfserveprop489",
    scriptId: "tripadvisor-selfserve-script-489",
    scriptUrl:
      "https://www.jscache.com/wejs?wtype=selfserveprop&uniq=489&locationId=34457256&lang=en_US&rating=true&nreviews=5&writereviewlink=true&popIdx=true&iswide=false&border=true&display_version=2",
  },
];

export function tripadvisorWidgetScriptUrl(config: TripadvisorWidgetConfig): string {
  return config.scriptUrl;
}
