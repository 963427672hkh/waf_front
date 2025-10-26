// 认证管理组合式函数
import { ref, reactive, computed } from 'vue'
import { authAPI } from '../api/authAPI'

// 全局状态
const user = ref(null)
const accessToken = ref(localStorage.getItem('waf_access_token'))
const refreshToken = ref(localStorage.getItem('waf_refresh_token'))
const loading = ref(false)
const error = ref(null)

// 自动刷新令牌的定时器
let refreshTimer = null

export function useAuth() {
  // 计算属性
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const userRole = computed(() => user.value?.role || null)

  // 设置令牌
  const setTokens = (access, refresh) => {
    accessToken.value = access
    refreshToken.value = refresh
    
    if (access) {
      localStorage.setItem('waf_access_token', access)
    } else {
      localStorage.removeItem('waf_access_token')
    }
    
    if (refresh) {
      localStorage.setItem('waf_refresh_token', refresh)
    } else {
      localStorage.removeItem('waf_refresh_token')
    }
  }

  // 设置用户信息
  const setUser = (userData) => {
    user.value = userData
  }

  // 清除认证信息
  const clearAuth = () => {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('waf_access_token')
    localStorage.removeItem('waf_refresh_token')
    
    // 清除定时器
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
  }

  // 登录
  const login = async (username, password) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authAPI.login(username, password)
      
      // 访问 token - response.data 已经是 {user, accessToken, refreshToken, expiresIn}
      setTokens(response.data.accessToken, response.data.refreshToken)
      
      // 设置用户信息（从登录响应中获取）
      setUser(response.data.user)
      
      // 设置自动刷新
      setupTokenRefresh(response.data.expiresIn)
      
      return response
    } catch (err) {
      error.value = err.response?.data?.message || '登录失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 游客登录
  const guestLogin = async () => {
    loading.value = true
    error.value = null
    
    try {
      // 使用后端文档中的默认管理员账号
      const guestUsername = 'admin'
      const guestPassword = 'admin123'
      
      console.log('开始游客登录...')
      const response = await authAPI.login(guestUsername, guestPassword)
      console.log('登录响应:', response)
      
      // 访问 token - response.data 已经是 {user, accessToken, refreshToken, expiresIn}
      console.log('设置令牌:', response.data)
      setTokens(response.data.accessToken, response.data.refreshToken)
      
      // 设置用户信息（从登录响应中获取）
      console.log('设置用户信息:', response.data.user)
      setUser(response.data.user)
      
      // 设置自动刷新
      setupTokenRefresh(response.data.expiresIn)
      
      console.log('游客登录成功!')
      return response
    } catch (err) {
      console.error('游客登录失败:', err)
      error.value = err.response?.data?.message || '游客登录失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (username, password, role = 'OPERATOR') => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authAPI.createUser(username, password, role)
      
      // 注册成功后自动登录
      await login(username, password)
      
      return response
    } catch (err) {
      error.value = err.response?.data?.message || '注册失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取用户信息
  const fetchUserProfile = async () => {
    if (!accessToken.value) return
    
    try {
      const response = await authAPI.getProfile()
      setUser(response.data.data)
      return response
    } catch (err) {
      console.error('获取用户信息失败:', err)
      // 如果获取用户信息失败，可能是token过期，尝试刷新
      if (err.response?.status === 401) {
        await handleTokenRefresh()
      }
    }
  }

  // 刷新令牌
  const handleTokenRefresh = async () => {
    if (!refreshToken.value) {
      clearAuth()
      return false
    }
    
    try {
      const response = await authAPI.refreshToken(refreshToken.value)
      const { data } = response
      
      // 更新访问令牌
      setTokens(data.access_token, refreshToken.value)
      
      // 重新设置自动刷新
      setupTokenRefresh(data.expires_in)
      
      return true
    } catch (err) {
      console.error('刷新令牌失败:', err)
      clearAuth()
      return false
    }
  }

  // 设置自动刷新令牌
  const setupTokenRefresh = (expiresIn) => {
    // 清除现有定时器
    if (refreshTimer) {
      clearTimeout(refreshTimer)
    }
    
    // 在令牌过期前5分钟刷新
    const refreshTime = (expiresIn - 300) * 1000 // 转换为毫秒
    
    if (refreshTime > 0) {
      refreshTimer = setTimeout(async () => {
        console.log('自动刷新令牌...')
        await handleTokenRefresh()
      }, refreshTime)
    }
  }

  // 退出登录
  const logout = async () => {
    loading.value = true
    
    try {
      if (accessToken.value) {
        await authAPI.logout()
      }
    } catch (err) {
      console.error('退出登录失败:', err)
    } finally {
      clearAuth()
      loading.value = false
    }
  }

  // 检查用户名可用性
  const checkUsername = async (username, excludeId = null) => {
    try {
      const response = await authAPI.checkUsername(username, excludeId)
      return response.data.available
    } catch (err) {
      console.error('检查用户名失败:', err)
      return false
    }
  }

  // 初始化认证状态
  const initAuth = async () => {
    if (accessToken.value) {
      try {
        await fetchUserProfile()
      } catch (err) {
        console.error('初始化认证状态失败:', err)
        clearAuth()
      }
    }
  }

  return {
    // 状态
    user: computed(() => user.value),
    accessToken: computed(() => accessToken.value),
    refreshToken: computed(() => refreshToken.value),
    isAuthenticated,
    userRole,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    
    // 方法
    login,
    guestLogin,
    register,
    logout,
    fetchUserProfile,
    handleTokenRefresh,
    checkUsername,
    initAuth,
    clearAuth
  }
}
