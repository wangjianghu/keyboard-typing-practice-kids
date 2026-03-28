function handleNextLevel() {
    const action = Router.resolveNextAction(Engine.currentLevel);
    processNextAction(action);
}

function processNextAction(action) {
    if (action.type === 'start-level') {
        startPractice(action.levelId);
        return;
    }
    if (action.reason === 'locked') {
        alert('下一关尚未解锁哦！');
    }
    showLevelSelection();
}

function startPractice(levelId) {
    UI.updateSoundBtn(Store.getSoundEnabled());
    const level = resolvePracticeLevel(levelId);
    if (!level) {
        return;
    }
    const preparedLevel = Adaptive.prepareLevel(level, levelId);
    Router.resetQueueForLevel(levelId);
    preparePracticeScreen(preparedLevel.goals);
    runPracticeLevel(levelId, preparedLevel);
}

function resolvePracticeLevel(levelId) {
    if (levelId === 999) {
        const errorLevel = getErrorReviewLevel();
        if (!errorLevel) {
            alert('你太棒了，目前没有易错按键，不需要复习哦！');
            return null;
        }
        return errorLevel;
    }
    const level = getLevelById(levelId);
    if (!level) {
        Logger.error('找不到对应关卡', { levelId });
        return null;
    }
    return level;
}

function preparePracticeScreen(goals) {
    UI.showScreen('practice-screen');
    if (UI.els.keyboardMask) {
        UI.els.keyboardMask.classList.add('active');
        UI.updateKeyboardMask();
    }
    UI.updateGoalTips(goals);
}

function runPracticeLevel(levelId, preparedLevel) {
    Engine.refreshCharsPerLine(true);
    Engine.startLevel(preparedLevel, (wpm, acc, stars, timeStr, goals, resultFlags) => {
        handleLevelComplete(levelId, wpm, acc, stars, timeStr, goals, resultFlags);
    }, (segmentPayload) => {
        UI.showSegmentFeedback(segmentPayload);
    });
}

function handleLevelComplete(levelId, wpm, acc, stars, timeStr, goals, resultFlags) {
    Store.saveLevelResult(levelId, wpm, acc, stars, timeStr);
    Store.completeDueReviewTaskByLevel(levelId);
    Adaptive.recordResult(resultFlags, acc, wpm);
    unlockNextLevelWhenPassed(levelId, stars);
    UI.renderResult(wpm, acc, stars, timeStr, goals, resultFlags);
    UI.showScreen('result-screen');
}

function unlockNextLevelWhenPassed(levelId, stars) {
    if (stars < 1) {
        return;
    }
    const nextLevelId = levelId + 1;
    if (getLevelById(nextLevelId)) {
        Store.unlockLevel(nextLevelId);
    }
}
