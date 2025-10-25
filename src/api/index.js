// API服务模块
import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可以在这里添加token等认证信息
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// 流量分析相关API接口
export const trafficAPI = {
  // 获取KPI指标数据
  getKPIData: (params = {}) => api.get('/traffic/kpi', { params }),
  
  // 获取地理位置数据
  getGeoData: (params = {}) => api.get('/traffic/geo', { params }),
  
  // 获取实时QPS数据
  getQPSData: (params = {}) => api.get('/traffic/qps', { params }),
  
  // 获取访问情况数据
  getVisitData: (params = {}) => api.get('/traffic/visit', { params }),
  
  // 获取拦截情况数据
  getInterceptData: (params = {}) => api.get('/traffic/intercept', { params }),
  
  // 获取攻击类型分布数据
  getAttackTypeData: (params = {}) => api.get('/traffic/attack-type', { params }),
  
  // 获取威胁监控数据
  getThreatData: (params = {}) => api.get('/traffic/threats', { params }),
  
  // 获取性能指标数据
  getPerformanceData: (params = {}) => api.get('/traffic/performance', { params }),
  
  // 获取客户端数据
  getClientData: (params = {}) => api.get('/traffic/client', { params }),
  
  // 获取响应状态数据
  getResponseData: (params = {}) => api.get('/traffic/response', { params }),
  
  // 获取外部来源域名数据
  getExternalDomains: (params = {}) => api.get('/traffic/external-domains', { params }),
  
  // 获取外部来源页面数据
  getExternalPages: (params = {}) => api.get('/traffic/external-pages', { params }),
  
  // 获取受访域名数据
  getVisitedDomains: (params = {}) => api.get('/traffic/visited-domains', { params }),
  
  // 获取受访页面数据
  getVisitedPages: (params = {}) => api.get('/traffic/visited-pages', { params }),
  
  // 获取所有流量分析数据
  getAllTrafficData: (params = {}) => api.get('/traffic/all', { params })
}

// 兼容性：保留原有的dashboardAPI
export const dashboardAPI = trafficAPI

export default api
