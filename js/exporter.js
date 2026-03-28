const Exporter = {
    async exportStatsToCSV() {
        const data = Store.getData();
        const levels = getAllLevels();
        const errorStats = Store.getTopErrorKeys(0, 'acc', 'asc');
        let totalAcc = 0;
        let totalWpm = 0;
        let playedCount = 0;

        levels.forEach(level => {
            const stats = UI.getFilteredBestStat(data.levelStats[level.id], 'all');
            if (!stats) {
                return;
            }
            totalAcc += stats.acc;
            totalWpm += stats.wpm;
            playedCount += 1;
        });

        const avgAcc = `${playedCount > 0 ? Math.round(totalAcc / playedCount) : 0}%`;
        const avgWpm = `${playedCount > 0 ? Math.round(totalWpm / playedCount) : 0} 次/分`;
        const reviewDoneWeek = Store.getWeeklyReviewDoneCount();

        const overviewRows = [
            ['项目', '数值'],
            ['总关卡数', levels.length],
            ['已解锁关卡', data.unlockedLevels.length],
            ['平均准确率', avgAcc],
            ['总平均速度', avgWpm],
            ['本周回访完成', `${reviewDoneWeek} 次`]
        ];

        const levelRows = [['关卡ID', '标题', '最高速度(次/分)', '最高准确率(%)', '最高星级']];
        if (levels.length === 0) {
            levelRows.push(['-', '无数据', '-', '-', '-']);
        } else {
            levels.forEach(level => {
                const stats = UI.getFilteredBestStat(data.levelStats[level.id], 'all');
                if (stats) {
                    levelRows.push([level.id, level.title, stats.wpm, stats.acc, stats.stars]);
                } else {
                    levelRows.push([level.id, level.title, '未练习', '未练习', '未练习']);
                }
            });
        }

        const errorRows = [['按键', '错误次数', '总次数', '正确率(%)']];
        if (errorStats.length === 0) {
            errorRows.push(['-', 0, 0, 0]);
        } else {
            errorStats.forEach(err => {
                errorRows.push([err.key.toUpperCase(), err.errors, err.total, Math.round(err.acc)]);
            });
        }

        const workbookXml = this.createExcelWorkbookXml([
            { name: '数据看板概览', rows: overviewRows },
            { name: '关卡历史记录', rows: levelRows },
            { name: '按键易错统计', rows: errorRows }
        ]);

        const blob = new Blob([workbookXml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().slice(0, 10);

        link.setAttribute('href', url);
        link.setAttribute('download', `键盘练习数据_${date}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();

        await new Promise(resolve => setTimeout(resolve, 180));
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    exportBackupJson() {
        const payload = Store.exportBackup();
        const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().replace(/[:.]/g, '-');
        link.setAttribute('href', url);
        link.setAttribute('download', `键盘练习备份_${date}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    createExcelWorkbookXml(sheets) {
        const header = [
            '<?xml version="1.0"?>',
            '<?mso-application progid="Excel.Sheet"?>',
            '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"',
            ' xmlns:o="urn:schemas-microsoft-com:office:office"',
            ' xmlns:x="urn:schemas-microsoft-com:office:excel"',
            ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
            '<Styles>',
            '<Style ss:ID="Header"><Font ss:Bold="1"/></Style>',
            '</Styles>'
        ].join('');

        const body = sheets.map(sheet => {
            const rowsXml = sheet.rows.map((row, rowIndex) => {
                const cellsXml = row.map(cell => {
                    const type = typeof cell === 'number' ? 'Number' : 'String';
                    return `<Cell${rowIndex === 0 ? ' ss:StyleID="Header"' : ''}><Data ss:Type="${type}">${this.escapeXml(String(cell))}</Data></Cell>`;
                }).join('');
                return `<Row>${cellsXml}</Row>`;
            }).join('');
            return `<Worksheet ss:Name="${this.escapeXml(sheet.name)}"><Table>${rowsXml}</Table></Worksheet>`;
        }).join('');

        return `${header}${body}</Workbook>`;
    },

    escapeXml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
};
