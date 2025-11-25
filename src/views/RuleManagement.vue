<template>
  <div class="rule-management">
    <!-- 顶部统计卡片 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-value">{{ stats.total || 0 }}</div>
        <div class="stat-label">全部规则</div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">✅</div>
        <div class="stat-value">{{ stats.active || 0 }}</div>
        <div class="stat-label">已启用</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon">⏸️</div>
        <div class="stat-value">{{ stats.inactive || 0 }}</div>
        <div class="stat-label">已禁用</div>
      </div>
      <div class="stat-card info">
        <div class="stat-icon">🛡️</div>
        <div class="stat-value">{{ stats.byAction?.DENY || 0 }}</div>
        <div class="stat-label">拦截规则</div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="action-left">
        <button class="action-btn primary" @click="openCreateModal">
          <span>➕</span> 新建规则
        </button>
        <button class="action-btn" @click="loadRules">
          <span>🔄</span> 刷新
        </button>
        <button class="action-btn" @click="syncRules" :disabled="syncing">
          <span v-if="syncing">⏳</span>
          <span v-else>🔄</span>
          {{ syncing ? '同步中...' : '同步规则' }}
        </button>
        <button class="action-btn" @click="exportRules">
          <span>📥</span> 导出规则
        </button>
      </div>
      <div class="action-right">
        <button 
          v-if="selectedRules.length > 0"
          class="action-btn danger" 
          @click="handleBatchDelete"
        >
          <span>🗑️</span> 批量删除 ({{ selectedRules.length }})
        </button>
        <button 
          v-if="selectedRules.length > 0"
          class="action-btn" 
          @click="handleBatchToggle"
        >
          <span>🔄</span> 批量切换状态 ({{ selectedRules.length }})
        </button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-group">
        <label>目标类型:</label>
        <select v-model="filters.target" @change="loadRules">
          <option value="">全部</option>
          <option v-for="target in targetTypes" :key="target" :value="target">
            {{ formatTarget(target) }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>动作类型:</label>
        <select v-model="filters.action" @change="loadRules">
          <option value="">全部</option>
          <option v-for="action in actionTypes" :key="action" :value="action">
            {{ formatAction(action) }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>匹配类型:</label>
        <select v-model="filters.matchType" @change="loadRules">
          <option value="">全部</option>
          <option v-for="matchType in matchTypes" :key="matchType" :value="matchType">
            {{ formatMatchType(matchType) }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>状态:</label>
        <select v-model="filters.isActive" @change="loadRules">
          <option value="">全部</option>
          <option value="true">已启用</option>
          <option value="false">已禁用</option>
        </select>
      </div>
      <div class="filter-group search-group">
        <label>搜索:</label>
        <input 
          type="text" 
          v-model="filters.search" 
          placeholder="搜索规则描述..." 
          @input="debounceSearch"
        />
      </div>
    </div>

    <!-- 规则列表 -->
    <div class="rules-table-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>加载中...</span>
      </div>
      <div v-else-if="rules.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-text">暂无规则数据</div>
      </div>
      <table v-else class="rules-table">
        <thead>
          <tr>
            <th class="checkbox-col">
              <input 
                type="checkbox" 
                :checked="selectedRules.length === rules.length && rules.length > 0"
                @change="toggleSelectAll"
              />
            </th>
            <th>规则ID</th>
            <th>描述</th>
            <th>目标</th>
            <th>匹配方式</th>
            <th>匹配模式</th>
            <th>动作</th>
            <th>评分</th>
            <th>优先级</th>
            <th>标签</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="rule in rules" 
            :key="rule.id"
            :class="{ 
              selected: selectedRules.includes(rule.id),
              inactive: !rule.isActive 
            }"
          >
            <td class="checkbox-col">
              <input 
                type="checkbox" 
                :checked="selectedRules.includes(rule.id)"
                @change="toggleSelect(rule.id)"
              />
            </td>
            <td>{{ rule.ruleId }}</td>
            <td class="description-cell" :title="rule.description">
              {{ rule.description || '-' }}
            </td>
            <td>{{ formatTarget(rule.target) }}</td>
            <td>{{ formatMatchType(rule.match) }}</td>
            <td class="pattern-cell" :title="rule.pattern">
              {{ rule.pattern }}
            </td>
            <td>
              <span :class="`action-badge action-${rule.action.toLowerCase()}`">
                {{ formatAction(rule.action) }}
              </span>
            </td>
            <td>{{ rule.score || '-' }}</td>
            <td>{{ rule.priority || '-' }}</td>
            <td class="tags-cell">
              <span 
                v-for="tag in (rule.tags || [])" 
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
              <span v-if="!rule.tags || rule.tags.length === 0">-</span>
            </td>
            <td>
              <span 
                class="status-badge" 
                :class="rule.isActive ? 'status-active' : 'status-inactive'"
              >
                {{ rule.isActive ? '已启用' : '已禁用' }}
              </span>
            </td>
            <td class="actions-cell">
              <button 
                class="icon-btn" 
                title="编辑"
                @click="openEditModal(rule)"
              >
                ✏️
              </button>
              <button 
                class="icon-btn" 
                :title="rule.isActive ? '禁用' : '启用'"
                @click="toggleRuleStatus(rule.id)"
              >
                {{ rule.isActive ? '⏸️' : '▶️' }}
              </button>
              <button 
                class="icon-btn danger" 
                title="删除"
                @click="deleteRule(rule.id)"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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

    <!-- 创建/编辑规则弹窗 -->
    <div v-if="showModal" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ modalMode === 'create' ? '新建规则' : '编辑规则' }}</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>规则ID <span class="required">*</span></label>
              <input 
                type="number" 
                v-model.number="formData.ruleId" 
                required
                :disabled="modalMode === 'edit'"
                placeholder="请输入规则ID"
              />
            </div>
            <div class="form-group">
              <label>优先级</label>
              <input 
                type="number" 
                v-model.number="formData.priority" 
                placeholder="优先级（数字越小优先级越高）"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>目标类型 <span class="required">*</span></label>
              <select v-model="formData.target" required>
                <option value="">请选择</option>
                <option v-for="target in targetTypes" :key="target" :value="target">
                  {{ formatTarget(target) }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>匹配类型 <span class="required">*</span></label>
              <select v-model="formData.match" required>
                <option value="">请选择</option>
                <option v-for="matchType in matchTypes" :key="matchType" :value="matchType">
                  {{ formatMatchType(matchType) }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>匹配模式 <span class="required">*</span></label>
            <textarea 
              v-model="formData.pattern" 
              required
              rows="3"
              placeholder="请输入匹配模式（正则表达式、字符串等）"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>动作类型 <span class="required">*</span></label>
              <select v-model="formData.action" required>
                <option value="">请选择</option>
                <option v-for="action in actionTypes" :key="action" :value="action">
                  {{ formatAction(action) }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>评分</label>
              <input 
                type="number" 
                v-model.number="formData.score" 
                placeholder="规则评分"
              />
            </div>
          </div>

          <div class="form-group">
            <label>标签</label>
            <input 
              type="text" 
              v-model="tagsInput" 
              placeholder="多个标签用逗号分隔，如：sqli,high"
              @blur="parseTags"
            />
            <div class="tags-preview" v-if="formData.tags && formData.tags.length > 0">
              <span 
                v-for="tag in formData.tags" 
                :key="tag"
                class="tag-preview"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="form-group">
            <label>描述</label>
            <textarea 
              v-model="formData.description" 
              rows="3"
              placeholder="请输入规则描述"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="formData.isActive"
              />
              <span>启用规则</span>
            </label>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="closeModal">取消</button>
            <button type="submit" class="btn-submit" :disabled="submitting">
              {{ submitting ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { rulesAPI } from '../api/rulesAPI.js'

// 响应式数据
const rules = ref([])
const loading = ref(false)
const syncing = ref(false)
const submitting = ref(false)
const selectedRules = ref([])
const showModal = ref(false)
const modalMode = ref('create') // 'create' | 'edit'
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

// 统计数据
const stats = reactive({
  total: 0,
  active: 0,
  inactive: 0,
  byAction: {}
})

// 枚举数据
const targetTypes = ref([])
const actionTypes = ref([])
const matchTypes = ref([])

// 筛选条件
const filters = reactive({
  target: '',
  action: '',
  matchType: '',
  isActive: '',
  search: ''
})

// 表单数据
const formData = reactive({
  ruleId: null,
  target: '',
  match: '',
  pattern: '',
  action: '',
  score: null,
  priority: null,
  isActive: true,
  tags: [],
  description: ''
})

const tagsInput = ref('')

// 方法
const loadRules = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      sortBy: 'ruleId',
      sortOrder: 'ASC'
    }
    
    if (filters.target) params.target = filters.target
    if (filters.action) params.action = filters.action
    if (filters.matchType) params.matchType = filters.matchType
    if (filters.isActive !== '') params.isActive = filters.isActive === 'true'
    if (filters.search) params.search = filters.search
    
    const response = await rulesAPI.getRules(params)
    // console.log('111',response)

    if (response.data?.code === 200) {
      const data = response.data.data || {}
      rules.value = data.items || []
      totalCount.value = data.total || 0
    } else {
      // 使用模拟数据
      rules.value = generateMockRules()
      totalCount.value = rules.value.length
    }
  } catch (error) {
    console.error('加载规则列表失败:', error)
    rules.value = generateMockRules()
    totalCount.value = rules.value.length
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const response = await rulesAPI.getRulesStats()
    if (response.data?.code === 200) {
      Object.assign(stats, response.data.data || {})
    }
  } catch (error) {
    console.error('加载规则统计失败:', error)
  }
}

const loadEnums = async () => {
  try {
    const [targetsRes, actionsRes, matchTypesRes] = await Promise.all([
      rulesAPI.getTargets(),
      rulesAPI.getActions(),
      rulesAPI.getMatchTypes()
    ])
    
    if (targetsRes.data?.code === 200) {
      targetTypes.value = targetsRes.data.data || []
    } else {
      targetTypes.value = ['CLIENT_IP', 'URI', 'ALL_PARAMS', 'BODY', 'HEADER']
    }
    
    if (actionsRes.data?.code === 200) {
      actionTypes.value = actionsRes.data.data || []
    } else {
      actionTypes.value = ['DENY', 'LOG', 'BYPASS']
    }
    
    if (matchTypesRes.data?.code === 200) {
      matchTypes.value = matchTypesRes.data.data || []
    } else {
      matchTypes.value = ['CONTAINS', 'EXACT', 'REGEX', 'CIDR']
    }
  } catch (error) {
    console.error('加载枚举数据失败:', error)
    // 使用默认值
    targetTypes.value = ['CLIENT_IP', 'URI', 'ALL_PARAMS', 'BODY', 'HEADER']
    actionTypes.value = ['DENY', 'LOG', 'BYPASS']
    matchTypes.value = ['CONTAINS', 'EXACT', 'REGEX', 'CIDR']
  }
}

const syncRules = async () => {
  if (!confirm('确定要同步规则吗？这将从文件系统同步规则到数据库。')) return
  
  syncing.value = true
  try {
    await rulesAPI.syncRules()
    alert('同步成功')
    loadRules()
    loadStats()
  } catch (error) {
    console.error('同步规则失败:', error)
    alert('同步失败，请重试')
  } finally {
    syncing.value = false
  }
}

const exportRules = async () => {
  try {
    const response = await rulesAPI.exportRules()
    if (response.data?.code === 200) {
      const dataStr = JSON.stringify(response.data.data, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `waf-rules-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      alert('导出功能暂未实现')
    }
  } catch (error) {
    console.error('导出规则失败:', error)
    alert('导出失败，请重试')
  }
}

const openCreateModal = () => {
  modalMode.value = 'create'
  resetForm()
  showModal.value = true
}

const openEditModal = (rule) => {
  modalMode.value = 'edit'
  Object.assign(formData, {
    ruleId: rule.ruleId,
    target: rule.target,
    match: rule.match,
    pattern: rule.pattern,
    action: rule.action,
    score: rule.score,
    priority: rule.priority,
    isActive: rule.isActive,
    tags: [...(rule.tags || [])],
    description: rule.description || ''
  })
  tagsInput.value = (rule.tags || []).join(', ')
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  Object.assign(formData, {
    ruleId: null,
    target: '',
    match: '',
    pattern: '',
    action: '',
    score: null,
    priority: null,
    isActive: true,
    tags: [],
    description: ''
  })
  tagsInput.value = ''
}

const parseTags = () => {
  if (tagsInput.value.trim()) {
    formData.tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t)
  } else {
    formData.tags = []
  }
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    parseTags()
    
    if (modalMode.value === 'create') {
      await rulesAPI.createRule(formData)
      alert('创建规则成功')
    } else {
      await rulesAPI.updateRule(formData.ruleId, formData)
      alert('更新规则成功')
    }
    
    closeModal()
    loadRules()
    loadStats()
  } catch (error) {
    console.error('保存规则失败:', error)
    alert('保存失败，请重试')
  } finally {
    submitting.value = false
  }
}

const toggleRuleStatus = async (ruleId) => {
  try {
    // 找到对应的rule对象以获取ruleId
    const rule = rules.value.find(r => r.id === ruleId)
    if (!rule) return
    
    await rulesAPI.toggleRule(rule.ruleId)
    loadRules()
    loadStats()
  } catch (error) {
    console.error('切换规则状态失败:', error)
    alert('操作失败，请重试')
  }
}

const deleteRule = async (ruleId) => {
  if (!confirm('确定要删除这条规则吗？')) return
  
  try {
    // 找到对应的rule对象以获取ruleId
    const rule = rules.value.find(r => r.id === ruleId)
    if (!rule) return
    
    await rulesAPI.deleteRule(rule.ruleId)
    loadRules()
    loadStats()
  } catch (error) {
    console.error('删除规则失败:', error)
    alert('删除失败，请重试')
  }
}

const toggleSelect = (ruleId) => {
  const index = selectedRules.value.indexOf(ruleId)
  if (index > -1) {
    selectedRules.value.splice(index, 1)
  } else {
    selectedRules.value.push(ruleId)
  }
}

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedRules.value = rules.value.map(r => r.id)
  } else {
    selectedRules.value = []
  }
}

const handleBatchDelete = async () => {
  if (selectedRules.value.length === 0) return
  if (!confirm(`确定要删除选中的 ${selectedRules.value.length} 条规则吗？`)) return
  
  try {
    // 批量删除需要找到对应的ruleId
    const ruleIds = selectedRules.value.map(id => {
      const rule = rules.value.find(r => r.id === id)
      return rule ? rule.ruleId : null
    }).filter(id => id !== null)
    
    // 批量删除：先删除每个规则
    for (const ruleId of ruleIds) {
      await rulesAPI.deleteRule(ruleId)
    }
    
    selectedRules.value = []
    loadRules()
    loadStats()
  } catch (error) {
    console.error('批量删除失败:', error)
    alert('批量删除失败，请重试')
  }
}

const handleBatchToggle = async () => {
  if (selectedRules.value.length === 0) return
  
  try {
    // 获取所有选中规则的ruleId
    const ruleIds = selectedRules.value.map(id => {
      const rule = rules.value.find(r => r.id === id)
      return rule ? rule.ruleId : null
    }).filter(id => id !== null)
    
    // 批量切换状态
    for (const ruleId of ruleIds) {
      await rulesAPI.toggleRule(ruleId)
    }
    selectedRules.value = []
    loadRules()
    loadStats()
  } catch (error) {
    console.error('批量切换状态失败:', error)
    alert('批量操作失败，请重试')
  }
}

const goToPage = (page) => {
  currentPage.value = page
  loadRules()
}

let searchTimer = null
const debounceSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadRules()
  }, 500)
}

// 格式化函数
const formatTarget = (target) => {
  const labels = {
    'CLIENT_IP': '客户端IP',
    'URI': 'URI',
    'ALL_PARAMS': '所有参数',
    'ARGS_COMBINED': '参数组合',
    'ARGS_NAME': '参数名',
    'ARGS_VALUE': '参数值',
    'BODY': '请求体',
    'HEADER': '请求头'
  }
  return labels[target] || target
}

const formatAction = (action) => {
  const labels = {
    'DENY': '拦截',
    'LOG': '记录',
    'BYPASS': '放行'
  }
  return labels[action] || action
}

const formatMatchType = (matchType) => {
  const labels = {
    'CONTAINS': '包含',
    'EXACT': '精确匹配',
    'REGEX': '正则表达式',
    'CIDR': 'CIDR'
  }
  return labels[matchType] || matchType
}

// 生成模拟数据
const generateMockRules = () => {
  return [
    {
      id: 1,
      ruleId: 1001,
      target: 'ALL_PARAMS',
      match: 'CONTAINS',
      pattern: 'attack',
      action: 'DENY',
      score: 50,
      priority: 1,
      isActive: true,
      tags: ['sqli', 'high'],
      description: 'SQL注入检测规则',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z'
    },
    {
      id: 2,
      ruleId: 1002,
      target: 'URI',
      match: 'REGEX',
      pattern: '<script>',
      action: 'DENY',
      score: 40,
      priority: 2,
      isActive: true,
      tags: ['xss', 'medium'],
      description: 'XSS攻击检测规则',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z'
    }
  ]
}

// 生命周期
onMounted(async () => {
  await loadEnums()
  await loadStats()
  await loadRules()
})
</script>

<style scoped>
.rule-management {
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
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(74, 158, 255, 0.2);
}

.stat-card.success {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
  border-color: rgba(76, 175, 80, 0.2);
}

.stat-card.warning {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
  border-color: rgba(255, 193, 7, 0.2);
}

.stat-card.info {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%);
  border-color: rgba(33, 150, 243, 0.2);
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

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.action-left,
.action-right {
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

/* 筛选栏 */
.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  color: #7b8aa3;
  white-space: nowrap;
}

.filter-group select,
.filter-group input {
  padding: 6px 12px;
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 6px;
  background: rgba(30, 30, 30, 0.8);
  color: #e0e0e0;
  font-size: 14px;
}

.filter-group.search-group input {
  width: 250px;
}

/* 表格 */
.rules-table-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  overflow-x: auto;
  min-height: 400px;
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

.rules-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.rules-table th,
.rules-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid rgba(74, 158, 255, 0.1);
}

.rules-table th {
  background: rgba(74, 158, 255, 0.1);
  color: #4a9eff;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
}

.rules-table tbody tr:hover {
  background: rgba(74, 158, 255, 0.05);
}

.rules-table tbody tr.selected {
  background: rgba(74, 158, 255, 0.1);
}

.rules-table tbody tr.inactive {
  opacity: 0.6;
}

.checkbox-col {
  width: 40px;
  text-align: center;
}

.description-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pattern-cell {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: monospace;
  font-size: 12px;
}

.tags-cell {
  max-width: 200px;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  margin: 2px;
  background: rgba(74, 158, 255, 0.2);
  color: #4a9eff;
  border-radius: 4px;
  font-size: 12px;
}

.action-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.action-deny {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.action-log {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.action-bypass {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-active {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-inactive {
  background: rgba(158, 158, 158, 0.2);
  color: #9e9e9e;
}

.actions-cell {
  white-space: nowrap;
}

.icon-btn {
  padding: 4px 8px;
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 4px;
  background: rgba(30, 30, 30, 0.8);
  color: #e0e0e0;
  font-size: 14px;
  cursor: pointer;
  margin-right: 4px;
  transition: all 0.3s ease;
}

.icon-btn:hover {
  background: rgba(74, 158, 255, 0.1);
  border-color: rgba(74, 158, 255, 0.6);
}

.icon-btn.danger:hover {
  background: rgba(244, 67, 54, 0.1);
  border-color: rgba(244, 67, 54, 0.6);
}

/* 弹窗 */
.modal {
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

.modal-content {
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(74, 158, 255, 0.2);
}

.modal-header h2 {
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
}

.close-btn:hover {
  background: rgba(244, 67, 54, 0.2);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #e0e0e0;
  font-size: 14px;
  font-weight: 500;
}

.required {
  color: #f44336;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 6px;
  background: rgba(30, 30, 30, 0.8);
  color: #e0e0e0;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4a9eff;
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

.tags-preview {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-preview {
  padding: 4px 8px;
  background: rgba(74, 158, 255, 0.2);
  color: #4a9eff;
  border-radius: 4px;
  font-size: 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid rgba(74, 158, 255, 0.2);
}

.btn-cancel,
.btn-submit {
  padding: 10px 20px;
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: rgba(30, 30, 30, 0.8);
  color: #e0e0e0;
}

.btn-cancel:hover {
  background: rgba(74, 158, 255, 0.1);
  border-color: rgba(74, 158, 255, 0.6);
}

.btn-submit {
  background: linear-gradient(135deg, #4a9eff 0%, #3b82f6 100%);
  border-color: #4a9eff;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

