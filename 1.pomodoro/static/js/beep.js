// シンプルなビープ音を鳴らす
// AudioContextを1度だけ生成し再利用（自動再生制限対策）
let audioCtx = null;
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

// 2音（高→低）で気づきやすいビープ音
export function playBeep() {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        // 1音目: 高音
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'square';
        osc1.frequency.value = 1200;
        gain1.gain.value = 0.28;
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        setTimeout(() => {
            osc1.stop();
            osc1.disconnect();
            gain1.disconnect();
            // 2音目: 低音
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'square';
            osc2.frequency.value = 700;
            gain2.gain.value = 0.22;
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start();
            setTimeout(() => {
                osc2.stop();
                osc2.disconnect();
                gain2.disconnect();
            }, 180);
        }, 180);
    } catch (e) {
        // 音が鳴らせない場合は何もしない
    }
}

// 最初のユーザー操作でAudioContextを有効化
export function unlockAudioContextOnUserGesture() {
    window.addEventListener('pointerdown', () => {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
    }, { once: true });
}
