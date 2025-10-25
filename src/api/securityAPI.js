// 安全态势API接口模块
import api from './index.js'

// 安全态势相关API接口
export const securityAPI = {
  // 获取安全态势统计数据
  getSecurityStats: () => api.get('/security/stats'),
  
  // 获取攻击防护趋势数据
  getAttackTrend: (params = {}) => api.get('/security/attack-trend', { params }),
  
  // 获取攻击源IP数据
  getAttackSourceIPs: (params = {}) => api.get('/security/attack-source-ips', { params }),
  
  // 获取黑白名单趋势数据
  getBlackWhiteTrend: (params = {}) => api.get('/security/black-white-trend', { params }),
  
  // 获取实时事件数据
  getRealTimeEvents: (params = {}) => api.get('/security/real-time-events', { params }),
  
  // 获取Web攻击分布数据
  getWebAttackDistribution: (params = {}) => api.get('/security/web-attack-distribution', { params }),
  
  // 获取黑白名单规则数据
  getBlackWhiteRules: (params = {}) => api.get('/security/black-white-rules', { params }),
  
  // 获取安全事件统计数据
  getSecurityEvents: (params = {}) => api.get('/security/security-events', { params }),
  
  // 获取威胁等级分布数据
  getThreatLevelDistribution: (params = {}) => api.get('/security/threat-level-distribution', { params }),
  
  // 获取防护规则状态数据
  getProtectionRules: (params = {}) => api.get('/security/protection-rules', { params }),
  
  // 获取安全评分数据
  getSecurityScore: (params = {}) => api.get('/security/security-score', { params }),
  
  // 获取最近攻击趋势数据
  getRecentAttacksTrend: (params = {}) => api.get('/security/recent-attacks-trend', { params }),
  
  // 获取所有安全态势数据
  getAllSecurityData: (params = {}) => api.get('/security/all', { params })
}

export default securityAPI
