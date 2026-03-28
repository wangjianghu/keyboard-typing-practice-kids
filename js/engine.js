/**
 * 核心练习引擎
 */
const Engine = {
    currentLevel: null,
    targetText: "", // 完整的目标文本（总长60）
    currentLineText: "", // 当前页/行显示的文本
    currentIndex: 0, // 整体进度索引
    lineIndex: 0, // 当前行内的索引
    
    startTime: 0,
    elapsedTime: 0, // 累计用时（毫秒），用于处理暂停
    timerInterval: null,
    errors: 0,
    totalKeystrokes: 0,
    isPracticeActive: false,
    isPaused: false,
    segmentErrorMap: {},
    onSegmentCallback: null,
    
    // 配置常量
    TARGET_LENGTH: 60,
    CHARS_PER_LINE: 20, // 每行显示20个字符
    SEGMENT_SIZE: 20,
    
    onCompleteCallback: null,
    lastContainerWidth: 0,

    /**
     * 生成标准长度的练习文本
     */
    generateStandardText(baseText) {
        let result = baseText;
        // 如果不足 60 个字符，循环拼接空格和原文本
        while (result.length < this.TARGET_LENGTH) {
            result += " " + baseText;
        }
        // 截取刚好 60 个字符
        return result.substring(0, this.TARGET_LENGTH);
    },

    /**
     * 加载当前行/页的文本
     */
    loadCurrentLine() {
        const start = Math.floor(this.currentIndex / this.CHARS_PER_LINE) * this.CHARS_PER_LINE;
        this.currentLineText = this.targetText.substring(start, start + this.CHARS_PER_LINE);
        this.lineIndex = this.currentIndex % this.CHARS_PER_LINE;
        
        UI.renderText(this.currentLineText, this.lineIndex);
        const expectedChar = this.currentLineText[this.lineIndex];
        UI.highlightNextKey(expectedChar);
        
        // 实时更新指法提示
        UI.showHint(expectedChar);
    },

    refreshCharsPerLine(force = false) {
        const container = UI.els?.textContainer?.parentElement;
        if (!container) {
            return false;
        }
        const width = container.clientWidth;
        if (!force && width === this.lastContainerWidth) {
            return false;
        }
        this.lastContainerWidth = width;
        this.CHARS_PER_LINE = UI.getCharsPerLine();
        return true;
    },

    /**
     * 启动关卡
     */
    startLevel(level, onComplete, onSegment) {
        this.currentLevel = level;
        this.targetText = this.generateStandardText(level.text);
        
        this.currentIndex = 0;
        this.errors = 0;
        this.totalKeystrokes = 0;
        this.startTime = 0; // 等待第一次按键再计时
        this.elapsedTime = 0;
        this.isPracticeActive = true;
        this.isPaused = false;
        this.onCompleteCallback = onComplete;
        this.onSegmentCallback = onSegment || null;
        this.segmentErrorMap = {};
        
        // 确保计时器被清理
        this.stopTimer();
        this.refreshCharsPerLine(true);

        Logger.info(`开始关卡: ${level.title}, 文本长度: ${this.targetText.length}`);
        
        UI.updateStats(0, 100, 0, "0:00", 0, this.TARGET_LENGTH);
        UI.resetSegmentFeedback();
        this.loadCurrentLine();

        // 绑定键盘事件
        document.addEventListener('keydown', this.handleKeyDown);
    },

    /**
     * 停止/放弃练习
     */
    stopPractice() {
        this.isPracticeActive = false;
        this.stopTimer();
        document.removeEventListener('keydown', this.handleKeyDown);
        this.onSegmentCallback = null;
        UI.resetSegmentFeedback();
    },

    /**
     * 暂停/恢复
     */
    togglePause() {
        if (!this.isPracticeActive) return;
        
        // 如果还没开始计时（还没打第一个字母），且不是在暂停状态，则不允许暂停
        if (this.startTime === 0 && this.elapsedTime === 0 && !this.isPaused) return;
        
        this.isPaused = !this.isPaused;
        UI.togglePauseOverlay(this.isPaused);
        
        if (this.isPaused) {
            // 暂停时，累加已用时间并清空 startTime，停止定时器
            if (this.startTime > 0) {
                this.elapsedTime += (Date.now() - this.startTime);
            }
            this.startTime = 0;
            this.stopTimer();
            Logger.info('练习已暂停');
        } else {
            // 恢复时，重置 startTime 并启动定时器
            this.startTime = Date.now();
            this.startTimer();
            Logger.info('练习已恢复');
        }
    },

    startTimer() {
        this.stopTimer(); // 确保不重复
        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.updateRealtimeStats();
            }
        }, 1000);
    },

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    /**
     * 处理键盘事件
     */
    handleKeyDown: (e) => {
        if (!Engine.isPracticeActive) return;

        // 暂停快捷键 ESC
        if (e.key === 'Escape') {
            Engine.togglePause();
            return;
        }

        if (Engine.isPaused) return; // 暂停期间屏蔽输入

        // 忽略功能键 (Shift, CapsLock, etc.)
        if (e.key.length > 1 && e.key !== ' ') return;
        
        // 阻止默认行为（比如空格滚动页面）
        e.preventDefault();

        // 首次按键开始计时
        if (Engine.startTime === 0 && Engine.elapsedTime === 0) {
            Engine.startTime = Date.now();
            Engine.startTimer();
        }

        Engine.totalKeystrokes++;
        const expectedChar = Engine.targetText[Engine.currentIndex];
        const typedChar = e.key;

        if (typedChar === expectedChar) {
            // 正确
            Engine.currentIndex++;
            Engine.lineIndex++;
            
            // 记录按键统计 (正确)
            if (expectedChar !== ' ') {
                Store.recordKeyStat(expectedChar, false);
            }
            
            UI.animateKey(typedChar);
            UI.playTypingSound(false);

            if (Engine.currentIndex % Engine.SEGMENT_SIZE === 0) {
                Engine.emitSegmentFeedback();
            }

            if (Engine.currentIndex >= Engine.targetText.length) {
                // 整个关卡完成
                Engine.finishLevel();
            } else if (Engine.lineIndex >= Engine.CHARS_PER_LINE) {
                // 当前行完成，翻页
                Engine.loadCurrentLine();
            } else {
                // 继续当前行的下一个字符
                UI.renderText(Engine.currentLineText, Engine.lineIndex, false);
                const nextChar = Engine.currentLineText[Engine.lineIndex];
                UI.highlightNextKey(nextChar);
                // 实时更新指法提示
                UI.showHint(nextChar);
            }
        } else {
            // 错误
            Engine.errors++;
            if (expectedChar !== ' ') {
                const lowerKey = expectedChar.toLowerCase();
                Engine.segmentErrorMap[lowerKey] = (Engine.segmentErrorMap[lowerKey] || 0) + 1;
            }
            
            // 记录按键统计 (错误)
            if (expectedChar !== ' ') {
                Store.recordKeyStat(expectedChar, true);
            }
            
            UI.animateKey(typedChar);
            UI.playTypingSound(true);
            UI.renderText(Engine.currentLineText, Engine.lineIndex, true);
            
            // 错误时也更新一下提示内容，确保准确
            UI.showHint(expectedChar);
        }

        // 实时更新状态
        Engine.updateRealtimeStats();
    },

    /**
     * 实时更新 WPM 和准确率
     */
    updateRealtimeStats() {
        const stats = this.calculateStats();
        const progress = (this.currentIndex / this.targetText.length) * 100;
        UI.updateStats(stats.wpm, stats.acc, progress, stats.timeStr, this.currentIndex, this.targetText.length);
    },

    /**
     * 获取当前总用时（毫秒）
     */
    getTotalElapsedTime() {
        let total = this.elapsedTime;
        if (this.startTime > 0 && !this.isPaused) {
            total += (Date.now() - this.startTime);
        }
        return total;
    },

    /**
     * 格式化时间
     */
    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },

    /**
     * 计算统计数据
     */
    calculateStats() {
        const totalMs = this.getTotalElapsedTime();
        const timeStr = this.formatTime(totalMs);
        
        if (totalMs === 0) return { wpm: 0, acc: 100, timeStr };
        
        const timeElapsedMin = totalMs / 60000;
        const correctKeystrokes = this.totalKeystrokes - this.errors;
        
        // 速度单位更改为“次/分钟” (KPM: Keystrokes Per Minute)，仅统计正确的按键
        const wpm = timeElapsedMin > 0 ? Math.round(correctKeystrokes / timeElapsedMin) : 0;
        
        const acc = this.totalKeystrokes > 0 
            ? Math.round((correctKeystrokes / this.totalKeystrokes) * 100) 
            : 100;

        return { wpm, acc, timeStr };
    },

    emitSegmentFeedback() {
        if (!this.onSegmentCallback) {
            this.segmentErrorMap = {};
            return;
        }
        const segmentIndex = Math.max(1, Math.ceil(this.currentIndex / this.SEGMENT_SIZE));
        const segmentStart = (segmentIndex - 1) * this.SEGMENT_SIZE + 1;
        const segmentEnd = Math.min(this.currentIndex, this.targetText.length);
        const sorted = Object.entries(this.segmentErrorMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([key, count]) => ({ key, count }));
        this.onSegmentCallback({
            progress: this.currentIndex,
            total: this.targetText.length,
            segmentSize: this.SEGMENT_SIZE,
            segmentIndex,
            segmentStart,
            segmentEnd,
            topErrors: sorted
        });
        this.segmentErrorMap = {};
    },

    /**
     * 完成关卡
     */
    finishLevel() {
        this.stopPractice();
        const stats = this.calculateStats();
        const goals = this.currentLevel?.goals || {
            pass: { acc: 85, wpm: 60 },
            perfect: { acc: 95, wpm: 90 }
        };
        const passReached = stats.acc >= goals.pass.acc && stats.wpm >= goals.pass.wpm;
        const perfectReached = stats.acc >= goals.perfect.acc && stats.wpm >= goals.perfect.wpm;
        const stars = perfectReached ? 3 : (passReached ? 2 : (stats.acc >= goals.pass.acc ? 1 : 0));

        Logger.info(`关卡完成! WPM: ${stats.wpm}, ACC: ${stats.acc}%, 用时: ${stats.timeStr}`);
        
        // 播放激励音效
        UI.playSuccessSound();

        if (this.onCompleteCallback) {
            this.onCompleteCallback(stats.wpm, stats.acc, stars, stats.timeStr, goals, { passReached, perfectReached });
        }
    }
};
