import { http, HttpResponse } from 'msw';
import { nanoid } from 'nanoid';
import { jobs, createdExams } from '../db'; // Shared DB

const apiBase = ((import.meta as any).env?.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:3000/api';
const withBase = (path: string) => `${apiBase}${path}`;

// UUID v7-like generator (32 hex chars)
const generateJobId = () => {
  const timestamp = Date.now().toString(16).padStart(12, '0');
  const random = Array.from({ length: 20 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `${timestamp}${random}`;
};

// Helper to update phase
const updatePhase = (job: any, newPhase: number) => {
  job.phase = newPhase;
  job.lastUpdated = Date.now();
  return job;
};

// Auto-transition logic based on time elapsed
const processJob = (job: any) => {
  const now = Date.now();
  const elapsed = now - job.lastUpdated;

  switch (job.phase) {
    case 0: // structure_uploading
      if (elapsed > 1000) updatePhase(job, 1); // -> queued
      break;
    case 1: // structure_queued
      if (elapsed > 1000) updatePhase(job, 2); // -> analysing
      break;
    case 2: // structure_analysing
      if (elapsed > 3000) {
        // Mock structure data (include problems with >=3 keywords per major/minor)
        job.data = {
          title: "Mock Exam",
          subjects: ["Math"],
          problems: [
            {
              questionContent: "Problem 1 overview",
              level: "1",
              keywords: [
                { id: nanoid(8), keyword: "algebra" },
                { id: nanoid(8), keyword: "equation" },
                { id: nanoid(8), keyword: "linear" }
              ],
              subQuestions: [
                {
                  questionContent: "Solve for x in 2x + 3 = 7",
                  questionType: "記述式",
                  keywords: [
                    { id: nanoid(8), keyword: "variable" },
                    { id: nanoid(8), keyword: "isolation" },
                    { id: nanoid(8), keyword: "solution" }
                  ]
                }
              ]
            }
          ]
        };
        if (job.options.checkStructure === false) {
          updatePhase(job, 4); // -> completed (auto-skip manual confirm)
        } else {
          updatePhase(job, 3); // -> confirmed
        }
      }
      break;
    case 3: // structure_confirmed
      // Wait for user confirmation unless auto-confirm is enabled
      if (job.options.checkStructure === false) {
        updatePhase(job, 4); // -> completed (auto-skip)
      }
      break;
    case 4: // structure_completed
      updatePhase(job, 10); // -> generation_preparing
      break;

    // Generation Phase
    case 10: // generation_preparing
      if (elapsed > 1000) updatePhase(job, 11); // -> queued
      break;
    case 11: // generation_queued
      if (elapsed > 1000) updatePhase(job, 12); // -> creating
      break;
    case 12: // generation_creating
      if (elapsed > 5000) {
        // Mock generated data (include keywords and subQuestions)
        job.data = {
          ...job.data,
          generatedContent: {
            id: nanoid(16),
            title: "Sample Problem",
            content: "Calculate 1 + 1.",
            answer: "2",
            explanation: "1 plus 1 equals 2.",
            level: "basic",
            subject: "Math",
            keywords: [
              { id: nanoid(8), keyword: "arithmetic" },
              { id: nanoid(8), keyword: "addition" },
              { id: nanoid(8), keyword: "integer" }
            ],
            subQuestions: [
              {
                questionContent: "Compute 1 + 1",
                questionType: "記述式",
                keywords: [
                  { id: nanoid(8), keyword: "compute" },
                  { id: nanoid(8), keyword: "basic" },
                  { id: nanoid(8), keyword: "sum" }
                ]
              }
            ]
          }
        };
        updatePhase(job, 14); // -> generation_completed (Skip 13 for auto-redirect)
      }
      break;
      // case 13: removed or unused for now
      // Wait for user confirmation
      break;
    case 14: // generation_completed
      // Create Exam Record here if not exists
      if (!job.contentsId) {
        const newExamId = `exam-${nanoid(8)}`;
        job.contentsId = newExamId;
        job.data = { ...job.data, contentsId: newExamId };

        // PERSIST TO SHARED DB
        // Create a new exam record compatible with problemHandlers
        const newExam = {
          id: newExamId,
          examName: job.data.generatedContent?.title || "Generated Exam",
          subjectName: job.data.generatedContent?.subject || "General",
          universityName: "Mock Univ",
          facultyName: "Mock Faculty",
          teacherName: "AI Generator",
          examType: 1, // Exercise
          examYear: new Date().getFullYear(),
          createdAt: new Date().toISOString(),
          questions: [
            {
              id: nanoid(8),
              content: job.data.generatedContent?.content || "Generated Content",
              level: 1,
              keywords: job.data.generatedContent?.keywords || []
            }
          ],
          isPublic: job.options.isPublic
        };
        createdExams.push(newExam);
        console.log('[MSW] Created new exam from generation:', newExamId);

        updatePhase(job, 20); // -> publication_saving
      }
      break;

    // Publication Phase
    case 20: // publication_saving
      if (elapsed > 1000) updatePhase(job, 21); // -> publishing
      break;
    case 21: // publication_publishing
      // Final state
      break;
  }
  return job;
};

export const generationHandlers = [
  // Start Generation Job
  http.post(withBase('/generation/start'), async ({ request }: { request: any }) => {
    const body = await request.json() as any;
    const jobId = generateJobId();

    const newJob = {
      jobId,
      tempKey: body.tempKey,
      phase: 0, // structure_uploading
      lastUpdated: Date.now(),
      options: {
        checkStructure: body.options?.checkStructure ?? false,
        isPublic: body.options?.isPublic ?? false,
      }
    };

    jobs.set(jobId, newJob);

    return HttpResponse.json({
      jobId,
      phase: newJob.phase,
      message: 'Job started'
    });
  }),

  // Get Job Status
  http.get(withBase('/generation/status/:jobId'), ({ params }: { params: any }) => {
    const jobId = String(params.jobId);
    let job = jobs.get(jobId);

    if (!job) {
      return new HttpResponse(null, { status: 404 });
    }

    // Process state transitions
    job = processJob(job);
    jobs.set(jobId, job);

    return HttpResponse.json({
      jobId: job.jobId,
      phase: job.phase,
      data: job.data,
      updatedAt: new Date(job.lastUpdated).toISOString()
    });
  }),

  // Confirm Phase (Manual Transition)
  http.post(withBase('/generation/:jobId/confirm'), ({ params }: { params: any }) => {
    const jobId = String(params.jobId);
    const job = jobs.get(jobId);

    if (!job) {
      return new HttpResponse(null, { status: 404 });
    }

    if (job.phase === 3) {
      updatePhase(job, 4); // structure_confirmed -> structure_completed
    } else if (job.phase === 13) {
      updatePhase(job, 14); // generation_confirmed -> generation_completed
      // Trigger process immediately to ensure ID generation happens
      processJob(job);
    }

    jobs.set(jobId, job);
    return HttpResponse.json({
      success: true,
      phase: job.phase,
      examId: job.contentsId // Return examId if available
    });
  }),
];


