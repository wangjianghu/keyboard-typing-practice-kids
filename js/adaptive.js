const Adaptive = {
    windowSize: 10,
    recentResults: [],

    isRegularLevel(levelId) {
        return levelId > 0 && levelId < 999;
    },

    recordResult(resultFlags, acc, wpm) {
        const entry = {
            passReached: !!resultFlags?.passReached,
            perfectReached: !!resultFlags?.perfectReached,
            acc: Number(acc) || 0,
            wpm: Number(wpm) || 0,
            timestamp: Date.now()
        };
        this.recentResults.push(entry);
        if (this.recentResults.length > this.windowSize) {
            this.recentResults.shift();
        }
    },

    getTrendSummary() {
        if (this.recentResults.length === 0) {
            return {
                avgAcc: 0,
                avgWpm: 0,
                passRate: 0,
                failStreak: 0
            };
        }
        const total = this.recentResults.length;
        const sumAcc = this.recentResults.reduce((sum, item) => sum + item.acc, 0);
        const sumWpm = this.recentResults.reduce((sum, item) => sum + item.wpm, 0);
        const passCount = this.recentResults.filter(item => item.passReached).length;
        let failStreak = 0;
        for (let i = this.recentResults.length - 1; i >= 0; i--) {
            if (this.recentResults[i].passReached) {
                break;
            }
            failStreak += 1;
        }
        return {
            avgAcc: sumAcc / total,
            avgWpm: sumWpm / total,
            passRate: passCount / total,
            failStreak
        };
    },

    adjustGoals(baseGoals, trend) {
        let passAccDelta = 0;
        let passWpmDelta = 0;
        let perfectAccDelta = 0;
        let perfectWpmDelta = 0;

        if (trend.avgAcc >= 95 && trend.passRate >= 0.8) {
            passAccDelta += 2;
            passWpmDelta += 10;
            perfectAccDelta += 1;
            perfectWpmDelta += 10;
        } else if (trend.avgAcc < 82 || trend.passRate < 0.4) {
            passAccDelta -= 4;
            passWpmDelta -= 10;
            perfectAccDelta -= 3;
            perfectWpmDelta -= 8;
        }

        if (trend.failStreak >= 2) {
            passAccDelta -= 2;
            passWpmDelta -= 6;
            perfectAccDelta -= 2;
            perfectWpmDelta -= 6;
        }

        return {
            pass: {
                acc: Math.max(75, Math.min(96, baseGoals.pass.acc + passAccDelta)),
                wpm: Math.max(20, baseGoals.pass.wpm + passWpmDelta)
            },
            perfect: {
                acc: Math.max(88, Math.min(99, baseGoals.perfect.acc + perfectAccDelta)),
                wpm: Math.max(45, baseGoals.perfect.wpm + perfectWpmDelta)
            }
        };
    },

    prepareLevel(level, levelId) {
        const clonedLevel = { ...level };
        const baseGoals = getGoalConfigByLevel(clonedLevel);
        const trend = this.getTrendSummary();
        clonedLevel.goals = this.adjustGoals(baseGoals, trend);

        if (this.isRegularLevel(levelId)) {
            clonedLevel.text = buildAdaptivePracticeText(clonedLevel.text, {
                enableWeaknessDriven: levelId > 5,
                enableProtectionMode: trend.failStreak >= 2
            });
        }

        return clonedLevel;
    }
};
