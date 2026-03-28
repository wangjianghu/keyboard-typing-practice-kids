document.addEventListener('DOMContentLoaded', bootstrapApp);

const APP_FEATURE_FLAGS = resolveFeatureFlagsFromQuery(
    createDefaultFeatureFlags(),
    window.location.search
);

const EVENT_BINDERS = [
    { key: 'welcome', bind: bindWelcomeEvents },
    { key: 'stats', bind: bindStatsEvents },
    { key: 'level', bind: bindLevelEvents },
    { key: 'practice', bind: bindPracticeEvents },
    { key: 'result', bind: bindResultEvents },
    { key: 'global', bind: bindGlobalEvents }
];

function bootstrapApp() {
    Logger.info('应用初始化开始');
    Logger.info('事件绑定开关', APP_FEATURE_FLAGS);
    if (shouldShowFeatureFlagsDebug(window.location.search)) {
        renderFeatureFlagsDebugPanel(APP_FEATURE_FLAGS);
    }
    initializeEventBindings();
    UI.initVirtualKeyboard();
    UI.showScreen('welcome-screen');
    Logger.info('应用初始化完成');
}

function initializeEventBindings() {
    EVENT_BINDERS
        .filter((eventBinder) => APP_FEATURE_FLAGS[eventBinder.key] !== false)
        .forEach((eventBinder) => eventBinder.bind());
}
