import { http, HttpResponse } from "msw";
import { healthSummary, healthStatusByService } from "../mockData/health";

const apiBase =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined)?.replace(
    /\/$/,
    "",
  ) ?? "";
const withBase = (path: string) => `${apiBase}${path}`;

export const healthHandlers = [
  http.get(withBase("/health/summary"), () =>
    HttpResponse.json(healthSummary),
  ),
  http.get(withBase("/health/content"), () =>
    HttpResponse.json(healthStatusByService.content),
  ),
  http.get(withBase("/health/community"), () =>
    HttpResponse.json(healthStatusByService.community),
  ),
  http.get(withBase("/health/notifications"), () =>
    HttpResponse.json(healthStatusByService.notifications),
  ),
  http.get(withBase("/health/search"), () =>
    HttpResponse.json(healthStatusByService.search),
  ),
  http.get(withBase("/health/wallet"), () =>
    HttpResponse.json(healthStatusByService.wallet),
  ),
];
