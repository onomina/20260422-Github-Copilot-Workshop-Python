



// ステップ2：4セットで完了回数+1、作業終了時に集中時間加算
document.addEventListener('DOMContentLoaded', () => {
	const WORK_MINUTES = 1;
	const BREAK_MINUTES = 1;
	const SETS_PER_CYCLE = 4;
	let minutes = WORK_MINUTES;
	let seconds = 0;
	let timerInterval = null;
	let isRunning = false;
	let isWork = true; // true:作業, false:休憩
	let currentSet = 1;
	let pomodoroCount = 0;
	let focusSeconds = 0;

	// localStorageから進捗・状態を復元
	function loadState() {
		const data = JSON.parse(localStorage.getItem('pomodoro_state'));
		if (data) {
			minutes = data.minutes ?? WORK_MINUTES;
			seconds = data.seconds ?? 0;
			isRunning = data.isRunning ?? false;
			isWork = data.isWork ?? true;
			currentSet = data.currentSet ?? 1;
			pomodoroCount = data.pomodoroCount ?? 0;
			focusSeconds = data.focusSeconds ?? 0;
		}
	}

	function saveState() {
		localStorage.setItem('pomodoro_state', JSON.stringify({
			minutes, seconds, isWork, currentSet, pomodoroCount, focusSeconds, isRunning
		}));
	}

	const timerDisplay = document.getElementById('timer-display');
	const startBtn = document.getElementById('start-btn');
	const pauseBtn = document.getElementById('pause-btn');
	const resetBtn = document.getElementById('reset-btn');
	const statusDisplay = document.getElementById('status');

	const pomodoroCountElem = document.getElementById('pomodoro-count');
	const focusTimeElem = document.getElementById('focus-time');
	const progressCanvas = document.getElementById('progressCanvas');
	const ctx = progressCanvas.getContext('2d');

	function updateDisplay() {
		const min = String(minutes).padStart(2, '0');
		const sec = String(seconds).padStart(2, '0');
		timerDisplay.textContent = `${min}:${sec}`;
		statusDisplay.textContent = isWork ? `作業中（${currentSet}/${SETS_PER_CYCLE}）` : '休憩中';
		pomodoroCountElem.textContent = pomodoroCount;
		focusTimeElem.textContent = Math.floor(focusSeconds / 60) + '分';
		drawProgress();
		saveState();
	}

	function drawProgress() {
		// 総秒数
		const total = (isWork ? WORK_MINUTES : BREAK_MINUTES) * 60;
		const current = minutes * 60 + seconds;
		const percent = 1 - current / total;
		ctx.clearRect(0, 0, progressCanvas.width, progressCanvas.height);
		// 背景サークル
		ctx.beginPath();
		ctx.arc(90, 90, 80, 0, 2 * Math.PI);
		ctx.strokeStyle = '#e5e6ef';
		ctx.lineWidth = 14;
		ctx.stroke();
		// 進捗サークル
		ctx.beginPath();
		ctx.arc(90, 90, 80, -0.5 * Math.PI, (2 * Math.PI) * percent - 0.5 * Math.PI);
		ctx.strokeStyle = isWork ? '#7b5cff' : '#00b894';
		ctx.lineWidth = 14;
		ctx.stroke();
	}

	function switchSession() {
		if (isWork) {
			// 作業終了時に集中時間加算
			focusSeconds += WORK_MINUTES * 60;
		}
		isWork = !isWork;
		if (isWork) {
			// 次の作業セットへ
			currentSet++;
			if (currentSet > SETS_PER_CYCLE) {
				// 4セット完了
				pomodoroCount++;
				currentSet = 1;
			}
		}
		minutes = isWork ? WORK_MINUTES : BREAK_MINUTES;
		seconds = 0;
		updateDisplay();
		saveState();
	}

	function tick() {
		if (seconds === 0) {
			if (minutes === 0) {
				// セッション終了→切り替え
				switchSession();
				return;
			} else {
				minutes--;
				seconds = 59;
			}
		} else {
			seconds--;
		}
		updateDisplay();
		saveState();
	}

	startBtn.addEventListener('click', () => {
		if (!isRunning) {
			timerInterval = setInterval(tick, 1000);
			isRunning = true;
			saveState();
		}
	});

	pauseBtn.addEventListener('click', () => {
		if (isRunning) {
			clearInterval(timerInterval);
			isRunning = false;
			saveState();
		}
	});

	resetBtn.addEventListener('click', () => {
		clearInterval(timerInterval);
		isRunning = false;
		isWork = true;
		minutes = WORK_MINUTES;
		seconds = 0;
		currentSet = 1;
		updateDisplay();
		saveState();
	});

	// 初期表示
	loadState();
	updateDisplay();
	if (isRunning) {
		timerInterval = setInterval(tick, 1000);
	}
});

