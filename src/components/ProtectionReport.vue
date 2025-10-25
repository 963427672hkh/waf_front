<template>
  <div class="protection-report">
    <!-- 控制栏 -->
    <div class="controls">
      <div class="controls-left">
        <button class="refresh-btn" @click="loadReports" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i> 
          {{ loading ? '加载中...' : '刷新报告列表' }}
        </button>
        <div class="status">{{ status }}</div>
      </div>
      
      <div class="top-bar-right">
        <div class="input-group">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder=" " 
            required
            @input="handleSearch"
            @focus="showSearchResults = true"
          >
          <label>报告名称</label>
          <div class="match-results" v-show="showSearchResults && filteredReports.length > 0">
            <div 
              v-for="report in filteredReports" 
              :key="report.id"
              class="match-item"
              @click="selectReport(report.title)"
            >
              {{ report.title }}
            </div>
          </div>
        </div>
        <button class="login-get" @click="openGenerateModal">
          <i class="fas fa-plus"></i> 立即生成
        </button>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="content">
      <!-- 表头 -->
      <div class="tlayar">
        <div>报告名称</div>
        <div>生成时间</div>
        <div>操作</div>
      </div>
      
      <!-- 报告列表 -->
      <div class="reports-container">
        <div v-if="reports.length === 0 && !loading" class="empty-state">
          <i class="fas fa-file-invoice"></i>
          <h3>暂无报告数据</h3>
          <p>点击"刷新报告列表"按钮加载数据</p>
        </div>
        
        <div v-else>
          <div 
            v-for="report in reports" 
            :key="report.id"
            class="thirdlayar"
          >
            <div class="report-title">{{ report.title }}</div>
            <div class="report-time">{{ formatDate(report.createTime) }}</div>
            <div class="button-group">
              <button class="btn view" @click="preview(report.pdfUrl)">
                <i class="fas fa-eye"></i> 预览
              </button>
              <button class="btn export" @click="downloadPdf(report.pdfUrl, report.title)">
                <i class="fas fa-file-pdf"></i> 导出PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 生成报告弹窗 -->
    <div class="modal" v-show="showModal" @click="closeModalOnBackdrop">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">生成新报告</h3>
          <button class="close-btn" @click="closeGenerateModal">&times;</button>
        </div>
        <form @submit.prevent="handleGenerate">
          <div class="form-group">
            <label for="newReportName">报告名称</label>
            <input 
              type="text" 
              id="newReportName" 
              v-model="newReport.name"
              class="form-control" 
              placeholder="请输入报告名称" 
              required
            >
          </div>
          <div class="date-group">
            <div class="form-group">
              <label for="startDate">开始时间</label>
              <input 
                type="date" 
                id="startDate" 
                v-model="newReport.startDate"
                class="form-control" 
                required
              >
            </div>
            <div class="form-group">
              <label for="endDate">结束时间</label>
              <input 
                type="date" 
                id="endDate" 
                v-model="newReport.endDate"
                class="form-control" 
                required
              >
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="closeGenerateModal">取消</button>
            <button type="submit" class="btn-submit">生成报告</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'

// 响应式数据
const loading = ref(false)
const status = ref('就绪')
const reports = ref([])
const searchQuery = ref('')
const showSearchResults = ref(false)
const showModal = ref(false)

// 新报告表单数据
const newReport = reactive({
  name: '',
  startDate: '',
  endDate: ''
})

// 模拟报告数据
const mockReports = [
  {
    id: 1,
    title: "应用防护周报 2025-09-22",
    createTime: "2025-09-22T10:30:00",
    pdfUrl: "/reports/2025-09-22.pdf"
  },
  {
    id: 2,
    title: "系统安全周报 2025-09-15",
    createTime: "2025-09-15T14:20:00",
    pdfUrl: "/reports/2025-09-15.pdf"
  },
  {
    id: 3,
    title: "网络监控周报 2025-09-08",
    createTime: "2025-09-08T09:15:00",
    pdfUrl: "/reports/2025-09-08.pdf"
  },
  {
    id: 4,
    title: "123 2025-09-28",
    createTime: "2025-09-08T09:15:00",
    pdfUrl: "/reports/123.pdf"
  }
]

// 计算属性 - 过滤后的报告
const filteredReports = computed(() => {
  if (!searchQuery.value.trim()) return []
  
  return reports.value.filter(report => 
    report.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 加载报告数据
const loadReports = async () => {
  loading.value = true
  status.value = '加载中...'
  
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 在实际应用中，这里应该是真实的API调用
    // const response = await fetch('/api/weekly-reports')
    // const data = await response.json()
    
    reports.value = [...mockReports]
    status.value = `已加载 ${reports.value.length} 条报告`
    
    // 记录到日志（模拟）
    console.log('报告加载完成，数量:', reports.value.length)
    
  } catch (error) {
    status.value = '加载失败'
    console.error('加载报告失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  showSearchResults.value = searchQuery.value.trim().length > 0
}

// 选择报告
const selectReport = (title) => {
  searchQuery.value = title
  showSearchResults.value = false
}

// 预览功能
const preview = (pdfUrl) => {
  // 记录预览操作到日志
  console.log('预览报告:', pdfUrl)
  
  // 在新窗口中打开PDF
  window.open(pdfUrl, '_blank')
}

// 下载PDF功能
const downloadPdf = (pdfUrl, title) => {
  // 记录下载操作到日志
  console.log('下载报告:', pdfUrl, title)
  
  // 创建下载链接
  const a = document.createElement('a')
  a.href = pdfUrl
  a.download = title + '.pdf'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// 打开生成报告弹窗
const openGenerateModal = () => {
  showModal.value = true
  
  // 设置默认日期
  const today = new Date()
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(today.getDate() - 7)
  
  newReport.startDate = oneWeekAgo.toISOString().split('T')[0]
  newReport.endDate = today.toISOString().split('T')[0]
}

// 关闭生成报告弹窗
const closeGenerateModal = () => {
  showModal.value = false
  newReport.name = ''
  newReport.startDate = ''
  newReport.endDate = ''
}

// 点击弹窗外部关闭
const closeModalOnBackdrop = (event) => {
  if (event.target === event.currentTarget) {
    closeGenerateModal()
  }
}

// 处理表单提交
const handleGenerate = () => {
  const { name, startDate, endDate } = newReport
  
  if (!name.trim()) {
    alert('请输入报告名称')
    return
  }
  
  if (!startDate || !endDate) {
    alert('请选择开始时间和结束时间')
    return
  }
  
  if (new Date(endDate) < new Date(startDate)) {
    alert('结束时间不能早于开始时间')
    return
  }
  
  // 检查是否与现有报告名称重复
  const isDuplicate = reports.value.some(report => report.title === name.trim())
  
  if (isDuplicate) {
    alert('报告名称已存在，请使用其他名称')
    return
  }
  
  // 记录生成操作到日志
  console.log('生成报告:', name, startDate, endDate)
  
  alert(`生成报告: ${name}\n开始时间: ${startDate}\n结束时间: ${endDate}\n\n在实际应用中，这里会开始生成新的报告。`)
  
  closeGenerateModal()
}

// 组件挂载时自动加载数据
onMounted(() => {
  // 延迟加载，让用户看到界面变化
  setTimeout(loadReports, 1000)
})
</script>

<style scoped>
.protection-report {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-2px);
}

.refresh-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.fa-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

.input-group {
  position: relative;
}

.input-group input {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  width: 300px;
  transition: border-color 0.3s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #3498db;
}

.input-group label {
  position: absolute;
  left: 16px;
  top: 12px;
  color: #999;
  font-size: 14px;
  pointer-events: none;
  transition: all 0.3s ease;
}

.input-group input:focus + label,
.input-group input:not(:placeholder-shown) + label {
  top: -8px;
  left: 12px;
  font-size: 12px;
  color: #3498db;
  background: white;
  padding: 0 4px;
}

.match-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.match-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.match-item:hover {
  background-color: #f8f9fa;
}

.login-get {
  background: #27ae60;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.login-get:hover {
  background: #229954;
  transform: translateY(-2px);
}

.content {
  background: white;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  overflow: hidden;
}

.tlayar {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 20px;
  background: #313031;
  color: white;
  font-weight: bold;
  font-size: 1.1em;
}

.thirdlayar {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 20px;
  border-bottom: 1px solid #ecf0f1;
  transition: all 0.3s ease;
  align-items: center;
}

.thirdlayar:hover {
  background: #f8f9fa;
  transform: translateX(5px);
}

.report-title {
  color: #2c3e50;
  font-weight: 600;
  font-size: 15px;
}

.report-time {
  color: #7f8c8d;
  font-size: 14px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.btn.view {
  background: #3498db;
  color: white;
}

.btn.view:hover {
  background: #2980b9;
}

.btn.export {
  background: #e74c3c;
  color: white;
}

.btn.export:hover {
  background: #c0392b;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 20px;
  color: #bdc3c7;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: #34495e;
}

.empty-state p {
  color: #7f8c8d;
}

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-title {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5em;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #e74c3c;
}

.form-group {
  margin-bottom: 20px;
  padding: 0 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
}

.date-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 0 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-cancel:hover {
  background: #7f8c8d;
}

.btn-submit {
  background: #27ae60;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-submit:hover {
  background: #229954;
}

/* 响应式设计 */
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
  
  .input-group input {
    width: 100%;
  }
  
  .tlayar,
  .thirdlayar {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .date-group {
    grid-template-columns: 1fr;
  }
}
</style>
