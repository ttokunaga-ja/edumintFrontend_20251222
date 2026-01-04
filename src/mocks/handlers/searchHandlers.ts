import { http, HttpResponse } from "msw";
import { mockExams as contentMockExams, readingSuggestionsData } from "../data";
import { ALLOWED_EXAM_TYPE_IDS } from "../../constants/fixedVariables";

const apiBase = (import.meta.env?.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:3000/api";
const withBase = (path: string) => `${apiBase}${path}`;

export const searchHandlers = [
  http.get(withBase("/search/exams"), ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get("keyword") || "";
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "20");

    if (keyword.toLowerCase() === "error") {
      return HttpResponse.json(
        { message: "Search failed (simulated)" },
        { status: 500 }
      );
    }

    if (keyword.toLowerCase() === "empty") {
      return HttpResponse.json({ exams: [], total: 0, page, limit, hasMore: false });
    }

    // Filter exams: by keyword and by allowed exam types
    const filtered = mockExams
      .filter((exam) => {
        // Validate exam type is allowed
        if (!ALLOWED_EXAM_TYPE_IDS.includes(exam.examType)) {
          return false;
        }
        // Filter by keyword if provided
        return keyword.trim().length === 0
          ? true
          : exam.examName.toLowerCase().includes(keyword.toLowerCase());
      });

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const exams = filtered.slice(startIndex, endIndex);
    const hasMore = endIndex < total;

    return HttpResponse.json({
      exams,
      total,
      page,
      limit,
      hasMore,
    });
  }),

  http.get(withBase("/search/readings"), ({ request }) => {
    const url = new URL(request.url);
    const entity = url.searchParams.get("entity");
    const query = (url.searchParams.get("q") || "").toLowerCase();

    const sources = entity
      ? readingSuggestionsData[entity] || []
      : Object.values(readingSuggestionsData).flat();

    const suggestions =
      query.length === 0
        ? sources.slice(0, 5)
        : sources
            .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 10);

    return HttpResponse.json({ suggestions });
  }),
];
