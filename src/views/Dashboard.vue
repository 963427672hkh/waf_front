<template>
  <div>
    <!-- 顶部导航栏 -->
    <header class="main-header">
      <div class="logo">🌐 安全大屏</div>
      <nav class="main-nav">
        <button 
          class="nav-link" 
          :class="{ active: currentPage === 'traffic' }"
          @click="switchPage('traffic')"
        >
          流量分析
        </button>
        <button 
          class="nav-link" 
          :class="{ active: currentPage === 'security' }"
          @click="switchPage('security')"
        >
          安全态势
        </button>
        <button 
          class="nav-link" 
          :class="{ active: currentPage === 'report' }"
          @click="switchPage('report')"
        >
          防护报告
        </button>
        <button 
          class="nav-link" 
          :class="{ active: currentPage === 'waf' }"
          @click="switchPage('waf')"
        >
          监控大屏
        </button>
        <button 
          class="nav-link" 
          :class="{ active: currentPage === 'alert' }"
          @click="switchPage('alert')"
        >
          告警管理
        </button>
        <button 
          class="nav-link" 
          :class="{ active: currentPage === 'rules' }"
          @click="switchPage('rules')"
        >
          规则配置
        </button>
      </nav>
      <div class="header-controls">
        <div class="user-info" v-if="isAuthenticated">
          <span class="user-name">{{ user?.username }}</span>
          <span class="user-role">{{ user?.role }}</span>
          <button @click="handleLogout" class="logout-btn">退出</button>
        </div>
        <el-button 
          type="danger" 
          :loading="logoutLoading"
          @click="handleLogout"
          :disabled="loading"
          class="logout-btn"
          size="large"
        >
          <template #icon>
            <el-icon><SwitchButton /></el-icon>
          </template>
          退出登录
        </el-button>

      </div>
    </header>
    
    <div class="dashboard">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner">加载中...</div>
      </div>
      
      <!-- 错误状态 -->
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="refreshData" class="retry-btn">重试</button>
      </div>

      <!-- 数据源切换按钮
      <div class="data-source-toggle">
        <button @click="toggleDataSource" class="toggle-btn">
          {{ useMockData ? '使用模拟数据' : '使用API数据' }}
        </button>
        <button @click="refreshData" class="refresh-btn">刷新数据</button>
      </div> -->

      <!-- 页面内容 -->
      <TrafficAnalysis v-if="currentPage === 'traffic'" />
      <SecurityStatus v-if="currentPage === 'security'" />
      <ProtectionReport v-if="currentPage === 'report'" />
      <WafDashboard v-if="currentPage === 'waf'" />
      <AlertManagement v-if="currentPage === 'alert'" />
      <RuleManagement v-if="currentPage === 'rules'" />
    </div>
  </div>
</template>

<script setup>
import {
  SwitchButton
} from '@element-plus/icons-vue'
import { ElButton, ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/dist/index.css'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useDashboard } from '../composables/useDashboard'
import AlertManagement from './AlertManagement.vue'
import ProtectionReport from './ProtectionReport.vue'
import RuleManagement from './RuleManagement.vue'
import SecurityStatus from './SecurityStatus.vue'
import TrafficAnalysis from './TrafficAnalysis.vue'
import WafDashboard from './WafDashboard.vue'


const router = useRouter()
const { 
  loading, 
  error, 
  refreshData
} = useDashboard()

const {
  user,
  isAuthenticated,
  logout,
  initAuth
    } = useAuth()

const logoutLoading = loading // 可以使用同一个loading状态

    // 当前页面状态
const currentPage = ref('traffic')

    // 切换页面
const switchPage = (page) => {
  currentPage.value = page
    }

    // 处理退出登录
const handleLogout = async () => {
  try {
    // 1. 确认
    await ElMessageBox.confirm('确定要退出登录吗？', '退出确认', {
      type: 'warning',
      confirmButtonText: '确定退出',
      cancelButtonText: '取消'
    })
    
    logoutLoading.value = true
    
    // 2. 备份token（清理前）
    const oldToken = localStorage.getItem('waf_access_token')
    
    // 4. 显示成功提示
    ElMessage.success({
      message: '退出登录成功',
      duration: 2000
    })
    
    // 5. 跳转到登录页
    setTimeout(() => {
      router.push('/login')
    }, 800)
    
    // 6. 异步尝试通知后端（不阻塞用户）
    if (oldToken) {
      setTimeout(async () => {
        try {
          await logout()
          console.log('后端通知成功')
        } catch (backendErr) {
          console.log('后端通知失败（不影响用户）:', backendErr.message)
          // 这里可以记录日志，但不打扰用户
        }
      }, 100)
    }
    
  } catch (error) {
    // 用户取消
    if (error === 'cancel' || error === 'close') {
      return
    }
    console.error('退出过程异常:', error)
  } finally {
    logoutLoading.value = false
  }
}


    // 初始化认证状态
onMounted(async () => {
      await initAuth()
    })




</script>

<style>
/* 顶部导航栏 */
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%);
  border-bottom: 1px solid rgba(74,158,255,0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}

.logo {
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(135deg, #4a9eff 0%, #ff8c00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.main-nav {
  display: flex;
  gap: 24px;
}

.nav-link {
  background: none;
  border: none;
  color: #e0e0e0;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  font-size: 16px;
}

.nav-link:hover {
  background: rgba(74,158,255,0.1);
  color: #4a9eff;
}

.nav-link.active {
  background: linear-gradient(135deg, #4a9eff 0%, #3b82f6 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(74,158,255,0.3);
}

.header-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(74, 158, 255, 0.2);
}

.user-name {
  color: #4a9eff;
  font-weight: 600;
  font-size: 14px;
}

.user-role {
  color: #888;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 8px;
  border-radius: 4px;
}

.logout-btn {
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.3);
  color: #ff4d4f;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 77, 79, 0.2);
  border-color: rgba(255, 77, 79, 0.5);
}

.control-select {
  padding: 8px 12px;
  border: 1px solid rgba(74,158,255,0.3);
  border-radius: 6px;
  background: rgba(30,30,30,0.8);
  color: #e0e0e0;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-select:hover {
  border-color: rgba(74,158,255,0.6);
  background: rgba(30,30,30,0.9);
}

.control-select:focus {
  outline: none;
  border-color: #4a9eff;
  box-shadow: 0 0 0 2px rgba(74,158,255,0.2);
}

/* 仪表盘样式 */
.dashboard {
  padding: 20px;
}

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  font-size: 18px;
  color: #4a9eff;
}

/* 错误状态 */
.error-message {
  padding: 20px;
  background-color: #ff4d4f;
  color: #fff;
  border-radius: 4px;
  margin-bottom: 20px;
}

.retry-btn {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #4a9eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 数据源切换按钮 */
.data-source-toggle {
  margin-bottom: 20px;
}

.toggle-btn, .refresh-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.toggle-btn {
  background-color: #4a9eff;
  color: #fff;
  margin-right: 10px;
}

.refresh-btn {
  background-color: #ff8c00;
  color: #fff;
}
</style>