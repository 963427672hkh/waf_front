// API客户端配置
import axios from 'axios'

const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
}

// 创建axios实例
const api = axios.create(API_CONFIG)

// 请求拦截器 - 添加认证头
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('waf_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器 - 处理token刷新
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 如果是401错误且不是刷新token的请求
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // 尝试刷新token
        const refreshToken = localStorage.getItem('waf_refresh_token')
        if (refreshToken) {
          const refreshResponse = await api.post('/auth/refresh', {
            refreshToken
          })
          
          const newAccessToken = refreshResponse.data.data.access_token
          localStorage.setItem('waf_access_token', newAccessToken)
          
          // 重新设置请求头
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          
          // 重新发送原始请求
          return api(originalRequest)
        }
      } catch (refreshError) {
        // 刷新失败，清除认证信息
        localStorage.removeItem('waf_access_token')
        localStorage.removeItem('waf_refresh_token')
        
        // 跳转到登录页
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

// 导出API客户端
export default {
  client: api
}
