/**
 * 全局日志监控模块
 * 用于在无后端环境下记录应用运行状态和错误
 */
const Logger = {
    logs: [],
    
    /**
     * 记录普通信息
     * @param {string} msg 
     * @param {object} data 
     */
    info(msg, data = null) {
        this._log('INFO', msg, data);
    },

    /**
     * 记录警告信息
     * @param {string} msg 
     * @param {object} data 
     */
    warn(msg, data = null) {
        this._log('WARN', msg, data);
    },

    /**
     * 记录错误信息
     * @param {string} msg 
     * @param {Error|object} error 
     */
    error(msg, error = null) {
        this._log('ERROR', msg, error);
    },

    /**
     * 内部记录方法
     */
    _log(level, msg, data) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, level, msg, data };
        this.logs.push(logEntry);
        
        // 开发阶段直接打印到控制台
        if (level === 'ERROR') {
            console.error(`[${timestamp}] [${level}] ${msg}`, data || '');
        } else if (level === 'WARN') {
            console.warn(`[${timestamp}] [${level}] ${msg}`, data || '');
        } else {
            console.log(`[${timestamp}] [${level}] ${msg}`, data || '');
        }

        // 可以选择持久化到 localStorage 中以备排查
        try {
            localStorage.setItem('typing_logs', JSON.stringify(this.logs.slice(-50))); // 仅保留最近50条
        } catch (e) {
            console.error('日志持久化失败', e);
        }
    }
};

// 捕获全局错误
window.addEventListener('error', (event) => {
    Logger.error('未捕获的全局错误', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});
