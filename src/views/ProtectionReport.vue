<template>
  <div class="protection-report">
    <!-- 控制栏 -->
    <div class="controls">
      <div class="controls-left">
        <button class="refresh-btn" @click="loadStats" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i> 
          {{ loading ? '加载中...' : '刷新统计信息' }}
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
            @blur="onSearchBlur"
          >
          <label>报告名称</label>
          <div class="match-results" v-show="showSearchResults && filteredExports.length > 0">
            <div 
              v-for="exportItem in filteredExports" 
              :key="exportItem.taskId"
              class="match-item"
              @click="selectExport(exportItem.filename)"
            >
              {{ exportItem.filename }}
            </div>
          </div>
        </div>
        <button class="login-get" @click="openGenerateModal" :disabled="generating">
          <i class="fas fa-plus" :class="{ 'fa-spin': generating }"></i> 
          {{ generating ? '生成中...' : '立即生成' }}
        </button>
      </div>
    </div>
    
    <!-- 统计信息区域 -->
    <div class="stats-container" v-if="statsData">
      <div class="stats-header">
        <h3>WAF 日志统计概览</h3>
        <div class="last-updated">最后更新: {{ formatDate(statsTimestamp) }}</div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total">
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statsData.totalLogs || 0 }}</div>
            <div class="stat-label">总日志数</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon blocked">
            <i class="fas fa-shield-alt"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statsData.blockedLogs || 0 }}</div>
            <div class="stat-label">拦截日志</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon allowed">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statsData.allowedLogs || 0 }}</div>
            <div class="stat-label">允许日志</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon bypass">
            <i class="fas fa-forward"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statsData.bypassLogs || 0 }}</div>
            <div class="stat-label">绕过日志</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon unique">
            <i class="fas fa-network-wired"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statsData.uniqueIps || 0 }}</div>
            <div class="stat-label">独立IP数</div>
          </div>
        </div>
      </div>
      
      <!-- 详细统计信息 -->
      <div class="detailed-stats">
        <div class="stat-section">
          <h4>攻击类型分布</h4>
          <div class="stat-list">
            <div 
              v-for="attack in statsData.topAttacks" 
              :key="attack.type"
              class="stat-item"
            >
              <span class="stat-name">{{ attack.type.toUpperCase() }}</span>
              <span class="stat-count">{{ attack.count }}</span>
              <div class="stat-bar">
                <div 
                  class="stat-bar-fill" 
                  :style="{ width: attack.percentage + '%' }"
                ></div>
              </div>
              <span class="stat-percentage">{{ attack.percentage }}%</span>
            </div>
          </div>
        </div>
        
        <div class="stat-section">
          <h4>规则触发排行</h4>
          <div class="stat-list">
            <div 
              v-for="rule in statsData.topRules" 
              :key="rule.ruleId"
              class="stat-item"
            >
              <span class="stat-name">规则 {{ rule.ruleId }}</span>
              <span class="stat-count">{{ rule.count }}</span>
              <div class="stat-bar">
                <div 
                  class="stat-bar-fill" 
                  :style="{ width: rule.percentage + '%' }"
                ></div>
              </div>
              <span class="stat-percentage">{{ rule.percentage }}%</span>
            </div>
          </div>
        </div>
        
        <div class="stat-section">
          <h4>来源IP排行</h4>
          <div class="stat-list">
            <div 
              v-for="ip in statsData.topIps" 
              :key="ip.ip"
              class="stat-item"
            >
              <span class="stat-name">{{ ip.ip }}</span>
              <span class="stat-count">{{ ip.count }} (拦截: {{ ip.blockedCount }})</span>
              <div class="stat-bar">
                <div 
                  class="stat-bar-fill" 
                  :style="{ width: (ip.count / statsData.totalLogs * 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 导出历史区域 -->
    <div class="content">
      <!-- 表头 -->
      <div class="tlayar">
        <div>报告名称</div>
        <div>生成时间</div>
        <div>操作</div>
      </div>
      
      <!-- 导出历史列表 -->
      <div class="reports-container">
        <div v-if="exportHistory.length === 0 && !loading" class="empty-state">
          <i class="fas fa-file-export"></i>
          <h3>暂无导出记录</h3>
          <p>点击"立即生成"按钮创建新的WAF日志报告</p>
        </div>
        
        <div v-else>
          <div 
            v-for="exportItem in exportHistory" 
            :key="exportItem.taskId"
            class="thirdlayar"
          >
            <div class="report-title">{{ exportItem.filename }}</div>
            <div class="report-time">{{ formatDate(exportItem.createTime) }}</div>
            <div class="button-group">
              <button class="btn download" @click="downloadExport(exportItem.taskId, exportItem.filename)">
                <i class="fas fa-download"></i> 下载
              </button>
              <button class="btn delete" @click="deleteExport(exportItem.taskId)">
                <i class="fas fa-trash"></i> 删除
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
          <h3 class="modal-title">生成WAF日志报告</h3>
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
              :disabled="generating"
            >
          </div>
          
          <div class="date-group">
            <div class="form-group">
              <label for="startDate">开始时间</label>
              <input 
                type="datetime-local" 
                id="startDate" 
                v-model="newReport.startTime"
                class="form-control" 
                required
                :disabled="generating"
              >
            </div>
            <div class="form-group">
              <label for="endDate">结束时间</label>
              <input 
                type="datetime-local" 
                id="endDate" 
                v-model="newReport.endTime"
                class="form-control" 
                required
                :disabled="generating"
              >
            </div>
          </div>
          
          <div class="form-group">
            <label for="clientIp">客户端IP</label>
            <input 
              type="text" 
              id="clientIp" 
              v-model="newReport.clientIp"
              class="form-control" 
              placeholder="可选: 过滤特定IP"
              :disabled="generating"
            >
          </div>
          
          <div class="form-group">
            <label for="action">操作类型</label>
            <select 
              id="action" 
              v-model="newReport.action"
              class="form-control" 
              :disabled="generating"
            >
              <option value="">全部</option>
              <option value="BLOCK">拦截</option>
              <option value="ALLOW">允许</option>
              <option value="BYPASS">绕过</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="ruleId">规则ID</label>
            <input 
              type="number" 
              id="ruleId" 
              v-model="newReport.ruleId"
              class="form-control" 
              placeholder="可选: 特定规则ID"
              :disabled="generating"
            >
          </div>
          
          <div class="form-group">
            <label for="tags">标签</label>
            <input 
              type="text" 
              id="tags" 
              v-model="newReport.tags"
              class="form-control" 
              placeholder="可选: 多个标签用逗号分隔"
              :disabled="generating"
            >
          </div>
          
          <div class="form-group">
            <label for="search">关键词搜索</label>
            <input 
              type="text" 
              id="search" 
              v-model="newReport.search"
              class="form-control" 
              placeholder="可选: 日志内容搜索"
              :disabled="generating"
            >
          </div>
          
          <div class="form-group">
            <label for="format">导出格式</label>
            <select 
              id="format" 
              v-model="newReport.format"
              class="form-control" 
              required
              :disabled="generating"
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="closeGenerateModal" :disabled="generating">取消</button>
            <button type="submit" class="btn-submit" :disabled="generating">
              <i class="fas fa-spinner fa-spin" v-if="generating"></i>
              {{ generating ? '生成中...' : '生成报告' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import wafReportService from '@/api/report.js';
import { computed, onMounted, reactive, ref } from 'vue';

// 响应式数据
const loading = ref(false);
const generating = ref(false);
const status = ref('就绪');
const statsData = ref(null);
const statsTimestamp = ref(null);
const exportHistory = ref([]);
const searchQuery = ref('');
const showSearchResults = ref(false);
const showModal = ref(false);

// 新报告表单数据
const newReport = reactive({
  name: '',
  startTime: '',
  endTime: '',
  clientIp: '',
  action: '',
  ruleId: '',
  tags: '',
  search: '',
  format: 'pdf'
});

// 计算属性 - 过滤后的导出记录
const filteredExports = computed(() => {
  if (!searchQuery.value.trim()) return [];
  
  return exportHistory.value.filter(item => 
    item.filename.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 加载统计信息
const loadStats = async () => {
  loading.value = true;
  status.value = '加载中...';
  
  try {
    const response = await wafReportService.getWafStats();
    statsData.value = response.data;
    statsTimestamp.value = response.timestamp;
    status.value = '统计信息已更新';
  } catch (error) {
    status.value = '加载失败';
    console.error('加载WAF统计信息失败:', error);
    alert('加载统计信息失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 加载导出历史
const loadExportHistory = async () => {
  try {
    exportHistory.value = await wafReportService.getExportHistory();
  } catch (error) {
    console.error('加载导出历史失败:', error);
  }
};

// 搜索处理
const handleSearch = () => {
  showSearchResults.value = searchQuery.value.trim().length > 0;
};

// 搜索框失去焦点处理
const onSearchBlur = () => {
  setTimeout(() => {
    showSearchResults.value = false;
  }, 200);
};

// 选择导出记录
const selectExport = (filename) => {
  searchQuery.value = filename;
  showSearchResults.value = false;
};

// 下载导出文件
const downloadExport = async (taskId, filename) => {
  try {
    await wafReportService.downloadExport(taskId, filename);
  } catch (error) {
    console.error('下载导出文件失败:', error);
    alert('下载文件失败，请重试');
  }
};

// 删除导出记录
const deleteExport = async (taskId) => {
  if (confirm('确定要删除此导出记录吗？')) {
    try {
      await wafReportService.deleteExport(taskId);
      await loadExportHistory();
      alert('删除成功');
    } catch (error) {
      console.error('删除导出记录失败:', error);
      alert('删除失败，请重试');
    }
  }
};

// 打开生成报告弹窗
const openGenerateModal = () => {
  showModal.value = true;
  
  // 设置默认时间范围（最近24小时）
  const endTime = new Date();
  const startTime = new Date();
  startTime.setDate(startTime.getDate() - 1);
  
  newReport.startTime = startTime.toISOString().slice(0, 16);
  newReport.endTime = endTime.toISOString().slice(0, 16);
};

// 关闭生成报告弹窗
const closeGenerateModal = () => {
  if (!generating.value) {
    showModal.value = false;
    // 重置表单
    Object.keys(newReport).forEach(key => {
      if (key === 'format') {
        newReport[key] = 'pdf';
      } else {
        newReport[key] = '';
      }
    });
  }
};

// 点击弹窗外部关闭
const closeModalOnBackdrop = (event) => {
  if (event.target === event.currentTarget && !generating.value) {
    closeGenerateModal();
  }
};

// 处理表单提交
const handleGenerate = async () => {
  const validation = wafReportService.validateExportData(newReport);
  if (!validation.isValid) {
    alert(validation.message);
    return;
  }
  
  generating.value = true;
  
  try {
    const result = await wafReportService.generateExport(newReport);
    
    alert(`报告 "${result.filename}" 生成成功！`);
    
    // 重新加载导出历史
    await loadExportHistory();
    closeGenerateModal();
    
  } catch (error) {
    console.error('生成报告失败:', error);
    alert('生成报告失败，请重试');
  } finally {
    generating.value = false;
  }
};

// 组件挂载时自动加载数据
onMounted(() => {
  loadStats();
  loadExportHistory();
});
</script>

<style scoped>
/* 原有的样式保持不变，新增统计信息相关样式 */

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

/* 统计信息样式 */
.stats-container {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  padding: 20px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 15px;
}

.stats-header h3 {
  margin: 0;
  color: #2c3e50;
}

.last-updated {
  color: #7f8c8d;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.stat-icon.blocked {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.stat-icon.allowed {
  background: linear-gradient(135deg, #27ae60, #229954);
}

.stat-icon.bypass {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.stat-icon.unique {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
}

.detailed-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.stat-section {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
}

.stat-section h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.stat-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-name {
  flex: 1;
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}

.stat-count {
  width: 80px;
  text-align: right;
  font-size: 14px;
  color: #7f8c8d;
}

.stat-bar {
  flex: 2;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2980b9);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.stat-percentage {
  width: 40px;
  text-align: right;
  font-size: 14px;
  color: #7f8c8d;
}

/* 内容区域样式 */
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

.btn.download {
  background: #3498db;
  color: white;
}

.btn.download:hover {
  background: #2980b9;
}

.btn.delete {
  background: #e74c3c;
  color: white;
}

.btn.delete:hover {
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
  max-width: 600px;
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
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .detailed-stats {
    grid-template-columns: 1fr;
  }
  
  .tlayar,
  .thirdlayar {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .date-group {
    grid-template-columns: 1fr;
  }
  
  .button-group {
    justify-content: flex-start;
  }
}
</style>