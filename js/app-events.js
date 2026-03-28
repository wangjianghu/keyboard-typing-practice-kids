function bindWelcomeEvents() {
    UI.els.welcomeScreen.querySelector('#btn-start').addEventListener('click', () => {
        showLevelSelection();
    });
}

function bindLevelEvents() {
    UI.els.levelScreen.querySelector('#btn-back-welcome').addEventListener('click', () => {
        UI.showScreen('welcome-screen');
    });

    const reviewTaskPanel = document.getElementById('level-review-task-panel');
    if (!reviewTaskPanel) return;
    reviewTaskPanel.addEventListener('click', (event) => {
        const target = event.target;
        if (!target || !target.dataset) return;
        const action = target.dataset.reviewAction;
        const taskId = target.dataset.taskId;
        const levelId = Number(target.dataset.levelId || 0);
        if (!action || !taskId) return;
        if (action === 'practice') {
            startPractice(levelId);
            return;
        }
        if (action === 'delay') {
            if (Store.postponeReviewTask(taskId, 1)) {
                showLevelSelection();
            }
            return;
        }
        if (action === 'skip' && Store.skipReviewTask(taskId)) {
            showLevelSelection();
        }
    });
}

function bindPracticeEvents() {
    UI.els.practiceScreen.querySelector('#btn-back-level').addEventListener('click', () => {
        Engine.stopPractice();
        if (UI.els.keyboardMask) {
            UI.els.keyboardMask.classList.remove('active');
        }
        showLevelSelection();
    });

    UI.els.practiceScreen.querySelector('#btn-pause').addEventListener('click', () => {
        Engine.togglePause();
    });

    const resumeBtn = document.getElementById('btn-resume');
    resumeBtn?.addEventListener('click', () => {
        Logger.info('点击继续按钮');
        Engine.togglePause();
    });

    UI.updateSoundBtn(Store.getSoundEnabled());
    UI.els.practiceScreen.querySelector('#btn-toggle-sound').addEventListener('click', () => {
        const isEnabled = Store.toggleSound();
        UI.updateSoundBtn(isEnabled);
        if (isEnabled && UI.audioCtx && UI.audioCtx.state === 'suspended') {
            UI.audioCtx.resume();
        } else if (isEnabled && !UI.audioCtx) {
            UI.playTypingSound();
        }
    });
}

function bindResultEvents() {
    UI.els.resultScreen.querySelector('#btn-home').addEventListener('click', () => {
        showLevelSelection();
    });

    UI.els.resultScreen.querySelector('#btn-retry').addEventListener('click', () => {
        if (Engine.currentLevel) {
            startPractice(Engine.currentLevel.id);
        }
    });

    UI.els.resultScreen.querySelector('#btn-next').addEventListener('click', () => {
        handleNextLevel();
    });
}

function bindGlobalEvents() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !UI.els.resultScreen.classList.contains('hidden')) {
            handleNextLevel();
        }
    });

    window.addEventListener('resize', () => {
        const charsChanged = Engine.refreshCharsPerLine();
        if (Engine.isPracticeActive && charsChanged) {
            Engine.loadCurrentLine();
        }
        UI.updateKeyboardMask();
    });
}
