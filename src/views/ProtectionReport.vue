<template>
  <div class="protection-report">
    <!-- 控制栏 -->
    <div class="controls">
      <div class="controls-left">
        <el-button 
          type="primary" 
          :loading="loading" 
          @click="loadStats"
          :disabled="loading"
          class="refresh-btn"
          size="large" 
        >
          <template #icon>
            <el-icon><Refresh /></el-icon>
          </template>
          {{ loading ? '加载中...' : '刷新统计信息' }}
        </el-button>
        
        <div class="status">
          <span v-if="loading">正在加载统计数据...</span>
          <span v-else-if="statsData">
            {{ searchQuery ? `找到 ${filteredExports.length} 条报告` : `共 ${statsData.totalLogs || 0} 条报告` }}
          </span>
          <span v-else>未加载</span>
        </div>
      </div>
      
      <div class="top-bar-right">
        <div class="search-container">
          <el-input
            v-model="searchQuery"
            placeholder="搜索报告名称"
            clearable
            @input="handleSearch"
            @keyup.enter="performSearch"
            @focus="showSearchResults = true"
            @blur="onSearchBlur"
            class="search-input"
            size="large"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button @click="performSearch" :icon="Search" />
            </template>
          </el-input>
          
        </div>
        
        <el-button 
          type="success" 
          @click="openGenerateModal" 
          :loading="generating"
          class="generate-btn"
          size="large"
        >
          <template #icon>
            <el-icon><Plus /></el-icon>
          </template>
          {{ generating ? '生成中...' : '立即生成' }}
        </el-button>
      </div>
    </div>
    
    <!-- 导出历史区域 -->
 
    <el-card class="content-card">
      <!-- 表头 -->
      <div class="table-header">
        <el-row :gutter="20" class="header-row">
          <el-col :span="10">报告名称</el-col>
          <el-col :span="8">生成时间</el-col>
          <el-col :span="6">操作</el-col>
        </el-row>
      </div>
      
      <!-- 导出历史列表 -->
      <div class="reports-container">
        <el-empty 
          v-if="displayExports.length === 0 && !loading" 
          description="暂无导出记录"
          class="empty-state"
        >
          <template #image>
            <el-icon :size="60"><Document /></el-icon>
          </template>
          <p>点击"立即生成"按钮创建新的WAF日志报告</p>
        </el-empty>
        
        <div v-else>
          <el-row 
            v-for="exportItem in displayExports"
            :key="exportItem.taskId"
            :gutter="20"
            class="report-row"
          >
            <el-col :span="10" class="report-title">{{ exportItem.filename }}</el-col>
            <el-col :span="8" class="report-time">{{ formatDate(exportItem.createTime) }}</el-col>
            <el-col :span="6" class="button-group">
              <el-button 
                type="primary" 
                size="small" 
                @click="downloadExport(exportItem.taskId, exportItem.filename)"
                class="download-btn"
              >
                <template #icon>
                  <el-icon><Download /></el-icon>
                </template>
                下载
              </el-button>
              <el-button 
                type="warning" 
                size="small" 
                @click="previewExport(exportItem.taskId)"
                class="preview-btn"
              >
                <template #icon>
                  <el-icon><View /></el-icon>
                </template>
                预览
              </el-button>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-card>
    
    <!-- 生成报告弹窗 -->
    <el-dialog
      v-model="showModal"
      title="生成WAF日志报告"
      width="600px"
      :before-close="handleDialogClose"
      class="generate-dialog"
    >
      <el-form
        ref="formRef"
        :model="newReport"
        label-width="100px"
        :disabled="generating"
      >
        <el-form-item label="报告名称" prop="name" required>
          <el-input
            v-model="newReport.name"
            placeholder="请输入报告名称"
            clearable
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime" required>
              <el-date-picker
                v-model="newReport.startTime"
                type="datetime"
                placeholder="选择开始时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime" required>
              <el-date-picker
                v-model="newReport.endTime"
                type="datetime"
                placeholder="选择结束时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="导出格式" prop="format" required>
          <el-select
            v-model="newReport.format"
            placeholder="请选择导出格式"
            style="width: 100%"
          >
            <el-option label="PDF" value="pdf" />
            <el-option label="CSV" value="csv" />
          </el-select>
        </el-form-item>
        
        <el-divider />
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeGenerateModal" :disabled="generating">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="handleGenerate"
            :loading="generating"
          >
            生成报告
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import wafReportService from '@api/report';
import {
  Document,
  Download,
  Plus,
  Refresh,
  Search,
  View
} from '@element-plus/icons-vue';
import { ElButton, ElCol, ElDatePicker, ElDialog, ElDivider, ElForm, ElFormItem, ElInput, ElMessage, ElOption, ElRow, ElSelect } from 'element-plus';
import 'element-plus/dist/index.css';
import { computed, onMounted, reactive, ref } from 'vue';

// 响应式数据
const loading = ref(false)
const generating = ref(false)
const status = ref('就绪')
const statsData = ref(null)
const statsTimestamp = ref(null)
const exportHistory = ref([])
const searchQuery = ref('')
const showSearchResults = ref(false)
const showModal = ref(false)

// 新报告表单数据
const newReport = reactive({
  name: '',
  startTime: '',
  endTime: '',
  clientIp: '',
  action: 'BLOCK',
  ruleId: '',
  tags: '',
  search: '',
  format: 'pdf',
  minScore: 0,
  maxScore: 100,
  fields: ["time", "clientIp", "uri", "action", "ruleId"],
})

// 计算属性 - 过滤后的导出记录（用于下拉建议）
const filteredExports = computed(() => {
  if (!searchQuery.value.trim()) return []
  
  return exportHistory.value.filter(item => 
    item.filename.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 计算属性 - 显示在页面的报告列表
const displayExports = computed(() => {
  if (!searchQuery.value.trim()) {
    return exportHistory.value // 没有搜索时显示全部
  }
  // 有搜索时，显示过滤后的列表
  return exportHistory.value.filter(item => 
    item.filename.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 加载统计信息 - 使用后端返回的数据
// 修改 loadStats 函数 - 删除其他计算，只保留需要的逻辑
const loadStats = async () => {
  loading.value = true
  status.value = '加载中...'
  
  try {
    // ✅ 我们不需要调用 getWafStats 了，因为你要显示的是生成报告时返回的 totalReports
    // 但是 loadStats 按钮需要显示什么数据呢？
    
    // 方案1：显示最近一次生成的报告的记录数
    await loadExportHistory()
    
    // 从历史记录中获取最近一次的报告记录数
    let recentTotalReports = 0
    if (exportHistory.value.length > 0) {
      recentTotalReports = exportHistory.value[0].totalReports || 0
    }
    
    statsData.value = {
      totalLogs: recentTotalReports  // 显示最近一次报告的记录数
    }

    statsTimestamp.value = new Date()
    status.value = '统计信息已更新'
    
    // 显示统计信息
    if (recentTotalReports > 0) {
      ElMessage.success(`共 ${recentTotalReports} 条记录`)
    } else {
      ElMessage.info('暂无报告数据')
    }
    
  } catch (error) {
    status.value = '加载失败'
    console.error('加载统计信息失败:', error)
    ElMessage.error('加载统计信息失败，请重试')
  } finally {
    loading.value = false
  }
}

// 修改 handleGenerate 函数 - 简化逻辑
const handleGenerate = async () => {
  if (!newReport.name.trim()) {
    ElMessage.warning('请输入报告名称')
    return
  }
  
  if (!newReport.startTime || !newReport.endTime) {
    ElMessage.warning('请选择时间范围')
    return
  }
  
  generating.value = true
  
  try {
    // 调用生成报告接口
    const result = await wafReportService.generateExport({ ...newReport })
    
    console.log('生成结果:', result)
    
    // ✅ 从生成结果中获取 totalReports（本次报告的记录数）
    const totalReports = result.data?.totalReports || result.totalReports || 0
    
    // 加载历史记录
    await loadExportHistory()
    
    // ✅ 更新统计信息为本次的 totalReports
    statsData.value = {
      totalLogs: totalReports
    }
    
    status.value = '统计信息已更新'
    
    // 显示本次生成的报告记录数
    if (totalReports > 0) {
      ElMessage.success(`报告 "${newReport.name}" 已生成，包含 ${totalReports} 条记录`)
    } else {
      ElMessage.success(`报告 "${newReport.name}" 已生成`)
    }
    
    // 清空搜索框
    searchQuery.value = ''
    
    closeGenerateModal()
    
  } catch (error) {
    console.error('生成报告失败:', error)
    ElMessage.error('生成报告失败，请重试')
  } finally {
    generating.value = false
  }
}

// 加载导出历史 - 修复：确保能获取到最新数据
const loadExportHistory = async () => {
  try {
    const data = await wafReportService.getExportHistory()
    // 直接使用返回的数据，不进行额外处理
    exportHistory.value = Array.isArray(data) ? data : (data?.data || data?.list || [])
  } catch (error) {
    console.error('加载导出历史失败:', error)
    exportHistory.value = []
  }
}

// 搜索处理
const handleSearch = () => {
  showSearchResults.value = searchQuery.value.trim().length > 0
}

// 搜索框失去焦点处理
const onSearchBlur = () => {
  setTimeout(() => {
    showSearchResults.value = false
  }, 200)
}

// 执行搜索（点击放大镜或按回车时调用）
const performSearch = () => {
  showSearchResults.value = false
  if (searchQuery.value.trim()) {
    ElMessage.success(`找到 ${displayExports.value.length} 条报告`)
  }
}

// 选择导出记录
const selectExport = (filename) => {
  searchQuery.value = filename
  showSearchResults.value = false
  performSearch()
}

// 下载导出文件
const downloadExport = async (taskId, filename) => {
  try {
    const response = await wafReportService.downloadExport(taskId)
    const blob = response.data
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    const downloadName = filename || `waf_report_${taskId}.${newReport.format}`
    link.download = downloadName
    
    document.body.appendChild(link)
    link.click()
    
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('开始下载文件')
  } catch (error) {
    console.error('下载导出文件失败:', error)
    ElMessage.error('下载文件失败，请重试')
  }
}

const previewExport = async (taskId) => {
  try {
    const blob = await wafReportService.previewExport(taskId)
    const url = URL.createObjectURL(
      new Blob([blob], { type: 'application/pdf' })
    )
    window.open(url)
    ElMessage.success('正在预览报告')
  } catch (error) {
    console.error('预览报告失败:', error)
    ElMessage.error('预览报告失败，请重试')
  }
}

// 打开生成报告弹窗
const openGenerateModal = () => {
  showModal.value = true
  const endTime = new Date()
  const startTime = new Date()
  startTime.setDate(startTime.getDate() - 1)
  
  newReport.startTime = startTime.toISOString().slice(0, 16)
  newReport.endTime = endTime.toISOString().slice(0, 16)
}

// 对话框关闭处理
const handleDialogClose = (done) => {
  if (!generating.value) {
    closeGenerateModal()
    done()
  }
}

// 关闭生成报告弹窗
const closeGenerateModal = () => {
  if (!generating.value) {
    showModal.value = false
    const name = newReport.name
    Object.keys(newReport).forEach(key => {
      if (key === 'format') {
        newReport[key] = 'pdf'
      } else if (key === 'action') {
        newReport[key] = 'BLOCK'
      } else if (key === 'minScore') {
        newReport[key] = 0
      } else if (key === 'maxScore') {
        newReport[key] = 100
      } else if (key !== 'name') {
        newReport[key] = ''
      }
    })
    newReport.name = name
  }
}

// 处理表单提交 - 修复：确保生成报告后立即显示


// 组件挂载时自动加载数据
onMounted(() => {
  loadStats()
  loadExportHistory()
})
</script>

<style scoped>
/* 原有样式保持不变 */
.protection-report {
  padding: 20px;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
  min-height: calc(100vh - 80px);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.controls-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status {
  color: #7f8c8d;
  font-size: 14px;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-container {
  position: relative;
  width: 300px;
}

.search-input {
  width: 100%;
}

.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 2000;
}

.match-results {
  background: white;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.match-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.match-item:hover {
  background-color: #f8f9fa;
}

.match-item .el-icon {
  color: #409eff;
}

.generate-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.content-card {
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  background: white;
  border: none;
}

.table-header {
  padding: 20px;
  background-color: rgba(52, 152, 219, 0.8);
  color: white;
  font-weight: bold;
  font-size: 1.1em;
  border-radius: 8px 8px 0 0;
}

.header-row {
  display: flex;
  align-items: center;
}

.reports-container {
  padding: 0;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-state .el-icon {
  color: #bdc3c7;
}

.empty-state p {
  color: #7f8c8d;
  margin-top: 10px;
}

.report-row {
  padding: 20px;
  border-bottom: 1px solid #ecf0f1;
  margin: 0 !important;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.report-row:hover {
  background: rgb(4, 1, 41);
  transform: translateX(5px);
}

.report-title {
  color: #ffffff;
  font-weight: 600;
  font-size: 15px;
  display: flex;
  align-items: center;
}

.report-time {
  color: #7f8c8d;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
}

.download-btn,
.preview-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.generate-dialog {
  border-radius: 15px;
  overflow: hidden;
}

.generate-dialog :deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  margin: 0;
}

.generate-dialog :deep(.el-dialog__title) {
  color: #2c3e50;
  font-size: 1.5em;
}

.generate-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.generate-dialog :deep(.el-form-item) {
  margin-bottom: 20px;
}

.generate-dialog :deep(.el-divider) {
  margin: 20px 0;
}

.generate-dialog :deep(.el-collapse) {
  border: none;
}

.generate-dialog :deep(.el-collapse-item__header) {
  background: #f8f9fa;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 600;
}

.generate-dialog :deep(.el-collapse-item__wrap) {
  border: none;
  background: transparent;
}

.generate-dialog :deep(.el-collapse-item__content) {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 0 0 8px 8px;
}

.generate-dialog :deep(.el-dialog__footer) {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
  
  .controls-left {
    justify-content: center;
  }
  
  .top-bar-right {
    flex-direction: column;
    gap: 15px;
  }
  
  .search-container {
    width: 100%;
  }
  
  .table-header,
  .report-row {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .button-group {
    justify-content: center;
    width: 100%;
  }
  
  .generate-dialog {
    width: 90% !important;
  }
}
</style>