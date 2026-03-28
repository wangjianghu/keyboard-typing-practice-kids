const UI = {
    els: {
        welcomeScreen: document.getElementById('welcome-screen'),
        levelScreen: document.getElementById('level-screen'),
        practiceScreen: document.getElementById('practice-screen'),
        resultScreen: document.getElementById('result-screen'),
        statsScreen: document.getElementById('stats-screen'),
        
        levelGrid: document.getElementById('level-grid'),
        levelReviewTaskPanel: document.getElementById('level-review-task-panel'),
        textContainer: document.getElementById('text-container'),
        virtualKeyboard: document.getElementById('virtual-keyboard'),
        
        progressBar: document.getElementById('progress-bar'),
        statWpm: document.getElementById('stat-wpm'),
        statAcc: document.getElementById('stat-acc'),
        statTime: document.getElementById('stat-time'),
        hintBubble: document.getElementById('hint-bubble'),
        progressText: document.getElementById('progress-text'),
        goalTips: document.getElementById('goal-tips'),
        segmentFeedback: document.getElementById('segment-feedback'),
        pauseOverlay: document.getElementById('pause-overlay'),
        
        resultWpm: document.getElementById('result-wpm'),
        resultAcc: document.getElementById('result-acc'),
        resultStars: document.getElementById('result-stars'),
        resultTime: document.getElementById('result-time'),
        resultGoalSummary: document.getElementById('result-goal-summary'),
        resultEncourage: document.getElementById('result-encourage'),
        
        btnToggleSound: document.getElementById('btn-toggle-sound'),
        keyboardMask: document.getElementById('keyboard-mask'),
        growthSummary: document.getElementById('growth-summary'),
        badgeList: document.getElementById('badge-list'),
        badgeDetailModal: document.getElementById('badge-detail-modal'),
        badgeDetailTitle: document.getElementById('badge-detail-title'),
        badgeDetailDesc: document.getElementById('badge-detail-desc'),
        badgeDetailProgress: document.getElementById('badge-detail-progress'),
        btnBadgeDetailClose: document.getElementById('btn-badge-detail-close'),
        statsMobileSwitcher: document.getElementById('stats-mobile-switcher'),
        btnStatsTabHistory: document.getElementById('btn-stats-tab-history'),
        btnStatsTabErrors: document.getElementById('btn-stats-tab-errors'),
        statsDetailsContainer: document.getElementById('stats-details-container'),
        statsErrorsContainer: document.getElementById('stats-errors-container')
    },

    // 键盘布局数据 (QWERTY)
    keyboardLayout: [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '['],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
    ],
    statsCompactBreakpoint: 980,
    currentStatsTab: 'history',
    statsSwitcherInited: false,
    renderState: {
        text: '',
        charSpans: [],
        currentIndex: -1,
        errorIndex: -1
    },
    keyboardLayoutRafId: null,
    keyboardLayoutNeedsMask: false,
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(el => {
            el.classList.add('hidden');
            el.classList.remove('active');
        });
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }
    },
};
