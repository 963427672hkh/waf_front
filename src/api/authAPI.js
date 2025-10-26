// 认证相关API接口
import apiClient from './client'

export const authAPI = {
  // 用户登录
  login: async (username, password) => {
    const response = await apiClient.client.post('/auth/login', {
      username,
      password
    })
    return response.data
  },

  // 刷新令牌
  refreshToken: async (refreshToken) => {
    const response = await apiClient.client.post('/auth/refresh', {
      refreshToken
    })
    return response.data
  },

  // 获取用户信息
  getProfile: async () => {
    const response = await apiClient.client.get('/auth/profile')
    return response.data
  },

  // 退出登录
  logout: async () => {
    const response = await apiClient.client.post('/auth/logout')
    return response.data
  },

  // 创建用户（注册）
  createUser: async (username, password, role = 'OPERATOR') => {
    const response = await apiClient.client.post('/users', {
      username,
      password,
      role
    })
    return response.data
  },

  // 检查用户名可用性
  checkUsername: async (username, excludeId = null) => {
    const params = excludeId ? { excludeId } : {}
    const response = await apiClient.client.get(`/users/check-username/${username}`, { params })
    return response.data
  }
}

export default authAPI
