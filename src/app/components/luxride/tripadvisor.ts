export const TRIPADVISOR_PAGE_URL =
  "https://www.tripadvisor.com/Attraction_Review-g297549-d34457256-Reviews-LuxRide_Taxi-Hurghada_Red_Sea_and_Sinai.html";

export const TRIPADVISOR_LOCATION_ID = "34457256";
export const SELECTED_TRIPADVISOR_REVIEW_COUNT = 5;

export type TripadvisorWidgetKey = "reviews" | "rating" | "excellent";

export interface TripadvisorWidgetConfig {
  key: TripadvisorWidgetKey;
  widgetType: "selfserveprop" | "cdsratingsonlynarrow" | "excellent";
  uniqueId: "491" | "411" | "384";
  containerId: string;
  scriptId: string;
  scriptUrl: string;
}

export const TRIPADVISOR_WIDGETS: TripadvisorWidgetConfig[] = [
  {
    key: "reviews",
    widgetType: "selfserveprop",
    uniqueId: "491",
    containerId: "TA_selfserveprop491",
    scriptId: "tripadvisor-selfserve-script-491",
    scriptUrl:
      "https://www.jscache.com/wejs?wtype=selfserveprop&uniq=491&locationId=34457256&lang=en_US&rating=true&nreviews=5&writereviewlink=true&popIdx=false&iswide=true&border=true&display_version=2",
  },
  {
    key: "rating",
    widgetType: "cdsratingsonlynarrow",
    uniqueId: "411",
    containerId: "TA_cdsratingsonlynarrow411",
    scriptId: "tripadvisor-rating-script-411",
    scriptUrl:
      "https://www.jscache.com/wejs?wtype=cdsratingsonlynarrow&uniq=411&locationId=34457256&lang=en_US&border=true&display_version=2",
  },
  {
    key: "excellent",
    widgetType: "excellent",
    uniqueId: "384",
    containerId: "TA_excellent384",
    scriptId: "tripadvisor-excellent-script-384",
    scriptUrl:
      "https://www.jscache.com/wejs?wtype=excellent&uniq=384&locationId=34457256&lang=en_US&display_version=2",
  },
];

export function tripadvisorWidgetScriptUrl(config: TripadvisorWidgetConfig): string {
  return config.scriptUrl;
}
