// 测试API连接
const testAPI = async () => {
  const API_BASE_URL = 'http://47.109.154.103:3000'
  
  try {
    console.log('测试API连接...')
    
    // 测试基础连接
    const response = await fetch(`${API_BASE_URL}/`)
    const data = await response.text()
    console.log('基础连接测试:', data)
    
    // 测试登录接口
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    })
    
    const loginData = await loginResponse.json()
    console.log('登录测试结果:', loginData)
    
  } catch (error) {
    console.error('API测试失败:', error)
  }
}

// 在浏览器控制台中运行
testAPI()
