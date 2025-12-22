// 路由配置
import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件
import Dashboard from '../views/Dashboard.vue'
import LoginPage from '../views/LoginPage.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 检查本地存储中的token
  const accessToken = localStorage.getItem('waf_access_token')
  const isAuthenticated = !!accessToken

if (from.path === '/logout' && to.path === '/login') {
    console.log('从退出页跳转到登录页，允许')
    return next()
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } 
  else {
    next()
  }
})

export default router
