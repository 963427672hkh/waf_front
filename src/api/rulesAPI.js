// WAF规则管理API接口模块
import apiClient from './client.js'

const api = apiClient.client

// WAF规则管理相关API接口
export const rulesAPI = {
  // 获取规则列表
  getRules: (params = {}) => api.get('/rules', { params }),
  
  // 获取规则统计信息
  getRulesStats: () => api.get('/rules/stats'),
  
  // 获取目标类型
  getTargets: () => api.get('/rules/targets'),
  
  // 获取动作类型
  getActions: () => api.get('/rules/actions'),
  
  // 获取匹配类型
  getMatchTypes: () => api.get('/rules/match-types'),
  
  // 获取规则分类
  getCategories: () => api.get('/rules/categories'),
  
  // 获取WAF配置
  getConfig: () => api.get('/rules/config'),
  
  // 获取规则状态
  getStatus: () => api.get('/rules/status'),
  
  // 导出规则
  exportRules: (params = {}) => api.get('/rules/export', { params }),
  
  // 获取规则详情
  getRuleDetail: (ruleId) => api.get(`/rules/${ruleId}`),
  
  // 创建规则
  createRule: (ruleData) => api.post('/rules', ruleData),
  
  // 更新规则
  updateRule: (ruleId, ruleData) => api.put(`/rules/${ruleId}`, ruleData),
  
  // 删除规则
  deleteRule: (ruleId) => api.delete(`/rules/${ruleId}`),
  
  // 切换规则状态
  toggleRule: (ruleId) => api.post(`/rules/${ruleId}/toggle`),
  
  // 批量操作规则
  batchOperation: (operation, rules) => api.post('/rules/batch', { operation, rules }),
  
  // 同步规则
  syncRules: () => api.post('/rules/sync'),
  
  // 验证规则
  validateRule: (ruleData) => api.post('/rules/validate', ruleData),
  
  // 测试Nginx配置
  testNginxConfig: () => api.post('/rules/config/test-nginx'),
  
  // 重载Nginx配置
  reloadNginxConfig: () => api.post('/rules/config/reload-nginx'),
  
  // ========== 规则集相关接口 ==========
  
  // 获取规则集列表
  getRuleSets: (params = {}) => api.get('/rules/sets', { params }),
  
  // 获取规则集详情
  getRuleSetDetail: (name) => api.get(`/rules/sets/${name}`),
  
  // 创建规则集
  createRuleSet: (setData) => api.post('/rules/sets', setData),
  
  // 更新规则集
  updateRuleSet: (name, setData) => api.put(`/rules/sets/${name}`, setData),
  
  // 删除规则集
  deleteRuleSet: (name) => api.delete(`/rules/sets/${name}`),
  
  // 同步规则集
  syncRuleSets: () => api.post('/rules/sets/sync'),
  
  // 同步规则集到文件系统
  syncRuleSetToFile: (name) => api.post(`/rules/sets/${name}/sync-to-file`),
  
  // 添加规则到规则集
  addRuleToSet: (setName, ruleId) => api.post(`/rules/sets/${setName}/rules/${ruleId}`),
  
  // 从规则集移除规则
  removeRuleFromSet: (setName, ruleId) => api.delete(`/rules/sets/${setName}/rules/${ruleId}`),
  
  // 切换规则集状态
  toggleRuleSet: (name, isActive) => api.post(`/rules/sets/${name}/toggle`, null, { params: { isActive } }),
  
  // 验证规则集
  validateRuleSet: (setData) => api.post('/rules/sets/validate', setData),
  
  // 获取规则集统计
  getRuleSetsStats: () => api.get('/rules/sets/stats')
}

export default rulesAPI

