<template>
  <div class="traffic-analysis">
    <!-- 顶部KPI指标卡片 -->
    <div class="kpi-section">
      <div class="kpi-card">
        <div class="kpi-icon">👥</div>
        <div class="kpi-value">{{ formatNumber(kpiData.requests) }}</div>
        <div class="kpi-label">请求次数</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">📄</div>
        <div class="kpi-value">{{ formatNumber(kpiData.pageViews) }}</div>
        <div class="kpi-label">访问次数(PV)</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">👤</div>
        <div class="kpi-value">{{ formatNumber(kpiData.uniqueVisitors) }}</div>
        <div class="kpi-label">独立访客(UV)</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🌐</div>
        <div class="kpi-value">{{ formatNumber(kpiData.uniqueIPs) }}</div>
        <div class="kpi-label">独立IP</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🛡️</div>
        <div class="kpi-value">{{ formatNumber(kpiData.intercepts) }}</div>
        <div class="kpi-label">拦截次数</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">⚠️</div>
        <div class="kpi-value">{{ formatNumber(kpiData.attackIPs) }}</div>
        <div class="kpi-label">攻击IP</div>
      </div>
    </div>

    <!-- 第二行KPI指标 -->
    <div class="kpi-section">
      <div class="kpi-card">
        <div class="kpi-icon">🔴</div>
        <div class="kpi-value">{{ formatNumber(kpiData.error4xx) }}</div>
        <div class="kpi-label">4xx 错误数</div>
        <div class="kpi-trend trend-up">▲</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">📊</div>
        <div class="kpi-value">{{ formatPercentage(kpiData.error4xxRate) }}</div>
        <div class="kpi-label">4xx 错误率</div>
        <div class="kpi-trend trend-up">▲</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🚫</div>
        <div class="kpi-value">{{ formatNumber(kpiData.intercept4xx) }}</div>
        <div class="kpi-label">4xx 拦截数</div>
        <div class="kpi-trend trend-up">▲</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">📈</div>
        <div class="kpi-value">{{ formatPercentage(kpiData.intercept4xxRate) }}</div>
        <div class="kpi-label">4xx 拦截率</div>
        <div class="kpi-trend trend-up">▲</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🔴</div>
        <div class="kpi-value">{{ formatNumber(kpiData.error5xx) }}</div>
        <div class="kpi-label">5xx 错误数</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">📊</div>
        <div class="kpi-value">{{ formatPercentage(kpiData.error5xxRate) }}</div>
        <div class="kpi-label">5xx 错误率</div>
        <div class="kpi-trend trend-up">▲</div>
      </div>
    </div>

    <!-- 主要图表区域 -->
    <div class="main-charts-section">
      <!-- 地理位置面板 -->
      <div class="panel geo-panel">
        <div class="panel-header">
          <h3 class="panel-title">地理位置</h3>
        </div>
        <div class="geo-controls">
          <button class="control-btn" :class="{ active: geoScope === 'world' }" @click="setGeoScope('world')">世界</button>
          <button class="control-btn" :class="{ active: geoScope === 'china' }" @click="setGeoScope('china')">中国</button>
          <button class="control-btn" :class="{ active: geoMetric === 'visit' }" @click="setGeoMetric('visit')">访问</button>
          <button class="control-btn" :class="{ active: geoMetric === 'intercept' }" @click="setGeoMetric('intercept')">仅拦截</button>
        </div>
        
        <!-- 地图容器 -->
        <div class="map-container">
          <div id="worldMap" class="world-map"></div>
          <!-- 地图数据流动画效果 -->
          <div class="map-data-flow">
            <div class="map-particle" v-for="i in 3" :key="i" :style="`animation-delay: ${i * 0.5}s`"></div>
          </div>
        </div>
        
        <!-- 国家列表 -->
        <div v-if="rankedCountries && rankedCountries.length" class="country-list">
          <div v-for="country in rankedCountries" :key="country.name" class="country-item">
            <span class="country-name">{{ country.name }}</span>
            <span class="country-value">{{ formatNumber(country.value) }}</span>
            <div class="progress-bar">
              <div class="progress-fill" :style="`width: ${country.percentage}%`"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧图表区域 -->
      <div class="right-charts-area">
        <!-- 实时QPS面板 -->
        <div class="panel qps-panel">
          <div class="qps-header">
            <h3 class="panel-title">实时 QPS</h3>
            <div class="qps-controls">
              <button class="qps-control-btn" :class="{ active: qpsAutoRefresh }" @click="toggleQpsAutoRefresh">
                {{ qpsAutoRefresh ? '⏸️' : '▶️' }}
              </button>
              <div class="qps-interval-selector">
                <select v-model="qpsRefreshInterval" @change="setQpsRefreshInterval(qpsRefreshInterval)" class="qps-interval-select">
                  <option value="10">10秒</option>
                  <option value="30">30秒</option>
                  <option value="60">1分钟</option>
                  <option value="120">2分钟</option>
                  <option value="300">5分钟</option>
                </select>
              </div>
              <div class="refresh-icon" @click="refreshQpsData" title="手动刷新">🔄</div>
            </div>
          </div>
          <div class="chart-container">
            <div id="qpsChart" style="height: 100%; width: 100%;"></div>
          </div>
        </div>

        <!-- 访问情况 -->
        <div class="panel status-panel">
          <div class="panel-header">
            <h3 class="panel-title">访问情况</h3>
          </div>
          <div v-if="visitData" class="status-peak">峰值 {{ formatNumber(visitData.peak) }}</div>
          <div class="status-chart">
            <div id="visitChart" style="height: 100%; width: 100%;"></div>
          </div>
        </div>

        <!-- 拦截情况 -->
        <div class="panel status-panel">
          <div class="panel-header">
            <h3 class="panel-title">拦截情况</h3>
          </div>
          <div v-if="interceptData" class="status-peak">峰值 {{ formatNumber(interceptData.peak) }}</div>
          <div class="status-chart">
            <div id="interceptChart" style="height: 100%; width: 100%;"></div>
          </div>
        </div>
      </div>
    </div>


    <!-- 第三行KPI指标 -->
    <div class="kpi-section">
      <div class="kpi-card">
        <div class="kpi-icon">🕒</div>
        <div class="kpi-value">{{ formatNumber(kpiData.avgResponseTime) }}ms</div>
        <div class="kpi-label">平均响应时间</div>
        <div class="kpi-trend trend-down">▼</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">📊</div>
        <div class="kpi-value">{{ formatNumber(kpiData.bandwidth) }}MB</div>
        <div class="kpi-label">带宽使用</div>
        <div class="kpi-trend trend-up">▲</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🔒</div>
        <div class="kpi-value">{{ formatNumber(kpiData.sslConnections) }}</div>
        <div class="kpi-label">SSL连接数</div>
        <div class="kpi-trend trend-up">▲</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🌍</div>
        <div class="kpi-value">{{ formatNumber(kpiData.countries) }}</div>
        <div class="kpi-label">访问国家数</div>
        <div class="kpi-trend trend-up">▲</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">📱</div>
        <div class="kpi-value">{{ formatNumber(kpiData.mobileTraffic) }}</div>
        <div class="kpi-label">移动端流量</div>
        <div class="kpi-trend trend-up">▲</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🖥️</div>
        <div class="kpi-value">{{ formatNumber(kpiData.desktopTraffic) }}</div>
        <div class="kpi-label">桌面端流量</div>
        <div class="kpi-trend trend-down">▼</div>
      </div>
    </div>

    <!-- 扩展区域 -->
    <div class="extended-section">
      <!-- 攻击类型分布 -->
      <div class="panel attack-panel">
        <div class="panel-header">
          <h3 class="panel-title">攻击类型分布</h3>
        </div>
        <div class="attack-chart">
          <div id="attackTypeChart" style="height: 100%; width: 100%;"></div>
        </div>
      </div>

      <!-- 实时威胁监控 -->
      <div class="panel threat-panel">
        <div class="panel-header">
          <h3 class="panel-title">实时威胁监控</h3>
        </div>
        <div class="threat-list">
          <div v-for="(threat, index) in threatData" :key="index" class="threat-item">
            <div class="threat-level" :class="threat.level">{{ threat.levelName }}</div>
            <div class="threat-info">
              <div class="threat-ip">{{ threat.ip }}</div>
              <div class="threat-type">{{ threat.type }}</div>
            </div>
            <div class="threat-time">{{ threat.time }}</div>
          </div>
        </div>
      </div>

      <!-- 性能指标 -->
      <div class="panel performance-panel">
        <div class="panel-header">
          <h3 class="panel-title">性能指标</h3>
        </div>
        <div class="performance-chart">
          <div id="performanceChart" style="height: 100%; width: 100%;"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts/core'
import { MapChart, LineChart, BarChart, PieChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { GeoComponent, TooltipComponent, VisualMapComponent, LegendComponent, GridComponent } from 'echarts/components'
import { useDashboard } from '../composables/useDashboard'
import { trafficAPI } from '../api'

// 注册必要的 ECharts 模块
echarts.use([
  MapChart,
  LineChart,
  BarChart,
  PieChart,
  CanvasRenderer,
  GeoComponent,
  TooltipComponent,
  VisualMapComponent,
  LegendComponent,
  GridComponent
])

// 缓存地图数据，避免重复加载
let worldMapDataCache = null
let chinaMapDataCache = null

// 使用dashboard composable - 获取全局状态
const { 
  data: dashboardData, 
  useMockData,
  formatNumber,
  formatPercentage 
} = useDashboard()

// 加载状态
const loading = ref(false)

// KPI数据 - 从全局状态获取
const kpiData = computed(() => {
  // 如果有API数据，使用API数据
  if (dashboardData.kpi) {
    return {
      requests: dashboardData.kpi.requests ?? 0,
      pageViews: dashboardData.kpi.pageViews ?? 0,
      uniqueVisitors: dashboardData.kpi.uniqueVisitors ?? 0,
      uniqueIPs: dashboardData.kpi.uniqueIPs ?? 0,
      intercepts: dashboardData.kpi.intercepts ?? 0,
      attackIPs: dashboardData.kpi.attackIPs ?? 0,
      error4xx: dashboardData.kpi.error4xx ?? 0,
      error4xxRate: dashboardData.kpi.error4xxRate ?? 0,
      intercept4xx: dashboardData.kpi.intercept4xx ?? 0,
      intercept4xxRate: dashboardData.kpi.intercept4xxRate ?? 0,
      error5xx: dashboardData.kpi.error5xx ?? 0,
      error5xxRate: dashboardData.kpi.error5xxRate ?? 0,
      avgResponseTime: dashboardData.kpi.avgResponseTime ?? 0,
      bandwidth: dashboardData.kpi.bandwidth ?? 0,
      sslConnections: dashboardData.kpi.sslConnections ?? 0,
      countries: dashboardData.kpi.countries ?? 0,
      mobileTraffic: dashboardData.kpi.mobileTraffic ?? 0,
      desktopTraffic: dashboardData.kpi.desktopTraffic ?? 0
    }
  }
  
  // 如果没有数据，使用模拟数据
  return {
    requests: 21700,
    pageViews: 6500,
    uniqueVisitors: 492,
    uniqueIPs: 673,
    intercepts: 12000,
    attackIPs: 93,
    error4xx: 3900,
    error4xxRate: 17.72,
    intercept4xx: 12000,
    intercept4xxRate: 55.22,
    error5xx: 236,
    error5xxRate: 1.09,
    avgResponseTime: 245,
    bandwidth: 1250,
    sslConnections: 1850,
    countries: 45,
    mobileTraffic: 3200,
    desktopTraffic: 3300
  }
})

const visitData = ref({
  peak: 17600,
  data: [
    { time: '10:00', value: 1200 },
    { time: '11:00', value: 1800 },
    { time: '12:00', value: 2200 },
    { time: '13:00', value: 1900 },
    { time: '14:00', value: 2500 },
    { time: '15:00', value: 3000 },
    { time: '16:00', value: 2800 }
  ]
})

const interceptData = ref({
  peak: 11800,
  data: [
    { time: '10:00', value: 800 },
    { time: '11:00', value: 1200 },
    { time: '12:00', value: 1500 },
    { time: '13:00', value: 1300 },
    { time: '14:00', value: 1800 },
    { time: '15:00', value: 2000 },
    { time: '16:00', value: 1900 }
  ]
})

const qpsData = ref({
  current: 5,
  history: [
    { time: '10:00', value: 3 },
    { time: '10:05', value: 5 },
    { time: '10:10', value: 4 },
    { time: '10:15', value: 6 },
    { time: '10:20', value: 7 },
    { time: '10:25', value: 5 },
    { time: '10:30', value: 4 }
  ]
})

// 威胁数据
const threatData = ref([
  { level: 'high', levelName: '高危', ip: '192.168.1.100', type: 'SQL注入', time: '16:25:30' },
  { level: 'medium', levelName: '中危', ip: '10.0.0.50', type: 'XSS攻击', time: '16:24:15' },
  { level: 'low', levelName: '低危', ip: '172.16.0.25', type: '目录遍历', time: '16:23:45' },
  { level: 'high', levelName: '高危', ip: '203.0.113.10', type: '命令注入', time: '16:22:30' },
  { level: 'medium', levelName: '中危', ip: '198.51.100.5', type: '文件包含', time: '16:21:20' }
])

// 攻击类型数据
const attackTypeData = ref([
  { name: 'SQL注入', value: 35 },
  { name: 'XSS攻击', value: 28 },
  { name: '目录遍历', value: 20 },
  { name: '命令注入', value: 12 },
  { name: '文件包含', value: 5 }
])

// 性能数据
const performanceData = ref({
  cpu: [65, 70, 68, 72, 75, 73, 70],
  memory: [45, 48, 50, 52, 55, 53, 50],
  disk: [30, 32, 35, 38, 40, 38, 35],
  network: [80, 85, 82, 88, 90, 87, 85]
})

// 地理位置视图状态
const geoScope = ref('world')
const geoMetric = ref('visit')

// QPS自动刷新状态
const qpsAutoRefresh = ref(true)
const qpsRefreshInterval = ref(30)
let qpsTimer = null

// 缓存图表实例
const chartInstances = new Map()

// 获取图表实例
const getChart = (idOrEl) => {
  const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl
  if (!el) return null
  
  let inst = echarts.getInstanceByDom(el)
  if (!inst) {
    inst = echarts.init(el)
    chartInstances.set(el, inst)
  }
  return inst
}

// 拦截与访问比率
const interceptRatio = computed(() => {
  if (kpiData.value.requests && kpiData.value.intercepts) {
    return Math.min(1, kpiData.value.intercepts / kpiData.value.requests)
  }
  return 0.17
})

// 世界国家列表
const worldCountries = computed(() => {
  const base = [
    { name: '中国', visit: 8500 },
    { name: '美国', visit: 5200 },
    { name: '日本', visit: 3200 },
    { name: '韩国', visit: 1800 },
    { name: '德国', visit: 1400 },
    { name: '英国', visit: 1100 },
    { name: '法国', visit: 900 }
  ]
  return base.map(c => ({
    name: c.name,
    value: geoMetric.value === 'visit' ? c.visit : Math.round(c.visit * interceptRatio.value)
  }))
})

// 中国省份列表
const chinaProvinces = computed(() => {
  const staticProvinces = [
    { name: '广东', value: 50500 },
    { name: '浙江', value: 8500 },
    { name: '北京', value: 5200 },
    { name: '上海', value: 3200 },
    { name: '江西', value: 1400 },
    { name: '香港', value: 1100 },
    { name: '湖北', value: 636 }
  ]
  return staticProvinces.map(p => ({
    name: p.name,
    value: geoMetric.value === 'visit' ? p.value : Math.round(p.value * interceptRatio.value)
  }))
})

// 右侧榜单展示用
const rankedCountries = computed(() => {
  const list = geoScope.value === 'china' ? chinaProvinces.value : worldCountries.value
  if (list.length === 0) return []
  const max = Math.max(...list.map(i => i.value || 0)) || 1
  return list.map(i => ({
    name: i.name,
    value: i.value,
    percentage: Math.round((i.value / max) * 100)
  }))
})

// 设置地理位置范围
const setGeoScope = (scope) => {
  geoScope.value = scope
}

// 设置度量
const setGeoMetric = (metric) => {
  geoMetric.value = metric
}

// QPS自动刷新控制
const startQpsAutoRefresh = () => {
  if (qpsTimer) {
    clearInterval(qpsTimer)
  }
  if (qpsAutoRefresh.value) {
    qpsTimer = setInterval(() => {
      refreshQpsData()
    }, qpsRefreshInterval.value * 1000)
  }
}

const stopQpsAutoRefresh = () => {
  if (qpsTimer) {
    clearInterval(qpsTimer)
    qpsTimer = null
  }
}

const toggleQpsAutoRefresh = () => {
  qpsAutoRefresh.value = !qpsAutoRefresh.value
  if (qpsAutoRefresh.value) {
    startQpsAutoRefresh()
  } else {
    stopQpsAutoRefresh()
  }
}

const setQpsRefreshInterval = (seconds) => {
  qpsRefreshInterval.value = seconds
  if (qpsAutoRefresh.value) {
    startQpsAutoRefresh()
  }
}

// 刷新QPS数据
const refreshQpsData = async () => {
  try {
    const newQpsData = {
      current: Math.floor(Math.random() * 10) + 1,
      history: qpsData.value.history.map(item => ({
        ...item,
        value: Math.floor(Math.random() * 10)
      }))
    }
    qpsData.value = newQpsData
    await nextTick()
    initQPSChart()
  } catch (error) {
    console.error('刷新QPS数据失败:', error)
  }
}

// 初始化QPS图表
const initQPSChart = () => {
  const chart = getChart('qpsChart')
  if (!chart) return
  try { chart.clear() } catch (e) {}
  
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: qpsData.value.history.map(item => item.time),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#888', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#888', fontSize: 10 },
      splitLine: { lineStyle: { color: '#333' } }
    },
    series: [{
      data: qpsData.value.history.map(item => item.value),
      type: 'bar',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#4a9eff' },
          { offset: 1, color: '#1e3a8a' }
        ])
      },
      barWidth: '60%'
    }]
  }
  chart.setOption(option)
}

// 初始化访问图表
const initVisitChart = () => {
  const chart = getChart('visitChart')
  if (!chart) return
  try { chart.clear() } catch (e) {}
  
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: visitData.value.data.map(item => item.time),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#888', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#888', fontSize: 10 },
      splitLine: { lineStyle: { color: '#333' } }
    },
    series: [{
      data: visitData.value.data.map(item => item.value),
      type: 'line',
      smooth: true,
      lineStyle: { color: '#4a9eff', width: 2 },
      itemStyle: { color: '#4a9eff' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(74, 158, 255, 0.3)' },
          { offset: 1, color: 'rgba(74, 158, 255, 0.05)' }
        ])
      }
    }]
  }
  chart.setOption(option)
}

// 初始化拦截图表
const initInterceptChart = () => {
  const chart = getChart('interceptChart')
  if (!chart) return
  try { chart.clear() } catch (e) {}
  
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: interceptData.value.data.map(item => item.time),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#888', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#888', fontSize: 10 },
      splitLine: { lineStyle: { color: '#333' } }
    },
    series: [{
      data: interceptData.value.data.map(item => item.value),
      type: 'line',
      smooth: true,
      lineStyle: { color: '#ff8c00', width: 2 },
      itemStyle: { color: '#ff8c00' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(255, 140, 0, 0.3)' },
          { offset: 1, color: 'rgba(255, 140, 0, 0.05)' }
        ])
      }
    }]
  }
  chart.setOption(option)
}

// 初始化世界地图
const initWorldMap = async () => {
  const mapElement = document.getElementById('worldMap')
  if (!mapElement) return
  
  try {
    // 加载并注册世界地图数据
    if (!worldMapDataCache) {
      const response = await fetch('/maps/world.json')
      if (!response.ok) {
        throw new Error(`Failed to load world map: ${response.status}`)
      }
      worldMapDataCache = await response.json()
      echarts.registerMap('world', worldMapDataCache)
    }
    
    const chart = getChart(mapElement)
    if (!chart) return
    
    // 先清除之前的配置，避免残留
    try { 
      chart.clear() 
      // 确保图表实例已准备好
      await nextTick()
    } catch (e) {
      console.warn('清除图表时出错:', e)
    }

    const mapData = worldCountries.value.map(i => ({ name: i.name, value: i.value }))
    const values = mapData.map(d => d.value || 0)
    const max = Math.max(...values, 1)

    const option = {
      backgroundColor: 'transparent',
      tooltip: { 
        trigger: 'item', 
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#ff8c00',
        borderWidth: 1,
        textStyle: { color: '#fff' },
        formatter: function (params) { 
          if (!params.data) return params.name
          return `<div style="padding: 8px;">
            <div style="font-weight: bold; color: #ff8c00; margin-bottom: 4px;">${params.data.name || params.name}</div>
            <div style="color: #fff;">${geoMetric.value === 'visit' ? '访问量' : '拦截量'}: <span style="color: #4a9eff; font-weight: bold;">${formatNumber(params.data.value || 0)}</span></div>
          </div>`
        } 
      },
      visualMap: {
        min: 0,
        max: Math.max(100000, max),
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        calculable: true,
        inRange: { 
          color: ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#7209b7', '#ff8c00', '#ff6b35'] 
        },
        textStyle: { 
          color: '#fff',
          fontSize: 12,
          fontWeight: 'bold'
        },
        itemWidth: 20,
        itemHeight: 120,
        borderColor: '#ff8c00',
        borderWidth: 1,
        formatter: function (value) { 
          return value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value 
        }
      },
      series: [
        { 
          name: geoMetric.value === 'visit' ? '访问量' : '拦截量', 
          type: 'map', 
          map: 'world', 
          data: mapData, 
          roam: false,
          label: {
            show: false
          },
          itemStyle: {
            areaColor: '#1a1a2e',
            borderColor: '#2a2a3e',
            borderWidth: 1.5
          },
          emphasis: { 
            itemStyle: { 
              areaColor: '#ff8c00',
              borderColor: '#ff6b35',
              borderWidth: 2
            },
            label: {
              show: true,
              color: '#fff'
            }
          }
        }
      ]
    }

    chart.setOption(option, { notMerge: true }) // 使用 notMerge 确保完全替换配置
    try { 
      chart.resize() 
      // 确保渲染完成
      await nextTick()
    } catch (e) {
      console.warn('调整图表大小时出错:', e)
    }
  } catch (error) {
    console.error('加载世界地图失败:', error)
  }
}

// 省份名称映射（短名称 -> 地图数据中的全名称）
const provinceNameMap = {
  '北京': '北京市',
  '天津': '天津市',
  '上海': '上海市',
  '重庆': '重庆市',
  '河北': '河北省',
  '山西': '山西省',
  '辽宁': '辽宁省',
  '吉林': '吉林省',
  '黑龙江': '黑龙江省',
  '江苏': '江苏省',
  '浙江': '浙江省',
  '安徽': '安徽省',
  '福建': '福建省',
  '江西': '江西省',
  '山东': '山东省',
  '河南': '河南省',
  '湖北': '湖北省',
  '湖南': '湖南省',
  '广东': '广东省',
  '海南': '海南省',
  '四川': '四川省',
  '贵州': '贵州省',
  '云南': '云南省',
  '陕西': '陕西省',
  '甘肃': '甘肃省',
  '青海': '青海省',
  '台湾': '台湾省',
  '内蒙古': '内蒙古自治区',
  '广西': '广西壮族自治区',
  '宁夏': '宁夏回族自治区',
  '新疆': '新疆维吾尔自治区',
  '西藏': '西藏自治区',
  '香港': '香港特别行政区',
  '澳门': '澳门特别行政区'
}

// 初始化中国地图
const initChinaMap = async () => {
  const mapElement = document.getElementById('worldMap')
  if (!mapElement) return
  
  try {
    // 如果已缓存，直接使用缓存数据
    let chinaGeoJson = chinaMapDataCache
    
    if (!chinaGeoJson) {
      // 优先从本地加载完整地图数据
      try {
        const response = await fetch('/maps/china.json')
        
        if (!response.ok) {
          throw new Error(`本地文件加载失败: ${response.status}`)
        }
        
        chinaGeoJson = await response.json()
        
        // 检查是否是完整的地图数据（应该有34个省级行政区）
        const featureCount = chinaGeoJson.features?.length || 0
        
        // 如果本地文件不完整（少于10个省份），尝试从 CDN 加载完整版本
        if (featureCount < 10) {
          try {
            const cdnResponse = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
            if (cdnResponse.ok) {
              const cdnData = await cdnResponse.json()
              const cdnFeatureCount = cdnData.features?.length || 0
              if (cdnFeatureCount > featureCount) {
                chinaGeoJson = cdnData
              }
            }
          } catch (cdnError) {
            console.warn('从 CDN 加载完整地图失败，使用本地数据:', cdnError)
          }
        }
        
        chinaMapDataCache = chinaGeoJson // 缓存数据
      } catch (error) {
        console.error('加载地图数据失败:', error)
        throw error
      }
    }
    
    // 注册地图（如果还未注册或需要更新）
    echarts.registerMap('china', chinaGeoJson)
    
    const chart = getChart(mapElement)
    if (!chart) return
    
    // 先清除之前的配置，避免残留
    try { 
      chart.clear() 
      // 确保图表实例已准备好
      await nextTick()
    } catch (e) {
      console.warn('清除图表时出错:', e)
    }

    // 从地图数据中提取所有省份名称
    const allProvinceNames = chinaGeoJson.features.map(feature => feature.properties.name)
    
    // 检查地图数据是否完整（中国应该有34个省级行政区）
    if (allProvinceNames.length < 10) {
      console.warn('⚠️ 警告：中国地图数据不完整！当前只有', allProvinceNames.length, '个省份/地区')
    }
    
    // 创建数据映射（短名称 -> 值）
    const dataMap = new Map()
    chinaProvinces.value.forEach(p => {
      const fullName = provinceNameMap[p.name] || p.name
      dataMap.set(fullName, p.value)
    })
    
    // 为所有省份创建数据，如果数据列表中没有则使用0
    const chinaMapData = allProvinceNames.map(provinceName => ({
      name: provinceName,
      value: dataMap.get(provinceName) || 0
    }))
    
    const values = chinaMapData.map(d => d.value || 0)
    const max = Math.max(...values, 1)

    const option = {
      backgroundColor: 'transparent',
      tooltip: { 
        trigger: 'item', 
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#ff8c00',
        borderWidth: 1,
        textStyle: { color: '#fff' },
        formatter: function (params) { 
          if (!params.data) return params.name
          return `<div style="padding: 8px;">
            <div style="font-weight: bold; color: #ff8c00; margin-bottom: 4px;">${params.data.name || params.name}</div>
            <div style="color: #fff;">${geoMetric.value === 'visit' ? '访问量' : '拦截量'}: <span style="color: #4a9eff; font-weight: bold;">${formatNumber(params.data.value || 0)}</span></div>
          </div>`
        } 
      },
      visualMap: {
        show: true,
        min: 0,
        max: Math.max(60000, max),
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        calculable: true,
        realtime: false,
        inRange: { 
          color: ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#7209b7', '#ff8c00', '#ff6b35'] 
        },
        textStyle: { 
          color: '#fff',
          fontSize: 12,
          fontWeight: 'bold'
        },
        itemWidth: 20,
        itemHeight: 120,
        borderColor: '#ff8c00',
        borderWidth: 1,
        formatter: function (value) { 
          return value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value 
        },
        // 确保所有值都能正确映射，包括0
        precision: 0
      },
      series: [
        { 
          name: geoMetric.value === 'visit' ? '访问量' : '拦截量', 
          type: 'map', 
          map: 'china', 
          data: chinaMapData, 
          roam: false,
          label: {
            show: true,
            color: '#fff',
            fontSize: 11
          },
          // 不设置固定的 areaColor，让 visualMap 来控制颜色
          itemStyle: {
            borderColor: '#4a9eff',
            borderWidth: 1.5
          },
          emphasis: { 
            itemStyle: { 
              borderColor: '#ff8c00',
              borderWidth: 2
            },
            label: {
              show: true,
              color: '#fff',
              fontSize: 12,
              fontWeight: 'bold'
            }
          }
        }
      ]
    }

    chart.setOption(option, { notMerge: true }) // 使用 notMerge 确保完全替换配置
    try { 
      chart.resize() 
      // 确保渲染完成
      await nextTick()
    } catch (e) {
      console.warn('调整图表大小时出错:', e)
    }
  } catch (error) {
    console.error('加载中国地图失败:', error)
  }
}

// 初始化攻击类型图表
const initAttackTypeChart = () => {
  const chart = getChart('attackTypeChart')
  if (!chart) return
  try { chart.clear() } catch (e) {}
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#ff8c00',
      borderWidth: 1,
      textStyle: { color: '#fff' },
      formatter: function (params) {
        return `<div style="padding: 8px;">
          <div style="font-weight: bold; color: #ff8c00; margin-bottom: 4px;">${params.name}</div>
          <div style="color: #fff;">攻击次数: <span style="color: #4a9eff; font-weight: bold;">${params.value}</span></div>
          <div style="color: #fff;">占比: <span style="color: #4a9eff; font-weight: bold;">${params.percent}%</span></div>
        </div>`
      }
    },
    legend: {
      data: attackTypeData.value.map(item => item.name),
      textStyle: { color: '#e0e0e0' },
      top: '5%'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '60%'],
        data: attackTypeData.value.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: getAttackTypeColor(item.name),
            borderColor: '#fff',
            borderWidth: 2,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 10
          }
        })),
        label: { 
          show: true,
          color: '#fff',
          fontSize: 12
        },
        labelLine: { 
          show: true,
          lineStyle: { color: '#666' }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  chart.setOption(option)
  try { chart.resize() } catch (e) {}
}

// 初始化性能图表
const initPerformanceChart = () => {
  const chart = getChart('performanceChart')
  if (!chart) return
  try { chart.clear() } catch (e) {}
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#ff8c00',
      borderWidth: 1,
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['CPU', '内存', '磁盘', '网络'],
      textStyle: { color: '#e0e0e0' },
      top: '5%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#888', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#888', fontSize: 10 },
      splitLine: { lineStyle: { color: '#333', type: 'dashed' } }
    },
    series: [
      {
        name: 'CPU',
        type: 'line',
        data: performanceData.value.cpu,
        smooth: true,
        lineStyle: { color: '#ff4d4f', width: 2 },
        itemStyle: { color: '#ff4d4f' }
      },
      {
        name: '内存',
        type: 'line',
        data: performanceData.value.memory,
        smooth: true,
        lineStyle: { color: '#4a9eff', width: 2 },
        itemStyle: { color: '#4a9eff' }
      },
      {
        name: '磁盘',
        type: 'line',
        data: performanceData.value.disk,
        smooth: true,
        lineStyle: { color: '#52c41a', width: 2 },
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '网络',
        type: 'line',
        data: performanceData.value.network,
        smooth: true,
        lineStyle: { color: '#ff8c00', width: 2 },
        itemStyle: { color: '#ff8c00' }
      }
    ]
  }
  
  chart.setOption(option)
  try { chart.resize() } catch (e) {}
}

// 获取攻击类型颜色
const getAttackTypeColor = (type) => {
  const colors = {
    'SQL注入': '#ff4d4f',
    'XSS攻击': '#ff8c00',
    '目录遍历': '#52c41a',
    '命令注入': '#722ed1',
    '文件包含': '#1890ff'
  }
  return colors[type] || '#666'
}

// 从后端获取KPI数据
const fetchKpiData = async () => {
  // 如果使用模拟数据，不调用API
  if (useMockData.value) {
    console.log('当前使用模拟数据，跳过API调用')
    return
  }
  
  try {
    loading.value = true
    console.log('开始获取流量分析数据...')
    
    // 调用后端接口
    const response = await trafficAPI.getAccessStats()
    
    console.log('获取到的完整响应:', response)
    
    // 根据后端实际返回的数据结构解析
    // 后端返回格式：{ code: 200, message: "操作成功", data: {...}, timestamp: ... }
    let statsData = null
    
    if (response) {
      // 如果响应有 code 字段，说明是标准格式
      if (response.code === 200 && response.data) {
        statsData = response.data
      } 
      // 如果响应直接是数据对象
      else if (response.totalRequests !== undefined) {
        statsData = response
      }
      // 如果响应里面有嵌套的 data
      else if (response.data) {
        statsData = response.data
      }
    }
    
    console.log('解析后的统计数据:', statsData)
    
    if (statsData) {
      // 从 statsData.data 中提取实际数据
      const actualData = statsData.data || statsData
      
      console.log('实际数据:', actualData)
      
      // 更新全局状态中的KPI数据，映射字段
      dashboardData.kpi = {
        requests: actualData.totalRequests ?? 0, // 总请求数
        pageViews: actualData.allowedRequests ?? 0, // 访问次数
        uniqueVisitors: actualData.uniqueIps ?? 0, // 独立访客(UV) - 使用独立IP
        uniqueIPs: actualData.uniqueIps ?? 0, // 独立IP
        intercepts: actualData.blockedRequests ?? 0, // 拦截次数
        attackIPs: actualData.attackIPs ?? 0, // 攻击IP
        error4xx: actualData.error4xx ?? 0, // 4xx错误数
        error4xxRate: actualData.error4xxRate ?? 0, // 4xx错误率
        intercept4xx: actualData.intercept4xx ?? 0, // 4xx拦截数
        intercept4xxRate: actualData.intercept4xxRate ?? 0, // 4xx拦截率
        error5xx: actualData.error5xx ?? 0, // 5xx错误数
        error5xxRate: actualData.error5xxRate ?? 0, // 5xx错误率
        avgResponseTime: Math.round((actualData.avgResponseTime || 0) * 1000), // 平均响应时间，从秒转为毫秒
        bandwidth: Math.round((actualData.totalBytes || 0) / 1024 / 1024), // 宽带使用，从字节转为MB
        sslConnections: actualData.sslConnections ?? 0, // SSL连接数
        countries: actualData.countries ?? 0, // 访问国家数
        mobileTraffic: actualData.mobileTraffic ?? 0, // 移动端流量
        desktopTraffic: actualData.desktopTraffic ?? 0 // 桌面端流量
      }
      
      console.log('KPI数据已更新到全局状态:', dashboardData.kpi)
    } else {
      console.warn('未能解析统计数据')
    }
  } catch (error) {
    console.error('获取流量分析数据失败:', error)
    // 不设置模拟数据，保持为空
  } finally {
    loading.value = false
  }
}

// 初始化所有图表
const initAllCharts = async () => {
  initQPSChart()
  initVisitChart()
  initInterceptChart()
  initAttackTypeChart()
  initPerformanceChart()
  
  // 初始化地图
  if (geoScope.value === 'world') {
    await initWorldMap()
  } else {
    await initChinaMap()
  }
}

onMounted(async () => {
  // 首先获取KPI数据
  await fetchKpiData()
  
  await nextTick()
  initAllCharts()
  startQpsAutoRefresh()
  
  })

// 监听 useMockData 变化，重新获取数据
watch(useMockData, async (newValue) => {
  console.log('=== TrafficAnalysis: useMockData 变化了 ===')
  console.log('新值:', newValue)
  
  if (!newValue) {
    // 切换到API数据，重新获取
    console.log('切换到API数据，重新获取KPI数据')
    await fetchKpiData()
  } else {
    // 切换到模拟数据，使用全局的 mockAllDashboardData
    console.log('切换到模拟数据')
  }
  
  await nextTick()
  initAllCharts()
})

// 监听地理位置视图变化，重新初始化地图
watch([geoScope, geoMetric], async (newVal, oldVal) => {
  // 避免初始化时的重复调用
  if (oldVal === undefined) return
  
  await nextTick()
  
  try {
    if (geoScope.value === 'world') {
      await initWorldMap()
    } else {
      await initChinaMap()
    }
  } catch (error) {
    console.error('切换地图时出错:', error)
  }
}, { flush: 'post' }) // 使用 post 确保 DOM 更新后再执行

onUnmounted(() => {
  stopQpsAutoRefresh()
  chartInstances.forEach((c) => {
    try { c.dispose && c.dispose() } catch (e) { console.warn('dispose chart error', e) }
  })
  chartInstances.clear()
})
</script>

<style scoped>
.traffic-analysis {
  padding: 20px;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
  min-height: 100vh;
  color: #e0e0e0;
}

/* KPI指标卡片 */
.kpi-section {
  display: grid;
  /* grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); */
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.kpi-card {
  background: linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%);
  padding: 20px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid rgba(74,158,255,0.2);
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4a9eff 0%, #ff8c00 50%, #ff6b35 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(74,158,255,0.2);
  border-color: rgba(74,158,255,0.4);
}

.kpi-card:hover::before {
  opacity: 1;
}

.kpi-icon {
  font-size: 32px;
  margin-bottom: 12px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.kpi-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.kpi-label {
  font-size: 14px;
  color: #bbb;
  text-align: center;
  font-weight: 500;
}

.kpi-trend {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 12px;
  color: #ff4d4f;
}

/* 主要图表区域 */
.main-charts-section {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  align-items: flex-start;
  height: 1200px;
}

.panel.geo-panel {
  flex: 2;
  min-width: 60%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.right-charts-area {
  flex: 1;
  min-width: 30%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel.qps-panel,
.panel.status-panel {
  width: 100%;
  height: 390px;
  display: flex;
  flex-direction: column;
}

@media (max-width: 1200px) {
  .main-charts-section {
    flex-direction: column;
  }
  
  .panel.geo-panel {
    margin-bottom: 20px;
  }
  
  .right-charts-area {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .panel.qps-panel,
  .panel.status-panel {
    flex: 1;
    min-width: 300px;
  }
}

@media (max-width: 768px) {
  .right-charts-area {
    flex-direction: column;
  }
  
  .panel.qps-panel,
  .panel.status-panel {
    min-width: 100%;
  }
}

/* 面板样式 */
.panel {
  background: linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(74,158,255,0.2);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  position: relative;
  overflow: hidden;
}

.panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4a9eff 0%, #ff8c00 50%, #ff6b35 100%);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.geo-controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  padding: 10px 18px;
  border: 1px solid rgba(74,158,255,0.3);
  border-radius: 8px;
  cursor: pointer;
  background: linear-gradient(135deg, rgba(42,42,42,0.8) 0%, rgba(60,60,60,0.8) 100%);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(74,158,255,0.3);
  border-color: rgba(74,158,255,0.6);
  background: linear-gradient(135deg, rgba(74,158,255,0.2) 0%, rgba(60,60,60,0.9) 100%);
}

.control-btn.active {
  background: linear-gradient(135deg, #4a9eff 0%, #3b82f6 100%);
  border-color: #4a9eff;
  box-shadow: 0 4px 12px rgba(74,158,255,0.4);
  transform: translateY(-1px);
}

.map-container {
  flex: 1;
  min-height: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.3);
  background: radial-gradient(circle at center, rgba(74,158,255,0.05) 0%, transparent 70%);
  position: relative;
  display: flex;
  width: 100%;
}

.world-map {
  flex: 1;
  min-width: 0;
  min-height: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  position: absolute;
  top: 0;
  left: 0;
}

.country-list {
  flex: 0 0 auto;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 16px;
  padding: 12px;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
  border: 1px solid rgba(74,158,255,0.2);
  display: flex;
  flex-direction: column;
  width: 100%;
}

.country-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%);
  border-radius: 12px;
  margin-bottom: 12px;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(74,158,255,0.1);
  border: 1px solid rgba(74,158,255,0.2);
  transition: all 0.3s ease;
}

.country-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(74,158,255,0.2);
  border-color: rgba(74,158,255,0.4);
}

.country-name {
  flex: 1 1 80px;
  font-size: 15px;
  color: #4a9eff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
}

.country-value {
  font-size: 15px;
  color: #fff;
  margin-left: 12px;
  min-width: 48px;
  text-align: right;
  font-weight: bold;
}

.progress-bar {
  flex: 1 1 60px;
  height: 10px;
  background: linear-gradient(90deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 6px;
  margin-left: 12px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a9eff 0%, #ff8c00 50%, #ff6b35 100%);
  border-radius: 6px;
  transition: width 0.6s ease;
}

/* QPS面板 */
.qps-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.qps-controls {
  display: flex;
  gap: 10px;
}

.qps-control-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #2a2a2a;
  color: #fff;
}

.qps-control-btn.active {
  background-color: #4a9eff;
}

.qps-interval-selector {
  flex: 1;
}

.qps-interval-select {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 4px;
  background-color: #2a2a2a;
  color: #fff;
}

.refresh-icon {
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  background-color: #2a2a2a;
  transition: background-color 0.3s ease;
}

.refresh-icon:hover {
  background-color: #4a9eff;
}

.chart-container {
  flex: 1;
  min-height: 0;
  height: auto;
  display: flex;
  width: 100%;
}


.status-panel {
  background: linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(74,158,255,0.2);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.status-peak {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #4a9eff;
}

.status-chart {
  height: 200px;
}

/* 扩展区域样式 */
.extended-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.attack-panel, .threat-panel, .performance-panel {
  background: linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(74,158,255,0.2);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  position: relative;
  overflow: hidden;
}

.attack-panel::before, .threat-panel::before, .performance-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4a9eff 0%, #ff8c00 50%, #ff6b35 100%);
}

.attack-chart, .performance-chart {
  height: 250px;
}

/* 威胁列表样式 */
.threat-list {
  max-height: 250px;
  overflow-y: auto;
}

.threat-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(74,158,255,0.1);
}

.threat-item:last-child {
  border-bottom: none;
}

.threat-level {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  margin-right: 12px;
  min-width: 40px;
  text-align: center;
}

.threat-level.high {
  background-color: #ff4d4f;
  color: #fff;
}

.threat-level.medium {
  background-color: #ff8c00;
  color: #fff;
}

.threat-level.low {
  background-color: #52c41a;
  color: #fff;
}

.threat-info {
  flex: 1;
}

.threat-ip {
  color: #4a9eff;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: bold;
}

.threat-type {
  color: #e0e0e0;
  font-size: 12px;
  margin-top: 2px;
}

.threat-time {
  color: #999;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

/* 地图数据流动画 */
.map-data-flow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.map-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, #ff8c00 0%, transparent 70%);
  border-radius: 50%;
  animation: mapFlowMove 6s linear infinite;
  box-shadow: 0 0 12px #ff8c00;
}

.map-particle:nth-child(1) { top: 25%; left: 15%; }
.map-particle:nth-child(2) { top: 55%; left: 45%; }
.map-particle:nth-child(3) { top: 75%; left: 75%; }

@keyframes mapFlowMove {
  0% { 
    transform: translateX(0) translateY(0) scale(0.3);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% { 
    transform: translateX(80px) translateY(-30px) scale(1.2);
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .extended-section {
    grid-template-columns: 1fr 1fr;
  }
  
  .performance-panel {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .extended-section {
    grid-template-columns: 1fr;
  }
  
  .performance-panel {
    grid-column: 1;
  }
}
</style>