<template>
  <div class="security-status">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">加载安全态势数据中...</div>
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div v-if="error" class="error-message">
      <div class="error-icon">⚠️</div>
      <div class="error-text">{{ error }}</div>
      <button @click="loadData" class="retry-btn">重试</button>
    </div>

    <!-- 顶部统计卡片（单行横向排列） -->
    <div class="kpi-section">
      <div class="kpi-card">
        <div class="kpi-icon">🛡️</div>
        <div class="kpi-value">{{ formatNumber(statCards.attackProtection) }}</div>
        <div class="kpi-label">攻击防护</div>
        <div class="kpi-info">ℹ️</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">📋</div>
        <div class="kpi-value">{{ formatNumber(statCards.blackWhiteList) }}</div>
        <div class="kpi-label">黑白名单</div>
        <div class="kpi-info">ℹ️</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">⏱️</div>
        <div class="kpi-value">{{ formatNumber(statCards.frequencyLimit) }}</div>
        <div class="kpi-label">频率限制</div>
        <div class="kpi-info">ℹ️</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🚪</div>
        <div class="kpi-value">{{ formatNumber(statCards.waitingRoom) }}</div>
        <div class="kpi-label">等候室</div>
        <div class="kpi-info">ℹ️</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">👤</div>
        <div class="kpi-value">{{ formatNumber(statCards.humanMachineVerification) }}</div>
        <div class="kpi-label">人机验证</div>
        <div class="kpi-info">ℹ️</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🔐</div>
        <div class="kpi-value">{{ formatNumber(statCards.identityAuth) }}</div>
        <div class="kpi-label">身份认证</div>
        <div class="kpi-info">ℹ️</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🛡️</div>
        <div class="kpi-value">{{ formatNumber(statCards.pageProtect) }}</div>
        <div class="kpi-label">网页防篡改</div>
        <div class="kpi-info">ℹ️</div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧列 -->
      <div class="left-column">
        <!-- 攻击防护趋势 -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">攻击防护趋势</h3>
            <div class="decoration-line"></div>
          </div>
          <div class="border-wrapper">
            <div class="chart-container">
              <AttackTrendChart :data="attackTrend" />
            </div>
          </div>
        </div>

        <!-- 攻击源IP（基于拦截趋势接口） -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">攻击源IP</h3>
            <div class="decoration-line"></div>
          </div>
          <div class="border-wrapper">
            <div class="table-container">
              <div v-for="(item, index) in attackInterceptIPs" :key="index" class="table-item">
                <span class="ip-address">{{ item.ip }}</span>
                <span class="ip-count">{{ formatNumber(item.count) }}</span>
              </div>
            </div>
          </div>
        </div>

        

        <!-- 黑白名单趋势 -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">黑白名单趋势</h3>
            <div class="decoration-line"></div>
          </div>
          <div class="border-wrapper">
            <div class="chart-container">
              <BlackWhiteTrend :data="blackWhiteTrend" />
            </div>
          </div>
        </div>

        
      </div>

      <!-- 右侧列 -->
      <div class="right-column">
        <!-- 实时事件 -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">实时事件</h3>
          </div>
          <div class="event-list">
            <div v-for="(event, index) in realTimeEvents" :key="index" class="event-item">
              <div class="event-tag" :class="event.type">{{ event.typeName }}</div>
              <div class="event-content">{{ event.content }}</div>
              <div class="event-time">{{ event.time }}</div>
            </div>
          </div>
        </div>

        <!-- Web攻击分布 -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">Web 攻击分布</h3>
          </div>
          <div class="donut-container">
            <div class="donut-chart">
              <AttackTypePie :data="webAttackDistribution" />
            </div>
            <div class="donut-legend">
              <div v-for="attack in webAttackDistribution" :key="attack.type" class="legend-item">
                <div class="legend-dot" :style="`background-color: ${getAttackColor(attack.type)};`"></div>
                <span class="legend-label">{{ attack.type }}</span>
                <span class="legend-value">{{ formatNumber(attack.count) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 黑白名单规则命中分布 -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">黑白名单规则命中分布</h3>
          </div>
          <div class="rule-list">
            <div v-for="(rule, index) in blackWhiteRules" :key="index" class="rule-item">
              <div class="rule-name">{{ rule.name }}</div>
              <div class="rule-count">{{ formatNumber(rule.count) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 扩展区域 -->
    <div class="extended-section">
      

      <!-- 防护规则状态 -->
      <div class="panel protection-rules-panel">
        <div class="panel-header">
          <h3 class="panel-title">防护规则状态</h3>
        </div>
        <div class="protection-rules-list">
          <div v-for="(rule, index) in protectionRules" :key="index" class="protection-rule-item">
            <div class="rule-icon" :class="rule.status">{{ getRuleStatusIcon(rule.status) }}</div>
            <div class="rule-info">
              <div class="rule-name">{{ rule.name }}</div>
              <div class="rule-description">{{ rule.description }}</div>
            </div>
            <div class="rule-status" :class="rule.status">{{ getRuleStatusText(rule.status) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部统计区域 -->
    <div class="bottom-stats-section">
      <!-- 安全评分 -->
      <div class="panel security-score-panel">
        <div class="panel-header">
          <h3 class="panel-title">安全评分</h3>
        </div>
        <div class="security-score-content">
          <div class="score-circle">
            <div class="score-value">{{ securityScore }}</div>
            <div class="score-label">安全评分</div>
          </div>
          <div class="score-details">
            <div class="score-item">
              <span class="score-item-label">防护覆盖率</span>
              <span class="score-item-value">{{ protectionCoverage }}%</span>
            </div>
            <div class="score-item">
              <span class="score-item-label">响应时间</span>
              <span class="score-item-value">{{ responseTime }}ms</span>
            </div>
            <div class="score-item">
              <span class="score-item-label">威胁检测率</span>
              <span class="score-item-value">{{ threatDetectionRate }}%</span>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// 已移除最近攻击趋势图表的ECharts依赖
import axios from 'axios'
// 使用聚合 API 客户端（带鉴权与代理），接入拦截趋势与热门IP
import { trafficAPI } from '../api/index.js'
import AttackTrendChart from '../components/dashboard/AttackTrendChart.vue'
import AttackTypePie from '../components/dashboard/AttackTypePie.vue'
import BlackWhiteTrend from '../components/dashboard/BlackWhiteTrend.vue'
import { securityAPI } from '../api/securityAPI.js'

// 加载状态
const loading = ref(true)
const error = ref('')

// 统计数据
const statCards = ref({
  attackProtection: 1200,
  blackWhiteList: 1900,
  frequencyLimit: 30,
  waitingRoom: 0,
  humanMachineVerification: 54,
  identityAuth: 0,
  pageProtect: 0
})

// 攻击趋势数据
const attackTrend = ref([
  { timestamp: '10:00', count: 120 },
  { timestamp: '11:00', count: 180 },
  { timestamp: '12:00', count: 220 },
  { timestamp: '13:00', count: 190 },
  { timestamp: '14:00', count: 250 },
  { timestamp: '15:00', count: 300 },
  { timestamp: '16:00', count: 280 }
])

// 黑白名单趋势数据
const blackWhiteTrend = ref([
  { timestamp: '10:00', blacklist: 20, whitelist: 5 },
  { timestamp: '11:00', blacklist: 25, whitelist: 8 },
  { timestamp: '12:00', blacklist: 30, whitelist: 12 },
  { timestamp: '13:00', blacklist: 28, whitelist: 10 },
  { timestamp: '14:00', blacklist: 35, whitelist: 15 },
  { timestamp: '15:00', blacklist: 40, whitelist: 18 },
  { timestamp: '16:00', blacklist: 38, whitelist: 16 }
])

// 已移除：攻击源IP列表（按要求不展示该栏）

// 攻击源IP（来源于拦截趋势接口的可能字段，若无则回退安全接口）
const attackInterceptIPs = ref<{ ip: string; count: number }[]>([])

// 归一化后端IP列表到 {ip, count}[]
const normalizeIpList = (raw: any): { ip: string; count: number }[] => {
  if (!raw) return []
  // 数组情况
  if (Array.isArray(raw)) {
    if (raw.length === 0) return []
    // 字符串数组，如 ['1.2.3.4', '5.6.7.8']
    if (typeof raw[0] === 'string') {
      return raw.map((ip: string) => ({ ip, count: 0 }))
    }
    // 对象数组，如 [{ip:'1.2.3.4', count:10}, {address:'5.6.7.8', blockedCount:2}]
    return raw
      .map((r: any) => ({
        ip: r?.ip || r?.address || r?.source || r?.src,
        count: Number(r?.count ?? r?.blockedCount ?? r?.value ?? r?.num ?? 0) || 0
      }))
      .filter((x: any) => !!x.ip)
  }
  // 键值对象，如 { '1.2.3.4': 10, '5.6.7.8': 2 }
  if (typeof raw === 'object') {
    return Object.entries(raw)
      .map(([ip, count]) => ({ ip, count: Number(count) || 0 }))
      .filter(v => !!v.ip)
  }
  return []
}

// 实时事件数据
const realTimeEvents = ref([
  { type: 'human-machine', typeName: '人机验证', content: '人机验证演示(勿动)', time: '10:12:16' },
  { type: 'black-white', typeName: '黑白名单', content: '无标题', time: '10:11:45' },
  { type: 'black-white', typeName: '黑白名单', content: '无标题', time: '10:10:32' },
  { type: 'human-machine', typeName: '人机验证', content: '人机验证演示(勿动)', time: '10:09:18' },
  { type: 'black-white', typeName: '黑白名单', content: '无标题', time: '10:08:05' }
])

// Web攻击分布数据
const webAttackDistribution = ref([
  { type: '目录穿越', count: 464 },
  { type: '后门', count: 406 },
  { type: '信息泄露', count: 272 },
  { type: '文件包含', count: 51 },
  { type: '命令注入', count: 18 }
])

// 黑白名单规则数据
const blackWhiteRules = ref([
  { name: '长亭社区恶意 IP 情报...', count: 67 },
  { name: '对内网 IP 加白', count: 2 }
])

// 已移除：安全事件统计、威胁等级分布模块及其数据

// 防护规则状态数据
const protectionRules = ref([
  { name: 'SQL注入防护', description: '检测和阻止SQL注入攻击', status: 'active' },
  { name: 'XSS防护', description: '跨站脚本攻击防护', status: 'active' },
  { name: 'CSRF防护', description: '跨站请求伪造防护', status: 'active' },
  { name: '文件上传防护', description: '恶意文件上传检测', status: 'warning' },
  { name: '目录遍历防护', description: '路径遍历攻击防护', status: 'inactive' },
  { name: '暴力破解防护', description: '登录暴力破解防护', status: 'active' }
])

// 安全评分数据
const securityScore = ref(85)
const protectionCoverage = ref(92)
const responseTime = ref(120)
const threatDetectionRate = ref(96)

// 已移除：最近攻击趋势图表的数据与渲染逻辑

// 获取攻击类型颜色（兼容中英文与不同命名）
const getAttackColor = (type: string) => {
  const t = (type || '').toLowerCase()
  const colors: { [key: string]: string } = {
    // 英文后端命名
    'xss': '#faad14',
    'sqli': '#ff4d4f',
    'rce': '#ff8c00',
    'lfi': '#722ed1',
    'csrf': '#13c2c2',
    'directory_traversal': '#1890ff',
    'dir_traversal': '#1890ff',

    // 中文命名兼容
    'xss攻击': '#faad14',
    'sql注入': '#ff4d4f',
    '命令注入': '#ff8c00',
    '文件包含': '#722ed1',
    'csrf攻击': '#13c2c2',
    '目录遍历': '#1890ff',
    '目录穿越': '#1890ff',
    '后门': '#ff8c00',
    '信息泄露': '#52c41a'
  }
  return colors[t] || colors[type] || '#666'
}

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 获取规则状态图标
const getRuleStatusIcon = (status: string) => {
  const icons: { [key: string]: string } = {
    'active': '✅',
    'warning': '⚠️',
    'inactive': '❌'
  }
  return icons[status] || '❓'
}

// 获取规则状态文本
const getRuleStatusText = (status: string) => {
  const texts: { [key: string]: string } = {
    'active': '正常',
    'warning': '警告',
    'inactive': '停用'
  }
  return texts[status] || '未知'
}

// 根据后端数据结构更新前端数据
const updateFromBackendData = (statsData: any, securityData: any) => {
  // 更新顶部统计卡片
  statCards.value = {
    attackProtection: statsData.security_events?.total_blocked || 0,
    blackWhiteList: statsData.rule_info?.total_rules || 0,
    frequencyLimit: 30, // 暂时保留模拟数据
    waitingRoom: 0,     // 暂时保留模拟数据
    humanMachineVerification: 54, // 暂时保留模拟数据
    identityAuth: 0,    // 暂时保留模拟数据
    pageProtect: 0      // 暂时保留模拟数据
  }

  // 更新Web攻击分布
  webAttackDistribution.value = [
    { type: 'XSS攻击', count: statsData.security_events?.xss_attempts || 0 },
    { type: 'SQL注入', count: statsData.security_events?.sql_injection_attempts || 0 },
    { type: '命令注入', count: statsData.security_events?.rce_attempts || 0 },
    { type: '文件包含', count: statsData.security_events?.lfi_attempts || 0 },
    { type: '目录遍历', count: statsData.security_events?.dir_traversal_attempts || 0 }
  ]

  // 已移除：威胁等级分布的更新逻辑

  // 更新防护规则状态
  protectionRules.value = [
    { name: 'XSS防护', description: `共${statsData.rule_info?.rule_categories?.xss || 0}条规则`, status: 'active' },
    { name: 'SQL注入防护', description: `共${statsData.rule_info?.rule_categories?.sqli || 0}条规则`, status: 'active' },
    { name: '命令注入防护', description: `共${statsData.rule_info?.rule_categories?.rce || 0}条规则`, status: 'active' },
    { name: '文件包含防护', description: `共${statsData.rule_info?.rule_categories?.lfi || 0}条规则`, status: 'active' },
    { name: '目录遍历防护', description: `共${statsData.rule_info?.rule_categories?.dir_traversal || 0}条规则`, status: 'active' },
    { name: '自定义规则', description: `共${statsData.rule_info?.rule_categories?.custom || 0}条规则`, status: 'active' }
  ]

  // 更新安全评分（基于拦截率和规则状态计算）
  const blockRate = statsData.request_stats?.block_rate || 0
  const activeRuleRate = statsData.rule_info?.total_rules > 0 
    ? (statsData.rule_info.active_rules / statsData.rule_info.total_rules) * 100 
    : 0
  
  securityScore.value = Math.min(100, Math.floor((blockRate * 0.3 + activeRuleRate * 0.7) * 100) / 100)
  protectionCoverage.value = Math.floor(activeRuleRate)
  responseTime.value = 120 // 暂时保留模拟数据
  threatDetectionRate.value = Math.floor(blockRate * 10) // 基于拦截率估算

}

// 数据加载函数
const loadData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // 使用代理路径，不再直接调用IP地址
    const baseURL = '/api'  // 这会通过Vite代理转发到真实后端
    
    try {
      // 调用 /system/stats 接口（这个接口数据最全）
      const statsResponse = await axios.get(`${baseURL}/system/stats`)
      const statsData = statsResponse.data.data.data
      
      // 调用 /system/security 接口作为补充
      const securityResponse = await axios.get(`${baseURL}/system/security`)
      const securityData = securityResponse.data.data
      
      // 使用后端数据更新前端展示
      updateFromBackendData(statsData, securityData)

      // 接入拦截趋势（24小时）
      try {
        const interceptRes = await trafficAPI.getInterceptData({ timeRange: '24h' })
        const interceptData = interceptRes?.data?.data || {}
        const trend = Array.isArray(interceptData?.data) ? interceptData.data : []
        attackTrend.value = trend.map(item => ({
          timestamp: item.time,
          count: Number(item.value) || 0
        }))

        // 攻击源IP不从拦截趋势数据解析，改为在WAF统计中获取
      } catch (e) {
        console.warn('加载拦截趋势失败，保留现有数据', e)
      }

      // 已移除：热门访问IP（access/top-ips）加载逻辑，现基于拦截/安全接口提供攻击IP

      // Web攻击分布（WAF统计24h）
      try {
        const end = new Date()
        const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
        const wafRes = await trafficAPI.getWafStats({
          startTime: start.toISOString(),
          endTime: end.toISOString()
        })
        const wafData = wafRes?.data?.data || {}
        const topAttacks = Array.isArray(wafData?.topAttacks) ? wafData.topAttacks : []
        webAttackDistribution.value = topAttacks.map(a => ({ type: a.type, count: Number(a.count) || 0 }))

        // 攻击源IP：优先使用WAF统计中的IP列表，保持与攻击防护趋势数据时间范围一致
        try {
          const rawIps = Array.isArray(wafData?.topIps) ? wafData.topIps
            : (Array.isArray(wafData?.attackIps) ? wafData.attackIps : null)
          let ipList = normalizeIpList(rawIps)
          if (ipList.length === 0) {
            // 回退到安全接口提供的攻击源IP
            const secRes = await securityAPI.getAttackSourceIPs({ timeRange: '24h', limit: 10 })
            const secData = secRes?.data?.data
            ipList = normalizeIpList(secData)
          }
          attackInterceptIPs.value = ipList
            .sort((a, b) => (b.count || 0) - (a.count || 0))
            .slice(0, 10)
        } catch (e) {
          console.warn('设置攻击源IP失败，保留现有数据', e)
        }
      } catch (e) {
        console.warn('加载Web攻击分布失败，保留现有数据', e)
      }

      // 黑白名单趋势（24h）
      try {
        const bwRes = await securityAPI.getBlackWhiteTrend({ timeRange: '24h' })
        const bwArr = Array.isArray(bwRes?.data?.data) ? bwRes.data.data : []
        blackWhiteTrend.value = bwArr.map(d => ({
          timestamp: d.time || d.timestamp,
          blacklist: Number(d.blacklist ?? d.black) || 0,
          whitelist: Number(d.whitelist ?? d.white) || 0
        }))
      } catch (e) {
        console.warn('加载黑白名单趋势失败，保留现有数据', e)
      }

      // 实时事件（合并WAF与访问日志）
      try {
        const realRes = await trafficAPI.getRealtimeLogs()
        const wafLogs = Array.isArray(realRes?.data?.data?.waf) ? realRes.data.data.waf : []
        const accessLogs = Array.isArray(realRes?.data?.data?.access) ? realRes.data.data.access : []
        const wafEvents = wafLogs.slice(0, 5).map(l => ({
          type: 'waf',
          typeName: 'WAF审计',
          content: `${l.method} ${l.uri} ${l.action}${l.ruleId ? ' #' + l.ruleId : ''}`,
          time: new Date(l.time).toLocaleTimeString('zh-CN', { hour12: false })
        }))
        const accessEvents = accessLogs.slice(0, 5).map(l => ({
          type: 'access',
          typeName: '访问日志',
          content: `${l.method} ${l.uri} ${l.status}`,
          time: new Date(l.time).toLocaleTimeString('zh-CN', { hour12: false })
        }))
        realTimeEvents.value = [...wafEvents, ...accessEvents].slice(0, 5)
      } catch (e) {
        console.warn('加载实时事件失败，保留现有数据', e)
      }

      // 加载性能指标用于响应时间
      try {
        const perfRes = await trafficAPI.getPerformanceData()
        const perf = perfRes?.data?.data || {}
        const avg = Number(perf.avg_response_time ?? perf.response_time)
        if (!Number.isNaN(avg) && avg > 0) {
          responseTime.value = Math.floor(avg)
        }
      } catch (e) {
        console.warn('加载性能指标失败，保留现有响应时间', e)
      }
    } catch (apiError) {
      console.warn('API调用失败，使用模拟数据:', apiError)
      // API失败时使用模拟数据
      updateMockData()
    }
    
    loading.value = false
  } catch (err) {
    error.value = '数据加载失败，使用模拟数据展示'
    loading.value = false
    console.error('加载安全态势数据失败:', err)
    updateMockData() // 确保有数据展示
  }
}

// 模拟数据更新函数（可选）
const updateMockData = () => {
  // 保留原有的时间更新逻辑
  const now = new Date()
  const currentHour = now.getHours()
  
  // 模拟实时事件时间更新
  realTimeEvents.value = realTimeEvents.value.map((event, index) => ({
    ...event,
    time: `${String(currentHour).padStart(2, '0')}:${String(now.getMinutes() - index).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  }))
  
  // 不再随机调整安全评分，因为现在使用真实数据
}

onMounted(async () => {
  // 初始化加载后端数据（已移除最近攻击趋势图表初始化）
  loadData()
})
</script>

<style scoped>
.security-status {
  padding: 20px;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
  min-height: 100vh;
  color: #e0e0e0;
}

/* KPI指标卡片 */
.kpi-section {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 20px;
  margin-bottom: 30px;
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
  margin-bottom: 8px;
}

.kpi-info {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;
}

.kpi-info:hover {
  color: #4a9eff;
}

/* 主要内容区域 */
.main-content {
  display: flex;
  gap: 24px;
}

.left-column, .right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  position: relative;
}

.panel-title::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #4a9eff 0%, #ff8c00 100%);
  border-radius: 1px;
}

.view-more {
  color: #4a9eff;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.view-more:hover {
  color: #ff8c00;
}

/* 图表容器 */
.chart-container {
  height: 300px;
}

/* DataV 边框容器适配 */
.decoration-line {
  width: 100%;
  height: 3px;
  margin-top: 8px;
  background: linear-gradient(90deg, 
    rgba(74, 158, 255, 0.8) 0%, 
    rgba(74, 158, 255, 0.4) 50%, 
    rgba(74, 158, 255, 0.8) 100%);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.decoration-line::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.3) 50%, 
    transparent 100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.border-wrapper {
  padding: 8px;
}

/* 表格样式 */
.table-container {
  max-height: 200px;
  overflow-y: auto;
}

.table-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(74,158,255,0.1);
}

.table-item:last-child {
  border-bottom: none;
}

.ip-address {
  color: #4a9eff;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.ip-count {
  color: #fff;
  font-weight: bold;
  font-size: 16px;
}

/* 事件列表 */
.event-list {
  max-height: 300px;
  overflow-y: auto;
}

.event-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(74,158,255,0.1);
}

.event-item:last-child {
  border-bottom: none;
}

.event-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  margin-right: 12px;
  min-width: 60px;
  text-align: center;
}

.event-tag.human-machine {
  background-color: #4a9eff;
  color: #fff;
}

.event-tag.black-white {
  background-color: #666;
  color: #fff;
}

.event-content {
  flex: 1;
  color: #e0e0e0;
  font-size: 14px;
}

.event-time {
  color: #999;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

/* 饼图容器 */
.donut-container {
  display: flex;
  gap: 20px;
}

.donut-chart {
  flex: 1;
  height: 200px;
}

.donut-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.legend-label {
  flex: 1;
  color: #e0e0e0;
  font-size: 14px;
}

.legend-value {
  color: #fff;
  font-weight: bold;
  font-size: 14px;
}

/* 规则列表 */
.rule-list {
  max-height: 200px;
  overflow-y: auto;
}

.rule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(74,158,255,0.1);
}

.rule-item:last-child {
  border-bottom: none;
}

.rule-name {
  color: #e0e0e0;
  font-size: 14px;
  flex: 1;
}

.rule-count {
  color: #fff;
  font-weight: bold;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }
  
  .kpi-section {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .kpi-section {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .donut-container {
    flex-direction: column;
  }
}

/* 加载状态样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  text-align: center;
  color: #fff;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(74, 158, 255, 0.3);
  border-top: 4px solid #4a9eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.loading-text {
  font-size: 16px;
  color: #e0e0e0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态样式 */
.error-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%);
  border: 1px solid rgba(255, 77, 79, 0.3);
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  z-index: 9999;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-text {
  color: #e0e0e0;
  font-size: 16px;
  margin-bottom: 20px;
  line-height: 1.5;
}

.retry-btn {
  background: linear-gradient(135deg, #4a9eff 0%, #ff8c00 100%);
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(74, 158, 255, 0.4);
}

/* 扩展区域样式 */
.extended-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.security-events-panel, .threat-level-panel, .protection-rules-panel {
  background: linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(74,158,255,0.2);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  position: relative;
  overflow: hidden;
}

.security-events-panel::before, .threat-level-panel::before, .protection-rules-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4a9eff 0%, #ff8c00 50%, #ff6b35 100%);
}

.security-events-chart, .threat-level-chart {
  height: 250px;
}

/* 防护规则列表样式 */
.protection-rules-list {
  max-height: 250px;
  overflow-y: auto;
}

.protection-rule-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(74,158,255,0.1);
}

.protection-rule-item:last-child {
  border-bottom: none;
}

.rule-icon {
  font-size: 20px;
  margin-right: 12px;
  min-width: 24px;
  text-align: center;
}

.rule-info {
  flex: 1;
}

.rule-name {
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
}

.rule-description {
  color: #bbb;
  font-size: 12px;
}

.rule-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
}

.rule-status.active {
  background-color: #52c41a;
  color: #fff;
}

.rule-status.warning {
  background-color: #ff8c00;
  color: #fff;
}

.rule-status.inactive {
  background-color: #ff4d4f;
  color: #fff;
}

/* 底部统计区域样式 */
.bottom-stats-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.security-score-panel, .recent-attacks-panel {
  background: linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(74,158,255,0.2);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  position: relative;
  overflow: hidden;
}

.security-score-panel::before, .recent-attacks-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4a9eff 0%, #ff8c00 50%, #ff6b35 100%);
}

/* 安全评分样式 */
.security-score-content {
  display: flex;
  align-items: center;
  gap: 30px;
}

.score-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a9eff 0%, #ff8c00 100%);
  position: relative;
}

.score-circle::before {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  right: 4px;
  bottom: 4px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%);
}

.score-value {
  font-size: 32px;
  font-weight: bold;
  color: #fff;
  z-index: 1;
}

.score-label {
  font-size: 12px;
  color: #bbb;
  z-index: 1;
}

.score-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(74,158,255,0.1);
}

.score-item:last-child {
  border-bottom: none;
}

.score-item-label {
  color: #e0e0e0;
  font-size: 14px;
}

.score-item-value {
  color: #4a9eff;
  font-size: 16px;
  font-weight: bold;
}

.recent-attacks-chart {
  height: 200px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .extended-section {
    grid-template-columns: 1fr 1fr;
  }
  
  .protection-rules-panel {
    grid-column: 1 / -1;
  }
  
  .bottom-stats-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .extended-section {
    grid-template-columns: 1fr;
  }
  
  .protection-rules-panel {
    grid-column: 1;
  }
  
  .security-score-content {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
