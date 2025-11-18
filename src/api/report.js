// src/api/report.js
// 报告中心 API 接口模块
import api from './index.js';

// 报告相关 API 接口
export const reportService = {
    // 获取全部报告列表
    loadReports: () => api.get('/reports'),

    // 生成新报告
    generateReport: data => api.post('/reports', data),

    // 预览 PDF（返回 blob）
    previewReport: id => api.get(`/reports/${id}/pdf`, { responseType: 'blob' }),

    // 下载 PDF（返回 blob，带 Content-Disposition）
    downloadReport: id => api.get(`/reports/${id}/download`, { responseType: 'blob' })
}

export const validateReportData = ({ name, startDate, endDate }) => {
    if (!name?.trim()) return { isValid: false, message: '报告名称不能为空' };
    if (!startDate || !endDate) return { isValid: false, message: '时间范围不完整' };
    if (new Date(startDate) > new Date(endDate)) return { isValid: false, message: '开始时间不能晚于结束时间' };
    return { isValid: true };
};

export const isDuplicateReportName = (name, list) =>
    list.some(r => r.title === name.trim());

export default reportService

