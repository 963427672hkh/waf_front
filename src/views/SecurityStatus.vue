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
        <div class="kpi-label">请求频率</div>
        <div class="kpi-info">ℹ️</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🚪</div>
        <div class="kpi-value">{{ formatNumber(statCards.waitingRoom) }}</div>
        <div class="kpi-label">并发连接</div>
        <div class="kpi-info">ℹ️</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">👤</div>
        <div class="kpi-value">{{ formatNumber(statCards.humanMachineVerification) }}</div>
        <div class="kpi-label">高危事件</div>
        <div class="kpi-info">ℹ️</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🔐</div>
        <div class="kpi-value">{{ formatNumber(statCards.identityAuth) }}</div>
        <div class="kpi-label">激活规则</div>
        <div class="kpi-info">ℹ️</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🛡️</div>
        <div class="kpi-value">{{ formatNumber(statCards.pageProtect) }}</div>
        <div class="kpi-label">错误率</div>
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
        <div class="panel-controls">
          <select v-model="attackRangeMode" class="control-select">
            <option value="preset">预设</option>
            <option value="custom">自定义</option>
          </select>
          <select v-if="attackRangeMode==='preset'" v-model="attackPresetRange" class="control-select">
            <option value="1h">近1小时</option>
            <option value="6h">近6小时</option>
            <option value="24h">近24小时</option>
            <option value="7d">近7天</option>
            <option value="30d">近30天</option>
          </select>
          <input v-if="attackRangeMode==='custom'" v-model="attackStartDate" type="date" class="control-input" />
          <input v-if="attackRangeMode==='custom'" v-model="attackEndDate" type="date" class="control-input" />
          <button class="refresh-btn" @click="applyAttackRange">应用</button>
        </div>
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
        <div class="panel-controls">
          <select v-model="bwRangeMode" class="control-select">
            <option value="preset">预设</option>
            <option value="custom">自定义</option>
          </select>
          <select v-if="bwRangeMode==='preset'" v-model="bwPresetRange" class="control-select">
            <option value="1h">近1小时</option>
            <option value="6h">近6小时</option>
            <option value="24h">近24小时</option>
            <option value="7d">近7天</option>
            <option value="30d">近30天</option>
          </select>
          <input v-if="bwRangeMode==='custom'" v-model="bwStartDate" type="date" class="control-input" />
          <input v-if="bwRangeMode==='custom'" v-model="bwEndDate" type="date" class="control-input" />
          <button class="refresh-btn" @click="applyBwRange">应用</button>
        </div>
        <div class="decoration-line"></div>
      </div>
      <div class="border-wrapper">
        <div class="chart-container">
          <BlackWhiteTrend :data="blackWhiteTrend" />
        </div>
      </div>
    </div>

        
        <!-- 防护规则状态（移动到左侧列） -->
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

      <!-- 威胁等级分布 -->
      <div class="panel">
        <div class="panel-header">
          <h3 class="panel-title">威胁等级分布</h3>
        </div>
        <div class="donut-container">
          <div class="donut-chart">
            <AttackTypePie :data="threatLevelDistribution" />
          </div>
          <div class="donut-legend">
            <div v-for="item in threatLevelDistribution" :key="item.type" class="legend-item">
              <div class="legend-dot" :style="`background-color: ${getAttackColor(item.type)};`"></div>
              <span class="legend-label">{{ item.type }}</span>
              <span class="legend-value">{{ formatNumber(item.count) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      

      <!-- 安全评分（移动到右侧列） -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// 已移除最近攻击趋势图表的ECharts依赖
// 使用统一 API 客户端（带鉴权与代理）
import { trafficAPI } from '../api/index.js'
import api from '../api/index.js'
import { securityAPI } from '../api/securityAPI.js'
import AttackTrendChart from '../components/dashboard/AttackTrendChart.vue'
import AttackTypePie from '../components/dashboard/AttackTypePie.vue'
import BlackWhiteTrend from '../components/dashboard/BlackWhiteTrend.vue'

// 加载状态
const loading = ref(true)
const error = ref('')

// 统计数据（真实接口填充）
const statCards = ref({
  attackProtection: 0,
  blackWhiteList: 0,
  frequencyLimit: 0,
  waitingRoom: 0,
  humanMachineVerification: 0,
  identityAuth: 0,
  pageProtect: 0
})

// 攻击趋势数据（真实）
const attackTrend = ref<{ timestamp: string; count: number }[]>([])

// 黑白名单趋势（真实）
const blackWhiteTrend = ref<{ timestamp: string; blacklist: number; whitelist: number }[]>([])

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

// 实时事件数据（真实）
const realTimeEvents = ref<{ type: string; typeName: string; content: string; time: string }[]>([])

// Web攻击分布（真实）
const webAttackDistribution = ref<{ type: string; count: number }[]>([])

// 黑白名单规则命中分布（真实）
const blackWhiteRules = ref<{ name: string; count: number }[]>([])
const threatLevelDistribution = ref<{ type: string; count: number }[]>([])

// 已移除：安全事件统计、威胁等级分布模块及其数据

// 防护规则状态（真实）
const protectionRules = ref<{ name: string; description: string; status: 'active' | 'warning' | 'inactive' }[]>([])

// 安全评分数据（真实）
const securityScore = ref(0)
const protectionCoverage = ref(0)
const responseTime = ref(0)
const threatDetectionRate = ref(0)

const attackRangeMode = ref<'preset' | 'custom'>('preset')
const attackPresetRange = ref<'1h' | '6h' | '24h' | '7d' | '30d'>('24h')
const attackStartDate = ref('')
const attackEndDate = ref('')
const bwRangeMode = ref<'preset' | 'custom'>('preset')
const bwPresetRange = ref<'1h' | '6h' | '24h' | '7d' | '30d'>('24h')
const bwStartDate = ref('')
const bwEndDate = ref('')

const fmt = (n: number) => String(n).padStart(2, '0')
const labelHour = (d: Date) => `${fmt(d.getMonth()+1)}/${fmt(d.getDate())}-${fmt(d.getHours())}:00`
const labelDay = (d: Date) => `${fmt(d.getMonth()+1)}/${fmt(d.getDate())}`
const labelMonth = (d: Date) => `${d.getMonth()+1}月`
const buildLastMonthsLabels = (count = 12) => {
  const labels: string[] = []
  const now = new Date()
  now.setDate(1)
  for (let i = count - 1; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(labelMonth(m))
  }
  return labels
}
const buildLastDaysLabels = (count = 7) => {
  const labels: string[] = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    labels.push(labelDay(d))
  }
  return labels
}
const buildLastHoursLabels = (count = 24) => {
  const labels: string[] = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000)
    labels.push(labelHour(d))
  }
  return labels
}
const tryParseDate = (key: any) => {
  const d = new Date(key)
  return isNaN(d.getTime()) ? null : d
}
const normalizeInterceptSeries = (items: any[], granularity: 'hour' | 'day') => {
  const out: { timestamp: string; count: number }[] = []
  for (const it of items || []) {
    const rawKey = it.time || it.ts || it.key || it.timestamp
    const d = tryParseDate(rawKey)
    const label = d ? (granularity === 'day' ? labelDay(d) : labelHour(d)) : String(rawKey)
    const val = Number(it.value ?? it.count ?? 0) || 0
    out.push({ timestamp: label, count: val })
  }
  return out
}

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
    ,
    '高危': '#ff4d4f',
    '中危': '#faad14',
    '低危': '#52c41a',
    'high': '#ff4d4f',
    'medium': '#faad14',
    'low': '#52c41a'
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
const updateFromBackendData = (health: any) => {
  statCards.value = {
    attackProtection: Number(health.request_stats?.blocked) || 0,
    blackWhiteList: Number(health.rule_info?.total_rules) || 0,
    frequencyLimit: 0,
    waitingRoom: 0,
    humanMachineVerification: 0,
    identityAuth: 0,
    pageProtect: 0
  }

  const se = health.security_events || {}
  webAttackDistribution.value = [
    { type: 'SQL注入', count: Number(se.sql_injection_attempts ?? se.sqli ?? 0) || 0 },
    { type: 'XSS攻击', count: Number(se.xss_attempts ?? se.xss ?? 0) || 0 },
    { type: '命令注入', count: Number(se.rce_attempts ?? se.rce ?? 0) || 0 },
    { type: '文件包含', count: Number(se.lfi_attempts ?? se.lfi ?? 0) || 0 },
    { type: '目录遍历', count: Number(se.dir_traversal_attempts ?? se.directory_traversal ?? 0) || 0 }
  ]
  threatLevelDistribution.value = [
    { type: '高危', count: Number(se.high_severity ?? 0) || 0 },
    { type: '中危', count: Number(se.medium_severity ?? 0) || 0 },
    { type: '低危', count: Number(se.low_severity ?? 0) || 0 }
  ]

  const ri = health.rule_info || {}
  const cats = ri.rule_categories || {}
  protectionRules.value = [
    { name: 'SQL注入防护', description: `规则数 ${cats.sqli ?? cats.sql_injection ?? 0}`, status: 'active' },
    { name: 'XSS防护', description: `规则数 ${cats.xss ?? 0}`, status: 'active' },
    { name: '命令注入防护', description: `规则数 ${cats.rce ?? 0}`, status: 'active' },
    { name: '文件包含防护', description: `规则数 ${cats.lfi ?? 0}`, status: 'active' },
    { name: '目录遍历防护', description: `规则数 ${cats.dir_traversal ?? cats.directory_traversal ?? 0}`, status: 'active' }
  ]

  const total = Number(health.request_stats?.total) || 0
  const blocked = Number(health.request_stats?.blocked) || 0
  const activeRules = Number(ri.active_rules) || 0
  const totalRules = Number(ri.total_rules) || 0
  const blockRate = total > 0 ? blocked / total : 0
  const activeRuleRate = totalRules > 0 ? activeRules / totalRules : 0
  securityScore.value = Math.round((blockRate * 0.5 + activeRuleRate * 0.5) * 100)
  protectionCoverage.value = Math.round(activeRuleRate * 100)
  threatDetectionRate.value = Math.round(blockRate * 100)

  // 补全顶部卡片其他指标映射（保持风格）
  const perf = health.performance || {}
  statCards.value.frequencyLimit = Number(perf.requests_per_second) || 0
  statCards.value.waitingRoom = Number(perf.concurrent_connections) || 0
  statCards.value.humanMachineVerification = Number(se.high_severity) || 0
  statCards.value.identityAuth = Number(ri.active_rules) || 0
  {
    const er = Number(perf.error_rate)
    statCards.value.pageProtect = Number.isFinite(er) ? Number(er.toFixed(3)) : 0
  }
}

// 数据加载函数
const loadData = async () => {
  try {
    loading.value = true
    error.value = ''
    try {
      const healthRes = await trafficAPI.getSystemHealth()
      const health = healthRes?.data?.data || {}
      updateFromBackendData(health)

      let groupByAttack: 'hour' | 'day' = 'hour'
      let monthlyAggregateAttack = false
      const baseParams: any = {}
      if (attackRangeMode.value === 'preset') {
        baseParams.timeRange = attackPresetRange.value
        groupByAttack = attackPresetRange.value === '7d' || attackPresetRange.value === '30d' ? 'day' : 'hour'
        baseParams.groupBy = groupByAttack
      } else {
        if (attackStartDate.value) {
          const s = new Date(attackStartDate.value)
          s.setHours(0,0,0,0)
          baseParams.startTime = s.toISOString()
        }
        if (attackEndDate.value) {
          const e = new Date(attackEndDate.value)
          e.setHours(23,59,59,999)
          baseParams.endTime = e.toISOString()
        }
        const sDate = attackStartDate.value ? new Date(attackStartDate.value) : null
        const eDate = attackEndDate.value ? new Date(attackEndDate.value) : null
        if (sDate && eDate && (eDate.getTime() - sDate.getTime()) >= 48*60*60*1000) {
          groupByAttack = 'day'
        }
        baseParams.groupBy = groupByAttack
      }
      let totals: any[] = []
      let ratesArr: any[] = []
      let interceptTrend: { timestamp: string; count: number }[] = []
      if (!monthlyAggregateAttack) {
      try {
        const interceptRes = await trafficAPI.getInterceptData({ timeRange: baseParams.timeRange || (attackPresetRange.value as any) })
        const interceptRaw = interceptRes?.data?.data || interceptRes?.data || []
        const arr = Array.isArray(interceptRaw?.data) ? interceptRaw.data : (Array.isArray(interceptRaw) ? interceptRaw : [])
        interceptTrend = normalizeInterceptSeries(arr, groupByAttack)
        if (groupByAttack === 'day' && (attackPresetRange.value === '7d' || attackPresetRange.value === '30d')) {
          const labels = buildLastDaysLabels(attackPresetRange.value === '7d' ? 7 : 30)
          const m = new Map(interceptTrend.map(it => [it.timestamp, it.count]))
          interceptTrend = labels.map(l => ({ timestamp: l, count: m.get(l) || 0 }))
        }
      } catch {}
        if (!interceptTrend.length) {
          const statsTotalRes = await trafficAPI.getLogsStats({ ...baseParams, metric: 'count' })
          const statsRateRes = await trafficAPI.getLogsStats({ ...baseParams, metric: 'blocked_rate' })
          totals = Array.isArray(statsTotalRes?.data?.data) ? statsTotalRes.data.data : []
          ratesArr = Array.isArray(statsRateRes?.data?.data) ? statsRateRes.data.data : []
        }
      }
      const rateMap = new Map<string, number>(ratesArr.map((r: any) => [String(r.key || r.time || r.ts), Number(r.value || r.rate) || 0]))
      if (interceptTrend.length) {
        attackTrend.value = interceptTrend
      } else if (monthlyAggregateAttack) {
        const monthMap = new Map<string, number>()
        totals.forEach((t: any) => {
          const rawKey = String(t.key || t.time || t.ts)
          const d = tryParseDate(rawKey)
          if (!d) return
          const totalVal = Number(t.value || t.count) || 0
          const rate = rateMap.get(rawKey) || 0
          const blocked = Math.round(totalVal * rate)
          const mLabel = labelMonth(d)
          monthMap.set(mLabel, (monthMap.get(mLabel) || 0) + blocked)
        })
        const labels = buildLastMonthsLabels(12)
        attackTrend.value = labels.map(l => ({ timestamp: l, count: monthMap.get(l) || 0 }))
      } else {
        attackTrend.value = totals.map((t: any) => {
          const rawKey = String(t.key || t.time || t.ts)
          const totalVal = Number(t.value || t.count) || 0
          const rate = rateMap.get(rawKey) || 0
          const d = tryParseDate(rawKey)
          const label = d ? (groupByAttack === 'day' ? labelDay(d) : labelHour(d)) : rawKey
          return { timestamp: label, count: Math.round(totalVal * rate) }
        })
      }

      // 若趋势为空，生成近24小时的平面零值曲线
      if (attackTrend.value.length === 0) {
        const now = new Date()
        const baseline: { timestamp: string; count: number }[] = []
        if (groupByAttack === 'hour') {
          for (let i = 23; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 60 * 60 * 1000)
            baseline.push({ timestamp: labelHour(d), count: 0 })
          }
        } else {
          if (monthlyAggregateAttack) {
            const labels = buildLastMonthsLabels(12)
            labels.forEach(l => baseline.push({ timestamp: l, count: 0 }))
          } else {
            const days = attackPresetRange.value === '7d' ? 7 : 30
            for (let i = days - 1; i >= 0; i--) {
              const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
              baseline.push({ timestamp: labelDay(d), count: 0 })
            }
          }
        }
        attackTrend.value = baseline
      }

      const ipParams: any = { groupBy: 'ip', metric: 'count' }
      if (attackRangeMode.value === 'preset') {
        ipParams.timeRange = attackPresetRange.value
      } else {
        if (attackStartDate.value) {
          const s = new Date(attackStartDate.value)
          s.setHours(0,0,0,0)
          ipParams.startTime = s.toISOString()
        }
        if (attackEndDate.value) {
          const e = new Date(attackEndDate.value)
          e.setHours(23,59,59,999)
          ipParams.endTime = e.toISOString()
        }
      }
      const ipStatsRes = await trafficAPI.getLogsStats(ipParams)
      const ipData = Array.isArray(ipStatsRes?.data?.data) ? ipStatsRes.data.data : []
      attackInterceptIPs.value = normalizeIpList(ipData.map((d: any) => ({ ip: d.key || d.ip, count: d.value || d.count || 0 })))

      let groupByBw: 'hour' | 'day' = 'hour'
      let monthlyAggregateBw = false
      const bwParamsCount: any = { metric: 'count' }
      const bwParamsRate: any = { metric: 'blocked_rate' }
      if (bwRangeMode.value === 'preset') {
        bwParamsCount.timeRange = bwPresetRange.value
        bwParamsRate.timeRange = bwPresetRange.value
        groupByBw = bwPresetRange.value === '7d' || bwPresetRange.value === '30d' ? 'day' : 'hour'
        bwParamsCount.groupBy = groupByBw
        bwParamsRate.groupBy = groupByBw
      } else {
        if (bwStartDate.value) {
          const s2 = new Date(bwStartDate.value)
          s2.setHours(0,0,0,0)
          bwParamsCount.startTime = s2.toISOString()
          bwParamsRate.startTime = s2.toISOString()
        }
        if (bwEndDate.value) {
          const e2 = new Date(bwEndDate.value)
          e2.setHours(23,59,59,999)
          bwParamsCount.endTime = e2.toISOString()
          bwParamsRate.endTime = e2.toISOString()
        }
        const s2Date = bwStartDate.value ? new Date(bwStartDate.value) : null
        const e2Date = bwEndDate.value ? new Date(bwEndDate.value) : null
        if (s2Date && e2Date && (e2Date.getTime() - s2Date.getTime()) >= 48*60*60*1000) {
          groupByBw = 'day'
        }
        bwParamsCount.groupBy = groupByBw
        bwParamsRate.groupBy = groupByBw
      }
      let bwTotals: any[] = []
      let bwRates: any[] = []
      if (!monthlyAggregateBw) {
        const bwTotalRes = await trafficAPI.getLogsStats(bwParamsCount)
        const bwRateRes = await trafficAPI.getLogsStats(bwParamsRate)
        bwTotals = Array.isArray(bwTotalRes?.data?.data) ? bwTotalRes.data.data : []
        bwRates = Array.isArray(bwRateRes?.data?.data) ? bwRateRes.data.data : []
      }
      const bwRateMap = new Map<string, number>(bwRates.map((r: any) => [String(r.key || r.time || r.ts), Number(r.value || r.rate) || 0]))
      if (monthlyAggregateBw) {
        const monthMapBlack = new Map<string, number>()
        const monthMapWhite = new Map<string, number>()
        bwTotals.forEach((t: any) => {
          const rawKey = String(t.key || t.time || t.ts)
          const d = tryParseDate(rawKey)
          if (!d) return
          const totalVal = Number(t.value || t.count) || 0
          const rate = bwRateMap.get(rawKey) || 0
          const black = Math.round(totalVal * rate)
          const white = Math.max(0, totalVal - black)
          const mLabel = labelMonth(d)
          monthMapBlack.set(mLabel, (monthMapBlack.get(mLabel) || 0) + black)
          monthMapWhite.set(mLabel, (monthMapWhite.get(mLabel) || 0) + white)
        })
        const labels = buildLastMonthsLabels(12)
        blackWhiteTrend.value = labels.map(l => ({ timestamp: l, blacklist: monthMapBlack.get(l) || 0, whitelist: monthMapWhite.get(l) || 0 }))
      } else if (groupByBw === 'day') {
        const agg = new Map<string, { b: number; w: number; t: number }>()
        bwTotals.forEach((t: any) => {
          const rawKey = String(t.key || t.time || t.ts)
          const d = tryParseDate(rawKey)
          const label = d ? labelDay(d) : rawKey
          const totalVal = Number(t.value || t.count) || 0
          const rate = bwRateMap.get(rawKey) || 0
          const black = Math.round(totalVal * rate)
          const white = Math.max(0, totalVal - black)
          const prev = agg.get(label)
          const tm = d ? d.getTime() : Date.now()
          if (prev) agg.set(label, { b: prev.b + black, w: prev.w + white, t: Math.max(prev.t, tm) })
          else agg.set(label, { b: black, w: white, t: tm })
        })
        if (bwRangeMode.value === 'preset') {
          const labels = buildLastDaysLabels(bwPresetRange.value === '7d' ? 7 : 30)
          blackWhiteTrend.value = labels.map(l => ({ timestamp: l, blacklist: agg.get(l)?.b || 0, whitelist: agg.get(l)?.w || 0 }))
        } else {
          blackWhiteTrend.value = Array.from(agg.entries()).sort((a, b) => a[1].t - b[1].t).map(([label, v]) => ({ timestamp: label, blacklist: v.b, whitelist: v.w }))
        }
      } else {
        const aggH = new Map<string, { b: number; w: number; t: number }>()
        bwTotals.forEach((t: any) => {
          const rawKey = String(t.key || t.time || t.ts)
          const d = tryParseDate(rawKey)
          const label = d ? labelHour(d) : rawKey
          const totalVal = Number(t.value || t.count) || 0
          const rate = bwRateMap.get(rawKey) || 0
          const black = Math.round(totalVal * rate)
          const white = Math.max(0, totalVal - black)
          const prev = aggH.get(label)
          const tm = d ? d.getTime() : Date.now()
          if (prev) aggH.set(label, { b: prev.b + black, w: prev.w + white, t: Math.max(prev.t, tm) })
          else aggH.set(label, { b: black, w: white, t: tm })
        })
        if (bwRangeMode.value === 'preset') {
          const cnt = bwPresetRange.value === '1h' ? 1 : (bwPresetRange.value === '6h' ? 6 : 24)
          const labels = buildLastHoursLabels(cnt)
          blackWhiteTrend.value = labels.map(l => ({ timestamp: l, blacklist: aggH.get(l)?.b || 0, whitelist: aggH.get(l)?.w || 0 }))
        } else {
          blackWhiteTrend.value = Array.from(aggH.entries()).sort((a, b) => a[1].t - b[1].t).map(([label, v]) => ({ timestamp: label, blacklist: v.b, whitelist: v.w }))
        }
      }

      // 若黑白名单趋势为空，生成与趋势一致的平面零值曲线
      if (blackWhiteTrend.value.length === 0) {
        if (groupByBw === 'hour') {
          const now2 = new Date()
          const tmp: { timestamp: string; blacklist: number; whitelist: number }[] = []
          for (let i = 23; i >= 0; i--) {
            const d2 = new Date(now2.getTime() - i * 60 * 60 * 1000)
            tmp.push({ timestamp: labelHour(d2), blacklist: 0, whitelist: 0 })
          }
          blackWhiteTrend.value = tmp
        } else {
          if (monthlyAggregateBw) {
            const labels = buildLastMonthsLabels(12)
            blackWhiteTrend.value = labels.map(l => ({ timestamp: l, blacklist: 0, whitelist: 0 }))
          } else {
            const now2 = new Date()
            const tmp: { timestamp: string; blacklist: number; whitelist: number }[] = []
            const days2 = bwPresetRange.value === '7d' ? 7 : 30
            for (let i = days2 - 1; i >= 0; i--) {
              const d2 = new Date(now2.getTime() - i * 24 * 60 * 60 * 1000)
              tmp.push({ timestamp: labelDay(d2), blacklist: 0, whitelist: 0 })
            }
            blackWhiteTrend.value = tmp
          }
        }
      }

      const perfRes = await trafficAPI.getPerformanceData({ timeRange: '24h', metric: 'response_time', interval: '1h' })
      const perf = perfRes?.data?.data || {}
      const avg = Number(perf?.summary?.avg ?? perf.avg_response_time ?? perf.response_time)
      responseTime.value = !Number.isNaN(avg) && avg > 0 ? Math.floor(avg) : 0

      // 黑白名单规则命中分布（优先 security 接口）
      try {
        const bwRulesRes = await securityAPI.getBlackWhiteRules({ timeRange: '24h', limit: 10 })
        const rulesArr = Array.isArray(bwRulesRes?.data?.data) ? bwRulesRes.data.data : []
        blackWhiteRules.value = rulesArr
          .map((r: any) => ({ name: r.name || r.ruleName || r.id?.toString() || '未知规则', count: Number(r.count ?? r.hits ?? 0) }))
      } catch (e) {
        // 回退至 /logs/waf/stats.topRules
        try {
          const end = new Date()
          const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
          const wafStats = await trafficAPI.getWafStats({ startTime: start.toISOString(), endTime: end.toISOString() })
          const topRules = Array.isArray(wafStats?.data?.data?.topRules) ? wafStats.data.data.topRules : []
          blackWhiteRules.value = topRules.map((x: any) => ({ name: String(x.ruleId ?? x.name ?? '未知'), count: Number(x.count ?? 0) }))
        } catch (ee) {
          console.warn('黑白名单规则命中数据不可用', ee)
        }
      }

      try {
        const realRes = await trafficAPI.getRealtimeLogs({ limit: 10 })
        const wafItems = Array.isArray(realRes?.data?.data?.waf) ? realRes.data.data.waf : []
        const accessItems = Array.isArray(realRes?.data?.data?.access) ? realRes.data.data.access : []
        const base = wafItems.length ? wafItems.slice(0, 10) : accessItems.slice(0, 10)
        const isWaf = !!wafItems.length
        realTimeEvents.value = base.map((l: any) => ({
          type: isWaf ? 'waf' : 'access',
          typeName: isWaf ? 'WAF审计' : '访问日志',
          content: isWaf ? `${l.method} ${l.uri} ${l.finalAction}` : `${l.method} ${l.uri} ${l.status}`,
          time: new Date((l.time || l.ts) || Date.now()).toLocaleTimeString('zh-CN', { hour12: false })
        }))
      } catch (e) {
        console.warn('实时事件不可用', e)
      }
    } catch (apiError) {
      console.warn('API调用失败:', apiError)
      throw apiError
    }
    loading.value = false
  } catch (err) {
    error.value = '数据加载失败，请稍后重试'
    loading.value = false
    console.error('加载安全态势数据失败:', err)
  }
}

const applyAttackRange = async () => { await loadData() }
const applyBwRange = async () => { await loadData() }

// 已移除模拟数据更新

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

.controls-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.panel-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.control-input {
  padding: 8px 12px;
  border: 1px solid rgba(74,158,255,0.3);
  border-radius: 6px;
  background: rgba(30,30,30,0.8);
  color: #e0e0e0;
  font-size: 14px;
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
  height: 220px;
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
  gap: 16px;
  flex-wrap: wrap;
}

.donut-chart {
  flex: 1 1 320px;
  height: 180px;
}

.donut-legend {
  flex: 1 1 320px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-height: 180px;
  overflow-y: auto;
  padding-right: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  line-height: 1.2;
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
