<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">WAF 安全大屏</h1>
        <p class="login-subtitle">安全防护管理系统</p>
      </div>

      <div class="login-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'login' }" 
          @click="activeTab = 'login'"
        >
          登录
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'register' }" 
          @click="activeTab = 'register'"
        >
          注册
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'guest' }" 
          @click="activeTab = 'guest'"
        >
          游客登录
        </button>
      </div>

      <!-- 登录表单 -->
      <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="loginForm.username"
            type="text"
            placeholder="请输入用户名"
            required
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            required
            :disabled="loading"
          />
        </div>
        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <!-- 注册表单 -->
      <form v-if="activeTab === 'register'" @submit.prevent="handleRegister" class="login-form">
        <div class="form-group">
          <label for="reg-username">用户名</label>
          <input
            id="reg-username"
            v-model="registerForm.username"
            type="text"
            placeholder="请输入用户名"
            required
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="reg-password">密码</label>
          <input
            id="reg-password"
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码（至少8位）"
            required
            minlength="8"
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="reg-confirm-password">确认密码</label>
          <input
            id="reg-confirm-password"
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            required
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="reg-role">角色</label>
          <select
            id="reg-role"
            v-model="registerForm.role"
            required
            :disabled="loading"
          >
            <option value="OPERATOR">操作员</option>
            <option value="ADMIN">管理员</option>
          </select>
        </div>
        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <!-- 游客登录 -->
      <div v-if="activeTab === 'guest'" class="guest-login">
        <div class="guest-info">
          <h3>游客登录</h3>
          <p>使用默认账号密码快速体验系统功能</p>
          <div class="guest-credentials">
            <p><strong>用户名:</strong> admin</p>
            <p><strong>密码:</strong> admin123</p>
          </div>
        </div>
        <button @click="handleGuestLogin" class="login-btn" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '登录中...' : '游客登录' }}
        </button>
      </div>

      <!-- 错误信息 -->
      <div v-if="error" class="error-message">
        <span class="error-icon">⚠️</span>
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login, guestLogin, register, loading, error } = useAuth()

const activeTab = ref('login')

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  role: 'OPERATOR'
})

const handleLogin = async () => {
  try {
    await login(loginForm.username, loginForm.password)
    router.push('/')
  } catch (err) {
    console.error('登录失败:', err)
  }
}

const handleRegister = async () => {
  if (registerForm.password !== registerForm.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }
  
  try {
    await register(registerForm.username, registerForm.password, registerForm.role)
    router.push('/')
  } catch (err) {
    console.error('注册失败:', err)
  }
}

const handleGuestLogin = async () => {
  try {
    console.log('LoginPage: 开始游客登录...')
    await guestLogin()
    console.log('LoginPage: 登录成功，准备跳转...')
    router.push('/')
    console.log('LoginPage: 跳转完成')
  } catch (err) {
    console.error('LoginPage: 游客登录失败:', err)
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
  padding: 20px;
}

.login-card {
  background: rgba(30, 30, 30, 0.95);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(74, 158, 255, 0.2);
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(135deg, #4a9eff 0%, #ff8c00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
}

.login-subtitle {
  color: #888;
  font-size: 14px;
  margin: 0;
}

.login-tabs {
  display: flex;
  margin-bottom: 30px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #888;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.tab-btn.active {
  background: linear-gradient(135deg, #4a9eff 0%, #3b82f6 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(74, 158, 255, 0.3);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #e0e0e0;
  font-size: 14px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  color: #e0e0e0;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4a9eff;
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
}

.form-group input:disabled,
.form-group select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-btn {
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #4a9eff 0%, #3b82f6 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(74, 158, 255, 0.4);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.guest-login {
  text-align: center;
}

.guest-info {
  margin-bottom: 30px;
}

.guest-info h3 {
  color: #4a9eff;
  margin: 0 0 12px 0;
  font-size: 20px;
}

.guest-info p {
  color: #888;
  margin: 0 0 20px 0;
  font-size: 14px;
}

.guest-credentials {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(74, 158, 255, 0.2);
}

.guest-credentials p {
  margin: 8px 0;
  color: #e0e0e0;
  font-size: 14px;
}

.error-message {
  margin-top: 20px;
  padding: 12px 16px;
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.3);
  border-radius: 8px;
  color: #ff4d4f;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-icon {
  font-size: 16px;
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .login-title {
    font-size: 24px;
  }
}
</style>
