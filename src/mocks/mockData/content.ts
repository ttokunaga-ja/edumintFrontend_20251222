import { Exam, Question, SubQuestion } from '../../features/content/models';

const baseTimestamps = {
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// 学問分野マスタデータ
export const mockAcademicFields = [
  { id: 1, field_name: '情報系', field_type: 'science' },
  { id: 2, field_name: '電気電子系', field_type: 'science' },
  { id: 3, field_name: '機械系', field_type: 'science' },
  { id: 4, field_name: '化学系', field_type: 'science' },
  { id: 5, field_name: '人文系', field_type: 'humanities' },
  { id: 6, field_name: '教養系', field_type: 'humanities' },
];

// 学部マスタデータ
export const mockFaculties = [
  { id: 1, university_id: 1, name: '数学科' },
  { id: 2, university_id: 2, name: '理工学部' },
  { id: 3, university_id: 3, name: '理学部' },
  { id: 4, university_id: 4, name: '先進理工学部' },
  { id: 5, university_id: 1, name: '工学部' },
];

export const mockExams: any[] = [
  {
    id: '8fA9xKQ2ZP7mR4LJ',
    examName: '微分積分学 期末試験',
    examYear: 2024,
    examType: 0,
    universityName: '筑波大学',
    facultyName: '数学科',
    teacherName: '山田太郎',
    subjectName: '微分積分学',
    durationMinutes: 90,
    majorType: 0,
    academicFieldName: '機械系',
    author_id: 'u_k8P3n9L2mR5qW4xZ',
    questions: [
      {
        id: 1,
        questionNumber: 1,
        questionContent: '次の積分を計算せよ：∫x²dx',
        difficulty: '1',
        keywords: [{ id: 'kw_abcdefghijklmn', keyword: '積分' }],
        subQuestions: [
          {
            id: 1,
            subQuestionNumber: 1,
            questionTypeId: '10',
            questionContent: '∫x²dx = ?',
            answerContent: 'x³/3 + C',
            explanation: '',
            keywords: [],
            options: [],
            pairs: [],
            items: [],
            answers: [{
              id: 'ansabcdefghijklmn',
              sampleAnswer: 'x³/3 + C',
              gradingCriteria: '計算過程が正しいか',
              pointValue: 10,
            }],
          },
        ],
      },
    ],
  },
  {
    id: '9gB0yLR3AQ8nS5MK',
    examName: '線形代数 中間試験',
    examYear: 2023,
    examType: 1,
    universityName: '慶應義塾大学',
    facultyName: '理工学部',
    teacherName: '佐藤花子',
    subjectName: '線形代数',
    durationMinutes: 60,
    majorType: 1,
    academicFieldName: '人文系',
    author_id: 'v_l9Q4o8N3pS6rX5yA',
    questions: [
      {
        id: 2,
        questionNumber: 1,
        questionContent: '次の行列の固有値を求めよ',
        difficulty: '2',
        keywords: [{ id: 'lx_bcdefghijklmnop', keyword: '固有値' }],
        subQuestions: [
          {
            id: 2,
            subQuestionNumber: 1,
            questionTypeId: '1',
            questionContent: '行列 A = [[1, 2], [3, 4]] の固有値は？',
            answerContent: '',
            explanation: '',
            keywords: [],
            options: [
              { id: 'optabcdefghijklmn', content: '5.372, -0.372', isCorrect: true },
              { id: 'optbcdefghijklmno', content: '2, 3', isCorrect: false },
              { id: 'optcdefghijklmnop', content: '1, 4', isCorrect: false },
            ],
            pairs: [],
            items: [],
            answers: [],
          },
        ],
      },
    ],
  },
];

const newMockExams = [
  {
    "id": "v7N2jK8mP4wL9XRz",
    "examName": "量子力学基礎 中間試験",
    "examYear": 2024,
    "examType": 1,
    "universityName": "帝都理工大学",
    "facultyName": "理学部物理学科",
    "teacherName": "佐藤 憲一 教授",
    "subjectName": "量子力学I",
    "durationMinutes": 90,
    "majorType": 1,
    "academicFieldName": "物理学",
    "author_id": "usr_A123bcD456",
    "questions": [
      {
        "id": "q1_v7N2jK8m",
        "questionNumber": 1,
        "content": "シュレディンガー方程式と演算子の基本的性質について述べよ。",
        "difficulty": { "id": 1, "label": "標準", "level": 2 },
        "keywords": [
          { "id": "kw_p1", "keyword": "演算子" },
          { "id": "kw_p2", "keyword": "シュレディンガー方程式" }
        ],
        "subQuestions": [
          {
            "id": "sq1_1_v7N2",
            "subQuestionNumber": 1,
            "questionTypeId": 1,
            "content": "位置演算子 $\\hat{x}$ と運動量演算子 $\\hat{p} = -i\\hbar \\frac{\\partial}{\\partial x}$ の交換関係 $[\\hat{x}, \\hat{p}]$ として正しいものを選択せよ。",
            "answer": "opt_p1_1",
            "explanation": "基本演算子の交換関係は $[\\hat{x}, \\hat{p}] = \\hat{x}\\hat{p} - \\hat{p}\\hat{x} = i\\hbar$ です。",
            "keywords": [{ "id": "kw_p3", "keyword": "交換関係" }],
            "options": [
              { "id": "opt_p1_1", "content": "$i\\hbar$", "isCorrect": true },
              { "id": "opt_p1_2", "content": "$-i\\hbar$", "isCorrect": false },
              { "id": "opt_p1_3", "content": "$\\hbar$", "isCorrect": false },
              { "id": "opt_p1_4", "content": "0", "isCorrect": false }
            ]
          },
          {
            "id": "sq1_2_v7N2",
            "subQuestionNumber": 2,
            "questionTypeId": 11,
            "content": "無限に深い1次元の箱（幅 $L$）に閉じ込められた質量 $m$ の粒子の、エネルギー固有値 $E_n$ を求めよ。",
            "answer": "$E_n = \\frac{n^2 \\pi^2 \\hbar^2}{2mL^2}$",
            "explanation": "境界条件 $\\psi(0) = \\psi(L) = 0$ を解くことで得られます。",
            "keywords": [{ "id": "kw_p4", "keyword": "無限井戸型ポテンシャル" }],
            "answers": [
              {
                "id": "ans_p1_2",
                "sampleAnswer": "$E_n = \\frac{n^2 \\pi^2 \\hbar^2}{2mL^2}$ ($n=1,2,3...$)",
                "gradingCriteria": "定数の正しさ、およびnの二乗に比例している点を確認。",
                "pointValue": 15
              }
            ]
          }
        ]
      },
      {
        "id": "q2_v7N2jK8m",
        "questionNumber": 2,
        "content": "エルミート演算子と測定値に関する次の問いに答えよ。",
        "difficulty": { "id": 2, "label": "やや難", "level": 3 },
        "keywords": [{ "id": "kw_p5", "keyword": "エルミート演算子" }],
        "subQuestions": [
          {
            "id": "sq2_1_v7N2",
            "subQuestionNumber": 1,
            "questionTypeId": 3,
            "content": "「任意の物理量に対応する演算子は、必ずしもエルミート演算子である必要はない」という言説は正しいか。",
            "answer": "opt_p2_1_2",
            "explanation": "物理量は実測値である必要があり、その期待値が常に実数になるためには演算子がエルミートである必要があります。",
            "keywords": [],
            "options": [
              { "id": "opt_p2_1_1", "content": "正", "isCorrect": false },
              { "id": "opt_p2_1_2", "content": "誤", "isCorrect": true }
            ]
          },
          {
            "id": "sq2_2_v7N2",
            "subQuestionNumber": 2,
            "questionTypeId": 2,
            "content": "エルミート演算子の性質として正しいものをすべて選べ。",
            "answer": "opt_p2_2_1, opt_p2_2_3",
            "explanation": "異なる固有値に属する固有関数は直交し、固有値は常に実数です。",
            "keywords": [{ "id": "kw_p6", "keyword": "固有関数" }],
            "options": [
              { "id": "opt_p2_2_1", "content": "固有値は常に実数である", "isCorrect": true },
              { "id": "opt_p2_2_2", "content": "固有値は常に正の数である", "isCorrect": false },
              { "id": "opt_p2_2_3", "content": "異なる固有値に属する固有ベクトルは直交する", "isCorrect": true },
              { "id": "opt_p2_2_4", "content": "逆演算子が必ず存在する", "isCorrect": false }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "G9b5HqR1sT3cV6mN",
    "examName": "ミクロ経済学 基礎解析",
    "examYear": 2024,
    "examType": 2,
    "universityName": "西京大学",
    "facultyName": "経済学部",
    "teacherName": "Robert Smith",
    "subjectName": "ミクロ経済学基礎",
    "durationMinutes": 60,
    "majorType": 2,
    "academicFieldName": "経済学",
    "author_id": "usr_E999xyz",
    "questions": [
      {
        "id": "q1_G9b5HqR1",
        "questionNumber": 1,
        "content": "消費者の効用最大化問題について、以下のステップと用語を確認せよ。",
        "difficulty": { "id": 1, "label": "標準", "level": 2 },
        "keywords": [{ "id": "kw_e1", "keyword": "効用最大化" }],
        "subQuestions": [
          {
            "id": "sq1_1_G9b5",
            "subQuestionNumber": 1,
            "questionTypeId": 5,
            "content": "消費者が最適な消費束を決定するまでの論理的な順序として適切なものに並べ替えよ。",
            "answer": "item_e1_2, item_e1_1, item_e1_3",
            "explanation": "まず選好（効用関数）が定義され、次に予算制約が考慮され、最終的にその接点で最大化されます。",
            "keywords": [],
            "items": [
              { "id": "item_e1_1", "text": "予算制約線 $p_1 x_1 + p_2 x_2 = I$ の定義", "correctOrder": 2 },
              { "id": "item_e1_2", "text": "効用関数 $U(x_1, x_2)$ の特定", "correctOrder": 1 },
              { "id": "item_e1_3", "text": "無差別曲線と予算制約線の接点の導出", "correctOrder": 3 }
            ]
          },
          {
            "id": "sq1_2_G9b5",
            "subQuestionNumber": 2,
            "questionTypeId": 12,
            "content": "需要の価格弾力性 $e_d$ の定義式を記述せよ。価格を $P$、需要量を $Q$ とする。",
            "answer": "$e_d = -\\frac{dQ}{dP} \\cdot \\frac{P}{Q}$",
            "explanation": "価格の変化率に対する需要の変化率の比率です。",
            "keywords": [{ "id": "kw_e2", "keyword": "価格弾力性" }],
            "answers": [
              {
                "id": "ans_e1_2",
                "sampleAnswer": "$e_d = -\\frac{\\Delta Q / Q}{\\Delta P / P}$ もしくは $-\\frac{dQ}{dP} \\frac{P}{Q}$",
                "gradingCriteria": "変化率の比であること、マイナス記号の考慮（慣習的）ができているか。",
                "pointValue": 10
              }
            ]
          }
        ]
      },
      {
        "id": "q2_G9b5HqR1",
        "questionNumber": 2,
        "content": "市場の形態と利潤最大化条件に関する理解を問う。",
        "difficulty": { "id": 2, "label": "やや難", "level": 3 },
        "keywords": [{ "id": "kw_e3", "keyword": "市場構造" }],
        "subQuestions": [
          {
            "id": "sq2_1_G9b5",
            "subQuestionNumber": 1,
            "questionTypeId": 4,
            "content": "次の経済学用語と、その特徴として最も適切な説明を組み合わせよ。",
            "answer": "pair_e1:1, pair_e2:2, pair_e3:3",
            "explanation": "それぞれの市場構造の基本定義です。",
            "keywords": [],
            "pairs": [
              { "id": "pair_e1", "question": "完全競争市場", "answer": "プライステイカーとして行動し、P=MCとなる。" },
              { "id": "pair_e2", "question": "独占市場", "answer": "限界収入(MR)と限界費用(MC)が一致する点で生産量を決める。" },
              { "id": "pair_e3", "question": "ナッシュ均衡", "answer": "他のプレイヤーの戦略に対し、自己の利得を最大化する戦略の組み合わせ。" }
            ]
          },
          {
            "id": "sq2_2_G9b5",
            "subQuestionNumber": 2,
            "questionTypeId": 1,
            "content": "限界費用 $MC$ が一定値 $c$ である独占企業の価格設定 $P$ と、需要の価格弾力性 $\\epsilon$ の関係式（ラーナーの独占度）として正しいものはどれか。",
            "answer": "opt_e2_2_1",
            "explanation": "$\\frac{P-MC}{P} = \\frac{1}{\\epsilon}$ より導かれます。",
            "keywords": [{ "id": "kw_e4", "keyword": "ラーナーの独占度" }],
            "options": [
              { "id": "opt_e2_2_1", "content": "$P = \\frac{c}{1 - 1/\\epsilon}$", "isCorrect": true },
              { "id": "opt_e2_2_2", "content": "$P = c(1 + \\epsilon)$", "isCorrect": false },
              { "id": "opt_e2_2_3", "content": "$P = c \\epsilon$", "isCorrect": false }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "X4yZ7kM2pA8wL1qE",
    "examName": "線形代数学 最終試験",
    "examYear": 2024,
    "examType": 3,
    "universityName": "北海総合大学",
    "facultyName": "工学部",
    "teacherName": "中野 昌三 教授",
    "subjectName": "線形代数II",
    "durationMinutes": 100,
    "majorType": 1,
    "academicFieldName": "数学",
    "author_id": "usr_Math999",
    "questions": [
      {
        "id": "q1_X4yZ7kM2",
        "questionNumber": 1,
        "content": "行列の固有値と対角化について。",
        "difficulty": { "id": 2, "label": "やや難", "level": 3 },
        "keywords": [{ "id": "kw_m1", "keyword": "固有値" }, { "id": "kw_m2", "keyword": "対角化" }],
        "subQuestions": [
          {
            "id": "sq1_1_X4yZ",
            "subQuestionNumber": 1,
            "questionTypeId": 1,
            "content": "行列 $A = \\begin{pmatrix} 2 & 1 \\\\ 1 & 2 \\end{pmatrix}$ の固有値を求めよ。",
            "answer": "opt_m1_1_3",
            "explanation": "$|A - \\lambda I| = (2-\\lambda)^2 - 1 = 0$ を解くと $\\lambda = 1, 3$ です。",
            "keywords": [],
            "options": [
              { "id": "opt_m1_1_1", "content": "1, 2", "isCorrect": false },
              { "id": "opt_m1_1_2", "content": "0, 3", "isCorrect": false },
              { "id": "opt_m1_1_3", "content": "1, 3", "isCorrect": true },
              { "id": "opt_m1_1_4", "content": "2, 2", "isCorrect": false }
            ]
          },
          {
            "id": "sq1_2_X4yZ",
            "subQuestionNumber": 2,
            "questionTypeId": 4,
            "content": "次の行列の種類とその性質を正しく組み合わせよ。",
            "answer": "pair_m1:1, pair_m2:2, pair_m3:3",
            "explanation": "行列の定義に基づく基本的な性質です。",
            "keywords": [],
            "pairs": [
              { "id": "pair_m1", "question": "正則行列", "answer": "逆行列が存在し、行列式が $0$ ではない。" },
              { "id": "pair_m2", "question": "直交行列", "answer": "$A^T A = I$ を満たす。" },
              { "id": "pair_m3", "question": "対称行列", "answer": "$A^T = A$ を満たし、固有値は常に実数である。" }
            ]
          }
        ]
      },
      {
        "id": "q2_X4yZ7kM2",
        "questionNumber": 2,
        "content": "線形写像とベクトルの空間に関する問題。",
        "difficulty": { "id": 3, "label": "難", "level": 4 },
        "keywords": [{ "id": "kw_m3", "keyword": "線形写像" }],
        "subQuestions": [
          {
            "id": "sq2_1_X4yZ",
            "subQuestionNumber": 1,
            "questionTypeId": 2,
            "content": "線形写像 $f: V \\to W$ について、常に成り立つ性質を選べ。",
            "answer": "opt_m2_1_1, opt_m2_1_4",
            "explanation": "線形性の定義および次元定理の性質です。",
            "keywords": [{ "id": "kw_m4", "keyword": "次元定理" }],
            "options": [
              { "id": "opt_m2_1_1", "content": "$f(\\mathbf{0}) = \\mathbf{0}$", "isCorrect": true },
              { "id": "opt_m2_1_2", "content": "$f$ は必ず全単射である", "isCorrect": false },
              { "id": "opt_m2_1_3", "content": "$\\dim(\\text{Ker } f) = \\dim V$", "isCorrect": false },
              { "id": "opt_m2_1_4", "content": "$f(a\mathbf{v} + b\mathbf{u}) = af(\mathbf{v}) + bf(\mathbf{u})$", "isCorrect": true }
            ]
          },
          {
            "id": "sq2_2_X4yZ",
            "subQuestionNumber": 2,
            "questionTypeId": 10,
            "content": "$n$ 次正方行列 $A$ が対角化可能であるための必要十分条件を、固有ベクトルを用いて記述せよ。",
            "answer": "$A$ が $n$ 個の線形独立な固有ベクトルを持つこと。",
            "explanation": "対角化行列 $P$ を構成するためには、基底となる $n$ 本の独立な固有ベクトルが必要です。",
            "keywords": [{ "id": "kw_m5", "keyword": "線形独立" }],
            "answers": [
              {
                "id": "ans_m2_2",
                "sampleAnswer": "$n$ 次正方行列 $A$ が $n$ 個の線形独立な固有ベクトルを持つこと。",
                "gradingCriteria": "「n個」「線形独立」「固有ベクトル」の3つのキーワードが含まれているか。",
                "pointValue": 20
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "v7N2jK8mP4wL9XRz",
    "examName": "量子力学基礎 中間試験",
    "examYear": 2024,
    "examType": 1,
    "universityName": "帝都理工大学",
    "facultyName": "理学部物理学科",
    "teacherName": "佐藤 憲一 教授",
    "subjectName": "量子力学I",
    "durationMinutes": 90,
    "majorType": 1,
    "academicFieldName": "物理学",
    "author_id": "usr_A123bcD456",
    "questions": [
      {
        "id": "q1_v7N2jK8m",
        "questionNumber": 1,
        "content": "シュレディンガー方程式と演算子の基本的性質について述べよ。",
        "difficulty": { "id": 1, "label": "標準", "level": 2 },
        "keywords": [
          { "id": "kw_p1", "keyword": "演算子" },
          { "id": "kw_p2", "keyword": "シュレディンガー方程式" }
        ],
        "subQuestions": [
          {
            "id": "sq1_1_v7N2",
            "subQuestionNumber": 1,
            "questionTypeId": 1,
            "content": "位置演算子 $\\hat{x}$ と運動量演算子 $\\hat{p} = -i\\hbar \\frac{\\partial}{\\partial x}$ の交換関係 $[\\hat{x}, \\hat{p}]$ として正しいものを選択せよ。",
            "answer": "opt_p1_1",
            "explanation": "基本演算子の交換関係は $[\\hat{x}, \\hat{p}] = \\hat{x}\\hat{p} - \\hat{p}\\hat{x} = i\\hbar$ です。",
            "keywords": [{ "id": "kw_p3", "keyword": "交換関係" }],
            "options": [
              { "id": "opt_p1_1", "content": "$i\\hbar$", "isCorrect": true },
              { "id": "opt_p1_2", "content": "$-i\\hbar$", "isCorrect": false },
              { "id": "opt_p1_3", "content": "$\\hbar$", "isCorrect": false },
              { "id": "opt_p1_4", "content": "0", "isCorrect": false }
            ]
          },
          {
            "id": "sq1_2_v7N2",
            "subQuestionNumber": 2,
            "questionTypeId": 11,
            "content": "無限に深い1次元の箱（幅 $L$）に閉じ込められた質量 $m$ の粒子の、エネルギー固有値 $E_n$ を求めよ。",
            "answer": "$E_n = \\frac{n^2 \\pi^2 \\hbar^2}{2mL^2}$",
            "explanation": "境界条件 $\\psi(0) = \\psi(L) = 0$ を解くことで得られます。",
            "keywords": [{ "id": "kw_p4", "keyword": "無限井戸型ポテンシャル" }],
            "answers": [
              {
                "id": "ans_p1_2",
                "sampleAnswer": "$E_n = \\frac{n^2 \\pi^2 \\hbar^2}{2mL^2}$ ($n=1,2,3...$)",
                "gradingCriteria": "定数の正しさ、およびnの二乗に比例している点を確認。",
                "pointValue": 15
              }
            ]
          }
        ]
      },
      {
        "id": "q2_v7N2jK8m",
        "questionNumber": 2,
        "content": "エルミート演算子と測定値に関する次の問いに答えよ。",
        "difficulty": { "id": 2, "label": "やや難", "level": 3 },
        "keywords": [{ "id": "kw_p5", "keyword": "エルミート演算子" }],
        "subQuestions": [
          {
            "id": "sq2_1_v7N2",
            "subQuestionNumber": 1,
            "questionTypeId": 3,
            "content": "「任意の物理量に対応する演算子は、必ずしもエルミート演算子である必要はない」という言説は正しいか。",
            "answer": "opt_p2_1_2",
            "explanation": "物理量は実測値である必要があり、その期待値が常に実数になるためには演算子がエルミートである必要があります。",
            "keywords": [],
            "options": [
              { "id": "opt_p2_1_1", "content": "正", "isCorrect": false },
              { "id": "opt_p2_1_2", "content": "誤", "isCorrect": true }
            ]
          },
          {
            "id": "sq2_2_v7N2",
            "subQuestionNumber": 2,
            "questionTypeId": 2,
            "content": "エルミート演算子の性質として正しいものをすべて選べ。",
            "answer": "opt_p2_2_1, opt_p2_2_3",
            "explanation": "異なる固有値に属する固有関数は直交し、固有値は常に実数です。",
            "keywords": [{ "id": "kw_p6", "keyword": "固有関数" }],
            "options": [
              { "id": "opt_p2_2_1", "content": "固有値は常に実数である", "isCorrect": true },
              { "id": "opt_p2_2_2", "content": "固有値は常に正の数である", "isCorrect": false },
              { "id": "opt_p2_2_3", "content": "異なる固有値に属する固有ベクトルは直交する", "isCorrect": true },
              { "id": "opt_p2_2_4", "content": "逆演算子が必ず存在する", "isCorrect": false }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "G9b5HqR1sT3cV6mN",
    "examName": "ミクロ経済学 基礎解析",
    "examYear": 2024,
    "examType": 2,
    "universityName": "西京大学",
    "facultyName": "経済学部",
    "teacherName": "Robert Smith",
    "subjectName": "ミクロ経済学基礎",
    "durationMinutes": 60,
    "majorType": 2,
    "academicFieldName": "経済学",
    "author_id": "usr_E999xyz",
    "questions": [
      {
        "id": "q1_G9b5HqR1",
        "questionNumber": 1,
        "content": "消費者の効用最大化問題について、以下のステップと用語を確認せよ。",
        "difficulty": { "id": 1, "label": "標準", "level": 2 },
        "keywords": [{ "id": "kw_e1", "keyword": "効用最大化" }],
        "subQuestions": [
          {
            "id": "sq1_1_G9b5",
            "subQuestionNumber": 1,
            "questionTypeId": 5,
            "content": "消費者が最適な消費束を決定するまでの論理的な順序として適切なものに並べ替えよ。",
            "answer": "item_e1_2, item_e1_1, item_e1_3",
            "explanation": "まず選好（効用関数）が定義され、次に予算制約が考慮され、最終的にその接点で最大化されます。",
            "keywords": [],
            "items": [
              { "id": "item_e1_1", "text": "予算制約線 $p_1 x_1 + p_2 x_2 = I$ の定義", "correctOrder": 2 },
              { "id": "item_e1_2", "text": "効用関数 $U(x_1, x_2)$ の特定", "correctOrder": 1 },
              { "id": "item_e1_3", "text": "無差別曲線と予算制約線の接点の導出", "correctOrder": 3 }
            ]
          },
          {
            "id": "sq1_2_G9b5",
            "subQuestionNumber": 2,
            "questionTypeId": 12,
            "content": "需要の価格弾力性 $e_d$ の定義式を記述せよ。価格を $P$、需要量を $Q$ とする。",
            "answer": "$e_d = -\\frac{dQ}{dP} \\cdot \\frac{P}{Q}$",
            "explanation": "価格の変化率に対する需要の変化率の比率です。",
            "keywords": [{ "id": "kw_e2", "keyword": "価格弾力性" }],
            "answers": [
              {
                "id": "ans_e1_2",
                "sampleAnswer": "$e_d = -\\frac{\\Delta Q / Q}{\\Delta P / P}$ もしくは $-\\frac{dQ}{dP} \\frac{P}{Q}$",
                "gradingCriteria": "変化率の比であること、マイナス記号の考慮（慣習的）ができているか。",
                "pointValue": 10
              }
            ]
          }
        ]
      },
      {
        "id": "q2_G9b5HqR1",
        "questionNumber": 2,
        "content": "市場の形態と利潤最大化条件に関する理解を問う。",
        "difficulty": { "id": 2, "label": "やや難", "level": 3 },
        "keywords": [{ "id": "kw_e3", "keyword": "市場構造" }],
        "subQuestions": [
          {
            "id": "sq2_1_G9b5",
            "subQuestionNumber": 1,
            "questionTypeId": 4,
            "content": "次の経済学用語と、その特徴として最も適切な説明を組み合わせよ。",
            "answer": "pair_e1:1, pair_e2:2, pair_e3:3",
            "explanation": "それぞれの市場構造の基本定義です。",
            "keywords": [],
            "pairs": [
              { "id": "pair_e1", "question": "完全競争市場", "answer": "プライステイカーとして行動し、P=MCとなる。" },
              { "id": "pair_e2", "question": "独占市場", "answer": "限界収入(MR)と限界費用(MC)が一致する点で生産量を決める。" },
              { "id": "pair_e3", "question": "ナッシュ均衡", "answer": "他のプレイヤーの戦略に対し、自己の利得を最大化する戦略の組み合わせ。" }
            ]
          },
          {
            "id": "sq2_2_G9b5",
            "subQuestionNumber": 2,
            "questionTypeId": 1,
            "content": "限界費用 $MC$ が一定値 $c$ である独占企業の価格設定 $P$ と、需要の価格弾力性 $\\epsilon$ の関係式（ラーナーの独占度）として正しいものはどれか。",
            "answer": "opt_e2_2_1",
            "explanation": "$\\frac{P-MC}{P} = \\frac{1}{\\epsilon}$ より導かれます。",
            "keywords": [{ "id": "kw_e4", "keyword": "ラーナーの独占度" }],
            "options": [
              { "id": "opt_e2_2_1", "content": "$P = \\frac{c}{1 - 1/\\epsilon}$", "isCorrect": true },
              { "id": "opt_e2_2_2", "content": "$P = c(1 + \\epsilon)$", "isCorrect": false },
              { "id": "opt_e2_2_3", "content": "$P = c \\epsilon$", "isCorrect": false }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "X4yZ7kM2pA8wL1qE",
    "examName": "線形代数学 最終試験",
    "examYear": 2024,
    "examType": 3,
    "universityName": "北海総合大学",
    "facultyName": "工学部",
    "teacherName": "中野 昌三 教授",
    "subjectName": "線形代数II",
    "durationMinutes": 100,
    "majorType": 1,
    "academicFieldName": "数学",
    "author_id": "usr_Math999",
    "questions": [
      {
        "id": "q1_X4yZ7kM2",
        "questionNumber": 1,
        "content": "行列の固有値と対角化について。",
        "difficulty": { "id": 2, "label": "やや難", "level": 3 },
        "keywords": [{ "id": "kw_m1", "keyword": "固有値" }, { "id": "kw_m2", "keyword": "対角化" }],
        "subQuestions": [
          {
            "id": "sq1_1_X4yZ",
            "subQuestionNumber": 1,
            "questionTypeId": 1,
            "content": "行列 $A = \\begin{pmatrix} 2 & 1 \\\\ 1 & 2 \\end{pmatrix}$ の固有値を求めよ。",
            "answer": "opt_m1_1_3",
            "explanation": "$|A - \\lambda I| = (2-\\lambda)^2 - 1 = 0$ を解くと $\\lambda = 1, 3$ です。",
            "keywords": [],
            "options": [
              { "id": "opt_m1_1_1", "content": "1, 2", "isCorrect": false },
              { "id": "opt_m1_1_2", "content": "0, 3", "isCorrect": false },
              { "id": "opt_m1_1_3", "content": "1, 3", "isCorrect": true },
              { "id": "opt_m1_1_4", "content": "2, 2", "isCorrect": false }
            ]
          },
          {
            "id": "sq1_2_X4yZ",
            "subQuestionNumber": 2,
            "questionTypeId": 4,
            "content": "次の行列の種類とその性質を正しく組み合わせよ。",
            "answer": "pair_m1:1, pair_m2:2, pair_m3:3",
            "explanation": "行列の定義に基づく基本的な性質です。",
            "keywords": [],
            "pairs": [
              { "id": "pair_m1", "question": "正則行列", "answer": "逆行列が存在し、行列式が $0$ ではない。" },
              { "id": "pair_m2", "question": "直交行列", "answer": "$A^T A = I$ を満たす。" },
              { "id": "pair_m3", "question": "対称行列", "answer": "$A^T = A$ を満たし、固有値は常に実数である。" }
            ]
          }
        ]
      },
      {
        "id": "q2_X4yZ7kM2",
        "questionNumber": 2,
        "content": "線形写像とベクトルの空間に関する問題。",
        "difficulty": { "id": 3, "label": "難", "level": 4 },
        "keywords": [{ "id": "kw_m3", "keyword": "線形写像" }],
        "subQuestions": [
          {
            "id": "sq2_1_X4yZ",
            "subQuestionNumber": 1,
            "questionTypeId": 2,
            "content": "線形写像 $f: V \\to W$ について、常に成り立つ性質を選べ。",
            "answer": "opt_m2_1_1, opt_m2_1_4",
            "explanation": "線形性の定義および次元定理の性質です。",
            "keywords": [{ "id": "kw_m4", "keyword": "次元定理" }],
            "options": [
              { "id": "opt_m2_1_1", "content": "$f(\\mathbf{0}) = \\mathbf{0}$", "isCorrect": true },
              { "id": "opt_m2_1_2", "content": "$f$ は必ず全単射である", "isCorrect": false },
              { "id": "opt_m2_1_3", "content": "$\\dim(\\text{Ker } f) = \\dim V$", "isCorrect": false },
              { "id": "opt_m2_1_4", "content": "$f(a\\mathbf{v} + b\\mathbf{u}) = af(\\mathbf{v}) + bf(\\mathbf{u})$", "isCorrect": true }
            ]
          },
          {
            "id": "sq2_2_X4yZ",
            "subQuestionNumber": 2,
            "questionTypeId": 10,
            "content": "$n$ 次正方行列 $A$ が対角化可能であるための必要十分条件を、固有ベクトルを用いて記述せよ。",
            "answer": "$A$ が $n$ 個の線形独立な固有ベクトルを持つこと。",
            "explanation": "対角化行列 $P$ を構成するためには、基底となる $n$ 本の独立な固有ベクトルが必要です。",
            "keywords": [{ "id": "kw_m5", "keyword": "線形独立" }],
            "answers": [
              {
                "id": "ans_m2_2",
                "sampleAnswer": "$n$ 次正方行列 $A$ が $n$ 個の線形独立な固有ベクトルを持つこと。",
                "gradingCriteria": "「n個」「線形独立」「固有ベクトル」の3つのキーワードが含まれているか。",
                "pointValue": 20
              }
            ]
          }
        ]
      }
    ]
  }
]

mockExams.push(...newMockExams);

export const mockQuestions: Question[] = [
  {
    id: 1,
    problemId: '8fA9xKQ2ZP7mR4LJ',
    questionNumber: 1,
    content: '次の関数の導関数を求めよ。',
    format: 0,
    difficulty: { id: 1, label: '標準', level: 2 },
    keywords: [
      { id: 'kw1', keyword: '導関数' },
      { id: 'kw2', keyword: '微分' },
    ],
    subQuestions: [
      {
        id: 1,
        questionId: 1,
        subQuestionNumber: 1,
        questionTypeId: 10,
        content: 'f(x) = x² の導関数を求めよ。',
        format: 0,
        answer: '2x',
        explanation: 'べき関数の微分公式より、x^n の導関数は n x^(n-1) である。',
        keywords: [],
      },
    ],
    ...baseTimestamps,
  },
  {
    id: 2,
    problemId: '9gB0yLR3AQ8nS5MK',
    questionNumber: 1,
    content: '次の行列の固有値を求めよ。',
    format: 0,
    difficulty: { id: 2, label: 'やや難', level: 3 },
    keywords: [
      { id: 'kw3', keyword: '固有値' },
      { id: 'kw4', keyword: '線形代数' },
    ],
    subQuestions: [
      {
        id: 2,
        questionId: 2,
        subQuestionNumber: 1,
        questionTypeId: 1,
        content: '行列 A = [[1, 2], [3, 4]] の固有値は？',
        format: 0,
        answer: '5.372, -0.372',
        explanation: '特性方程式を解くことで固有値を求める。',
        keywords: [],
      },
    ],
    ...baseTimestamps,
  },
  {
    id: 3,
    problemId: '9gB0yLR3AQ8nS5MK',
    questionNumber: 2,
    content: '次の行列の逆行列を求めよ。',
    format: 0,
    difficulty: { id: 2, label: 'やや難', level: 3 },
    keywords: [
      { id: 'kw5', keyword: '逆行列' },
      { id: 'kw6', keyword: '線形代数' },
    ],
    subQuestions: [
      {
        id: 3,
        questionId: 3,
        subQuestionNumber: 1,
        questionTypeId: 10,
        content: '行列 B = [[2, 1], [1, 1]] の逆行列を求めよ。',
        format: 0,
        answer: '[[1, -1], [-1, 2]]',
        explanation: '逆行列の公式を用いて計算する。',
        keywords: [],
      },
    ],
    ...baseTimestamps,
  },
];

export const mockSubQuestions: SubQuestion[] = [
  {
    id: 1,
    questionId: 1,
    subQuestionNumber: 1,
    questionTypeId: 10,
    content: 'f(x) = x² の導関数を求めよ。',
    format: 0,
    answer: '2x',
    explanation: 'べき関数の微分公式より、x^n の導関数は n x^(n-1) である。',
    keywords: [],
    ...baseTimestamps,
  },
  {
    id: 2,
    questionId: 2,
    subQuestionNumber: 1,
    questionTypeId: 1,
    content: '行列 A = [[1, 2], [3, 4]] の固有値は？',
    format: 0,
    answer: '5.372, -0.372',
    explanation: '特性方程式を解くことで固有値を求める。',
    keywords: [],
    ...baseTimestamps,
  },
  {
    id: 3,
    questionId: 3,
    subQuestionNumber: 1,
    questionTypeId: 10,
    content: '行列 B = [[2, 1], [1, 1]] の逆行列を求めよ。',
    format: 0,
    answer: '[[1, -1], [-1, 2]]',
    explanation: '逆行列の公式を用いて計算する。',
    keywords: [],
    ...baseTimestamps,
  },
];

export const mockSubQuestionSelection = [
  {
    id: 'sel1',
    subQuestionId: 1,
    content: '2x',
    isCorrect: true,
    order: 1,
  },
  {
    id: 'sel2',
    subQuestionId: 1,
    content: 'x²',
    isCorrect: false,
    order: 2,
  },
];

export const mockSubQuestionMatching = [
  {
    id: 'match1',
    subQuestionId: 1,
    leftContent: 'f(x)',
    rightContent: '2x',
  },
];

export const mockSubQuestionOrdering = [
  {
    id: 'ord1',
    subQuestionId: 1,
    content: 'ステップ1',
    correctOrder: 1,
  },
];

export const mockSubQuestionEssay = [
  {
    id: 'essay1',
    subQuestionId: 1,
    sampleAnswer: '2x',
    gradingCriteria: '計算過程が正しいか',
    pointValue: 10,
  },
  {
    id: 'essay3',
    subQuestionId: 3,
    sampleAnswer: '[[1, -1], [-1, 2]]',
    gradingCriteria: '逆行列の計算が正しいか',
    pointValue: 15,
  },
];

