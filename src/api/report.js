import apiClient from './client.js';
const api = apiClient.client;

// ================== 常量 ==================
const STORAGE_KEY = 'wafExportHistory';

// ================== 工具函数 ==================
function readHistory() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function writeHistory(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list;
}

// ================== Service ==================
export const wafReportService = {
    /* ---- 核心业务接口（真实后端） ---- */
    getWafStats: () => api.get('/logs/waf/stats'),

    getWafLogs: (params) => api.get('/logs/waf', { params }),

    /**
     * 生成导出任务（后端生成 + 前端本地落历史）
     */
    async generateExport(data) {
        // 1️⃣ 构造 payload
        const payload = {
            ...data,
            filename: data.name
        };

        // 清理空值
        Object.keys(payload).forEach((k) => {
            if (payload[k] === '' || payload[k] === null || payload[k] === undefined) {
                delete payload[k];
            }
        });

        // 2️⃣ 调用后端生成接口
        const response = await api.post('/logs/waf/export', payload);
        const resData = response.data?.data || response.data;

        // 3️⃣ 构造本地历史记录（✅ 修复点）
        if (resData?.taskId || resData?.id) {
            const record = {
                taskId: resData.taskId || resData.id,
                filename: `${payload.filename}.${data.format || 'pdf'}`,
                format: data.format || 'pdf',
                createTime: new Date().toISOString(),
                downloadUrl: resData.downloadUrl || null,
                expiresAt: resData.expiresAt || null,
                status: 'completed',
                totalReports: resData.totalReports || 0,
            };

            this.saveExportToHistory(record);
            return {
            data: resData,      // 包含 totalReports
            record: record      // 本地记录
    };
        }

        return resData;
    },
    
    /**
     * 下载导出文件
     */
    downloadExport(taskId) {
        return api.get(`/logs/waf/export/${taskId}`, {
            responseType: 'blob',
            timeout: 60000
        });
    },

    /**
     * 预览 PDF 文件
     */
    async previewExport(taskId) {
        const response = await api.get(`/logs/waf/export/${taskId}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    /* ---- 本地历史记录（伪后端） ---- */

    getExportHistory() {
        const list = readHistory();
        return list.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    },

    saveExportToHistory(record) {
        const list = readHistory();

        const idx = list.findIndex((item) => item.taskId === record.taskId);
        if (idx >= 0) {
            list[idx] = { ...list[idx], ...record };
        } else {
            list.unshift(record);
        }

        if (list.length > 100) list.splice(100);

        return writeHistory(list);
    },

    updateExportStatus(taskId, status, downloadUrl = null) {
        const list = readHistory();
        const item = list.find((i) => i.taskId === taskId);

        if (item) {
            item.status = status;
            if (downloadUrl) item.downloadUrl = downloadUrl;
            writeHistory(list);
        }

        return list;
    },

    /* ---- 校验工具 ---- */
    validateExportData(d) {
        if (!d.name?.trim()) return { isValid: false, message: '请输入报告名称' };
        if (!d.startTime || !d.endTime) return { isValid: false, message: '请选择起止时间' };

        const start = new Date(d.startTime);
        const end = new Date(d.endTime);

        if (start >= end) return { isValid: false, message: '开始时间必须早于结束时间' };


    },
}

export default wafReportService;