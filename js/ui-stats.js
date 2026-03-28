Object.assign(UI, {
    getFilteredBestStat(records, timeFilter) {
        if (!records || !Array.isArray(records) || records.length === 0) return null;
        const now = Date.now();
        let filtered = records;
        if (timeFilter === 'today') {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            filtered = records.filter(r => r.timestamp >= todayStart.getTime());
        } else if (timeFilter === 'week') {
            const weekStart = now - 7 * 24 * 60 * 60 * 1000;
            filtered = records.filter(r => r.timestamp >= weekStart);
        }
        if (filtered.length === 0) return null;
        return filtered.reduce((best, current) => {
            const currentTimeSec = this.parseTimeToSeconds(current.timeStr);
            const bestTimeSec = best.bestTimeSec === null
                ? currentTimeSec
                : (currentTimeSec === null ? best.bestTimeSec : Math.min(best.bestTimeSec, currentTimeSec));
            return {
                wpm: Math.max(best.wpm || 0, current.wpm),
                acc: Math.max(best.acc || 0, current.acc),
                stars: Math.max(best.stars || 0, current.stars),
                bestTimeSec,
                timeStr: bestTimeSec === null ? '--' : this.formatSecondsToTime(bestTimeSec)
            };
        }, { wpm: 0, acc: 0, stars: 0, bestTimeSec: null, timeStr: '--' });
    },

    parseTimeToSeconds(timeStr) {
        if (typeof timeStr !== 'string' || !timeStr.includes(':')) return null;
        const [m, s] = timeStr.split(':');
        const minutes = Number(m);
        const seconds = Number(s);
        if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return null;
        if (minutes < 0 || seconds < 0) return null;
        return (minutes * 60) + seconds;
    },

    formatSecondsToTime(totalSeconds) {
        if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '--';
        const sec = Math.floor(totalSeconds);
        const minutes = Math.floor(sec / 60);
        const seconds = sec % 60;
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    },

    initStatsSwitcher() {
        if (this.statsSwitcherInited) return;
        if (!this.els.statsMobileSwitcher || !this.els.btnStatsTabHistory || !this.els.btnStatsTabErrors) return;
        this.els.btnStatsTabHistory.addEventListener('click', () => {
            this.setStatsTab('history');
        });
        this.els.btnStatsTabErrors.addEventListener('click', () => {
            this.setStatsTab('errors');
        });
        window.addEventListener('resize', () => {
            this.syncStatsSwitcherLayout();
        });
        this.statsSwitcherInited = true;
        this.syncStatsSwitcherLayout();
    },

    setStatsTab(tab) {
        this.currentStatsTab = tab === 'errors' ? 'errors' : 'history';
        const showHistory = this.currentStatsTab === 'history';
        if (this.els.statsDetailsContainer) {
            this.els.statsDetailsContainer.classList.toggle('hidden', !showHistory);
        }
        if (this.els.statsErrorsContainer) {
            this.els.statsErrorsContainer.classList.toggle('hidden', showHistory);
        }
        if (this.els.btnStatsTabHistory) {
            this.els.btnStatsTabHistory.classList.toggle('active', showHistory);
        }
        if (this.els.btnStatsTabErrors) {
            this.els.btnStatsTabErrors.classList.toggle('active', !showHistory);
        }
    },

    syncStatsSwitcherLayout() {
        const isCompact = window.innerWidth <= this.statsCompactBreakpoint;
        if (!this.els.statsMobileSwitcher) return;
        if (!isCompact) {
            this.els.statsMobileSwitcher.classList.add('hidden');
            if (this.els.statsDetailsContainer) {
                this.els.statsDetailsContainer.classList.remove('hidden');
            }
            if (this.els.statsErrorsContainer) {
                this.els.statsErrorsContainer.classList.remove('hidden');
            }
            return;
        }
        this.els.statsMobileSwitcher.classList.remove('hidden');
        this.setStatsTab(this.currentStatsTab);
    },

    renderStatsDashboard(timeFilter = 'all') {
        this.initStatsSwitcher();
        const data = Store.getData();
        const levels = getAllLevels();
        document.getElementById('dashboard-total-levels').textContent = levels.length;
        document.getElementById('dashboard-unlocked').textContent = data.unlockedLevels.length;
        let totalAcc = 0;
        let totalWpm = 0;
        let playedCount = 0;
        const detailsList = document.getElementById('stats-details-list');
        detailsList.innerHTML = '';
        levels.forEach(level => {
            const stats = this.getFilteredBestStat(data.levelStats[level.id], timeFilter);
            const row = document.createElement('div');
            if (stats) {
                row.className = 'detail-row';
                totalAcc += stats.acc;
                totalWpm += stats.wpm;
                playedCount++;
                row.innerHTML = `
                    <div><strong>关卡 ${level.id}:</strong> ${level.title}</div>
                    <div>速度: ${stats.wpm} 次/分 | 准确率: ${stats.acc}% | 用时: ${stats.timeStr} | 星星: ${'★'.repeat(stats.stars)}</div>
                `;
            } else {
                row.className = 'detail-row not-played';
                row.innerHTML = `
                    <div><strong>关卡 ${level.id}:</strong> ${level.title}</div>
                    <div>${timeFilter === 'all' ? '尚未练习' : '该时间段内无记录'}</div>
                `;
            }
            detailsList.appendChild(row);
        });
        const avgAcc = playedCount > 0 ? Math.round(totalAcc / playedCount) : 0;
        const avgWpm = playedCount > 0 ? Math.round(totalWpm / playedCount) : 0;
        document.getElementById('dashboard-avg-acc').textContent = `${avgAcc}%`;
        document.getElementById('dashboard-avg-wpm').textContent = avgWpm;
        const doneCount = Store.getWeeklyReviewDoneCount();
        const doneEl = document.getElementById('dashboard-review-done-week');
        if (doneEl) {
            doneEl.textContent = doneCount;
        }
        this.renderGrowthAndBadges(data);
        this.bindBadgeDetailEvents();
        this.renderErrorStatsList();
        this.syncStatsSwitcherLayout();
    },

    renderGrowthAndBadges(data) {
        const records = this.flattenRecords(data.levelStats);
        const thisWeekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const prevWeekStart = Date.now() - 14 * 24 * 60 * 60 * 1000;
        const thisWeek = records.filter(r => r.timestamp >= thisWeekStart);
        const prevWeek = records.filter(r => r.timestamp >= prevWeekStart && r.timestamp < thisWeekStart);
        const thisWeekAvg = this.calculateAverage(thisWeek);
        const prevWeekAvg = this.calculateAverage(prevWeek);
        const deltaAcc = Math.round((thisWeekAvg.acc - prevWeekAvg.acc) * 10) / 10;
        const deltaWpm = Math.round((thisWeekAvg.wpm - prevWeekAvg.wpm) * 10) / 10;
        if (this.els.growthSummary) {
            this.els.growthSummary.textContent = `本周较上周：准确率 ${deltaAcc >= 0 ? '+' : ''}${deltaAcc}% ｜ 速度 ${deltaWpm >= 0 ? '+' : ''}${deltaWpm} 次/分`;
        }
        if (this.els.badgeList) {
            const badges = this.getBadgeList(records);
            this.els.badgeList.innerHTML = badges.map(item => `<button class="badge-chip" data-badge-id="${item.id}">${item.label}</button>`).join('');
        }
    },

    flattenRecords(levelStats) {
        const records = [];
        Object.values(levelStats || {}).forEach(list => {
            if (Array.isArray(list)) {
                list.forEach(item => records.push(item));
            }
        });
        return records;
    },

    calculateAverage(records) {
        if (!records || records.length === 0) return { acc: 0, wpm: 0 };
        const sum = records.reduce((acc, item) => {
            acc.acc += item.acc || 0;
            acc.wpm += item.wpm || 0;
            return acc;
        }, { acc: 0, wpm: 0 });
        return {
            acc: sum.acc / records.length,
            wpm: sum.wpm / records.length
        };
    },

    getBadgeList(records) {
        const badges = [];
        const count = records.length;
        const highAccCount = records.filter(r => r.acc >= 95).length;
        const highSpeedCount = records.filter(r => r.wpm >= 120).length;
        if (highAccCount >= 5) badges.push({ id: 'acc-master', label: '🎯 准确达人', progress: `${Math.min(highAccCount, 5)}/5` });
        if (count >= 20) badges.push({ id: 'persistence', label: '🔥 坚持之星', progress: `${Math.min(count, 20)}/20` });
        if (highSpeedCount >= 5) badges.push({ id: 'speed-breakthrough', label: '⚡ 速度突破', progress: `${Math.min(highSpeedCount, 5)}/5` });
        const lowAccThenHighAcc = this.hasComeback(records);
        if (lowAccThenHighAcc) badges.push({ id: 'comeback', label: '🌱 逆袭徽章', progress: '已达成' });
        if (badges.length === 0) badges.push({ id: 'newbie', label: '🧩 新手起航', progress: `${Math.min(count, 5)}/5` });
        return badges;
    },

    getBadgeDetailMap(records) {
        const count = records.length;
        const highAccCount = records.filter(r => r.acc >= 95).length;
        const highSpeedCount = records.filter(r => r.wpm >= 120).length;
        const comeback = this.hasComeback(records);
        return {
            'acc-master': {
                title: '🎯 准确达人',
                desc: '累计 5 次准确率达到 95% 及以上。',
                progress: `${Math.min(highAccCount, 5)}/5`
            },
            'persistence': {
                title: '🔥 坚持之星',
                desc: '累计完成 20 次关卡练习。',
                progress: `${Math.min(count, 20)}/20`
            },
            'speed-breakthrough': {
                title: '⚡ 速度突破',
                desc: '累计 5 次速度达到 120 次/分及以上。',
                progress: `${Math.min(highSpeedCount, 5)}/5`
            },
            'comeback': {
                title: '🌱 逆袭徽章',
                desc: '前半程平均准确率低于 85%，后半程提升到 92% 及以上。',
                progress: comeback ? '已达成' : '未达成'
            },
            'newbie': {
                title: '🧩 新手起航',
                desc: '完成前 5 次练习后将解锁下一枚成长徽章。',
                progress: `${Math.min(count, 5)}/5`
            }
        };
    },

    bindBadgeDetailEvents() {
        if (!this.els.badgeList) return;
        const records = this.flattenRecords(Store.getData().levelStats);
        const details = this.getBadgeDetailMap(records);
        this.els.badgeList.querySelectorAll('.badge-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const id = chip.getAttribute('data-badge-id');
                const detail = details[id];
                if (!detail || !this.els.badgeDetailModal) return;
                this.els.badgeDetailTitle.textContent = detail.title;
                this.els.badgeDetailDesc.textContent = detail.desc;
                this.els.badgeDetailProgress.textContent = `当前进度：${detail.progress}`;
                this.els.badgeDetailModal.classList.remove('hidden');
            });
        });
        if (this.els.btnBadgeDetailClose && this.els.badgeDetailModal) {
            this.els.btnBadgeDetailClose.onclick = () => {
                this.els.badgeDetailModal.classList.add('hidden');
            };
        }
    },

    hasComeback(records) {
        if (records.length < 6) return false;
        const sorted = records.slice().sort((a, b) => a.timestamp - b.timestamp);
        const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
        const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
        const firstAvg = this.calculateAverage(firstHalf);
        const secondAvg = this.calculateAverage(secondHalf);
        return firstAvg.acc < 85 && secondAvg.acc >= 92;
    },

    renderErrorStatsList() {
        const sortSelect = document.getElementById('stats-error-sort');
        const sortVal = sortSelect ? sortSelect.value : 'acc-asc';
        const [sortBy, order] = sortVal.split('-');
        const errorsList = document.getElementById('stats-errors-list');
        if (!errorsList) return;
        errorsList.innerHTML = '';
        const topErrors = Store.getTopErrorKeys(10, sortBy, order);
        if (topErrors.length === 0) {
            errorsList.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">太棒了，目前没有明显易错的按键记录！</div>';
            return;
        }
        topErrors.forEach(err => {
            const row = document.createElement('div');
            row.className = 'error-row';
            row.innerHTML = `
                <div>
                    <span class="error-key-display">${err.key.toUpperCase()}</span>
                    <span>错误次数: <strong>${err.errors}</strong> / 总按键数: ${err.total}</span>
                </div>
                <div>
                    <span style="color: var(--error-color); font-weight: bold; font-size: 20px;">正确率: ${Math.round(err.acc)}%</span>
                </div>
            `;
            errorsList.appendChild(row);
        });
    }
});
