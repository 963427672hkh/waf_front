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
// 防止无限循环的计数器
let refreshAttempts = 0
const MAX_REFRESH_ATTEMPTS = 2

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 如果是401错误且不是刷新token的请求，且未超过最大刷新次数
    if (error.response?.status === 401 && !originalRequest._retry && refreshAttempts < MAX_REFRESH_ATTEMPTS) {
      originalRequest._retry = true
      refreshAttempts++

      try {
        // 尝试刷新token
        const refreshTokenValue = localStorage.getItem('waf_refresh_token')
        if (!refreshTokenValue) {
          throw new Error('No refresh token available')
        }

        console.log('尝试刷新token，第', refreshAttempts, '次')
        
        // 直接调用刷新接口，不通过authAPI（避免循环）
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/refresh`,
          { refreshToken: refreshTokenValue },
          { headers: { 'Content-Type': 'application/json' } }
        )
        
        console.log('刷新token响应:', refreshResponse.data)
        
        // 解析响应数据
        // 响应格式: { code: 200, message: "...", data: { access_token: "...", expires_in: 900 } }
        const responseData = refreshResponse.data
        
        // 检查响应是否成功
        if (responseData.code === 200 && responseData.data?.access_token) {
          const newAccessToken = responseData.data.access_token
          
          // 更新token
          localStorage.setItem('waf_access_token', newAccessToken)
          
          // 重置请求头
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          
          // 重置刷新计数器
          refreshAttempts = 0
          
          console.log('Token刷新成功，重试原始请求')
          
          // 重新发送原始请求
          return api(originalRequest)
        } else {
          throw new Error('刷新token返回的数据格式不正确')
        }
      } catch (refreshError) {
        console.error('刷新token失败:', refreshError)
        
        // 刷新失败，清除认证信息
        localStorage.removeItem('waf_access_token')
        localStorage.removeItem('waf_refresh_token')
        
        // 重置刷新计数器
        refreshAttempts = 0
        
        // 显示提示信息
        alert('认证已过期，请重新登录')
        
        // 跳转到登录页
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    } else if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      // 超过最大刷新次数
      console.error('超过最大刷新次数，停止尝试')
      refreshAttempts = 0
      
      alert('认证失败，请重新登录')
      
      // 清除认证信息并跳转登录
      localStorage.removeItem('waf_access_token')
      localStorage.removeItem('waf_refresh_token')
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// 导出API客户端
export default {
  client: api
}
