# 【Frontend】画面レイヤー管理ガイドライン (Native Top Layer方針)

**最終更新日:** 2025/12/25  
**対象:** フロントエンド開発チーム全般

## 1. 概要・目的
本プロジェクトでは、画面の重なり順序（Stacking Context）の管理において、従来の `z-index` 管理を廃止し、ブラウザ標準の **Top Layer** 機能（`<dialog>` 要素および Popover API）を全面的に採用します。

**目的:**
*   **脱 `z-index` 戦争**: 開発者が CSS で任意の数値（`z-index: 9999` 等）を指定することを禁止し、管理コストをゼロにする。
*   **視認性の保証**: スクロール時に文字が重なったり、透過して読みづらくなる事故をシステムレベルで防ぐ。
*   **堅牢な描画**: 親要素の `overflow: hidden` や `transform` の影響を受けずに、常に最前面表示を保証する。

---

## 2. レイヤー構造の全体図 (Layer Architecture)

本アプリケーションの画面は、以下の **3階層** で厳格に管理されます。
開発者は実装するUIがどのレベルに属するかを定義し、対応する技術を選定してください。

| Level | 名称 | 技術スタック | z-index | 背景・視認性ルール |
| :--- | :--- | :--- | :--- | :--- |
| **L2** | **Top Layer**<br>(最前面) | `<dialog>`<br>`popover` | **無効**<br>(Browser Native) | **【完全不透明】**<br>要素自体の背景色は不透明（Solid Color）必須。<br>下のコンテンツが透けて見えないようにすること。<br>※Backdrop（幕）のみ半透明可。 |
| **L1** | **App Shell**<br>(固定ナビ) | `sticky`<br>`fixed` | **限定許可**<br>(Design Tokenのみ) | **【完全不透明】**<br>スクロールするコンテンツ(L0)が下を通過するため、<br>背景色は必ず不透明（`bg-white`等）であること。<br>磨りガラス表現(`backdrop-blur`)を使う場合も視認性を担保すること。 |
| **L0** | **Content**<br>(通常フロー) | `static`<br>`relative` | **原則禁止**<br>(Auto / 0) | **【透明/任意】**<br>通常のドキュメントフロー。 |

---

## 3. 実装パターンと適用UI事例詳細

各レイヤーに該当する具体的なUIコンポーネントのリストです。
迷った際はここを参照し、自己判断で異なるレイヤーに配置しないでください。

### Level 2: Top Layer (`<dialog>` / `popover`)
**特徴:** ブラウザが管理する別次元のレイヤー。L1 (ヘッダー等) よりも必ず手前に表示されます。
**実装:** `z-index` は指定しません。

#### A. モーダル系 (`<dialog>.showModal()`)
背景操作をブロック（Backdropあり）し、ユーザーにアクションを強制するUI。
*   **確認ダイアログ** (削除確認、変更破棄の警告)
*   **システムアラート** (セッションタイムアウト、クリティカルエラー)
*   **入力フォームモーダル** (ログイン、詳細設定、新規登録)
*   **ライトボックス** (画像・動画の拡大プレビュー)
*   **フルスクリーンローダー** (画面全体を覆う通信中スピナー)
*   **モバイル用フルスクリーンメニュー** (ハンバーガーメニュー展開時)

#### B. ポップオーバー系 (`popover="auto"`)
背景操作をブロックせず（Backdropなし）、領域外クリックで閉じる（Light Dismiss）UI。
*   **ドロップダウンメニュー** (「…」ボタン、アクションメニュー)
*   **ツールチップ** (アイコンホバー時の説明)
*   **コンボボックス / Select** (選択肢リストの展開)
*   **トースト通知 / スナックバー** (画面端の一時的なメッセージ)
*   **メガメニュー** (PCヘッダーから展開する巨大なパネル)
*   **日付ピッカー (Date Picker)** / **カラーピッカー**
*   **インライン編集ポップアップ** (Trello風のカード編集など)

---

### Level 1: App Shell (`sticky` / `fixed`)
**特徴:** 画面スクロールに関わらず定位置に留まるナビゲーションUI。
**実装:** コンテンツ(L0)より手前に表示する必要がありますが、L2よりは必ず奥になります。

**【重要】背景色の規定**
L1要素は、L0コンテンツがスクロールによって下を通過します。視認性確保のため、**必ず不透明な背景色（`bg-white`, `bg-slate-900` 等）を指定してください。** 透明背景は禁止です。

#### 適用UI事例
*   **グローバルヘッダー** (ロゴ、ナビゲーションリンク、検索バーを含む上部帯)
*   **サイドナビゲーション / ドロワー** (左側の固定メニュー)
*   **ボトムナビゲーション** (モバイルアプリ風の下部タブバー)
*   **Table of Contents (目次)** (記事横に追従するサイドバー)
*   **Stickyヘッダー** (データグリッドの見出し行、セクションタイトル)
*   **フィルタバー** (検索結果一覧の上部に固定される絞り込みバー)
*   **フローティングアクションボタン (FAB)** (画面右下の「＋」ボタンなど)

---

### Level 0: Content Layer (Standard Flow)
**特徴:** 通常のページ構成要素。
**実装:** `z-index` は指定しません。

#### 適用UI事例
*   **記事本文 / テキストブロック**
*   **画像 / 動画埋め込み**
*   **カードコンポーネント**
*   **データテーブル / グリッド** (ヘッダー除く)
*   **入力フォーム / ボタン**
*   **チャート / グラフ** (Canvas, SVG)

---

## 4. `z-index` 廃止と制限ルール

本プロジェクトでは **「開発者が任意の `z-index` 数値を書くこと」を禁止** します。

### ルール1: アプリケーションコードでの禁止
`.css`, `styled-components`, `sx`, Tailwindの `z-[100]` などで、数値を直接指定することは禁止です。
発見次第、リファクタリング対象となります。

### ルール2: App Shell用のシステム定数のみ許可
L1 (App Shell) を実装する場合のみ、以下の定義済みクラス（または変数）を使用してください。

| 定数名 (Tailwind例) | 値 | 使用箇所 |
| :--- | :--- | :--- |
| **`z-app-bar`** | `10` | ヘッダー、サイドバー、Sticky要素 |
| **`z-fab`** | `20` | フローティングアクションボタン |

※ L2 (Top Layer) は `z-index` 無関係にこれらより手前に来ます。したがって `1000` 以上の数値はシステムに存在しません。

### ルール3: コンポーネント内の局所解決 (`isolation`)
「アイコンの上にバッジを重ねる」など、コンポーネント内部のデザイン再現で重なり制御が必要な場合は、**`isolation: isolate`** を使用してスタッキングコンテキストを隔離してください。

**実装例:**
```css
.user-avatar {
  isolation: isolate; /* 内部のz-indexを外部に漏らさない */
  position: relative;
}
.badge {
  position: absolute;
  z-index: 1; /* この「1」は .user-avatar の中だけで有効 */
}
```

---

## 5. 実装コード例 (Best Practices)

### L2: モーダル (`<dialog>`) の基本実装

```tsx
import { useEffect, useRef } from 'react';

export const BaseModal = ({ isOpen, onClose, children }: ModalProps) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) ref.current?.showModal();
    else ref.current?.close();
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="bg-white p-6 rounded-lg shadow-xl backdrop:bg-black/50"
      // ↑ bg-whiteで不透明化を徹底する
    >
      {children}
    </dialog>
  );
};
```

### L1: スティッキーヘッダーの基本実装

```tsx
export const Header = () => {
  return (
    // z-app-bar (z-10) を使用。
    // bg-white で不透明化し、下のコンテンツが透けないようにする。
    <header className="sticky top-0 z-app-bar w-full bg-white border-b border-gray-200">
      <nav className="h-16 px-4 flex items-center">
        <h1>Logo</h1>
      </nav>
    </header>
  );
};
```

### L2: ドロップダウン (`popover`) の基本実装

```tsx
export const Menu = () => {
  return (
    <>
      <button popovertarget="menu-popover">Menu</button>
      
      {/* popover属性でTop Layerへ。bg-whiteで不透明化。 */}
      <div 
        id="menu-popover" 
        popover="auto"
        className="bg-white border rounded shadow-lg p-2 min-w-[200px]"
      >
        <ul><li>Item 1</li></ul>
      </div>
    </>
  );
};
```

---

## 6. Checklist (Code Review用)

PR提出前に以下を確認してください。

*   [ ] **No z-index**: CSSファイルやコンポーネントに `z-index: 100` などの数値指定がないか。
*   [ ] **Correct Layer**: モーダルやドロップダウンが `<dialog>` / `popover` (L2) で実装されているか。
*   [ ] **L1 Opacity**: ヘッダーやサイドバーの背景色が不透明（`bg-white`等）になっているか。透過してスクロール時に文字が重なっていないか。
*   [ ] **Isolation**: コンポーネント内部の重なり制御に `isolation: isolate` が使われているか。
*   [ ] **Portal Free**: 不要な `React.createPortal` が使われていないか（Top Layer APIを使用すれば不要）。

---