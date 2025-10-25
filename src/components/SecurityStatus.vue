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
          </div>
          <div class="chart-container">
            <AttackTrendChart :data="attackTrend" />
          </div>
        </div>

        <!-- 攻击源IP表格 -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">攻击源IP</h3>
            <a href="#" class="view-more">查看更多</a>
          </div>
          <div class="table-container">
            <div v-for="(item, index) in attackSourceIPs" :key="index" class="table-item">
              <span class="ip-address">{{ item.ip }}</span>
              <span class="ip-count">{{ formatNumber(item.count) }}</span>
            </div>
          </div>
        </div>

        <!-- 黑白名单趋势 -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">黑白名单趋势</h3>
          </div>
          <div class="chart-container">
            <BlackWhiteTrend :data="blackWhiteTrend" />
          </div>
        </div>

        <!-- 攻击源IP表格2 -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">攻击源IP</h3>
            <a href="#" class="view-more">查看更多</a>
          </div>
          <div class="table-container">
            <div v-for="(item, index) in attackSourceIPs2" :key="index" class="table-item">
              <span class="ip-address">{{ item.ip }}</span>
              <span class="ip-count">{{ formatNumber(item.count) }}</span>
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
      <!-- 安全事件统计 -->
      <div class="panel security-events-panel">
        <div class="panel-header">
          <h3 class="panel-title">安全事件统计</h3>
        </div>
        <div class="security-events-chart">
          <div id="securityEventsChart" style="height: 100%; width: 100%;"></div>
        </div>
      </div>

      <!-- 威胁等级分布 -->
      <div class="panel threat-level-panel">
        <div class="panel-header">
          <h3 class="panel-title">威胁等级分布</h3>
        </div>
        <div class="threat-level-chart">
          <div id="threatLevelChart" style="height: 100%; width: 100%;"></div>
        </div>
      </div>

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

      <!-- 最近攻击趋势 -->
      <div class="panel recent-attacks-panel">
        <div class="panel-header">
          <h3 class="panel-title">最近攻击趋势</h3>
        </div>
        <div class="recent-attacks-chart">
          <div id="recentAttacksChart" style="height: 100%; width: 100%;"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AttackTrendChart from './dashboard/AttackTrendChart.vue'
import AttackTypePie from './dashboard/AttackTypePie.vue'
import BlackWhiteTrend from './dashboard/BlackWhiteTrend.vue'
import { securityAPI } from '../api/securityAPI'

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

// 攻击源IP数据
const attackSourceIPs = ref([
  { ip: '47.242.104.253', count: 146 },
  { ip: '101.132.120.240', count: 141 },
  { ip: '123.57.185.163', count: 134 },
  { ip: '116.62.147.32', count: 128 },
  { ip: '101.200.212.185', count: 92 }
])

const attackSourceIPs2 = ref([
  { ip: '120.26.132.13', count: 1800 },
  { ip: '134.122.174.156', count: 5 },
  { ip: '58.218.211.150', count: 2 },
  { ip: '58.218.211.127', count: 2 },
  { ip: '58.218.211.239', count: 2 }
])

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

// 安全事件统计数据
const securityEventsData = ref([
  { name: 'SQL注入', value: 45 },
  { name: 'XSS攻击', value: 32 },
  { name: 'CSRF攻击', value: 18 },
  { name: '文件上传', value: 12 },
  { name: '目录遍历', value: 8 }
])

// 威胁等级分布数据
const threatLevelData = ref([
  { name: '高危', value: 15, color: '#ff4d4f' },
  { name: '中危', value: 28, color: '#ff8c00' },
  { name: '低危', value: 42, color: '#52c41a' },
  { name: '信息', value: 8, color: '#1890ff' }
])

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

// 最近攻击趋势数据
const recentAttacksData = ref([
  { time: '00:00', count: 5 },
  { time: '04:00', count: 3 },
  { time: '08:00', count: 12 },
  { time: '12:00', count: 18 },
  { time: '16:00', count: 25 },
  { time: '20:00', count: 15 },
  { time: '24:00', count: 8 }
])

// 获取攻击类型颜色
const getAttackColor = (type: string) => {
  const colors: { [key: string]: string } = {
    '目录穿越': '#4a9eff',
    '后门': '#ff8c00',
    '信息泄露': '#52c41a',
    '文件包含': '#722ed1',
    '命令注入': '#1890ff'
  }
  return colors[type] || '#666'
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

// 数据加载函数
const loadData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 暂时使用模拟数据，等后端接口准备好后再启用真实API调用
    console.log('使用模拟数据 - 等待后端接口对接')
    
    // 模拟数据已经在组件中定义，直接使用
    // 这里可以添加一些数据更新逻辑，比如随机化部分数据
    
    // 模拟数据更新（可选）
    updateMockData()
    
    loading.value = false
  } catch (err) {
    error.value = '数据加载失败，请稍后重试'
    loading.value = false
    console.error('加载安全态势数据失败:', err)
  }
}

// 模拟数据更新函数（可选）
const updateMockData = () => {
  // 可以在这里添加一些动态数据更新逻辑
  // 比如随机化部分数值，模拟实时数据变化
  const now = new Date()
  const currentHour = now.getHours()
  
  // 模拟实时事件时间更新
  realTimeEvents.value = realTimeEvents.value.map((event, index) => ({
    ...event,
    time: `${String(currentHour).padStart(2, '0')}:${String(now.getMinutes() - index).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  }))
  
  // 模拟安全评分微调
  securityScore.value = Math.max(80, Math.min(95, securityScore.value + Math.floor(Math.random() * 6) - 3))
}

onMounted(() => {
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
