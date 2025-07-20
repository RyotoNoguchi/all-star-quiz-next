# Chromatic VRT セットアップガイド

このガイドに従って、Chromatic Visual Regression Testing を設定してください。

## 前提条件

- ✅ Chromatic パッケージインストール済み (v13.1.2)
- ✅ Storybook 環境構築済み (v9.0.17)
- ✅ GitHub Actions ワークフロー準備済み

## セットアップ手順

### 1. Chromatic アカウント作成

1. [Chromatic](https://www.chromatic.com/start) にアクセス
2. GitHub アカウントでサインイン
3. 「Create a project」をクリック

### 2. プロジェクト設定

1. **Project name**: `all-star-quiz`
2. **Repository**: `all-star-quiz` を選択
3. **Setup method**: `GitHub Action` を選択

### 3. プロジェクトトークン取得

1. プロジェクト作成後、Manage → Configure へ移動
2. **Project Token** をコピー

### 4. GitHub Secrets 設定

1. GitHubリポジトリの Settings → Security → Secrets and variables → Actions
2. 「New repository secret」をクリック
3. **Name**: `CHROMATIC_PROJECT_TOKEN`
4. **Secret**: コピーしたプロジェクトトークンを貼り付け
5. 「Add secret」をクリック

### 5. 初回ビルド実行

```bash
# ローカルで初回ベースライン作成
npm run chromatic -- --project-token YOUR_PROJECT_TOKEN

# または environment variable を使用
export CHROMATIC_PROJECT_TOKEN=your-project-token
npm run chromatic
```

### 6. 動作確認

1. GitHub にプッシュして GitHub Actions を確認
2. Chromatic ダッシュボードでビルド結果を確認
3. Visual Regression Tests が正常に実行されることを確認

## 利用可能なコマンド

```bash
# 開発用
npm run chromatic          # 基本的なビルド
npm run storybook          # Storybook 開発サーバー
npm run build-storybook    # Storybook ビルド

# CI/CD での自動実行
# GitHub Actions workflow が自動的に実行
```

## 機能

- ✅ 自動 Visual Regression Testing
- ✅ Pull Request での変更検出
- ✅ メインブランチでの自動承認
- ✅ Storybook の自動デプロイ
- ✅ [skip ci] でのビルドスキップ

## トラブルシューティング

### エラー対応

1. **Authentication failed**: `CHROMATIC_PROJECT_TOKEN` が正しく設定されているか確認
2. **Build failed**: Storybook が正常にビルドできるか `npm run build-storybook` で確認
3. **No stories found**: Story ファイルが `.stories.tsx` 形式で作成されているか確認

### ログ確認

```bash
# Chromatic ログ確認
cat chromatic.log

# Storybook ビルドログ確認  
cat build-storybook.log
```

## 次のステップ

1. 他の UI コンポーネントの Story 作成
2. Visual テストカバレッジの拡大
3. Accessibility テストの統合