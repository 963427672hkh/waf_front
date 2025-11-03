// 告警管理API接口模块
import apiClient from './client.js'

const api = apiClient.client

// 告警管理相关API接口
export const alertAPI = {
  // 获取告警列表
  getAlerts: (params = {}) => api.get('/alerts', { params }),
  
  // 获取单个告警详情
  getAlertDetail: (alertId) => api.get(`/alerts/${alertId}`),
  
  // 获取告警统计信息
  getAlertStats: (params = {}) => api.get('/alerts/stats', { params }),
  
  // 更新告警状态
  updateAlertStatus: (alertId, status) => api.put(`/alerts/${alertId}/status`, { status }),
  
  // 批量更新告警状态
  batchUpdateAlertStatus: (alertIds, status) => api.put('/alerts/batch-status', { 
    alertIds, 
    status 
  }),
  
  // 添加告警处理记录
  addAlertHandleRecord: (alertId, handleInfo) => api.post(`/alerts/${alertId}/handle`, handleInfo),
  
  // 获取告警处理进度
  getAlertProgress: (alertId) => api.get(`/alerts/${alertId}/progress`),
  
  // 标记告警为已处理
  markAsHandled: (alertId) => api.put(`/alerts/${alertId}/handle`),
  
  // 批量标记告警为已处理
  batchMarkAsHandled: (alertIds) => api.put('/alerts/batch-handle', { alertIds }),
  
  // 删除告警
  deleteAlert: (alertId) => api.delete(`/alerts/${alertId}`),
  
  // 批量删除告警
  batchDeleteAlerts: (alertIds) => api.delete('/alerts/batch', { data: { alertIds } }),
  
  // 获取告警类型列表
  getAlertTypes: () => api.get('/alerts/types'),
  
  // 获取告警级别列表
  getAlertLevels: () => api.get('/alerts/levels'),
  
  // 导出告警数据
  exportAlerts: (params = {}) => api.get('/alerts/export', { 
    params,
    responseType: 'blob'
  })
}

export default alertAPI

