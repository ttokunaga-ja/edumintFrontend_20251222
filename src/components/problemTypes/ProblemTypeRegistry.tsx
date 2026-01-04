import { lazy } from 'react';
import type { ComponentType } from 'react';
import { ProblemTypeEditProps, ProblemTypeRegistration, ProblemTypeViewProps } from '@/types/problemTypes';

const registry = new Map<number, ProblemTypeRegistration>();

/**
 * ProblemTypeRegistry
 * 
 * 問題形式（typeId）とコンポーネントのマッピングを管理するレジストリ
 * 
 * ========================================
 * typeId マッピング（実装参照）
 * ========================================
 * 
 * 【パターンA：選択・構造化データ系】
 * ID 1 | 単一選択         | SelectionViewer (isSingleSelect=true)
 * ID 2 | 複数選択         | MultipleChoiceView (SelectionViewer採用)
 * ID 3 | 正誤判定         | SelectionViewer (Yes/No二者択一)
 * ID 4 | 組み合わせ       | MatchViewer (ペアリング)
 * ID 5 | 順序並べ替え     | OrderViewer (シーケンス)
 * 
 * 【パターンB：自由記述・テキスト系】
 * ID 10 | 記述式          | 親コンポーネントで表示（SubQuestionBlockContent）
 * ID 11 | 証明問題        | 親コンポーネントで表示（SubQuestionBlockContent）
 * ID 12 | コード記述      | 親コンポーネントで表示（SubQuestionBlockContent）
 * ID 13 | 翻訳            | 親コンポーネントで表示（SubQuestionBlockContent）
 * ID 14 | 数値計算        | 親コンポーネントで表示（SubQuestionBlockContent）
 * 
 * ========================================
 * 現在の実装状況（2026-01-02）
 * ========================================
 * 
 * ✅ レガシーマッピング（後方互換性）
 *    ID 1-5 → 各専用Viewer（SelectionViewer, MultipleChoiceViewer等）
 *    ID 10-14 → 親コンポーネント（SubQuestionBlockContent）で問題文表示
 * 
 * ⚠️  移行中: SelectionViewer, MatchViewer, OrderViewer 統合予定
 *    新規問題の場合は ID 1-5 を使用
 * 
 * ========================================
 */

export function registerProblemType(entry: ProblemTypeRegistration) {
  registry.set(entry.id, entry);
}

export function getProblemTypeView(typeId: number): ComponentType<ProblemTypeViewProps> | null {
  const entry = registry.get(typeId);
  return entry ? entry.view : null;
}

export function getProblemTypeEdit(typeId: number): ComponentType<ProblemTypeEditProps> | null {
  const entry = registry.get(typeId);
  return entry && entry.edit ? entry.edit : null;
}

/**
 * getProblemTypeList
 * 
 * 登録済みの問題タイプをリストで取得
 * BlockMeta の metaOptions 生成時に使用可能
 */
export function getProblemTypeList(): Array<{ id: number; label: string }> {
  const list: Array<{ id: number; label: string }> = [];
  registry.forEach((entry) => {
    list.push({ id: entry.id, label: entry.id.toString() }); // label はレジストリに記録されていないため、ID をデフォルト値として使用
  });
  return list.sort((a, b) => a.id - b.id);
}

/**
 * registerDefaults
 * 
 * デフォルト問題タイプを登録する
 * 
 * パターンA（選択系）：ID 1-5
 * - SelectionViewer: ID 1,3（単一選択 + 正誤判定）
 * - MultipleChoiceView: ID 2（複数選択）
 * - MatchViewer: ID 4（組み合わせ）
 * - OrderViewer: ID 5（順序並べ替え）
 * 
 * パターンB（記述系）：ID 10-14
 * - 親コンポーネント（SubQuestionBlockContent）で問題文を表示
 * - ViewComponentは不要（ID1-5のみ使用）
 * 
 * レガシーマッピング（後方互換性）：ID 1,4,5,6,7,8,9
 * - 親コンポーネントで問題文表示（旧形式コンテンツ対応）
 */
export function registerDefaults() {
  // lazy require to avoid load-order issues
  try {

    // ========================================
    // パターンA：選択・構造化データ系（ID 1-5）
    // ========================================

    // ID 1: 単一選択（RadioButton）
    const SQ1_SingleChoice = lazy(() =>
      import('./viewers/SQ1_SingleChoice').then(m => ({ default: m.SQ1_SingleChoice }))
    );
    registerProblemType({ id: 1, view: SQ1_SingleChoice, edit: SQ1_SingleChoice });

    // ID 2: 複数選択（Checkbox）
    const SQ2_MultipleChoice = lazy(() =>
      import('./viewers/SQ2_MultipleChoice').then(m => ({ default: m.SQ2_MultipleChoice }))
    );
    registerProblemType({ id: 2, view: SQ2_MultipleChoice, edit: SQ2_MultipleChoice });

    // ID 3: 正誤判定（True/False）
    const SQ3_TrueFalse = lazy(() =>
      import('./viewers/SQ3_TrueFalse').then(m => ({ default: m.SQ3_TrueFalse }))
    );
    registerProblemType({ id: 3, view: SQ3_TrueFalse, edit: SQ3_TrueFalse });

    // ID 4: 組み合わせ（Matching）
    const SQ4_Matching = lazy(() =>
      import('./viewers/SQ4_Matching').then(m => ({ default: m.SQ4_Matching }))
    );
    registerProblemType({ id: 4, view: SQ4_Matching, edit: SQ4_Matching });

    // ID 5: 順序並べ替え（Ordering）
    const SQ5_Ordering = lazy(() =>
      import('./viewers/SQ5_Ordering').then(m => ({ default: m.SQ5_Ordering }))
    );
    registerProblemType({ id: 5, view: SQ5_Ordering, edit: SQ5_Ordering });

    // ========================================
    // パターンB：自由記述・テキスト系（ID 10-14）
    // ========================================

    // ID 10: 記述式（Essay）
    // ID 11: 証明問題（Proof）
    // ID 12: コード記述（Programming）
    // ID 13: 翻訳（Translation）
    // ID 14: 数値計算（Numeric with tolerance）
    // 注：これらの問題形式は親コンポーネント（SubQuestionBlockContent）で
    //     問題文を表示するため、ここでは登録不要
    // 差異は type_id のみで、UI/採点プロンプトで区別

    // ========================================
    // 新規形式での ID 1-5 (上記で完全登録)
    // 新規形式での ID 10-14 (上記で完全登録)
  } catch (e) {
    // ignore in environments where require isn't resolved at module load
    // registry can be populated later
    // console.warn('ProblemTypeRegistry defaults not registered', e);
  }
}

export default { registerProblemType, getProblemTypeView, getProblemTypeEdit, registerDefaults };
