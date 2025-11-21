// src/api/report.js
// API服务模块
import api from './index.js';

export const wafReportService = {
    /* ---- 核心业务接口（走 axios，自动带 token） ---- */
    getWafStats: () => api.get('/logs/waf/stats'),

    getWafLogs: params => api.get('/logs/waf', { params }),

    generateExport: data => api.post('/logs/waf/export', data),

    downloadExport: taskId =>
        api.get(`/logs/waf/export/${taskId}`, { responseType: 'blob' }),

    /* ---- 本地历史记录（不连网） ---- */
    getExportHistory() {
        try {
            return JSON.parse(localStorage.getItem('wafExportHistory') || '[]');
        } catch {
            return [];
        }
    },

    saveExportToHistory(record) {
        const list = this.getExportHistory();
        list.unshift(record);
        if (list.length > 50) list.splice(50);
        localStorage.setItem('wafExportHistory', JSON.stringify(list));
    },

    deleteExport(taskId) {
        const list = this.getExportHistory().filter(i => i.taskId !== taskId);
        localStorage.setItem('wafExportHistory', JSON.stringify(list));
    },

    /* ---- 数据校验工具 ---- */
    validateExportData(d) {
        if (!d.name?.trim()) return { isValid: false, message: '请输入报告名称' };
        if (!d.startTime || !d.endTime) return { isValid: false, message: '请选择起止时间' };
        const start = new Date(d.startTime), end = new Date(d.endTime);
        if (start >= end) return { isValid: false, message: '开始时间必须早于结束时间' };
        const oneYear = new Date(); oneYear.setFullYear(oneYear.getFullYear() - 1);
        if (start < oneYear) return { isValid: false, message: '开始时间不能超过一年前' };
        if (d.ruleId && (isNaN(d.ruleId) || d.ruleId < 0)) return { isValid: false, message: '规则ID必须是正整数' };
        return { isValid: true };
    },

    isDuplicateReportName(name, history) {
        const low = name.toLowerCase();
        return history.some(i =>
            i.filename.toLowerCase() === `${low}.pdf` ||
            i.filename.toLowerCase() === `${low}.csv`
        );
    }
};

export default wafReportService;