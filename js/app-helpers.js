function getLevelSelectHandler() {
    return (levelId) => startPractice(levelId);
}

function refreshDashboardAndLevels() {
    UI.renderStatsDashboard('all');
    UI.renderLevelGrid(getLevelSelectHandler());
}

function showLevelSelection() {
    UI.renderLevelGrid(getLevelSelectHandler());
    UI.showScreen('level-screen');
    setTimeout(() => UI.updateKeyboardMask(), 100);
}

function setButtonLoading(button, loading, text) {
    if (!button) {
        return;
    }
    button.disabled = loading;
    button.classList.toggle('loading', loading);
    button.textContent = text;
}
