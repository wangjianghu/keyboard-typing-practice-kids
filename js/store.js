/**
 * 数据服务层 (基于 localStorage)
 */
const Store = {
    KEY: 'typing_adventure_data',
    SAVE_DEBOUNCE_MS: 240,
    dataCache: null,
    saveTimer: null,
    persistenceInited: false,
    
    // 默认数据结构
    defaultData: {
        unlockedLevels: [1], // 默认解锁第一关
        levelStats: {},      // 关卡统计历史记录：不再只存最高分，而是存数组 { "1": [ { wpm: 20, acc: 95, stars: 3, timestamp: 123456789 } ] }
        errorStats: {},      // 错误按键统计 { "a": { errors: 5, total: 20 }, "j": { errors: 2, total: 10 } }
        reviewTasks: [],     // 回访任务队列 [{ taskId, levelId, stage, dueAt, status, createdAt, completedAt }]
        totalTime: 0,
        settings: {
            soundEnabled: true
        }
    },

    /**
     * 获取全部存储数据
     * @returns {Object}
     */
    cloneDefaultData() {
        return JSON.parse(JSON.stringify(this.defaultData));
    },

    normalizeData(data) {
        const base = data && typeof data === 'object' ? data : {};
        const normalized = {
            unlockedLevels: Array.isArray(base.unlockedLevels) && base.unlockedLevels.length > 0 ? base.unlockedLevels : [1],
            levelStats: base.levelStats && typeof base.levelStats === 'object' ? base.levelStats : {},
            errorStats: base.errorStats && typeof base.errorStats === 'object' ? base.errorStats : {},
            reviewTasks: Array.isArray(base.reviewTasks) ? base.reviewTasks : [],
            totalTime: typeof base.totalTime === 'number' ? base.totalTime : 0,
            settings: {
                soundEnabled: typeof base?.settings?.soundEnabled === 'boolean' ? base.settings.soundEnabled : true
            }
        };
        const now = Date.now();
        normalized.reviewTasks = normalized.reviewTasks.map(task => ({
            taskId: task.taskId || `${task.levelId || 0}-${task.stage || 'D1'}-${now}`,
            levelId: task.levelId || 1,
            stage: task.stage || 'D1',
            dueAt: typeof task.dueAt === 'number' ? task.dueAt : now,
            status: task.status || 'pending',
            createdAt: typeof task.createdAt === 'number' ? task.createdAt : now,
            completedAt: typeof task.completedAt === 'number' ? task.completedAt : null
        }));
        return normalized;
    },

    ensureLoaded() {
        if (this.dataCache) {
            return;
        }
        try {
            const raw = localStorage.getItem(this.KEY);
            if (!raw) {
                this.dataCache = this.cloneDefaultData();
            } else {
                this.dataCache = this.normalizeData(JSON.parse(raw));
            }
        } catch (e) {
            Logger.error('读取 localStorage 失败', e);
            this.dataCache = this.cloneDefaultData();
        }
    },

    initPersistence() {
        if (this.persistenceInited) {
            return;
        }
        this.persistenceInited = true;
        window.addEventListener('beforeunload', () => {
            this.flushSaveQueue();
        });
    },

    getData() {
        this.initPersistence();
        this.ensureLoaded();
        return this.dataCache;
    },

    /**
     * 保存数据
     * @param {Object} data 
     */
    flushSaveQueue() {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
            this.saveTimer = null;
        }
        if (!this.dataCache) {
            return;
        }
        try {
            localStorage.setItem(this.KEY, JSON.stringify(this.dataCache));
        } catch (e) {
            Logger.error('保存 localStorage 失败', e);
        }
    },

    saveData(data, options = {}) {
        if (data === this.dataCache) {
            this.dataCache = data;
        } else if (options.trusted === true) {
            this.dataCache = data;
        } else {
            this.dataCache = this.normalizeData(data);
        }
        const immediate = options.immediate === true;
        if (immediate) {
            this.flushSaveQueue();
            return;
        }
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }
        this.saveTimer = setTimeout(() => {
            this.flushSaveQueue();
        }, this.SAVE_DEBOUNCE_MS);
    },

    /**
     * 解锁新关卡
     * @param {number} levelId 
     */
    unlockLevel(levelId) {
        const data = this.getData();
        if (!data.unlockedLevels.includes(levelId)) {
            data.unlockedLevels.push(levelId);
            this.saveData(data);
            Logger.info(`关卡 ${levelId} 已解锁`);
        }
    },

    /**
     * 保存关卡成绩 (保存每一次记录，用于筛选统计)
     */
    saveLevelResult(levelId, wpm, acc, stars, timeStr = null) {
        const data = this.getData();
        if (!data.levelStats[levelId]) {
            data.levelStats[levelId] = [];
        }
        
        // 兼容老数据结构
        if (!Array.isArray(data.levelStats[levelId])) {
            data.levelStats[levelId] = [data.levelStats[levelId]];
        }

        data.levelStats[levelId].push({
            wpm,
            acc,
            stars,
            timeStr,
            timestamp: Date.now()
        });
        this.scheduleReviewTasks(data, levelId);
        
        this.saveData(data);
    },

    /**
     * 为指定关卡安排遗忘曲线回访任务（1/3/7天）
     * @param {Object} data
     * @param {number} levelId
     */
    scheduleReviewTasks(data, levelId) {
        if (!data.reviewTasks) {
            data.reviewTasks = [];
        }
        const offsets = [
            { stage: 'D1', days: 1 },
            { stage: 'D3', days: 3 },
            { stage: 'D7', days: 7 }
        ];
        const now = Date.now();
        offsets.forEach(({ stage, days }) => {
            const exists = data.reviewTasks.some(task =>
                task.levelId === levelId &&
                task.stage === stage &&
                task.status === 'pending'
            );
            if (exists) {
                return;
            }
            const dueAt = now + days * 24 * 60 * 60 * 1000;
            data.reviewTasks.push({
                taskId: `${levelId}-${stage}-${now}`,
                levelId,
                stage,
                dueAt,
                status: 'pending',
                createdAt: now,
                completedAt: null
            });
        });
    },

    /**
     * 获取回访任务（可筛选到期任务）
     * @param {number} limit
     * @param {boolean} onlyDue
     * @returns {Array}
     */
    getReviewTasks(limit = 5, onlyDue = false) {
        const data = this.getData();
        const now = Date.now();
        const pending = (data.reviewTasks || [])
            .filter(task => task.status === 'pending')
            .filter(task => !onlyDue || task.dueAt <= now)
            .sort((a, b) => a.dueAt - b.dueAt);
        return limit === 0 ? pending : pending.slice(0, limit);
    },

    /**
     * 完成指定关卡的到期回访任务
     * @param {number} levelId
     */
    completeDueReviewTaskByLevel(levelId) {
        const data = this.getData();
        const now = Date.now();
        const task = (data.reviewTasks || [])
            .filter(item => item.levelId === levelId && item.status === 'pending' && item.dueAt <= now)
            .sort((a, b) => a.dueAt - b.dueAt)[0];
        if (!task) {
            return;
        }
        task.status = 'done';
        task.completedAt = now;
        this.saveData(data);
    },

    postponeReviewTask(taskId, days = 1) {
        const data = this.getData();
        const now = Date.now();
        const task = (data.reviewTasks || []).find(item => item.taskId === taskId && item.status === 'pending');
        if (!task) {
            return false;
        }
        task.dueAt = Math.max(task.dueAt, now) + (days * 24 * 60 * 60 * 1000);
        this.saveData(data);
        return true;
    },

    skipReviewTask(taskId) {
        const data = this.getData();
        const now = Date.now();
        const task = (data.reviewTasks || []).find(item => item.taskId === taskId && item.status === 'pending');
        if (!task) {
            return false;
        }
        task.status = 'skipped';
        task.completedAt = now;
        this.saveData(data);
        return true;
    },

    getWeeklyReviewDoneCount() {
        const data = this.getData();
        const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return (data.reviewTasks || []).filter(task =>
            task.status === 'done' &&
            typeof task.completedAt === 'number' &&
            task.completedAt >= weekStart
        ).length;
    },

    /**
     * 获取指定关卡的最高成绩（兼容 UI 显示需要）
     */
    getBestLevelStat(levelId) {
        const data = this.getData();
        const records = data.levelStats[levelId];
        if (!records || !Array.isArray(records) || records.length === 0) return null;

        return records.reduce((best, current) => {
            return {
                wpm: Math.max(best.wpm || 0, current.wpm),
                acc: Math.max(best.acc || 0, current.acc),
                stars: Math.max(best.stars || 0, current.stars)
            };
        }, { wpm: 0, acc: 0, stars: 0 });
    },
    
    /**
     * 判断关卡是否解锁
     * @param {number} levelId 
     * @returns {boolean}
     */
    isLevelUnlocked(levelId) {
        return this.getData().unlockedLevels.includes(levelId);
    },

    /**
     * 获取音效设置
     */
    getSoundEnabled() {
        return this.getData().settings.soundEnabled;
    },

    /**
     * 切换音效设置
     */
    toggleSound() {
        const data = this.getData();
        data.settings.soundEnabled = !data.settings.soundEnabled;
        this.saveData(data);
        return data.settings.soundEnabled;
    },

    /**
     * 记录按键统计 (包含总数和错误数)
     * @param {string} key 
     * @param {boolean} isError 
     */
    recordKeyStat(key, isError) {
        const data = this.getData();
        if (!data.errorStats) data.errorStats = {};
        
        const lowerKey = key.toLowerCase();
        
        // 兼容老数据结构
        if (typeof data.errorStats[lowerKey] === 'number') {
            data.errorStats[lowerKey] = { errors: data.errorStats[lowerKey], total: data.errorStats[lowerKey] };
        }
        if (!data.errorStats[lowerKey]) {
            data.errorStats[lowerKey] = { errors: 0, total: 0 };
        }
        
        data.errorStats[lowerKey].total += 1;
        if (isError) {
            data.errorStats[lowerKey].errors += 1;
        }
        
        this.saveData(data);
    },

    /**
     * 获取易错按键排行榜
     * @param {number} limit 
     * @param {string} sortBy 排序字段: 'acc' | 'count'
     * @param {string} order 排序顺序: 'asc' | 'desc'
     */
    getTopErrorKeys(limit = 10, sortBy = 'acc', order = 'asc') {
        const data = this.getData();
        if (!data.errorStats) return [];
        
        const entries = Object.entries(data.errorStats)
            .filter(([k, v]) => {
                const stats = typeof v === 'object' ? v : { errors: v, total: v };
                return stats.total >= 5; // 至少按过5次才参与统计
            })
            .map(([k, v]) => {
                const stats = typeof v === 'object' ? v : { errors: v, total: v };
                const acc = ((stats.total - stats.errors) / stats.total) * 100;
                return { key: k, acc: acc, errors: stats.errors, total: stats.total };
            });
            
        // 排序逻辑
        entries.sort((a, b) => {
            let valA, valB;
            if (sortBy === 'acc') {
                valA = a.acc;
                valB = b.acc;
            } else {
                valA = a.errors;
                valB = b.errors;
            }
            
            return order === 'asc' ? valA - valB : valB - valA;
        });
        
        return limit === 0 ? entries : entries.slice(0, limit);
    },
    
    /**
     * 清空全部存储数据，并恢复为默认结构
     */
    clearAllData() {
        this.saveData(this.cloneDefaultData(), { immediate: true });
        Logger.info('本地存储数据已重置为默认值');
    },

    exportBackup() {
        const payload = {
            version: 1,
            exportedAt: Date.now(),
            data: this.getData()
        };
        return JSON.stringify(payload, null, 2);
    },

    importBackup(rawText) {
        if (!rawText || typeof rawText !== 'string') {
            throw new Error('备份文件内容为空');
        }
        let parsed;
        try {
            parsed = JSON.parse(rawText);
        } catch (error) {
            throw new Error('备份文件不是有效的 JSON');
        }
        const candidate = parsed && parsed.data ? parsed.data : parsed;
        const normalized = this.normalizeData(candidate);
        this.saveData(normalized, { immediate: true });
        return true;
    }
};
