Object.assign(UI, {
    formatLevelTitle(title) {
        return title.replace(/([A-Za-z;]+)/g, '<span class="key-font">$1</span>');
    },

    removeEmojiForLevelScreen(text) {
        return String(text || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
    },

    formatSpecialTitle(title) {
        if (title.includes('（') && title.includes('）')) {
            return title.replace('（', '<br><span class="level-card-title-sub">').replace('）', '</span>');
        }
        if (title.includes('(') && title.includes(')')) {
            return title.replace('(', '<br><span class="level-card-title-sub">').replace(')', '</span>');
        }
        return title;
    },

    renderLevelGrid(onLevelSelect) {
        this.els.levelGrid.innerHTML = '';
        const data = Store.getData();
        const levels = getAllLevels();
        const recommendations = this.getRecommendedLevels(levels, data);
        const dueTasks = Store.getReviewTasks(3, true);
        if (dueTasks.length > 0) {
            const reviewCard = document.createElement('div');
            reviewCard.className = 'level-card unlocked special-level special-review';
            reviewCard.innerHTML = `
                <h3 class="level-card-title">今日回访任务</h3>
                <p class="level-card-meta">${dueTasks.map(task => `关卡${task.levelId}（${task.stage}）`).join(' / ')}</p>
            `;
            reviewCard.addEventListener('click', () => onLevelSelect(dueTasks[0].levelId));
            this.els.levelGrid.appendChild(reviewCard);
        }
        if (recommendations.length > 0) {
            const recCard = document.createElement('div');
            recCard.className = 'level-card unlocked special-level special-recommend';
            recCard.innerHTML = `
                <h3 class="level-card-title">今日推荐</h3>
                <p class="level-card-meta">${recommendations.map(level => `关卡${level.id}`).join(' / ')}</p>
            `;
            recCard.addEventListener('click', () => onLevelSelect(recommendations[0].id));
            this.els.levelGrid.appendChild(recCard);
        }
        levels.forEach(level => {
            const isUnlocked = data.unlockedLevels.includes(level.id);
            const stats = Store.getBestLevelStat(level.id);
            let statusText = '未练习';
            let statusClass = 'status-not-started';
            if (!isUnlocked) {
                statusText = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
                statusClass = 'status-locked';
            } else if (stats && stats.stars > 0) {
                statusText = '已通关';
                statusClass = 'status-passed';
            } else if (stats) {
                statusText = '待提升';
                statusClass = 'status-improving';
            }
            const card = document.createElement('div');
            card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            let starsHtml = '';
            if (stats && stats.stars > 0) {
                starsHtml = `<div style="color: gold; font-size: 20px;">${'★'.repeat(stats.stars)}</div>`;
            }
            const formattedTitle = this.formatLevelTitle(level.title);
            card.innerHTML = `
                <span class="level-status-badge ${statusClass}">${statusText}</span>
                <h3>关卡 ${level.id}</h3>
                <p>${formattedTitle}</p>
                <p style="font-size: 14px; color: #666; margin-top: 6px;">阶段：${level.stage || '基础训练'} · 重点：${level.focus || '准确率优先'}</p>
                ${starsHtml}
            `;
            if (isUnlocked) {
                card.addEventListener('click', () => onLevelSelect(level.id));
            }
            this.els.levelGrid.appendChild(card);
        });
        const errorLevel = getErrorReviewLevel();
        if (errorLevel) {
            const errorKeys = Store.getTopErrorKeys().map(obj => obj.key);
            const errorCard = document.createElement('div');
            errorCard.className = 'level-card unlocked special-level special-error-review';
            errorCard.innerHTML = `
                <h3 class="level-card-title">专属复习关</h3>
                <p class="level-card-meta">针对易错按键：<span class="key-font">${errorKeys.join(', ').toUpperCase()}</span></p>
            `;
            errorCard.addEventListener('click', () => onLevelSelect(999));
            this.els.levelGrid.insertBefore(errorCard, this.els.levelGrid.firstChild);
        }
        getConfusionLevels().forEach(level => {
            const card = document.createElement('div');
            card.className = 'level-card unlocked special-level special-confusion';
            const title = this.removeEmojiForLevelScreen(level.title);
            const formattedTitle = this.formatSpecialTitle(title);
            card.innerHTML = `
                <h3 class="level-card-title">${formattedTitle}</h3>
                <p class="level-card-meta">${level.description}</p>
            `;
            card.addEventListener('click', () => onLevelSelect(level.id));
            this.els.levelGrid.appendChild(card);
        });
        getFingerWeakLevels().forEach(level => {
            const card = document.createElement('div');
            card.className = 'level-card unlocked special-level special-finger';
            const title = this.removeEmojiForLevelScreen(level.title);
            const formattedTitle = this.formatSpecialTitle(title);
            card.innerHTML = `
                <h3 class="level-card-title">${formattedTitle}</h3>
                <p class="level-card-meta">${level.description}</p>
            `;
            card.addEventListener('click', () => onLevelSelect(level.id));
            this.els.levelGrid.appendChild(card);
        });
        getContentPackLevels().forEach(level => {
            const card = document.createElement('div');
            card.className = 'level-card unlocked special-level special-content-pack';
            const title = this.removeEmojiForLevelScreen(level.title);
            const formattedTitle = this.formatSpecialTitle(title);
            card.innerHTML = `
                <h3 class="level-card-title">${formattedTitle}</h3>
                <p class="level-card-meta">${level.description}</p>
            `;
            card.addEventListener('click', () => onLevelSelect(level.id));
            this.els.levelGrid.appendChild(card);
        });
        this.renderReviewTaskPanel();
    },

    renderReviewTaskPanel() {
        if (!this.els.levelReviewTaskPanel) return;
        const dueTasks = Store.getReviewTasks(8, true);
        if (dueTasks.length === 0) {
            this.els.levelReviewTaskPanel.classList.add('hidden');
            this.els.levelReviewTaskPanel.innerHTML = '';
            return;
        }
        this.els.levelReviewTaskPanel.classList.remove('hidden');
        const rows = dueTasks.map(task => `
            <div class="review-task-row">
                <div>关卡 ${task.levelId} · ${task.stage} · 已到期</div>
                <div class="review-task-actions">
                    <button class="btn secondary btn-mini" data-review-action="practice" data-task-id="${task.taskId}" data-level-id="${task.levelId}">去练习</button>
                    <button class="btn secondary btn-mini" data-review-action="delay" data-task-id="${task.taskId}" data-level-id="${task.levelId}">延后1天</button>
                    <button class="btn secondary btn-mini" data-review-action="skip" data-task-id="${task.taskId}" data-level-id="${task.levelId}">跳过一次</button>
                </div>
            </div>
        `).join('');
        this.els.levelReviewTaskPanel.innerHTML = `
            <div class="review-task-title">回访任务队列（到期优先）</div>
            ${rows}
        `;
    },

    getRecommendedLevels(levels, data) {
        const now = Date.now();
        return levels
            .filter(level => data.unlockedLevels.includes(level.id))
            .map(level => {
                const records = data.levelStats[level.id] || [];
                const latest = records[records.length - 1];
                const best = this.getFilteredBestStat(records, 'all');
                let score = 0;
                if (!latest) score += 120;
                if (best) {
                    score += Math.max(0, 100 - best.acc);
                    score += Math.max(0, 90 - best.wpm) * 0.7;
                } else {
                    score += 120;
                }
                if (latest) {
                    const days = (now - latest.timestamp) / (24 * 60 * 60 * 1000);
                    if (days >= 7) score += 35;
                    else if (days >= 3) score += 20;
                    else if (days >= 1) score += 10;
                } else {
                    score += 30;
                }
                return { level, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(item => item.level);
    }
});
