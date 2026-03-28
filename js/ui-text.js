Object.assign(UI, {
    getCharsPerLine() {
        const containerWidth = this.els.textContainer.parentElement.clientWidth - 80;
        const fontSize = 150;
        const letterSpacing = 15;
        const charWidth = (fontSize * 0.6) + letterSpacing;
        return Math.max(1, Math.floor(containerWidth / charWidth));
    },

    renderText(text, currentIndex, isError = false) {
        const needsRebuild = this.renderState.text !== text || this.renderState.charSpans.length !== text.length;
        if (needsRebuild) {
            const fragment = document.createDocumentFragment();
            const spans = [];
            for (let i = 0; i < text.length; i++) {
                const charSpan = document.createElement('span');
                charSpan.className = 'char';
                charSpan.textContent = text[i] === ' ' ? '␣' : text[i];
                spans.push(charSpan);
                fragment.appendChild(charSpan);
            }
            this.els.textContainer.innerHTML = '';
            this.els.textContainer.appendChild(fragment);
            this.renderState.text = text;
            this.renderState.charSpans = spans;
            this.renderState.currentIndex = -1;
            this.renderState.errorIndex = -1;
        }
        if (this.renderState.currentIndex !== currentIndex) {
            const prevSpan = this.renderState.charSpans[this.renderState.currentIndex];
            if (prevSpan) {
                prevSpan.classList.remove('current');
                prevSpan.classList.remove('error');
            }
            if (this.renderState.currentIndex >= 0 && this.renderState.currentIndex < currentIndex) {
                for (let i = this.renderState.currentIndex; i < currentIndex; i++) {
                    const typedSpan = this.renderState.charSpans[i];
                    if (typedSpan) {
                        typedSpan.classList.add('typed');
                        typedSpan.classList.remove('current');
                        typedSpan.classList.remove('error');
                    }
                }
            }
            const currentSpan = this.renderState.charSpans[currentIndex];
            if (currentSpan) {
                currentSpan.classList.add('current');
            }
            this.renderState.currentIndex = currentIndex;
        }
        const activeSpan = this.renderState.charSpans[currentIndex];
        if (activeSpan) {
            if (isError) {
                activeSpan.classList.add('error');
                this.renderState.errorIndex = currentIndex;
            } else if (this.renderState.errorIndex === currentIndex) {
                activeSpan.classList.remove('error');
                this.renderState.errorIndex = -1;
            }
        }
    },

    updateStats(wpm, acc, progress, timeStr, currentCount = 0, totalCount = 60) {
        this.els.statWpm.textContent = wpm;
        this.els.statAcc.textContent = acc;
        this.els.statTime.textContent = timeStr;
        this.els.progressBar.style.width = `${progress}%`;
        if (this.els.progressText) {
            this.els.progressText.textContent = `${currentCount}/${totalCount}`;
        }
    },

    updateGoalTips(goals) {
        if (!this.els.goalTips || !goals) return;
        this.els.goalTips.textContent = `通关目标：准确率≥${goals.pass.acc}%，速度≥${goals.pass.wpm}次/分钟｜满星目标：准确率≥${goals.perfect.acc}%，速度≥${goals.perfect.wpm}次/分钟`;
    },

    showSegmentFeedback(payload) {
        if (!this.els.segmentFeedback) return;
        const segmentSize = payload?.segmentSize || 20;
        const segmentNo = payload?.segmentIndex || (payload ? Math.max(1, Math.ceil(payload.progress / segmentSize)) : 1);
        const segmentStart = payload?.segmentStart || ((segmentNo - 1) * segmentSize + 1);
        const segmentEnd = payload?.segmentEnd || Math.min(payload?.progress || segmentSize, payload?.total || segmentSize);
        const rangeLabel = `第 ${segmentNo} 段（${segmentStart}-${segmentEnd} 字）`;
        if (!payload || !payload.topErrors || payload.topErrors.length === 0) {
            this.els.segmentFeedback.textContent = `${rangeLabel} 完成：太棒了，这一段几乎零失误！`;
        } else {
            const topText = payload.topErrors.map(item => `${item.key.toUpperCase()}(${item.count})`).join('、');
            this.els.segmentFeedback.textContent = `${rangeLabel} 完成：本段易错键 Top${payload.topErrors.length} → ${topText}`;
        }
        this.els.segmentFeedback.classList.remove('hidden');
    },

    resetSegmentFeedback() {
        if (!this.els.segmentFeedback) return;
        this.els.segmentFeedback.textContent = '';
        this.els.segmentFeedback.classList.add('hidden');
    },

    togglePauseOverlay(isPaused) {
        if (isPaused) {
            this.els.pauseOverlay.classList.remove('hidden');
        } else {
            this.els.pauseOverlay.classList.add('hidden');
        }
    },

    renderResult(wpm, acc, stars, timeStr = '0:00', goals = null, resultFlags = null) {
        this.els.resultWpm.textContent = wpm;
        this.els.resultAcc.textContent = acc;
        this.els.resultTime.textContent = timeStr;
        this.els.resultStars.textContent = '★'.repeat(Math.max(0, stars)) + '☆'.repeat(3 - Math.max(0, stars));
        if (this.els.resultGoalSummary) {
            if (!goals || !resultFlags) {
                this.els.resultGoalSummary.textContent = '';
            } else if (resultFlags.perfectReached) {
                this.els.resultGoalSummary.textContent = `已达成满星目标（准确率≥${goals.perfect.acc}% 且速度≥${goals.perfect.wpm}）`;
            } else if (resultFlags.passReached) {
                this.els.resultGoalSummary.textContent = `已达成通关目标（准确率≥${goals.pass.acc}% 且速度≥${goals.pass.wpm}）`;
            } else {
                this.els.resultGoalSummary.textContent = `未达通关目标（目标：准确率≥${goals.pass.acc}% 且速度≥${goals.pass.wpm}）`;
            }
        }
        if (this.els.resultEncourage) {
            this.els.resultEncourage.textContent = this.getEncouragementText(acc, wpm, resultFlags);
        }
    },

    getEncouragementText(acc, wpm, resultFlags) {
        if (resultFlags?.perfectReached) {
            return '你太厉害啦！这关又快又准，继续保持这个节奏！';
        }
        if (resultFlags?.passReached) {
            return '已经稳稳通关啦！再把速度提高一点点，就能拿满星。';
        }
        if (acc >= 80) {
            return '准确率已经很接近目标了，下一次把节奏放稳一点就能通过。';
        }
        if (wpm >= 70) {
            return '速度很棒！先稍微放慢一点，准确率会很快上来。';
        }
        return '今天也有进步，先把手指回位做好，我们一关一关拿下它！';
    }
});
