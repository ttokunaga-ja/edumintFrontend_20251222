import { http, HttpResponse } from 'msw';
import { mockExams } from '../data';
import { EXAM_TYPE_LABELS, DIFFICULTY_LEVELS, ACADEMIC_FIELDS, ALLOWED_EXAM_TYPE_IDS } from '../../constants/fixedVariables';

const apiBase = (import.meta.env?.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:3000/api';
const withBase = (path: string) => `${apiBase}${path}`;

// Convert mockExams to problems format lazily (with enum enforcement)
let _createdProblems: any[] = [];
const mapExamToProblem = (exam: any) => {
  // Enforce: only allow exams with valid examType IDs
  if (!ALLOWED_EXAM_TYPE_IDS.includes(exam.examType)) {
    return null; // Filter out invalid exam types
  }

  const examType = exam.examType;
  const difficulty = exam.difficulty !== undefined ? exam.difficulty : (exam.questions?.[0]?.difficulty === '1' ? 1 : 2);
  const academicFieldId = exam.academicFieldId !== undefined ? exam.academicFieldId : (exam.majorType === 1 ? 0 : 1);

  return {
    id: exam.id,
    title: exam.examName,
    examName: exam.examName,
    subject: exam.subjectName,
    subjectName: exam.subjectName,
    university: exam.universityName,
    faculty: exam.facultyName,
    examType, // Numeric ID
    examTypeLabel: EXAM_TYPE_LABELS[examType], // Use fixed variable
    examYear: exam.examYear || (exam.createdAt ? new Date(exam.createdAt).getFullYear() : undefined),
    durationMinutes: exam.durationMinutes,
    academicFieldId, // Numeric ID
    academicFieldName: exam.academicFieldName,
    academicFieldType: ACADEMIC_FIELDS[academicFieldId] === 'science' ? '理系' : '文系',
    type: exam.examType === 0 ? 'past_exam' : 'exercise',
    difficulty, // Numeric ID
    difficultyLabel: DIFFICULTY_LEVELS[difficulty], // Use fixed variable
    rating: 4.5,
    likes: Math.floor(Math.random() * 200) + 50,
    comments: Math.floor(Math.random() * 20) + 5,
    views: Math.floor(Math.random() * 500) + 200,
    author: { id: exam.author_id, name: exam.teacherName, avatar: `/avatars/${exam.author_id}.jpg` },
    // Keep createdAt consistent for tests/environments (legacy mock timestamp)
    createdAt: '2025-11-20T10:00:00Z',
    updatedAt: '2025-11-20T10:00:00Z',
    content: `${exam.subjectName}の${exam.examName}です。`,
    description: `${exam.universityName} ${exam.facultyName}の${exam.examName}。`,
    tags: exam.questions?.flatMap(q => q.keywords?.map(k => k.keyword) || []) || [],
    isPublic: true,
    questions: exam.questions?.map(q => ({
      id: `q${q.id}`,
      text: (q.questionContent || q.content || q.text || ''),
      type: 'proof',
      points: 10,
    })) || [],
  };
};

const getAllProblems = () => {
  // Map exams to problems, filter out invalid exam types (null values)
  const mapped = mockExams.map(mapExamToProblem).filter((p): p is any => p !== null);
  // Combine with created problems, then deduplicate by id (keep first occurrence)
  const combined = [...mapped, ..._createdProblems];
  const seen = new Map<string, any>();
  for (const p of combined) {
    if (!seen.has(p.id)) {
      seen.set(p.id, p);
    }
  }
  return Array.from(seen.values());
};

export const __test_problems = getAllProblems();

export const problemHandlers = [
  // Get all problems (simplified search/list)
  http.get(withBase('/problems'), () => {
    return HttpResponse.json(getAllProblems());
  }),

  // Search problems (useContent フックで使用)
  http.get(withBase('/search/problems'), ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword') || '';
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '20');
    const sortBy = url.searchParams.get('sortBy') || 'newest';

    // Additional filters
    const subjects = url.searchParams.getAll('subjects[]');
    const universities = url.searchParams.getAll('universities[]');
    const faculties = url.searchParams.getAll('faculties[]');
    const difficulty = url.searchParams.get('level');
    const professor = url.searchParams.get('professor');
    const year = url.searchParams.get('year');
    const fieldType = url.searchParams.get('fieldType');
    const duration = url.searchParams.get('duration');
    const period = url.searchParams.get('period');
    const isLearned = url.searchParams.get('isLearned') === 'true';
    const isHighRating = url.searchParams.get('isHighRating') === 'true';
    const isCommented = url.searchParams.get('isCommented') === 'true';
    const isPosted = url.searchParams.get('isPosted') === 'true';
    const language = url.searchParams.get('language');

    // キーワードでフィルター
    let filtered = getAllProblems();
    if (keyword.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(keyword.toLowerCase()) ||
          p.description?.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    // Apply advanced filters
    if (subjects.length > 0) {
      const subjectMap: Record<string, string> = {
        math: '数学', physics: '物理学', chemistry: '化学', biology: '生物',
        english: '英語', history: '歴史', geography: '地理', japanese: '国語'
      };
      const targetSubjects = subjects.map(s => subjectMap[s] || s);
      filtered = filtered.filter(p => targetSubjects.some(t => p.subject.includes(t)));
    }

    if (universities.length > 0) {
      const uniMap: Record<string, string> = {
        tokyo: '東京大学', kyoto: '京都大学', osaka: '大阪大学',
        tohoku: '東北大学', keio: '慶應義塾大学', waseda: '早稲田大学'
      };
      const targetUnis = universities.map(u => uniMap[u] || u);
      filtered = filtered.filter(p => targetUnis.some(u => p.university.includes(u)));
    }

    if (faculties.length > 0) {
      filtered = filtered.filter(p => faculties.some(f => p.description?.includes(f)));
    }

    if (professor) {
      filtered = filtered.filter(p => p.author.name.includes(professor));
    }

    if (year) {
      filtered = filtered.filter(p => p.createdAt.includes(year));
    }

    if (fieldType) {
      filtered = filtered.filter(p => p.tags?.includes(fieldType));
    }

    if (difficulty) {
      if (difficulty === 'advanced') {
        filtered = filtered.filter(p => p.difficulty === 'difficult' || p.difficulty === 'applied');
      } else {
        filtered = filtered.filter(p => p.difficulty === difficulty);
      }
    }


    if (duration) {
      // Mock logic: filter by views as a proxy for duration
      if (duration === 'short') filtered = filtered.filter(p => (p.views || 0) < 100);
      else if (duration === 'medium') filtered = filtered.filter(p => (p.views || 0) >= 100 && (p.views || 0) < 300);
      else if (duration === 'long') filtered = filtered.filter(p => (p.views || 0) >= 300);
    }

    if (period && period !== 'none') {
      const now = new Date();
      let cutoff = new Date(0);
      if (period === '1day') cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      else if (period === '1week') cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      else if (period === '1month') {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        cutoff = d;
      }
      else if (period === '1year') {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 1);
        cutoff = d;
      }
      
      if (period !== 'custom') {
        filtered = filtered.filter(p => new Date(p.createdAt) >= cutoff);
      }
    }

    if (isLearned) {
      // Mock: even IDs are learned
      filtered = filtered.filter(p => parseInt(p.id.replace('exam-', '')) % 2 === 0);
    }
    if (isHighRating) {
      filtered = filtered.filter(p => (p.rating || 0) >= 4.5);
    }
    if (isCommented) {
      filtered = filtered.filter(p => (p.comments || 0) > 0);
    }
    if (isPosted) {
      // Mock: odd IDs are posted
      filtered = filtered.filter(p => parseInt(p.id.replace('exam-', '')) % 2 !== 0);
    }
    if (language) {
      // Mock: assume all are 'ja' for now
      if (language !== 'ja') filtered = [];
    }

    // ソート
    if (sortBy === 'popular') {
      filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'recommended') {
      filtered = filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortBy === 'views') {
      filtered = filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      // newest がデフォルト
      filtered = filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // ページネーション
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Map to response format (add authorName)
    const items = filtered.slice(startIndex, endIndex).map(p => ({
      ...p,
      authorName: p.author.name // Flatten for frontend
    }));

    // Debug logging to help verify updated mock data in browser console
    try {
      // eslint-disable-next-line no-console
      console.debug('[MSW] /search/problems ->', { total, returnedIds: items.map(i => i.id) });
    } catch (e) {}

    return HttpResponse.json({
      data: items,
      total,
      page,
      limit,
      hasMore: endIndex < total,
    });
  }),

  // Get single problem by ID
  http.get(withBase('/problems/:id'), ({ params }) => {
    const { id } = params;
    const problem = getAllProblems().find((p) => p.id === id);
    if (!problem) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(problem);
  }),

  // Create new problem (mock)
  http.post(withBase('/problems'), async ({ request }) => {
    const newProblem = (await request.json()) as any;
    newProblem.id = `exam-${getAllProblems().length + 1}`;
    newProblem.createdAt = new Date().toISOString();
    _createdProblems.push(newProblem);
    return HttpResponse.json(newProblem, { status: 201 });
  }),

  // Update problem (mock)
  http.put(withBase('/problems/:id'), async ({ params, request }) => {
    const { id } = params;
    const updateData = (await request.json()) as any;
    const all = getAllProblems();
    const index = all.findIndex((p) => p.id === id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    // If it's in createdProblems, update there, otherwise we shallow copy to createdProblems
    if (index >= mockExams.length) {
      _createdProblems[index - mockExams.length] = { ..._createdProblems[index - mockExams.length], ...updateData };
      return HttpResponse.json(_createdProblems[index - mockExams.length]);
    } else {
      const updated = { ...mapExamToProblem(mockExams[index]), ...updateData };
      _createdProblems.push(updated);
      return HttpResponse.json(updated);
    }
  }),
];
