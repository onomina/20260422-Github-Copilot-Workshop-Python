# データモデル仕様

本アプリケーションはサーバー側で永続的なデータモデルを持ちません。

## クライアント側データ
- `localStorage` を利用し、以下の情報を保存します。

### pomodoro_settings
- `workMinutes` (int): 作業時間（分）
- `breakMinutes` (int): 休憩時間（分）

### pomodoro_state
- `minutes` (int): 現在の分
- `seconds` (int): 現在の秒
- `isWork` (bool): 作業中かどうか
- `currentSet` (int): 現在のセット番号
- `pomodoroCount` (int): 完了サイクル数
- `focusSeconds` (int): 累計集中時間（秒）
- `isRunning` (bool): タイマー稼働中か
- `stateDate` (str): 状態保存日（YYYY-MM-DD）

---

サーバー側でのDBやモデルは現状ありません。