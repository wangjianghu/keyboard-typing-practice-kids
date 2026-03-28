/**
 * 简易测试框架
 */
const TestRunner = {
    results: [],
    
    assert(condition, message) {
        if (condition) {
            this.results.push({ pass: true, message: `✅ PASS: ${message}` });
        } else {
            this.results.push({ pass: false, message: `❌ FAIL: ${message}` });
            console.error(`Assertion failed: ${message}`);
        }
    },

    assertEqual(actual, expected, message) {
        this.assert(actual === expected, `${message} (Expected: ${expected}, Actual: ${actual})`);
    },

    render() {
        const container = document.getElementById('test-results');
        let html = '<ul>';
        let passCount = 0;
        
        this.results.forEach(r => {
            html += `<li class="${r.pass ? 'pass' : 'fail'}">${r.message}</li>`;
            if (r.pass) passCount++;
        });
        
        html += '</ul>';
        html += `<h3>总结: ${passCount} / ${this.results.length} 通过</h3>`;
        container.innerHTML = html;
    },

    run() {
        console.log("开始运行测试...");
        
        try {
            localStorage.clear();
            const data = Store.getData();
            this.assertEqual(data.unlockedLevels.length, 1, "Store: 默认解锁1个关卡");
            
            Store.unlockLevel(2);
            this.assert(Store.isLevelUnlocked(2), "Store: 能够解锁新关卡");
            Store.flushSaveQueue();

            Store.recordKeyStat('f', true);
            Store.recordKeyStat('f', false);
            Store.flushSaveQueue();
            const errorStats = Store.getData().errorStats.f;
            this.assertEqual(errorStats.total, 2, "Store: 按键统计总次数正确");
            this.assertEqual(errorStats.errors, 1, "Store: 按键统计错误次数正确");

            const backup = Store.exportBackup();
            Store.clearAllData();
            Store.importBackup(backup);
            this.assert(Store.isLevelUnlocked(2), "Store: 导出后可完整恢复数据");

            const level1 = getLevelById(1);
            this.assertEqual(level1.id, 1, "Levels: 能根据 ID 获取关卡");
            const protectedText = simplifyTextForProtection('one two three four five six seven eight');
            this.assert(protectedText.split(' ').length <= 8, "Levels: 保护模式文本裁剪生效");

            UI.showScreen('practice-screen');
            this.assert(document.getElementById('practice-screen').classList.contains('active'), "UI: showScreen 切换 active 类");
            this.assertEqual(UI.parseTimeToSeconds('1:30'), 90, "UI-Stats: 时间字符串解析正确");
            this.assertEqual(UI.formatSecondsToTime(125), '2:05', "UI-Stats: 秒数格式化正确");
            const bestStat = UI.getFilteredBestStat([
                { wpm: 60, acc: 88, stars: 1, timeStr: '2:00', timestamp: Date.now() - 1000 },
                { wpm: 75, acc: 92, stars: 2, timeStr: '1:50', timestamp: Date.now() - 500 }
            ], 'all');
            this.assertEqual(bestStat.wpm, 75, "UI-Stats: 最佳速度统计正确");
            this.assertEqual(bestStat.timeStr, '1:50', "UI-Stats: 最佳用时统计正确");
            
            Engine.startTime = Date.now() - 60000;
            Engine.currentIndex = 50;
            Engine.totalKeystrokes = 55;
            Engine.errors = 5;
            const stats = Engine.calculateStats();
            this.assertEqual(stats.wpm, 10, "Engine: WPM 计算正确 (10词/1分钟)");
            this.assertEqual(stats.acc, Math.round((50/55)*100), "Engine: 准确率计算正确");

            Adaptive.recentResults = [];
            Adaptive.recordResult({ passReached: true }, 96, 120);
            Adaptive.recordResult({ passReached: false }, 70, 45);
            const trend = Adaptive.getTrendSummary();
            this.assertEqual(Math.round(trend.avgAcc), 83, "Adaptive: 滑动窗口准确率统计正确");
            this.assertEqual(trend.failStreak, 1, "Adaptive: 连败统计正确");

            const defaultFlags = createDefaultFeatureFlags();
            this.assert(defaultFlags.welcome && defaultFlags.stats, "App-Flags: 默认开关为启用");
            const onlyStats = resolveFeatureFlagsFromQuery(defaultFlags, '?enable=stats');
            this.assertEqual(onlyStats.stats, true, "App-Flags: enable 参数可单独启用 stats");
            this.assertEqual(onlyStats.global, false, "App-Flags: enable 参数会关闭未包含项");
            const disabled = resolveFeatureFlagsFromQuery(defaultFlags, '?disable=global,practice');
            this.assertEqual(disabled.global, false, "App-Flags: disable 参数可关闭 global");
            this.assertEqual(disabled.practice, false, "App-Flags: disable 参数可关闭 practice");
            const mixed = resolveFeatureFlagsFromQuery(defaultFlags, '?enable=stats,global&disable=global');
            this.assertEqual(mixed.stats, true, "App-Flags: enable 与 disable 同时存在时保留启用项");
            this.assertEqual(mixed.global, false, "App-Flags: disable 优先覆盖同名启用项");
            this.assert(shouldShowFeatureFlagsDebug('?debugFlags=1'), "App-Flags: debugFlags=1 时显示调试面板");
            this.assert(shouldShowFeatureFlagsDebug('?debugFlags=true'), "App-Flags: debugFlags=true 时显示调试面板");
            this.assert(!shouldShowFeatureFlagsDebug('?debugFlags=0'), "App-Flags: debugFlags=0 时不显示调试面板");
            const summary = getFeatureFlagsSummary({ welcome: true, stats: false, level: true });
            this.assertEqual(summary.enabledKeys.join(','), 'welcome,level', "App-Flags: 可正确提取启用项");
            this.assertEqual(summary.disabledKeys.join(','), 'stats', "App-Flags: 可正确提取禁用项");
            const copyFormatted = formatFeatureFlagsForCopy({ welcome: true, stats: false });
            this.assert(copyFormatted.includes('ON=welcome'), "App-Flags: 可格式化复制文本启用项");
            this.assert(copyFormatted.includes('OFF=stats'), "App-Flags: 可格式化复制文本禁用项");
            const debugUrl = buildFeatureFlagsDebugUrl(
                { welcome: true, stats: false, level: true, practice: false, result: true, global: true },
                'https://example.com/index.html?foo=bar'
            );
            this.assert(debugUrl.includes('debugFlags=1'), "App-Flags: 可生成带 debugFlags 的调试链接");
            this.assert(debugUrl.includes('enable=welcome%2Clevel%2Cresult%2Cglobal'), "App-Flags: 调试链接包含启用项");
            this.assert(debugUrl.includes('disable=stats%2Cpractice'), "App-Flags: 调试链接包含禁用项");
            renderFeatureFlagsDebugPanel({ welcome: true, stats: false });
            const panel = document.getElementById('feature-flags-debug-panel');
            this.assert(!!panel, "App-Flags: 可渲染调试面板");
            this.assert(panel.textContent.includes('ON: welcome'), "App-Flags: 调试面板展示启用项");
            this.assert(panel.textContent.includes('OFF: stats'), "App-Flags: 调试面板展示关闭项");
            const copyUrlButton = panel.querySelector('[data-role="copy-url"]');
            this.assert(!!copyUrlButton, "App-Flags: 调试面板包含复制链接按钮");
            const toggleButton = panel.querySelector('[data-role="toggle"]');
            toggleButton.click();
            this.assertEqual(panel.dataset.collapsed, '1', "App-Flags: 调试面板支持折叠");
            toggleButton.click();
            this.assertEqual(panel.dataset.collapsed, '0', "App-Flags: 调试面板支持展开");

        } catch (e) {
            this.assert(false, `发生异常: ${e.message}`);
        }

        this.render();
    }
};

// 延迟运行测试，确保 DOM 加载完成
setTimeout(() => {
    TestRunner.run();
}, 500);
