import { http, HttpResponse } from "msw";
const apiBase =
    (import.meta.env?.VITE_API_BASE_URL as string | undefined)?.replace(
        /\/$/,
        "",
    ) ?? "";
const withBase = (path: string) => `${apiBase}${path}`;

// Mock database for problems
const problems = [
    {
        id: "p1",
        title: "微分積分学 - 第3章 演習問題",
        subject: "数学",
        university: "東京大学",
        faculty: "理学部",
        type: "exercise",
        difficulty: "standard",
        rating: 4.5,
        likes: 120,
        comments: 15,
        views: 450,
        author: {
            id: "u1",
            name: "佐藤花子",
            avatar: "/avatars/u1.jpg"
        },
        createdAt: "2025-11-20T10:00:00Z",
        updatedAt: "2025-11-20T10:00:00Z",
        content: "関数の極限と連続性についての問題セットです。イプシロン・デルタ論法を用いた証明問題を含みます。",
        description: "微分積分学の基礎となる極限と連続性について学習します。",
        tags: ["微分積分", "極限", "連続性", "証明"],
        isPublic: true,
        questions: [
            {
                id: "q1",
                text: "f(x) = x^2 の x=2 における連続性を証明せよ。",
                type: "proof",
                points: 10,
                solution: "任意のε>0に対して、δ=min{1, ε/5}とおくと、|x-2|<δのとき|f(x)-4|<εが成り立つ。"
            },
            {
                id: "q2",
                text: "lim(x->0) sin(x)/x = 1 を示せ。",
                type: "proof",
                points: 15,
                solution: "はさみうちの原理を用いる。"
            }
        ]
    },
    {
        id: "p2",
        title: "線形代数 - 固有値と固有ベクトル",
        subject: "数学",
        university: "京都大学",
        faculty: "工学部",
        type: "past_exam",
        difficulty: "difficult",
        rating: 4.8,
        likes: 85,
        comments: 8,
        views: 320,
        author: {
            id: "u2",
            name: "鈴木一郎",
            avatar: "/avatars/u2.jpg"
        },
        createdAt: "2025-11-21T14:30:00Z",
        updatedAt: "2025-11-21T14:30:00Z",
        content: "行列の対角化とジョルダン標準形に関する演習。計算量が多いので注意。",
        description: "固有値問題の理論と応用を学びます。",
        tags: ["線形代数", "固有値", "固有ベクトル", "対角化"],
        isPublic: true,
        questions: [
            {
                id: "q1",
                text: "次の行列の固有値を求めよ。A = [[2,1],[1,2]]",
                type: "calculation",
                points: 20,
                solution: "固有方程式 det(A-λI)=0 より、λ=1,3"
            }
        ]
    },
    {
        id: "p3",
        title: "力学 - 剛体の運動",
        subject: "物理学",
        university: "東京理科大学",
        faculty: "理学部",
        type: "exercise",
        difficulty: "standard",
        rating: 4.2,
        likes: 45,
        comments: 3,
        views: 180,
        author: {
            id: "u3",
            name: "田中次郎",
            avatar: ""
        },
        createdAt: "2025-11-22T09:00:00Z",
        updatedAt: "2025-11-22T09:00:00Z",
        content: "慣性モーメントの計算と回転運動の方程式。",
        description: "剛体の力学について学習します。",
        tags: ["力学", "剛体", "慣性モーメント", "回転運動"],
        isPublic: true,
        questions: [
            {
                id: "q1",
                text: "半径Rの円盤の慣性モーメントを求めよ。",
                type: "calculation",
                points: 15,
                solution: "I = (1/2)MR^2"
            }
        ]
    },
    {
        id: "p4",
        title: "有機化学 - 反応機構",
        subject: "化学",
        university: "早稲田大学",
        faculty: "理工学部",
        type: "exercise",
        difficulty: "applied",
        rating: 4.6,
        likes: 92,
        comments: 12,
        views: 280,
        author: {
            id: "u1",
            name: "佐藤花子",
            avatar: "/avatars/u1.jpg"
        },
        createdAt: "2025-11-23T11:00:00Z",
        updatedAt: "2025-11-23T11:00:00Z",
        content: "SN1、SN2反応の反応機構と立体化学について学びます。",
        description: "求核置換反応の詳細な機構を理解します。",
        tags: ["有機化学", "反応機構", "SN1", "SN2", "立体化学"],
        isPublic: true,
        questions: [
            {
                id: "q1",
                text: "SN1反応とSN2反応の違いを説明せよ。",
                type: "descriptive",
                points: 10
            }
        ]
    }
];

export const problemHandlers = [
    // Get all problems (simplified search/list)
    http.get(withBase("/problems"), () => {
        return HttpResponse.json(problems);
    }),

    // Get single problem by ID
    http.get(withBase("/problems/:id"), ({ params }) => {
        const { id } = params;
        const problem = problems.find((p) => p.id === id);
        if (!problem) {
            return new HttpResponse(null, { status: 404 });
        }
        return HttpResponse.json(problem);
    }),

    // Create new problem (mock)
    http.post(withBase("/problems"), async ({ request }) => {
        const newProblem = await request.json() as any;
        newProblem.id = `p${problems.length + 1}`;
        newProblem.createdAt = new Date().toISOString();
        problems.push(newProblem);
        return HttpResponse.json(newProblem, { status: 201 });
    }),

    // Update problem (mock)
    http.put(withBase("/problems/:id"), async ({ params, request }) => {
        const { id } = params;
        const updateData = await request.json() as any;
        const index = problems.findIndex((p) => p.id === id);

        if (index === -1) {
            return new HttpResponse(null, { status: 404 });
        }

        problems[index] = { ...problems[index], ...updateData };
        return HttpResponse.json(problems[index]);
    }),
];
