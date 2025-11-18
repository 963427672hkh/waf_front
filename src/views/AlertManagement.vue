<template>
  <div class="alert-management">
    <!-- 顶部统计卡片 -->
    <div class="stats-section">
      <div class="stat-card" :class="{ active: filterStatus === '' }" @click="setFilterStatus('')">
        <div class="stat-icon">📊</div>
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">全部告警</div>
      </div>
      <div class="stat-card warning" :class="{ active: filterStatus === 'pending' }" @click="setFilterStatus('pending')">
        <div class="stat-icon">⏳</div>
        <div class="stat-value">{{ stats.pending }}</div>
        <div class="stat-label">待处理</div>
      </div>
      <div class="stat-card processing" :class="{ active: filterStatus === 'processing' }" @click="setFilterStatus('processing')">
        <div class="stat-icon">🔄</div>
        <div class="stat-value">{{ stats.processing }}</div>
        <div class="stat-label">处理中</div>
      </div>
      <div class="stat-card success" :class="{ active: filterStatus === 'resolved' }" @click="setFilterStatus('resolved')">
        <div class="stat-icon">✅</div>
        <div class="stat-value">{{ stats.resolved }}</div>
        <div class="stat-label">已解决</div>
      </div>
      <div class="stat-card danger" :class="{ active: filterStatus === 'critical' }" @click="setFilterLevel('critical')">
        <div class="stat-icon">🔴</div>
        <div class="stat-value">{{ stats.critical }}</div>
        <div class="stat-label">严重告警</div>
      </div>
    </div>

    <!-- 筛选和操作栏 -->
    <div class="filter-bar">
      <div class="filter-left">
        <select v-model="filterLevel" class="filter-select" @change="loadAlerts">
          <option value="">全部级别</option>
          <option value="critical">严重</option>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
          <option value="info">信息</option>
        </select>
        <select v-model="filterType" class="filter-select" @change="loadAlerts">
          <option value="">全部类型</option>
          <option value="attack">攻击告警</option>
          <option value="traffic">流量异常</option>
          <option value="security">安全事件</option>
          <option value="system">系统异常</option>
          <option value="unknown">未知类别</option>
        </select>
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索告警内容、IP地址..." 
          class="search-input"
          @input="debounceSearch"
        />
      </div>
      <div class="filter-right">
        <button class="action-btn" @click="refreshAlerts">
          <span>🔄</span> 刷新
        </button>
        <button class="action-btn primary" @click="handleBatchAction('handle')" :disabled="selectedAlerts.length === 0">
          <span>✓</span> 批量处理
        </button>
        <button class="action-btn danger" @click="handleBatchAction('delete')" :disabled="selectedAlerts.length === 0">
          <span>🗑️</span> 批量删除
        </button>
      </div>
    </div>

    <!-- 告警列表 -->
    <div class="alert-list-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>加载中...</span>
      </div>
      <div v-else-if="filteredAlerts.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-text">暂无告警数据</div>
      </div>
      <div v-else class="alert-list">
        <div 
          v-for="alert in filteredAlerts" 
          :key="alert.id"
          class="alert-item"
          :class="{
            [`level-${alert.level}`]: true,
            selected: selectedAlerts.includes(alert.id),
            expanded: expandedAlert === alert.id
          }"
          @click="toggleSelect(alert.id)"
        >
          <div class="alert-checkbox">
            <input 
              type="checkbox" 
              :checked="selectedAlerts.includes(alert.id)"
              @click.stop="toggleSelect(alert.id)"
            />
          </div>
          <div class="alert-content" @click.stop="toggleExpand(alert.id)">
            <div class="alert-header">
              <div class="alert-title-row">
                <span class="alert-level" :class="`badge-${alert.level}`">
                  {{ getLevelLabel(alert.level) }}
                </span>
                <span class="alert-type">{{ getTypeLabel(alert.type) }}</span>
                <h3 class="alert-title">{{ alert.title }}</h3>
                <span class="alert-time">{{ formatTime(alert.createdAt) }}</span>
              </div>
            </div>
            <div class="alert-body">
              <div class="alert-message">{{ alert.message }}</div>
              <div class="alert-meta">
                <span v-if="alert.sourceIP" class="meta-item">
                  <span class="meta-label">来源IP:</span>
                  <span class="meta-value">{{ alert.sourceIP }}</span>
                </span>
                <span v-if="alert.target" class="meta-item">
                  <span class="meta-label">目标:</span>
                  <span class="meta-value">{{ alert.target }}</span>
                </span>
                <span class="meta-item">
                  <span class="meta-label">状态:</span>
                  <span class="meta-value" :class="`status-${alert.status}`">
                    {{ getStatusLabel(alert.status) }}
                  </span>
                </span>
              </div>
            </div>
            <!-- 处理进度条 -->
            <div v-if="alert.status === 'processing'" class="alert-progress">
              <div class="progress-info">
                <span>处理进度: {{ alert.progress || 0 }}%</span>
                <span v-if="alert.handler">{{ alert.handler }}</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${alert.progress || 0}%` }"
                ></div>
              </div>
            </div>
          </div>
          <div class="alert-actions">
            <button 
              v-if="alert.status === 'pending'"
              class="action-icon-btn" 
              title="开始处理"
              @click.stop="handleAlert(alert.id, 'processing')"
            >
              ▶️
            </button>
            <button 
              v-if="alert.status === 'processing'"
              class="action-icon-btn" 
              title="标记已解决"
              @click.stop="handleAlert(alert.id, 'resolved')"
            >
              ✓
            </button>
            <button 
              class="action-icon-btn danger" 
              title="删除"
              @click.stop="deleteAlert(alert.id)"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 告警详情弹窗 -->
    <div v-if="detailAlert" class="detail-modal" @click.self="closeDetail">
      <div class="detail-content">
        <div class="detail-header">
          <h2>告警详情</h2>
          <button class="close-btn" @click="closeDetail">×</button>
        </div>
        <div class="detail-body">
          <div class="detail-section">
            <h3>基本信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>告警标题:</label>
                <span>{{ detailAlert.title }}</span>
              </div>
              <div class="detail-item">
                <label>告警级别:</label>
                <span :class="`badge-${detailAlert.level}`">{{ getLevelLabel(detailAlert.level) }}</span>
              </div>
              <div class="detail-item">
                <label>告警类型:</label>
                <span>{{ getTypeLabel(detailAlert.type) }}</span>
              </div>
              <div class="detail-item">
                <label>告警状态:</label>
                <span :class="`status-${detailAlert.status}`">{{ getStatusLabel(detailAlert.status) }}</span>
              </div>
              <div class="detail-item">
                <label>创建时间:</label>
                <span>{{ formatTime(detailAlert.createdAt) }}</span>
              </div>
              <div class="detail-item" v-if="detailAlert.updatedAt">
                <label>更新时间:</label>
                <span>{{ formatTime(detailAlert.updatedAt) }}</span>
              </div>
            </div>
          </div>
          <div class="detail-section">
            <h3>告警内容</h3>
            <div class="detail-message">{{ detailAlert.message }}</div>
          </div>
          <div class="detail-section" v-if="detailAlert.sourceIP || detailAlert.target">
            <h3>相关信息</h3>
            <div class="detail-grid">
              <div class="detail-item" v-if="detailAlert.sourceIP">
                <label>来源IP:</label>
                <span>{{ detailAlert.sourceIP }}</span>
              </div>
              <div class="detail-item" v-if="detailAlert.target">
                <label>目标:</label>
                <span>{{ detailAlert.target }}</span>
              </div>
            </div>
          </div>
          <div class="detail-section" v-if="detailAlert.status === 'processing'">
            <h3>处理进度</h3>
            <div class="progress-info">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${detailAlert.progress || 0}%` }"
                ></div>
              </div>
              <div class="progress-text">{{ detailAlert.progress || 0 }}%</div>
            </div>
            <div v-if="detailAlert.handler" class="detail-item">
              <label>处理人:</label>
              <span>{{ detailAlert.handler }}</span>
            </div>
          </div>
          <div class="detail-section" v-if="detailAlert.handleRecords && detailAlert.handleRecords.length > 0">
            <h3>处理记录</h3>
            <div class="handle-records">
              <div 
                v-for="(record, idx) in detailAlert.handleRecords" 
                :key="idx"
                class="handle-record"
              >
                <div class="record-time">{{ formatTime(record.createdAt) }}</div>
                <div class="record-action">{{ record.action }}</div>
                <div class="record-user" v-if="record.handler">{{ record.handler }}</div>
                <div class="record-note" v-if="record.note">{{ record.note }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="detail-footer">
          <button 
            v-if="detailAlert.status === 'pending'"
            class="detail-btn primary" 
            @click="handleAlert(detailAlert.id, 'processing')"
          >
            开始处理
          </button>
          <button 
            v-if="detailAlert.status === 'processing'"
            class="detail-btn success" 
            @click="handleAlert(detailAlert.id, 'resolved')"
          >
            标记已解决
          </button>
          <button class="detail-btn" @click="closeDetail">关闭</button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        class="page-btn" 
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        上一页
      </button>
      <span class="page-info">
        第 {{ currentPage }} / {{ totalPages }} 页 (共 {{ totalCount }} 条)
      </span>
      <button 
        class="page-btn" 
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { alertAPI } from '../api/alertAPI.js'

// 响应式数据
const alerts = ref([])
const allAlerts = ref([]) // 存储全部告警数据，用于统计计算
const loading = ref(false)
const filterStatus = ref('')
const filterLevel = ref('')
const filterType = ref('')
const searchKeyword = ref('')
const selectedAlerts = ref([])
const expandedAlert = ref(null)
const detailAlert = ref(null)
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)

// 统计数据
const stats = reactive({
  total: 0,
  pending: 0,
  processing: 0,
  resolved: 0,
  critical: 0
})

// WebSocket连接
let ws = null
const wsUrl = import.meta.env.VITE_WAF_WS || 'ws://localhost:3000'

// 计算属性
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

const filteredAlerts = computed(() => {
  let result = [...alerts.value]
  
  // 状态筛选
  if (filterStatus.value) {
    result = result.filter(alert => alert.status === filterStatus.value)
  }
  
  // 级别筛选
  if (filterLevel.value) {
    result = result.filter(alert => alert.level === filterLevel.value)
  }
  
  // 类型筛选
  if (filterType.value) {
    result = result.filter(alert => alert.type === filterType.value)
  }
  
  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(alert => 
      alert.title?.toLowerCase().includes(keyword) ||
      alert.message?.toLowerCase().includes(keyword) ||
      alert.sourceIP?.includes(keyword) ||
      alert.target?.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

// 方法
const loadAlerts = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      status: filterStatus.value || undefined,
      level: filterLevel.value || undefined,
      type: filterType.value || undefined,
      keyword: searchKeyword.value || undefined
    }
    
    const response = await alertAPI.getAlerts(params)
    
    if (response.data?.code === 200) {
      const data = response.data.data || {}
      alerts.value = data.list || []
      totalCount.value = data.total || 0
    } else {
      // 如果API未实现，使用模拟数据
      const mockAlerts = generateMockAlerts()
      alerts.value = mockAlerts
      totalCount.value = mockAlerts.length
    }
    
    // 注意：不在这里调用 updateStats()，因为统计数据应该基于全部数据
    // 只有在加载全部数据时才更新统计
  } catch (error) {
    console.error('加载告警列表失败:', error)
    // 使用模拟数据
    const mockAlerts = generateMockAlerts()
    alerts.value = mockAlerts
    totalCount.value = mockAlerts.length
  } finally {
    loading.value = false
  }
}

// 加载全部告警数据（用于统计）
const loadAllAlertsForStats = async () => {
  try {
    const params = {
      page: 1,
      pageSize: 1000 // 获取足够多的数据用于统计
    }
    
    const response = await alertAPI.getAlerts(params)
    
    if (response.data?.code === 200) {
      const data = response.data.data || {}
      allAlerts.value = data.list || []
    } else {
      // 如果API未实现，使用模拟数据
      allAlerts.value = generateMockAlerts()
    }
    
    updateStats()
  } catch (error) {
    console.error('加载全部告警数据失败:', error)
    // 使用模拟数据
    allAlerts.value = generateMockAlerts()
    updateStats()
  }
}

const loadAlertStats = async () => {
  try {
    const response = await alertAPI.getAlertStats()
    if (response.data?.code === 200) {
      const data = response.data.data || {}
      Object.assign(stats, {
        total: data.total || 0,
        pending: data.pending || 0,
        processing: data.processing || 0,
        resolved: data.resolved || 0,
        critical: data.critical || 0
      })
      return true // 返回true表示成功从API获取统计
    }
  } catch (error) {
    console.error('加载告警统计失败:', error)
  }
  return false // 返回false表示需要从本地数据计算
}

const updateStats = () => {
  // 统计数据基于全部告警数据，不受筛选条件影响
  const dataSource = allAlerts.value.length > 0 ? allAlerts.value : alerts.value
  stats.total = dataSource.length
  stats.pending = dataSource.filter(a => a.status === 'pending').length
  stats.processing = dataSource.filter(a => a.status === 'processing').length
  stats.resolved = dataSource.filter(a => a.status === 'resolved').length
  stats.critical = dataSource.filter(a => a.level === 'critical').length
}

const refreshAlerts = async () => {
  // 先尝试从API获取统计数据
  const statsLoaded = await loadAlertStats()
  // 如果API统计不可用，则加载全部数据用于统计
  if (!statsLoaded) {
    await loadAllAlertsForStats()
  }
  // 加载筛选后的列表数据
  await loadAlerts()
}

const setFilterStatus = (status) => {
  filterStatus.value = status
  currentPage.value = 1
  loadAlerts()
}

const setFilterLevel = (level) => {
  filterLevel.value = level
  filterStatus.value = '' // 清除状态筛选
  currentPage.value = 1
  loadAlerts()
}

const toggleSelect = (alertId) => {
  const index = selectedAlerts.value.indexOf(alertId)
  if (index > -1) {
    selectedAlerts.value.splice(index, 1)
  } else {
    selectedAlerts.value.push(alertId)
  }
}

const toggleExpand = async (alertId) => {
  if (expandedAlert.value === alertId) {
    expandedAlert.value = null
    detailAlert.value = null
  } else {
    expandedAlert.value = alertId
    // 加载详情
    try {
      const response = await alertAPI.getAlertDetail(alertId)
      if (response.data?.code === 200) {
        detailAlert.value = response.data.data
      } else {
        // 使用列表中的数据
        detailAlert.value = alerts.value.find(a => a.id === alertId)
      }
    } catch (error) {
      console.error('加载告警详情失败:', error)
      detailAlert.value = alerts.value.find(a => a.id === alertId)
    }
  }
}

const closeDetail = () => {
  detailAlert.value = null
  expandedAlert.value = null
}

const handleAlert = async (alertId, status) => {
  try {
    await alertAPI.updateAlertStatus(alertId, status)
    // 更新本地数据（包括全部数据和当前列表）
    const updateAlertInList = (alertList) => {
      const alert = alertList.find(a => a.id === alertId)
      if (alert) {
        alert.status = status
        if (status === 'processing') {
          alert.progress = 0
        } else if (status === 'resolved') {
          alert.progress = 100
        }
      }
    }
    updateAlertInList(alerts.value)
    updateAlertInList(allAlerts.value)
    updateStats()
  } catch (error) {
    console.error('处理告警失败:', error)
    alert('处理告警失败，请重试')
  }
}

const deleteAlert = async (alertId) => {
  if (!confirm('确定要删除这条告警吗？')) return
  
  try {
    await alertAPI.deleteAlert(alertId)
    alerts.value = alerts.value.filter(a => a.id !== alertId)
    allAlerts.value = allAlerts.value.filter(a => a.id !== alertId)
    selectedAlerts.value = selectedAlerts.value.filter(id => id !== alertId)
    updateStats()
  } catch (error) {
    console.error('删除告警失败:', error)
    alert('删除告警失败，请重试')
  }
}

const handleBatchAction = async (action) => {
  if (selectedAlerts.value.length === 0) return
  
  if (action === 'handle') {
    if (!confirm(`确定要批量处理 ${selectedAlerts.value.length} 条告警吗？`)) return
    try {
      await alertAPI.batchMarkAsHandled(selectedAlerts.value)
      // 更新本地数据（包括全部数据和当前列表）
      const updateStatus = (alertList) => {
        alertList.forEach(alert => {
          if (selectedAlerts.value.includes(alert.id)) {
            alert.status = 'resolved'
            alert.progress = 100
          }
        })
      }
      updateStatus(alerts.value)
      updateStatus(allAlerts.value)
      selectedAlerts.value = []
      updateStats()
    } catch (error) {
      console.error('批量处理告警失败:', error)
      alert('批量处理失败，请重试')
    }
  } else if (action === 'delete') {
    if (!confirm(`确定要删除 ${selectedAlerts.value.length} 条告警吗？`)) return
    try {
      await alertAPI.batchDeleteAlerts(selectedAlerts.value)
      alerts.value = alerts.value.filter(a => !selectedAlerts.value.includes(a.id))
      allAlerts.value = allAlerts.value.filter(a => !selectedAlerts.value.includes(a.id))
      selectedAlerts.value = []
      updateStats()
    } catch (error) {
      console.error('批量删除告警失败:', error)
      alert('批量删除失败，请重试')
    }
  }
}

const goToPage = (page) => {
  currentPage.value = page
  loadAlerts()
}

// 防抖搜索
let searchTimer = null
const debounceSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadAlerts()
  }, 500)
}

// WebSocket连接
const connectWebSocket = () => {
  try {
    ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log('[Alert WS] 连接成功')
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleWebSocketMessage(data)
      } catch (error) {
        console.error('解析WebSocket消息失败:', error)
      }
    }
    
    ws.onclose = () => {
      console.log('[Alert WS] 连接关闭，5秒后重试')
      setTimeout(connectWebSocket, 5000)
    }
    
    ws.onerror = (error) => {
      console.error('[Alert WS] 连接错误:', error)
    }
  } catch (error) {
    console.error('WebSocket连接失败:', error)
  }
}

const handleWebSocketMessage = (data) => {
  // 处理不同类型的WebSocket消息
  if (data.type === 'alert') {
    // 新告警
    const newAlert = {
      id: data.id || Date.now().toString(),
      title: data.title || '新告警',
      message: data.message || '',
      level: data.level || 'medium',
      type: data.type || 'system',
      status: 'pending',
      sourceIP: data.sourceIP,
      target: data.target,
      createdAt: data.createdAt || new Date().toISOString(),
      progress: 0
    }
    // 添加到全部数据列表
    allAlerts.value.unshift(newAlert)
    if (allAlerts.value.length > 1000) {
      allAlerts.value = allAlerts.value.slice(0, 1000)
    }
    // 如果当前没有筛选或者筛选条件匹配，也添加到当前列表
    const shouldShow = (!filterStatus.value || newAlert.status === filterStatus.value) &&
                       (!filterLevel.value || newAlert.level === filterLevel.value) &&
                       (!filterType.value || newAlert.type === filterType.value)
    if (shouldShow) {
      alerts.value.unshift(newAlert)
      // 限制列表长度
      if (alerts.value.length > 100) {
        alerts.value = alerts.value.slice(0, 100)
      }
    }
    updateStats()
  } else if (data.type === 'alert_update') {
    // 告警更新
    const updateAlertInList = (alertList) => {
      const alert = alertList.find(a => a.id === data.alertId)
      if (alert) {
        if (data.status) alert.status = data.status
        if (data.progress !== undefined) alert.progress = data.progress
        if (data.handler) alert.handler = data.handler
        if (data.updatedAt) alert.updatedAt = data.updatedAt
      }
    }
    updateAlertInList(alerts.value)
    updateAlertInList(allAlerts.value)
    updateStats()
  }
}

// 工具函数
const getLevelLabel = (level) => {
  const labels = {
    critical: '严重',
    high: '高',
    medium: '中',
    low: '低',
    info: '信息'
  }
  return labels[level] || level
}

const getTypeLabel = (type) => {
  const labels = {
    attack: '攻击告警',
    traffic: '流量异常',
    security: '安全事件',
    system: '系统异常',
    unknown: '未知类别'
  }
  return labels[type] || type
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    ignored: '已忽略'
  }
  return labels[status] || status
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN')
}

// 生成模拟数据（用于测试）
const generateMockAlerts = () => {
  const levels = ['critical', 'high', 'medium', 'low', 'info']
  const types = ['attack', 'traffic', 'security', 'system', 'unknown']
  const statuses = ['pending', 'processing', 'resolved']
  const mockAlerts = []
  
  for (let i = 0; i < 15; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)]
    const type = types[Math.floor(Math.random() * types.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    mockAlerts.push({
      id: `alert-${i + 1}`,
      title: `告警 ${i + 1}: ${getTypeLabel(type)}`,
      message: `检测到${getTypeLabel(type)}，需要及时处理`,
      level,
      type,
      status,
      sourceIP: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      target: `example.com${i % 3 === 0 ? '/api' : ''}`,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      progress: status === 'processing' ? Math.floor(Math.random() * 100) : (status === 'resolved' ? 100 : 0),
      handler: status === 'processing' || status === 'resolved' ? '管理员' : null
    })
  }
  
  return mockAlerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// 生命周期
onMounted(async () => {
  // 先尝试从API获取统计数据
  const statsLoaded = await loadAlertStats()
  // 如果API统计不可用，则加载全部数据用于统计
  if (!statsLoaded) {
    await loadAllAlertsForStats()
  }
  // 然后加载当前页的筛选数据
  await loadAlerts()
  connectWebSocket()
})

onBeforeUnmount(() => {
  if (ws) {
    ws.close()
  }
})
</script>

<style scoped>
.alert-management {
  padding: 20px;
  min-height: calc(100vh - 100px);
}

/* 统计卡片 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.1) 0%, rgba(74, 158, 255, 0.05) 100%);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #4a9eff 0%, #3b82f6 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.stat-card.active::before,
.stat-card:hover::before {
  transform: scaleX(1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(74, 158, 255, 0.2);
}

.stat-card.warning {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
  border-color: rgba(255, 193, 7, 0.2);
}

.stat-card.warning::before {
  background: linear-gradient(90deg, #ffc107 0%, #ffb300 100%);
}

.stat-card.processing {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%);
  border-color: rgba(33, 150, 243, 0.2);
}

.stat-card.processing::before {
  background: linear-gradient(90deg, #2196f3 0%, #1976d2 100%);
}

.stat-card.success {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
  border-color: rgba(76, 175, 80, 0.2);
}

.stat-card.success::before {
  background: linear-gradient(90deg, #4caf50 0%, #388e3c 100%);
}

.stat-card.danger {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%);
  border-color: rgba(244, 67, 54, 0.2);
}

.stat-card.danger::before {
  background: linear-gradient(90deg, #f44336 0%, #d32f2f 100%);
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #2b3a4b;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #7b8aa3;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.filter-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 6px;
  background: rgba(30, 30, 30, 0.8);
  color: #e0e0e0;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:hover {
  border-color: rgba(74, 158, 255, 0.6);
}

.filter-select:focus {
  outline: none;
  border-color: #4a9eff;
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
}

.search-input {
  padding: 8px 16px;
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 6px;
  background: rgba(30, 30, 30, 0.8);
  color: #e0e0e0;
  font-size: 14px;
  width: 300px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4a9eff;
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
}

.filter-right {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 6px;
  background: rgba(30, 30, 30, 0.8);
  color: #e0e0e0;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn:hover:not(:disabled) {
  background: rgba(74, 158, 255, 0.1);
  border-color: rgba(74, 158, 255, 0.6);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.primary {
  background: linear-gradient(135deg, #4a9eff 0%, #3b82f6 100%);
  border-color: #4a9eff;
  color: white;
}

.action-btn.danger {
  background: rgba(244, 67, 54, 0.1);
  border-color: rgba(244, 67, 54, 0.3);
  color: #f44336;
}

/* 告警列表 */
.alert-list-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  min-height: 400px;
  backdrop-filter: blur(10px);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #7b8aa3;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(74, 158, 255, 0.2);
  border-top-color: #4a9eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.alert-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(74, 158, 255, 0.4);
  transform: translateX(4px);
}

.alert-item.selected {
  background: rgba(74, 158, 255, 0.1);
  border-color: #4a9eff;
}

.alert-item.expanded {
  background: rgba(74, 158, 255, 0.05);
}

.alert-item.level-critical {
  border-left: 4px solid #f44336;
}

.alert-item.level-high {
  border-left: 4px solid #ff9800;
}

.alert-item.level-medium {
  border-left: 4px solid #ffc107;
}

.alert-item.level-low {
  border-left: 4px solid #4caf50;
}

.alert-item.level-info {
  border-left: 4px solid #2196f3;
}

.alert-checkbox {
  margin-top: 4px;
}

.alert-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.alert-content {
  flex: 1;
}

.alert-header {
  margin-bottom: 8px;
}

.alert-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.alert-level {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.badge-critical {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.badge-high {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

.badge-medium {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.badge-low {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.badge-info {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

.alert-type {
  padding: 4px 8px;
  background: rgba(74, 158, 255, 0.1);
  color: #4a9eff;
  border-radius: 4px;
  font-size: 12px;
}

.alert-title {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #e0e0e0;
}

.alert-time {
  font-size: 12px;
  color: #7b8aa3;
  white-space: nowrap;
}

.alert-body {
  margin-top: 8px;
}

.alert-message {
  color: #b0b0b0;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.alert-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-label {
  color: #7b8aa3;
}

.meta-value {
  color: #e0e0e0;
  font-weight: 500;
}

.status-pending {
  color: #ffc107;
}

.status-processing {
  color: #2196f3;
}

.status-resolved {
  color: #4caf50;
}

.status-ignored {
  color: #9e9e9e;
}

/* 处理进度 */
.alert-progress {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(74, 158, 255, 0.1);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: #7b8aa3;
}

.progress-bar {
  height: 6px;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a9eff 0%, #3b82f6 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 操作按钮 */
.alert-actions {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.action-icon-btn {
  padding: 6px 10px;
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 6px;
  background: rgba(30, 30, 30, 0.8);
  color: #e0e0e0;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-icon-btn:hover {
  background: rgba(74, 158, 255, 0.1);
  border-color: rgba(74, 158, 255, 0.6);
}

.action-icon-btn.danger {
  border-color: rgba(244, 67, 54, 0.3);
  color: #f44336;
}

.action-icon-btn.danger:hover {
  background: rgba(244, 67, 54, 0.1);
  border-color: rgba(244, 67, 54, 0.6);
}

/* 详情弹窗 */
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.detail-content {
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(45, 45, 45, 0.95) 100%);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.2);
}

.detail-header h2 {
  margin: 0;
  color: #e0e0e0;
  font-size: 20px;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border-radius: 6px;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(244, 67, 54, 0.2);
}

.detail-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  margin: 0 0 16px 0;
  color: #4a9eff;
  font-size: 16px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.2);
  padding-bottom: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item label {
  font-size: 12px;
  color: #7b8aa3;
}

.detail-item span {
  font-size: 14px;
  color: #e0e0e0;
  font-weight: 500;
}

.detail-message {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  color: #e0e0e0;
  line-height: 1.6;
  font-size: 14px;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-text {
  font-size: 14px;
  color: #7b8aa3;
  text-align: right;
}

.handle-records {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.handle-record {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border-left: 3px solid #4a9eff;
}

.record-time {
  font-size: 12px;
  color: #7b8aa3;
  margin-bottom: 4px;
}

.record-action {
  font-size: 14px;
  color: #e0e0e0;
  font-weight: 500;
  margin-bottom: 4px;
}

.record-user {
  font-size: 12px;
  color: #7b8aa3;
  margin-bottom: 4px;
}

.record-note {
  font-size: 13px;
  color: #b0b0b0;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(74, 158, 255, 0.1);
}

.detail-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid rgba(74, 158, 255, 0.2);
}

.detail-btn {
  padding: 10px 20px;
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 6px;
  background: rgba(30, 30, 30, 0.8);
  color: #e0e0e0;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.detail-btn:hover {
  background: rgba(74, 158, 255, 0.1);
  border-color: rgba(74, 158, 255, 0.6);
}

.detail-btn.primary {
  background: linear-gradient(135deg, #4a9eff 0%, #3b82f6 100%);
  border-color: #4a9eff;
  color: white;
}

.detail-btn.success {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  border-color: #4caf50;
  color: white;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 6px;
  background: rgba(30, 30, 30, 0.8);
  color: #e0e0e0;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(74, 158, 255, 0.1);
  border-color: rgba(74, 158, 255, 0.6);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #7b8aa3;
  font-size: 14px;
}
</style>

