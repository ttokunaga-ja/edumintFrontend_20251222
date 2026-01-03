import { http, HttpResponse } from "msw";
import { defaultSearchResponse, emptySearchResponse, mockExams, readingSuggestions } from "../mockData/search";
import { mockExams as contentMockExams } from "../mockData/content";

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
      return HttpResponse.json({ ...emptySearchResponse, page, limit, });
    }

    const filtered = keyword.trim().length === 0 ? mockExams : mockExams.filter((exam) => exam.examName.toLowerCase().includes(keyword.toLowerCase()));
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const exams = filtered.slice(startIndex, endIndex);
    const hasMore = endIndex < total;

    return HttpResponse.json({ exams, total, page, limit, hasMore, });
  }),
  http.get(withBase("/search/readings"), ({ request }) => {
    const url = new URL(request.url);
    const entity = url.searchParams.get("entity");
    const query = (url.searchParams.get("q") || "").toLowerCase();
    const sources = entity ? readingSuggestions[entity] || [] : Object.values(readingSuggestions).flat();
    const suggestions = query.length === 0 ? sources.slice(0, 5) : sources
      .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);

    return HttpResponse.json({ suggestions });
  }),
  http.get(withBase("/search/problems"), ({ request }) => {
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
      return HttpResponse.json({
        data: [],
        total: 0,
        hasMore: false,
      });
    }

    // content.ts の mockExams を使用
    const allExams = contentMockExams;
    const filtered = keyword.trim().length === 0
      ? allExams
      : allExams.filter((exam) =>
          exam.examName.toLowerCase().includes(keyword.toLowerCase()) ||
          exam.subjectName?.toLowerCase().includes(keyword.toLowerCase()) ||
          exam.universityName?.toLowerCase().includes(keyword.toLowerCase()) ||
          exam.teacherName?.toLowerCase().includes(keyword.toLowerCase())
        );

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const exams = filtered.slice(startIndex, endIndex);

    // Problem 形式に変換
    const problems = exams.map((exam) => ({
      id: exam.id,
      title: exam.examName,
      examName: exam.examName,
      subjectName: exam.subjectName,
      universityName: exam.universityName,
      content: exam.questions?.[0]?.content || "",
      authorName: exam.teacherName,
      university: exam.universityName,
      difficulty: exam.questions?.[0]?.difficulty?.label || "標準",
      likes: 0, // 仮の値
      views: 0, // 仮の値
      createdAt: "2024-01-01T00:00:00Z",
      rating: 0,
      comments: 0,
      tags: exam.questions?.[0]?.keywords?.map(k => k.keyword) || [],
    }));

    const hasMore = endIndex < total;

    return HttpResponse.json({
      data: problems,
      total,
      hasMore,
    });
  }),
];
