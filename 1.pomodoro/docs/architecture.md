# アーキテクチャ概要

## 構成
- Flask（Python）: サーバーサイド（`app.py`）
    - `/` ルートで `index.html` を返すのみ
- フロントエンド: HTML（Jinja2テンプレート）、CSS、JavaScript（モジュール分割）
    - `timer.js`: タイマー本体・状態管理
    - `beep.js`: ビープ音
    - `style.css`: UIスタイル
- データ保存: クライアントのlocalStorageのみ

## 層
- サーバー: 静的ファイル配信とテンプレート描画のみ
- クライアント: タイマー・状態管理・UI・音声・進捗記録

## 依存関係
- Flask, Jinja2, 標準Web API
- DBや外部API連携なし

## テスト
- `tests/test_app.py`: Flaskルートの疎通テスト
- `timer.test.js`: タイマーロジックのユニットテスト（Jest形式）
