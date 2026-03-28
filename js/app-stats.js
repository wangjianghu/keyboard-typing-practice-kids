function bindStatsEvents() {
    UI.els.levelScreen.querySelector('#btn-view-stats').addEventListener('click', () => {
        const timeFilter = document.getElementById('stats-time-filter').value;
        UI.renderStatsDashboard(timeFilter);
        UI.showScreen('stats-screen');
    });

    document.getElementById('stats-time-filter').addEventListener('change', (e) => {
        UI.renderStatsDashboard(e.target.value);
    });

    document.getElementById('stats-error-sort').addEventListener('change', () => {
        UI.renderErrorStatsList();
    });

    bindExportCsvEvent();
    bindBackupEvents();
    bindClearDataEvent();

    document.getElementById('btn-back-from-stats').addEventListener('click', () => {
        UI.showScreen('level-screen');
    });
}

function bindExportCsvEvent() {
    const btnExportCsv = document.getElementById('btn-export-csv');
    btnExportCsv?.addEventListener('click', async () => {
        if (AppState.exportingCsv) return;
        AppState.exportingCsv = true;
        const originalText = btnExportCsv.textContent;
        setButtonLoading(btnExportCsv, true, '导出中，请稍候...');
        try {
            await Exporter.exportStatsToCSV();
            alert('导出成功，已开始下载到本地。');
            Logger.info('CSV 导出成功');
        } catch (error) {
            Logger.error('CSV 导出失败', error);
            alert('导出失败，请重试');
        } finally {
            setButtonLoading(btnExportCsv, false, originalText);
            AppState.exportingCsv = false;
        }
    });
}

function bindBackupEvents() {
    const btnExportBackup = document.getElementById('btn-export-backup');
    btnExportBackup?.addEventListener('click', () => {
        try {
            Exporter.exportBackupJson();
            alert('备份导出成功，请妥善保存该 JSON 文件。');
        } catch (error) {
            Logger.error('导出备份失败', error);
            alert('备份导出失败，请重试。');
        }
    });

    const btnImportBackup = document.getElementById('btn-import-backup');
    const inputImportBackup = document.getElementById('input-import-backup');
    btnImportBackup?.addEventListener('click', () => {
        if (!inputImportBackup) {
            return;
        }
        inputImportBackup.value = '';
        inputImportBackup.click();
    });

    inputImportBackup?.addEventListener('change', async (event) => {
        const file = event.target?.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            Store.importBackup(text);
            refreshDashboardAndLevels();
            alert('备份恢复成功，数据已刷新。');
        } catch (error) {
            Logger.error('导入备份失败', error);
            alert(error?.message || '导入失败，请确认备份文件格式。');
        }
    });
}

function bindClearDataEvent() {
    document.getElementById('btn-clear-data').addEventListener('click', () => {
        const confirmed = confirm('确定要清空所有练习数据吗？\n\n此操作将产生以下影响：\n1. 所有关卡的练习记录（用时、准确率、星级）将被永久删除。\n2. 所有已获得的成长勋章将重置，你需要重新获得它们。\n3. 除第一关外，所有已解锁的关卡将重新变为锁定状态。\n4. 数据看板中的统计图表和历史记录将恢复到初始空状态。\n5. 关卡选择页将恢复到默认初始状态。\n\n温馨提示：此操作不可撤销，建议在清空前确认是否真的需要重置进度。');
        if (!confirmed) return;
        Store.clearAllData();
        refreshDashboardAndLevels();
        alert('数据已清空，新的冒险开始啦！');
    });
}
