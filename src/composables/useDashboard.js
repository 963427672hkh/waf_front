// 仪表板数据管理组合式函数
import { ref, reactive, onMounted } from 'vue'
import { dashboardAPI } from '../api'
import { mockAllDashboardData } from '../data/mockData'

// 全局状态，确保所有组件共享同一个数据源
const loading = ref(false)
const error = ref(null)
const data = reactive({
  kpi: null,
  geo: null,
  qps: null,
  visit: null,
  intercept: null,
  client: null,
  response: null,
  externalDomains: null,
  externalPages: null,
  visitedDomains: null,
  visitedPages: null
})

// 是否使用模拟数据 - 全局共享
const useMockData = ref(true)

// 加载所有数据 - 全局函数，所有组件共享
const loadAllData = async () => {
  loading.value = true
  error.value = null
  try {
    console.log('=== loadAllData 开始 ===')
    console.log('useMockData.value:', useMockData.value)
    
    if (useMockData.value) {
      // 使用模拟数据
      console.log('使用模拟数据')
      Object.assign(data, mockAllDashboardData)
      await new Promise(resolve => setTimeout(resolve, 500))
    } else {
      // 从真实API获取数据 - 缺少数据时保持为空，不回退到模拟数据
      console.log('正在从后端API加载数据...')
      
      // 初始化为空
      Object.assign(data, {
        kpi: null,
        geo: null,
        qps: null,
        visit: null,
        intercept: null,
        client: null,
        response: null,
        externalDomains: null,
        externalPages: null,
        visitedDomains: null,
        visitedPages: null
      })
      
      try {
        // 并行调用多个接口，有的可能失败或返回空数据
        console.log('开始调用后端接口...')
        const [accessStats, wafStats, topPaths, topIPs] = await Promise.allSettled([
          dashboardAPI.getAccessStats(),
          dashboardAPI.getWafStats(),
          dashboardAPI.getTopPaths({ limit: 10 }),
          dashboardAPI.getTopIPs({ limit: 10 })
        ])
        
        console.log('接口调用结果:', {
          accessStats: accessStats.status,
          wafStats: wafStats.status,
          topPaths: topPaths.status,
          topIPs: topIPs.status
        })
        console.log('accessStats完整响应:', accessStats)
        
        // 访问日志统计
        if (accessStats.status === 'fulfilled') {
          console.log('accessStats.value:', accessStats.value)
          
          // 尝试不同的数据结构
          let accessData = null
          if (accessStats.value?.data) {
            accessData = accessStats.value.data
          } else if (accessStats.value) {
            accessData = accessStats.value
          }
          
          if (accessData) {
            data.kpi = accessData
            data.visit = accessData
            
            // 从访问统计计算QPS
            if (accessData.totalRequests) {
              data.qps = {
                current: Math.round(accessData.totalRequests / 3600),
                history: []
              }
            }
          }
        }
        
        // WAF日志统计
        if (wafStats.status === 'fulfilled' && wafStats.value?.data) {
          data.intercept = wafStats.value.data
        }
        
        // 热门IP（地理位置）
        if (topIPs.status === 'fulfilled' && topIPs.value?.data) {
          data.geo = topIPs.value.data
        }
        
        // 热门路径（受访域名/页面）
        if (topPaths.status === 'fulfilled' && topPaths.value?.data) {
          data.visitedDomains = topPaths.value.data
          data.visitedPages = topPaths.value.data
        }
        
        // 尝试获取其他数据
        try {
          const logsStatsSummary = await dashboardAPI.getLogsStatsSummary({ timeRange: '24h' })
          if (logsStatsSummary?.data) {
            data.attackType = logsStatsSummary.data.topAttackTypes || null
            data.threat = logsStatsSummary.data.topTargetIps || null
          }
        } catch (e) {
          console.log('获取日志摘要失败:', e.message)
        }
        
        console.log('API数据加载完成:', data)
        
      } catch (apiError) {
        console.error('API数据加载错误:', apiError)
        // 保持数据为空，不显示模拟数据
        error.value = '部分接口暂时无法访问，相关数据为空'
      }
    }
  } catch (err) {
    error.value = err.message || '数据加载失败'
    console.error('加载仪表板数据失败:', err)
    // 如果是真实API模式，保持为空；如果是模拟模式，使用模拟数据
    if (!useMockData.value) {
      Object.assign(data, {
        kpi: null, geo: null, qps: null, visit: null, intercept: null,
        client: null, response: null, externalDomains: null, externalPages: null,
        visitedDomains: null, visitedPages: null
      })
    } else {
      Object.assign(data, mockAllDashboardData)
    }
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = async () => {
  await loadAllData()
}

// 切换数据源
const toggleDataSource = () => {
  console.log('=== toggleDataSource 调用 ===')
  console.log('切换前 useMockData.value:', useMockData.value)
  useMockData.value = !useMockData.value
  console.log('切换后 useMockData.value:', useMockData.value)
  console.log('切换到', useMockData.value ? '模拟数据' : '真实API数据')
  loadAllData()
}

// 格式化数字
const formatNumber = (num) => {
  // 处理 null、undefined 或空值
  if (num === null || num === undefined || num === '') {
    return '-'
  }
  const numValue = Number(num)
  if (isNaN(numValue)) {
    return '-'
  }
  if (numValue >= 1000) {
    return (numValue / 1000).toFixed(1) + 'k'
  }
  return numValue.toString()
}

// 格式化百分比
const formatPercentage = (num) => {
  // 处理 null、undefined 或空值
  if (num === null || num === undefined || num === '') {
    return '-'
  }
  const numValue = Number(num)
  if (isNaN(numValue)) {
    return '-'
  }
  return numValue.toFixed(2) + '%'
}

export function useDashboard() {
  return {
    // 状态
    loading,
    error,
    data,
    useMockData,
    
    // 方法
    loadAllData,
    refreshData,
    toggleDataSource,
    formatNumber,
    formatPercentage
  }
}
