// 仪表板数据管理组合式函数
import { ref, reactive, onMounted } from 'vue'
import { dashboardAPI } from '../api'
import { mockAllDashboardData } from '../data/mockData'

export function useDashboard() {
  // 数据状态
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

  // 是否使用模拟数据
  const useMockData = ref(true)

  // 加载所有数据
  const loadAllData = async () => {
    loading.value = true
    error.value = null
    try {
      if (useMockData.value) {
        // 使用模拟数据
        Object.assign(data, mockAllDashboardData)
        await new Promise(resolve => setTimeout(resolve, 500))
      } else {
        // 从API获取数据（后端需实现 /dashboard/all 聚合接口，或分别请求各接口）
        // const response = await dashboardAPI.getAllDashboardData()
        // Object.assign(data, response)
        // 若后端未聚合，可并发请求各接口
        const [kpi, geo, qps, visit, intercept, client, responseData, externalDomains, externalPages, visitedDomains, visitedPages] = await Promise.all([
          dashboardAPI.getKPIData(),
          dashboardAPI.getGeoData(),
          dashboardAPI.getQPSData(),
          dashboardAPI.getVisitData(),
          dashboardAPI.getInterceptData(),
          dashboardAPI.getClientData(),
          dashboardAPI.getResponseData(),
          dashboardAPI.getExternalDomains(),
          dashboardAPI.getExternalPages(),
          dashboardAPI.getVisitedDomains(),
          dashboardAPI.getVisitedPages()
        ])
        data.kpi = kpi.data || kpi
        data.geo = geo.data || geo
        data.qps = qps.data || qps
        data.visit = visit.data || visit
        data.intercept = intercept.data || intercept
        data.client = client.data || client
        data.response = responseData.data || responseData
        data.externalDomains = externalDomains.data || externalDomains
        data.externalPages = externalPages.data || externalPages
        data.visitedDomains = visitedDomains.data || visitedDomains
        data.visitedPages = visitedPages.data || visitedPages
      }
    } catch (err) {
      error.value = err.message || '数据加载失败'
      console.error('加载仪表板数据失败:', err)
      if (!useMockData.value) {
        useMockData.value = true
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
    useMockData.value = !useMockData.value
    loadAllData()
  }

  // 格式化数字
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  // 格式化百分比
  const formatPercentage = (num) => {
    return num.toFixed(2) + '%'
  }

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
