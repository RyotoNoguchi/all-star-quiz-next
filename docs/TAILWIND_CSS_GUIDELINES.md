# Tailwind CSS Guidelines

## 禁止クラス・再発防止ガイドライン

### 🚫 使用禁止クラス

以下のクラスは使用禁止です。ESLintで自動検出されます：

#### 1. `bg-background`
- **問題**: Tailwind CSS v4で未定義のクラス
- **代替**: `bg-white dark:bg-gray-900`
- **適用例**:
  ```tsx
  // ❌ 禁止
  className="bg-background"
  
  // ✅ 推奨
  className="bg-white dark:bg-gray-900"
  ```

#### 2. その他のshadcn/ui特有クラス
- `text-foreground` → `text-black dark:text-white`
- `border-border` → `border-gray-200 dark:border-gray-800`
- `ring-ring` → `ring-blue-500`

### ✅ 推奨クラスパターン

#### 背景色
```tsx
// 基本背景
"bg-white dark:bg-gray-900"

// カード背景  
"bg-gray-50 dark:bg-gray-800"

// 強調背景
"bg-blue-50 dark:bg-blue-900/20"
```

#### テキスト色
```tsx
// 基本テキスト
"text-black dark:text-white"

// 説明テキスト
"text-gray-600 dark:text-gray-400"

// 強調テキスト
"text-blue-600 dark:text-blue-400"
```

#### ボーダー
```tsx
// 基本ボーダー
"border-gray-200 dark:border-gray-800"

// 強調ボーダー
"border-blue-200 dark:border-blue-800"
```

### 🔧 再発防止メカニズム

#### 1. ESLint自動検出
```javascript
// eslint.config.mjs で定義済み
'no-restricted-syntax': [
  'error',
  {
    selector: 'Literal[value*="bg-background"]',
    message: 'Do not use "bg-background" class. Use "bg-white dark:bg-gray-900" instead.',
  },
]
```

#### 2. 開発時チェック
```bash
# 実装前の必須チェック
npm run lint:check

# ビルド前の必須チェック  
npm run type-check && npm run lint:check && npm run build
```

#### 3. Playwright MCP検証
実装完了後は必ずPlaywright MCPで動作検証を実行:
1. サーバー起動
2. ブラウザでページアクセス
3. UIコンポーネント操作確認
4. スクリーンショット記録

### 📝 修正手順

新しいshadcn/ui特有クラスエラーが発生した場合:

1. **エラー確認**: ビルドログでクラス名特定
2. **適切な代替検索**: Tailwind CSS公式ドキュメント確認
3. **ESLint設定追加**: 禁止クラスリストに追加
4. **修正実装**: 該当ファイルで置換
5. **検証実行**: ビルド + Playwright MCP検証

### 🎯 品質保証

この仕組みにより以下を保証:
- ✅ 未定義Tailwind CSSクラスの事前検出
- ✅ 開発時の即座エラー通知
- ✅ ビルド時の品質チェック
- ✅ 動作保証されたUIコンポーネント