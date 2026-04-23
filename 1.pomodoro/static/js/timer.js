// ビープ音モジュールをインポート
import { playBeep, unlockAudioContextOnUserGesture } from './beep.js';




document.addEventListener('DOMContentLoaded', () => {
	// 最初のユーザー操作でAudioContextを有効化（自動再生制限対策）
	unlockAudioContextOnUserGesture();
	class PomodoroTimer {
		constructor(workMinutes, breakMinutes, setsPerCycle) {
			this.WORK_MINUTES = workMinutes;      // 1セットの作業時間（分）
			this.BREAK_MINUTES = breakMinutes;    // 1セットの休憩時間（分）
			this.SETS_PER_CYCLE = setsPerCycle;   // 1サイクルあたりのセット数
			this.minutes = workMinutes;           // 現在の分（カウントダウン用）
			this.seconds = 0;                     // 現在の秒（カウントダウン用）
			this.isRunning = false;               // タイマーが動作中か
			this.isWork = true;                   // true:作業中, false:休憩中
			this.currentSet = 1;                  // 現在のセット番号（1～4）
			this.pomodoroCount = 0;               // 完了サイクル数
			this.focusSeconds = 0;                // 累計集中時間（秒）
			this.timerInterval = null;            // setIntervalのID
			this.lastTickAt = Date.now();
		}

		getTodayKey() {
			const now = new Date();
			const year = now.getFullYear();
			const month = String(now.getMonth() + 1).padStart(2, '0');
			const day = String(now.getDate()).padStart(2, '0');
			return `${year}-${month}-${day}`;
		}

		getTodayKey() {
			const now = new Date();
			const year = now.getFullYear();
			const month = String(now.getMonth() + 1).padStart(2, '0');
			const day = String(now.getDate()).padStart(2, '0');
			return `${year}-${month}-${day}`;
		}

		loadState() {
			const data = JSON.parse(localStorage.getItem('pomodoro_state'));
			if (data) {
				const today = this.getTodayKey();
				const stateDate = data.stateDate;
				const isTodayState = stateDate === today;
				this.minutes = data.minutes ?? this.WORK_MINUTES;
				this.seconds = data.seconds ?? 0;
				this.isRunning = data.isRunning ?? false;
				this.isWork = data.isWork ?? true;
				this.currentSet = data.currentSet ?? 1;
				this.pomodoroCount = isTodayState ? (data.pomodoroCount ?? 0) : 0;
				this.focusSeconds = isTodayState ? (data.focusSeconds ?? 0) : 0;
			}
		}

		saveState() {
			localStorage.setItem('pomodoro_state', JSON.stringify({
				minutes: this.minutes,
				seconds: this.seconds,
				isWork: this.isWork,
				currentSet: this.currentSet,
				pomodoroCount: this.pomodoroCount,
				focusSeconds: this.focusSeconds,
				isRunning: this.isRunning,
				stateDate: this.getTodayKey()
			}));
		}

		switchSession() {
			// 作業⇔休憩の切替処理
			// どちらの切替時もビープ音
			playBeep();
			if (this.isWork) { // 作業終了時のみ集中時間加算
				this.focusSeconds += this.WORK_MINUTES * 60;
			}
			this.isWork = !this.isWork; // 作業⇔休憩を反転
			if (this.isWork) { // 休憩→作業に戻るときセット数を進める
				this.currentSet++;
				if (this.currentSet > this.SETS_PER_CYCLE) { // 4セット完了したら
					this.pomodoroCount++; // サイクル完了回数を加算
					this.currentSet = 1; // セット番号リセット
				}
			}
			this.minutes = this.isWork ? this.WORK_MINUTES : this.BREAK_MINUTES; // 状態に応じて分数セット
			this.seconds = 0;
			this.saveState();
		}

		tick() {
			// 1秒ごとのカウントダウン処理
			// 0になったらセッション切替
			if (this.seconds === 0) { // 秒が0なら
				if (this.minutes === 0) { // 分も0ならセッション切替
					this.switchSession();
					return;
				} else { // 分が残っていれば分を減らし秒を59に
					this.minutes--;
					this.seconds = 59;
				}
			} else { // 秒が残っていれば秒だけ減らす
				this.seconds--;
			}
			this.saveState();
		}
	}

	// インスタンス生成
	// 設定値が保存されていればそれを使う
	const savedSettings = JSON.parse(localStorage.getItem('pomodoro_settings'));
	const initialWork = savedSettings?.workMinutes ?? 25;
	const initialBreak = savedSettings?.breakMinutes ?? 5;
	const timer = new PomodoroTimer(initialWork, initialBreak, 4);
	// カスタマイズUI要素取得
	const workInput = document.getElementById('work-minutes-input');
	const breakInput = document.getElementById('break-minutes-input');
	const saveSettingsBtn = document.getElementById('save-settings-btn');

	// 入力欄に現在値を反映
	if (workInput && breakInput) {
		workInput.value = timer.WORK_MINUTES;
		breakInput.value = timer.BREAK_MINUTES;
	}

	// 「保存」ボタン押下時の処理
	if (saveSettingsBtn) {
		saveSettingsBtn.addEventListener('click', () => {
			const newWork = parseInt(workInput.value, 10);
			const newBreak = parseInt(breakInput.value, 10);
			// 値のバリデーション
			if (isNaN(newWork) || isNaN(newBreak) || newWork < 1 || newBreak < 1) {
				alert('作業・休憩時間は1分以上で入力してください');
				return;
			}
			// 設定値をlocalStorageに保存
			localStorage.setItem('pomodoro_settings', JSON.stringify({
				workMinutes: newWork,
				breakMinutes: newBreak
			}));
			// タイマー本体に反映
			timer.WORK_MINUTES = newWork;
			timer.BREAK_MINUTES = newBreak;
			// 現在の状態もリセット
			clearInterval(timer.timerInterval);
			timer.isRunning = false;
			timer.isWork = true;
			timer.minutes = timer.WORK_MINUTES;
			timer.seconds = 0;
			timer.currentSet = 1;
			updateDisplay();
			timer.saveState();
			alert('タイマー設定を保存しました');
		});
	}


	const timerDisplay = document.getElementById('timer-display');
	const startBtn = document.getElementById('start-btn');
	const pauseBtn = document.getElementById('pause-btn');
	const resetBtn = document.getElementById('reset-btn');
	const statusDisplay = document.getElementById('status');
	const pomodoroCountElem = document.getElementById('pomodoro-count');
	const focusTimeElem = document.getElementById('focus-time');
	const progressCanvas = document.getElementById('progressCanvas');
	const focusBackground = document.getElementById('focus-background');
	const ctx = progressCanvas.getContext('2d');
	const PROGRESS_COLORS = {
		start: '#4e8cff',
		middle: '#ffd54f',
		end: '#ff5252'
	};
	let progressAnimationId = null;

	/**
	 * 16進数カラーコード（#RRGGBB）をRGB値へ変換
	 */
	function hexToRgb(hex) {
		const normalized = hex.replace('#', '');
		if (normalized.length !== 6) {
			return { r: 0, g: 0, b: 0 };
		}
		const r = parseInt(normalized.slice(0, 2), 16);
		const g = parseInt(normalized.slice(2, 4), 16);
		const b = parseInt(normalized.slice(4, 6), 16);
		if ([r, g, b].some((value) => Number.isNaN(value))) {
			return { r: 0, g: 0, b: 0 };
		}
		return {
			r,
			g,
			b
		};
	}

	/**
	 * 2つの色を0〜1の割合で線形補間
	 */
	function interpolateColor(fromHex, toHex, fraction) {
		const from = hexToRgb(fromHex);
		const to = hexToRgb(toHex);
		const r = Math.round(from.r + (to.r - from.r) * fraction);
		const g = Math.round(from.g + (to.g - from.g) * fraction);
		const b = Math.round(from.b + (to.b - from.b) * fraction);
		return `rgb(${r}, ${g}, ${b})`;
	}

	/**
	 * 進捗率（0〜1）に応じて青→黄→赤の色を返す
	 */
	function getProgressColor(percent) {
		const value = Math.max(0, Math.min(1, percent));
		if (value < 0.5) {
			return interpolateColor(PROGRESS_COLORS.start, PROGRESS_COLORS.middle, value * 2);
		}
		return interpolateColor(PROGRESS_COLORS.middle, PROGRESS_COLORS.end, (value - 0.5) * 2);
	}

	/**
	 * 集中時間中のみ背景エフェクトを有効化
	 */
	function updateFocusBackground() {
		if (!focusBackground) {
			return;
		}
		focusBackground.classList.toggle('active', timer.isRunning && timer.isWork);
	}

	/**
	 * 画面表示を最新状態に更新
	 */
	function updateDisplay() {
		const min = String(timer.minutes).padStart(2, '0');
		const sec = String(timer.seconds).padStart(2, '0');
		timerDisplay.textContent = `${min}:${sec}`;
		statusDisplay.textContent = timer.isWork ? `作業中（${timer.currentSet}/${timer.SETS_PER_CYCLE}）` : '休憩中';
		pomodoroCountElem.textContent = timer.pomodoroCount;
		focusTimeElem.textContent = Math.floor(timer.focusSeconds / 60) + '分';
		updateFocusBackground();
		drawProgress();
	}

	/**
	 * 円形プログレスバーを描画
	 */
	function drawProgress() {
		const total = Math.max(1, (timer.isWork ? timer.WORK_MINUTES : timer.BREAK_MINUTES) * 60);
		const current = timer.minutes * 60 + timer.seconds;
		let smoothedCurrent = current;
		if (timer.isRunning && current > 0) {
			const elapsedSeconds = Math.min(1, Math.max(0, (Date.now() - timer.lastTickAt) / 1000));
			smoothedCurrent = Math.max(0, current - elapsedSeconds);
		}
		const percent = Math.max(0, Math.min(1, 1 - smoothedCurrent / total));
		ctx.clearRect(0, 0, progressCanvas.width, progressCanvas.height);
		ctx.beginPath();
		ctx.arc(90, 90, 80, 0, 2 * Math.PI);
		ctx.strokeStyle = '#e5e6ef';
		ctx.lineWidth = 14;
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(90, 90, 80, -0.5 * Math.PI, (2 * Math.PI) * percent - 0.5 * Math.PI);
		ctx.strokeStyle = getProgressColor(percent);
		ctx.lineWidth = 14;
		ctx.stroke();
	}

	function animateProgress() {
		drawProgress();
		if (timer.isRunning) {
			progressAnimationId = requestAnimationFrame(animateProgress);
		} else {
			progressAnimationId = null;
		}
	}

	function startProgressAnimation() {
		if (progressAnimationId !== null) {
			return;
		}
		progressAnimationId = requestAnimationFrame(animateProgress);
	}

	function stopProgressAnimation() {
		if (progressAnimationId !== null) {
			cancelAnimationFrame(progressAnimationId);
			progressAnimationId = null;
		}
	}

	// イベントハンドラ

	// 「開始」ボタン押下時の処理
	startBtn.addEventListener('click', () => {
		if (!timer.isRunning) {
			timer.lastTickAt = Date.now();
			timer.timerInterval = setInterval(() => {
				timer.tick();
				timer.lastTickAt = Date.now();
				updateDisplay();
			}, 1000);
			timer.isRunning = true;
			timer.saveState();
			startProgressAnimation();
			updateDisplay();
		}
	});

	// 「一時停止」ボタン押下時の処理
	pauseBtn.addEventListener('click', () => {
		if (timer.isRunning) {
			clearInterval(timer.timerInterval);
			timer.isRunning = false;
			timer.saveState();
			stopProgressAnimation();
			updateDisplay();
		}
	});

	// 「リセット」ボタン押下時の処理
	resetBtn.addEventListener('click', () => {
		clearInterval(timer.timerInterval);
		timer.isRunning = false;
		timer.isWork = true;
		timer.minutes = timer.WORK_MINUTES;
		timer.seconds = 0;
		timer.currentSet = 1;
		updateDisplay();
		timer.saveState();
		stopProgressAnimation();
	});

	// 初期表示
	// ===============================
	// 初期化処理（ページロード時）
	// ===============================
	timer.loadState(); // 状態復元
	updateDisplay();   // 画面更新
	if (timer.isRunning) {
		timer.lastTickAt = Date.now();
		// 動作中なら自動再開
		timer.timerInterval = setInterval(() => {
			timer.tick();
			timer.lastTickAt = Date.now();
			updateDisplay();
		}, 1000);
		startProgressAnimation();
	}
});
