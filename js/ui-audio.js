Object.assign(UI, {
    updateSoundBtn(isEnabled) {
        if (this.els.btnToggleSound) {
            this.els.btnToggleSound.textContent = isEnabled ? '🔊 音效' : '🔇 静音';
        }
    },

    playTypingSound(isError = false) {
        if (!Store.getSoundEnabled()) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!this.audioCtx) {
                this.audioCtx = new AudioContext();
            }
            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);
            if (isError) {
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(150, this.audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
                oscillator.start(this.audioCtx.currentTime);
                oscillator.stop(this.audioCtx.currentTime + 0.1);
            } else {
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(800, this.audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.05);
                gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.05);
                oscillator.start(this.audioCtx.currentTime);
                oscillator.stop(this.audioCtx.currentTime + 0.05);
            }
        } catch (e) {
        }
    },

    playSuccessSound() {
        if (!Store.getSoundEnabled()) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!this.audioCtx) {
                this.audioCtx = new AudioContext();
            }
            const now = this.audioCtx.currentTime;
            const frequencies = [261.63, 329.63, 392.0, 523.25];
            frequencies.forEach((freq, i) => {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                const startTime = now + i * 0.15;
                const duration = 0.3;
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
                osc.start(startTime);
                osc.stop(startTime + duration);
            });
        } catch (e) {
        }
    }
});
