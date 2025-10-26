// API服务模块
// 使用统一的API客户端 (client.js)，该客户端已实现token刷新机制
import apiClient from './client.js'

const api = apiClient.client

// 流量分析相关API接口
export const trafficAPI = {
  // ========== 已实现的后端接口 ==========
  
  // 1. 访问日志统计（已对接）
  getAccessStats: (params = {}) => api.get('/logs/access/stats', { params }),
  
  // 2. 访问日志 - 热门路径
  getTopPaths: (params = {}) => api.get('/logs/access/top-paths', { params }),
  
  // 3. 访问日志 - 热门IP
  getTopIPs: (params = {}) => api.get('/logs/access/top-ips', { params }),
  
  // 4. WAF日志统计
  getWafStats: (params = {}) => api.get('/logs/waf/stats', { params }),
  
  // 5. 日志统计信息（用于QPS、时间趋势等）
  getLogsStats: (params = {}) => api.get('/logs/stats', { params }),
  
  // 6. 日志统计摘要
  getLogsStatsSummary: (params = {}) => api.get('/logs/stats/summary', { params }),
  
  // 7. 日志分析数据
  getLogsAnalytics: (params = {}) => api.get('/logs/stats/analytics', { params }),
  
  // 8. 日志趋势数据
  getLogsTrends: (params = {}) => api.get('/logs/stats/trends', { params }),
  
  // 9. 系统健康状态
  getSystemHealth: (params = {}) => api.get('/system/health', { params }),
  
  // 10. 性能指标
  getPerformanceData: (params = {}) => api.get('/system/performance', { params }),
  
  // 11. 安全指标
  getSecurityData: (params = {}) => api.get('/system/security', { params }),
  
  // ========== 接口别名映射（保持向后兼容） ==========
  
  // KPI数据 - 使用访问日志统计
  getKPIData: (params = {}) => api.get('/logs/access/stats', { params }),
  
  // 地理位置数据 - 使用热门IP数据
  getGeoData: (params = {}) => api.get('/logs/access/top-ips', { params }),
  
  // QPS数据 - 使用日志统计
  getQPSData: (params = {}) => api.get('/logs/stats', { params: { ...params, metric: 'count' } }),
  
  // 访问情况 - 使用访问日志统计
  getVisitData: (params = {}) => api.get('/logs/access/stats', { params }),
  
  // 拦截情况 - 使用WAF日志统计
  getInterceptData: (params = {}) => api.get('/logs/waf/stats', { params }),
  
  // 攻击类型分布 - 使用日志摘要
  getAttackTypeData: (params = {}) => api.get('/logs/stats/summary', { params }),
  
  // 威胁监控 - 使用安全指标
  getThreatData: (params = {}) => api.get('/system/security', { params }),
  
  // 客户端数据 - 暂无后端接口，返回模拟数据
  getClientData: (params = {}) => Promise.resolve({ 
    code: 200, 
    message: '功能待实现', 
    data: { operatingSystems: [], browsers: [] } 
  }),
  
  // 响应状态 - 使用访问日志统计
  getResponseData: (params = {}) => api.get('/logs/access/stats', { params }),
  
  // 受访域名 - 使用热门路径
  getVisitedDomains: (params = {}) => api.get('/logs/access/top-paths', { params }),
  
  // 受访页面 - 使用热门路径  
  getVisitedPages: (params = {}) => api.get('/logs/access/top-paths', { params }),
  
  // 外部来源域名 - 暂无后端接口
  getExternalDomains: (params = {}) => Promise.resolve({ code: 200, message: '功能待实现', data: [] }),
  
  // 外部来源页面 - 暂无后端接口
  getExternalPages: (params = {}) => Promise.resolve({ code: 200, message: '功能待实现', data: [] }),
  
  // 所有流量数据 - 组合多个接口
  getAllTrafficData: async (params = {}) => {
    try {
      const [accessStats, wafStats, topPaths, topIPs] = await Promise.all([
        api.get('/logs/access/stats', { params }),
        api.get('/logs/waf/stats', { params }),
        api.get('/logs/access/top-paths', { params }),
        api.get('/logs/access/top-ips', { params })
      ])
      return {
        code: 200,
        data: {
          access: accessStats,
          waf: wafStats,
          topPaths,
          topIPs
        }
      }
    } catch (error) {
      throw error
    }
  }
}

// 兼容性：保留原有的dashboardAPI
export const dashboardAPI = trafficAPI

export default api
