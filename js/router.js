const Router = {
    queuedNextLevelIdAfterReview: null,

    resetQueueForLevel(levelId) {
        if (levelId !== 999) {
            this.queuedNextLevelIdAfterReview = null;
        }
    },

    resolveNextAction(currentLevel) {
        if (!currentLevel) {
            return { type: 'show-level-selection' };
        }
        const dueTasks = Store.getReviewTasks(1, true);
        if (dueTasks.length > 0 && currentLevel.id !== dueTasks[0].levelId) {
            return { type: 'start-level', levelId: dueTasks[0].levelId };
        }

        if (currentLevel.id === 999 && this.queuedNextLevelIdAfterReview) {
            const queuedLevelId = this.queuedNextLevelIdAfterReview;
            this.queuedNextLevelIdAfterReview = null;
            return { type: 'start-level', levelId: queuedLevelId };
        }

        if (currentLevel.id !== 999 && currentLevel.id % 5 === 0) {
            const nextIdAfterReview = currentLevel.id + 1;
            const hasNextLevel = !!getLevelById(nextIdAfterReview);
            const hasErrorKeys = Store.getTopErrorKeys(3).length > 0;
            if (hasNextLevel && hasErrorKeys) {
                this.queuedNextLevelIdAfterReview = nextIdAfterReview;
                return { type: 'start-level', levelId: 999 };
            }
        }

        const nextId = currentLevel.id + 1;
        if (Store.isLevelUnlocked(nextId)) {
            return { type: 'start-level', levelId: nextId };
        }
        return { type: 'show-level-selection', reason: 'locked' };
    }
};
