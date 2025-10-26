# Nginx HTTP WAF v2 - 前后端对接接口文档


## 📋 目录

- [1. 概述](#1-概述)
- [2. 认证机制](#2-认证机制)
- [3. 通用响应格式](#3-通用响应格式)
- [4. 用户认证接口](#4-用户认证接口)
- [5. WAF规则管理接口](#5-waf规则管理接口)
- [6. 规则集管理接口](#6-规则集管理接口)
- [7. 系统监控接口](#7-系统监控接口)
- [8. 日志查询接口](#8-日志查询接口)
- [9. 错误代码说明](#9-错误代码说明)
- [10. 前端集成示例](#10-前端集成示例)

---

## 1. 概述

### 1.1 系统架构

本系统基于 NestJS 框架构建，为 Nginx HTTP WAF v2 模块提供完整的 Web 管理界面，支持：

- **JWT 双令牌认证**：Access Token (15分钟) + Refresh Token (7天)
- **基于角色的访问控制**：ADMIN、OPERATOR
- **JSON 格式规则管理**：符合 WAF v2 标准的规则 JSON 格式
- **规则继承机制**：支持 `extends` 继承和规则集管理
- **实时监控**：系统状态、攻击统计、性能指标

### 1.2 技术栈

- **后端框架**：NestJS 11.0.1 + TypeScript
- **数据库**：MySQL 5.7 + TypeORM
- **认证**：JWT (jsonwebtoken)
- **API 风格**：RESTful API
- **数据格式**：JSON

### 1.3 核心概念

#### 规则集 (RuleSet)
WAF v2 的规则配置单元，包含元数据、规则列表和继承关系：

```typescript
interface RuleSet {
  version: number;
  meta: {
    name: string;
    extends?: (string | ExtendConfig)[];
    duplicatePolicy?: 'error' | 'warn_skip' | 'warn_keep_last';
    tags?: string[];
  };
  disableById?: number[];
  disableByTag?: string[];
  rules: Rule[];
}
```

#### 规则 (Rule)
单个检测规则，定义匹配条件和处理动作：

```typescript
interface Rule {
  id: number;
  tags?: string[];
  target: RuleTarget | RuleTarget[];
  headerName?: string;
  match: RuleMatch;
  pattern: string | string[];
  caseless?: boolean;
  negate?: boolean;
  action: RuleAction;
  score?: number;
  priority?: number;
}
```

---

## 2. 认证机制

### 2.1 JWT 双令牌机制

系统采用 Access Token + Refresh Token 双令牌认证：

- **Access Token**：有效期 15 分钟，用于 API 访问
- **Refresh Token**：有效期 7 天，用于刷新 Access Token
- **自动刷新**：Access Token 过期时使用 Refresh Token 获取新的 Access Token

### 2.2 角色权限

| 角色 | 权限 | 描述 |
|------|------|------|
| ADMIN | 全部权限 | 系统管理、用户管理、规则管理、系统配置 |
| OPERATOR | 操作权限 | 规则查看、规则编辑、系统监控、日志查看 |

### 2.3 认证头格式

```http
Authorization: Bearer <access_token>
```

---

## 3. 通用响应格式

### 3.1 成功响应

```typescript
interface SuccessResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}
```

示例：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": { /* 具体数据 */ },
  "timestamp": 1729425600000
}
```

### 3.2 分页响应

```typescript
interface PaginatedResponse<T> {
  code: number;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  timestamp: number;
}
```

### 3.3 错误响应

```typescript
interface ErrorResponse {
  code: number;
  message: string;
  error?: string;
  details?: any;
  timestamp: number;
}
```

---

## 4. 用户认证接口

### 4.1 用户登录

**接口地址**：`POST /auth/login`

**请求参数**：
```typescript
interface LoginRequest {
  username: string;
  password: string;
}
```

**响应数据**：
```typescript
interface LoginResponse {
  user: {
    id: number;
    username: string;
    role: 'ADMIN' | 'OPERATOR';
    createdAt: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Access Token 过期时间（秒）
}
```

**示例请求**：
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

**示例响应**：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "role": "ADMIN",
      "createdAt": "2025-10-20T12:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  },
  "timestamp": 1729425600000
}
```

### 4.2 刷新令牌

**接口地址**：`POST /auth/refresh`

**请求头**：
```http
Authorization: Bearer <refresh_token>
```

**响应数据**：
```typescript
interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}
```

### 4.3 用户信息

**接口地址**：`GET /auth/profile`

**权限要求**：需要认证

**响应数据**：
```typescript
interface UserProfile {
  id: number;
  username: string;
  role: 'ADMIN' | 'OPERATOR';
  createdAt: string;
}
```

### 4.4 退出登录

**接口地址**：`POST /auth/logout`

**权限要求**：需要认证

**说明**：将用户的 Refresh Token 标记为无效

---

## 5. WAF规则管理接口

### 5.1 获取规则列表

**接口地址**：`GET /rules`

**权限要求**：需要认证（ADMIN、OPERATOR）

**查询参数**：
```typescript
interface RuleQueryParams {
  page?: number;           // 页码，默认 1
  pageSize?: number;       // 每页大小，默认 20
  target?: RuleTarget;     // 按目标过滤
  action?: RuleAction;     // 按动作过滤
  tags?: string[];         // 按标签过滤（逗号分隔）
  setId?: number;          // 按规则集ID过滤
  isActive?: boolean;      // 按激活状态过滤
  search?: string;         // 搜索关键词（ID、描述、模式）
  sortBy?: 'id' | 'priority' | 'score' | 'createdAt'; // 排序字段
  sortOrder?: 'ASC' | 'DESC'; // 排序方向
}
```

**响应数据**：
```typescript
interface RuleListResponse {
  items: Rule[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

**示例请求**：
```bash
curl -X GET "http://localhost:3000/rules?page=1&pageSize=10&target=ALL_PARAMS&action=DENY&tags=sqli,baseline&sortBy=priority&sortOrder=ASC" \
  -H "Authorization: Bearer <access_token>"
```

### 5.2 获取单个规则详情

**接口地址**：`GET /rules/:id`

**权限要求**：需要认证（ADMIN、OPERATOR）

**路径参数**：
- `id`: 规则ID

**响应数据**：完整的 Rule 对象

### 5.3 创建规则

**接口地址**：`POST /rules`

**权限要求**：ADMIN

**请求参数**：
```typescript
interface CreateRuleRequest {
  id: number;
  tags?: string[];
  target: RuleTarget | RuleTarget[];
  headerName?: string;
  match: RuleMatch;
  pattern: string | string[];
  caseless?: boolean;
  negate?: boolean;
  action: RuleAction;
  score?: number;
  priority?: number;
  ruleSetId?: number;
}
```

**响应数据**：创建的 Rule 对象

### 5.4 更新规则

**接口地址**：`PUT /rules/:id`

**权限要求**：ADMIN

**路径参数**：
- `id`: 规则ID

**请求参数**：同 CreateRuleRequest（所有字段可选）

### 5.5 删除规则

**接口地址**：`DELETE /rules/:id`

**权限要求**：ADMIN

**路径参数**：
- `id`: 规则ID

**响应数据**：
```typescript
interface DeleteRuleResponse {
  deleted: boolean;
  message: string;
}
```

### 5.6 批量操作规则

**接口地址**：`POST /rules/batch`

**权限要求**：ADMIN

**请求参数**：
```typescript
interface BatchRuleOperationRequest {
  action: 'activate' | 'deactivate' | 'delete';
  ruleIds: number[];
}
```

**响应数据**：
```typescript
interface BatchOperationResponse {
  success: number;
  failed: number;
  errors?: string[];
}
```

---

## 6. 规则集管理接口

### 6.1 获取规则集列表

**接口地址**：`GET /rules/sets`

**权限要求**：需要认证（ADMIN、OPERATOR）

**响应数据**：
```typescript
interface RuleSetListResponse {
  items: RuleSetInfo[];
}

interface RuleSetInfo {
  id: number;
  name: string;
  version: number;
  description?: string;
  ruleCount: number;
  isActive: boolean;
  filePath: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}
```

### 6.2 获取规则集详情

**接口地址**：`GET /rules/sets/:id`

**权限要求**：需要认证（ADMIN、OPERATOR）

**路径参数**：
- `id`: 规则集ID

**响应数据**：完整的 RuleSet 对象

### 6.3 创建规则集

**接口地址**：`POST /rules/sets`

**权限要求**：ADMIN

**请求参数**：
```typescript
interface CreateRuleSetRequest {
  name: string;
  description?: string;
  version?: number;
  meta?: {
    extends?: (string | ExtendConfig)[];
    duplicatePolicy?: 'error' | 'warn_skip' | 'warn_keep_last';
    tags?: string[];
  };
  disableById?: number[];
  disableByTag?: string[];
  rules: Rule[];
}
```

### 6.4 更新规则集

**接口地址**：`PUT /rules/sets/:id`

**权限要求**：ADMIN

### 6.5 删除规则集

**接口地址**：`DELETE /rules/sets/:id`

**权限要求**：ADMIN

### 6.6 同步规则到文件系统

**接口地址**：`POST /rules/sync`

**权限要求**：ADMIN

**请求参数**：
```typescript
interface SyncRulesRequest {
  setType?: 'all' | 'set' | 'rule';
  setId?: number;
  ruleIds?: number[];
  targetPath?: string; // 自定义目标路径
}
```

**响应数据**：
```typescript
interface SyncRulesResponse {
  synced: {
    sets: number;
    rules: number;
    files: string[];
  };
  errors?: string[];
}
```

### 6.7 验证规则集

**接口地址**：`POST /rules/validate`

**权限要求**：需要认证（ADMIN、OPERATOR）

**请求参数**：
```typescript
interface ValidateRuleSetRequest {
  ruleSet: RuleSet;
}
```

**响应数据**：
```typescript
interface ValidateRuleSetResponse {
  valid: boolean;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
}

interface ValidationError {
  field: string;
  message: string;
  ruleId?: number;
}

interface ValidationWarning {
  field: string;
  message: string;
  ruleId?: number;
}
```

---

## 7. 系统监控接口

### 7.1 获取系统健康状态

**接口地址**：`GET /system/health`

**权限要求**：需要认证（ADMIN、OPERATOR）

**响应数据**：
```typescript
interface HealthResponse {
  code: number;
  message: string;
  data: {
    waf_status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
    timestamp: number;
    request_stats: {
      total: number;
      blocked: number;
      allowed: number;
      blocked_rate: number;
    };
    security_events: {
      sql_injection: number;
      xss: number;
      rce: number;
      lfi: number;
      directory_traversal: number;
      other: number;
    };
    system_resources: {
      cpu_usage: number;
      memory_usage: number;
      disk_usage: number;
    };
    rule_info: {
      total_rules: number;
      active_rules: number;
      rule_sets: number;
    };
    service_status: {
      database: 'UP' | 'DOWN';
      nginx: 'UP' | 'DOWN';
      waf_module: 'UP' | 'DOWN';
    };
    performance: {
      avg_response_time: number;
      p95_response_time: number;
      p99_response_time: number;
      requests_per_second: number;
    };
  };
  timestamp: number;
}
```

### 7.2 获取性能指标

**接口地址**：`GET /system/performance`

**权限要求**：需要认证（ADMIN、OPERATOR）

**查询参数**：
```typescript
interface PerformanceQueryParams {
  timeRange?: '1h' | '6h' | '24h' | '7d' | '30d'; // 时间范围
  metric?: 'response_time' | 'throughput' | 'error_rate' | 'cpu' | 'memory';
  interval?: '1m' | '5m' | '15m' | '1h'; // 数据间隔
}
```

**响应数据**：
```typescript
interface PerformanceResponse {
  timeRange: string;
  interval: string;
  metrics: {
    timestamp: number;
    value: number;
  }[];
  summary: {
    min: number;
    max: number;
    avg: number;
    p95: number;
    p99: number;
  };
}
```

---

## 8. 日志查询接口

### 8.1 获取 WAF 审计日志

**接口地址**：`GET /logs/waf`

**权限要求**：需要认证（ADMIN、OPERATOR）

**查询参数**：
```typescript
interface WafLogQueryParams {
  page?: number;
  pageSize?: number;
  startTime?: string;     // ISO 8601 格式
  endTime?: string;       // ISO 8601 格式
  clientIp?: string;
  action?: 'BLOCK' | 'ALLOW' | 'BYPASS';
  ruleId?: number;
  tags?: string[];
  search?: string;        // 搜索 URI、模式等
  minScore?: number;
  maxScore?: number;
}
```

**响应数据**：
```typescript
interface WafLogListResponse {
  items: WafLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface WafLogEntry {
  time: string;
  clientIp: string;
  method: string;
  host: string;
  uri: string;
  events: WafEvent[];
  finalAction: string;
  finalActionType: string;
  blockRuleId?: number;
  status: number;
  level: string;
  requestHeaders?: Record<string, string>;
  matchedPatterns?: string[];
}
```

### 8.2 获取访问日志

**接口地址**：`GET /logs/access`

**权限要求**：需要认证（ADMIN、OPERATOR）

**查询参数**：类似 WafLogQueryParams，增加 WAF 特定字段

**响应数据**：
```typescript
interface AccessLogEntry {
  ts: string;
  ip: string;
  method: string;
  uri: string;
  status: number;
  bytes: number;
  rt: number;
  ua: string;
  ref: string;
  blocked: number;
  waf_action?: string;
  waf_rule?: string;
  waf_type?: string;
}
```

### 8.3 日志统计

**接口地址**：`GET /logs/stats`

**权限要求**：需要认证（ADMIN、OPERATOR）

**查询参数**：
```typescript
interface LogStatsQueryParams {
  timeRange?: '1h' | '6h' | '24h' | '7d' | '30d';
  groupBy?: 'hour' | 'day' | 'action' | 'rule' | 'ip';
  metric?: 'count' | 'unique_ips' | 'blocked_rate';
}
```

**响应数据**：
```typescript
interface LogStatsResponse {
  timeRange: string;
  groupBy: string;
  metric: string;
  data: {
    key: string;
    value: number;
    percentage?: number;
  }[];
  total: number;
}
```

---

## 9. 错误代码说明

### 9.1 HTTP 状态码

| 状态码 | 说明 | 示例场景 |
|--------|------|----------|
| 200 | 请求成功 | 数据获取成功 |
| 201 | 创建成功 | 规则创建成功 |
| 400 | 请求参数错误 | 参数格式不正确 |
| 401 | 未认证 | Token 缺失或无效 |
| 403 | 权限不足 | OPERATOR 尝试删除规则 |
| 404 | 资源不存在 | 规则 ID 不存在 |
| 409 | 资源冲突 | 规则 ID 已存在 |
| 422 | 数据验证失败 | 规则格式不符合规范 |
| 500 | 服务器内部错误 | 数据库连接失败 |

### 9.2 业务错误代码

| 错误代码 | 说明 | 示例场景 |
|----------|------|----------|
| 1001 | 用户名或密码错误 | 登录失败 |
| 1002 | Token 已过期 | Access Token 过期 |
| 1003 | Token 无效 | Token 格式错误 |
| 2001 | 规则 ID 已存在 | 创建重复 ID 的规则 |
| 2002 | 规则格式无效 | JSON 格式错误 |
| 2003 | 继承关系错误 | extends 文件不存在 |
| 3001 | 规则集名称已存在 | 创建重复名称的规则集 |
| 3002 | 同步失败 | 文件写入权限不足 |
| 4001 | 数据库连接失败 | 系统健康检查异常 |

### 9.3 错误响应示例

```json
{
  "code": 422,
  "message": "数据验证失败",
  "error": "VALIDATION_ERROR",
  "details": {
    "field": "pattern",
    "message": "正则表达式格式无效",
    "ruleId": 1001
  },
  "timestamp": 1729425600000
}
```

---

## 10. 前端集成示例

### 10.1 API 客户端封装

```typescript
// api-client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class WafApiClient {
  private client: AxiosInstance;
  private refreshTokenPromise?: Promise<string>;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器：添加认证头
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // 响应拦截器：处理 token 刷新
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            localStorage.setItem('access_token', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // 刷新失败，跳转到登录页
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    if (!this.refreshTokenPromise) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      this.refreshTokenPromise = this.client.post('/auth/refresh', {}, {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }).then(response => response.data.accessToken);
    }

    return this.refreshTokenPromise;
  }

  // 认证相关
  async login(username: string, password: string) {
    const response = await this.client.post('/auth/login', {
      username,
      password,
    });
    return response.data;
  }

  async logout() {
    await this.client.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async getProfile() {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  // 规则相关
  async getRules(params?: any) {
    const response = await this.client.get('/rules', { params });
    return response.data;
  }

  async getRule(id: number) {
    const response = await this.client.get(`/rules/${id}`);
    return response.data;
  }

  async createRule(data: any) {
    const response = await this.client.post('/rules', data);
    return response.data;
  }

  async updateRule(id: number, data: any) {
    const response = await this.client.put(`/rules/${id}`, data);
    return response.data;
  }

  async deleteRule(id: number) {
    const response = await this.client.delete(`/rules/${id}`);
    return response.data;
  }

  // 规则集相关
  async getRuleSets() {
    const response = await this.client.get('/rules/sets');
    return response.data;
  }

  async getRuleSet(id: number) {
    const response = await this.client.get(`/rules/sets/${id}`);
    return response.data;
  }

  async createRuleSet(data: any) {
    const response = await this.client.post('/rules/sets', data);
    return response.data;
  }

  async syncRules(params?: any) {
    const response = await this.client.post('/rules/sync', params);
    return response.data;
  }

  // 系统监控相关
  async getHealth() {
    const response = await this.client.get('/system/health');
    return response.data;
  }

  async getPerformance(params?: any) {
    const response = await this.client.get('/system/performance', { params });
    return response.data;
  }

  // 日志相关
  async getWafLogs(params?: any) {
    const response = await this.client.get('/logs/waf', { params });
    return response.data;
  }

  async getLogStats(params?: any) {
    const response = await this.client.get('/logs/stats', { params });
    return response.data;
  }
}

// 使用示例
const apiClient = new WafApiClient('http://localhost:3000');

export default apiClient;
```

### 10.2 Vue3 Composition API 集成

```typescript
// composables/useWafRules.ts
import { ref, reactive, computed } from 'vue';
import apiClient from '@/api-client';

interface Rule {
  id: number;
  tags?: string[];
  target: string | string[];
  match: string;
  pattern: string | string[];
  action: string;
  score?: number;
  priority?: number;
  // ... 其他字段
}

export function useWafRules() {
  const rules = ref<Rule[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  const filters = reactive({
    target: '',
    action: '',
    tags: [] as string[],
    search: '',
    isActive: undefined as boolean | undefined,
  });

  const sortedRules = computed(() => {
    return [...rules.value].sort((a, b) => {
      if (a.priority !== b.priority) {
        return (b.priority || 0) - (a.priority || 0);
      }
      return a.id - b.id;
    });
  });

  const fetchRules = async () => {
    loading.value = true;
    error.value = null;

    try {
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) =>
            value !== '' && value !== undefined && value !== null
          )
        ),
      };

      const response = await apiClient.getRules(params);

      rules.value = response.data.items;
      pagination.total = response.data.total;
      pagination.totalPages = response.data.totalPages;
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取规则失败';
    } finally {
      loading.value = false;
    }
  };

  const createRule = async (ruleData: Partial<Rule>) => {
    try {
      await apiClient.createRule(ruleData);
      await fetchRules();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.message || '创建规则失败'
      };
    }
  };

  const updateRule = async (id: number, ruleData: Partial<Rule>) => {
    try {
      await apiClient.updateRule(id, ruleData);
      await fetchRules();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.message || '更新规则失败'
      };
    }
  };

  const deleteRule = async (id: number) => {
    try {
      await apiClient.deleteRule(id);
      await fetchRules();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.message || '删除规则失败'
      };
    }
  };

  const batchOperation = async (action: 'activate' | 'deactivate' | 'delete', ruleIds: number[]) => {
    try {
      await apiClient.post('/rules/batch', { action, ruleIds });
      await fetchRules();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.message || '批量操作失败'
      };
    }
  };

  return {
    rules: sortedRules,
    loading,
    error,
    pagination,
    filters,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    batchOperation,
  };
}
```

### 10.3 React Hook 集成

```typescript
// hooks/useWafSystem.ts
import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/api-client';

interface HealthData {
  waf_status: string;
  request_stats: {
    total: number;
    blocked: number;
    allowed: number;
    blocked_rate: number;
  };
  security_events: {
    [key: string]: number;
  };
  system_resources: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
  };
}

export function useWafSystem() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getHealth();
      setHealth(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '获取系统状态失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();

    // 每30秒刷新一次
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const getSecurityEventStats = useCallback(() => {
    if (!health) return [];

    return Object.entries(health.security_events).map(([type, count]) => ({
      type: type.replace(/_/g, ' ').toUpperCase(),
      count,
      percentage: health.request_stats.total > 0
        ? (count / health.request_stats.total) * 100
        : 0,
    }));
  }, [health]);

  return {
    health,
    loading,
    error,
    fetchHealth,
    getSecurityEventStats,
  };
}
```

---

## 📝 附录

### A. 数据类型定义

```typescript
// 规则目标
enum RuleTarget {
  CLIENT_IP = 'CLIENT_IP',
  URI = 'URI',
  ALL_PARAMS = 'ALL_PARAMS',
  ARGS_COMBINED = 'ARGS_COMBINED',
  ARGS_NAME = 'ARGS_NAME',
  ARGS_VALUE = 'ARGS_VALUE',
  BODY = 'BODY',
  HEADER = 'HEADER',
}

// 匹配类型
enum RuleMatch {
  CONTAINS = 'CONTAINS',
  EXACT = 'EXACT',
  REGEX = 'REGEX',
  CIDR = 'CIDR',
}

// 规则动作
enum RuleAction {
  DENY = 'DENY',
  LOG = 'LOG',
  BYPASS = 'BYPASS',
}

// 用户角色
enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
}

// 继承配置
interface ExtendConfig {
  file: string;
  rewriteTargetsForTag?: Record<string, RuleTarget[]>;
}
```

### B. 环境变量配置

```env
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=waf_manager

# JWT 配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d

# WAF 配置
WAF_RULES_PATH=/usr/local/nginx/conf/waf/releases/current
WAF_LOG_PATH=/var/log/nginx
WAF_ENABLE_AUTO_SYNC=true

# 日志配置
LOG_LEVEL=info
LOG_MAX_FILES=30
LOG_MAX_SIZE=100m
```

### C. 部署检查清单

- [ ] 数据库连接配置正确
- [ ] JWT 密钥已设置且足够复杂
- [ ] WAF 规则文件路径权限正确
- [ ] 日志目录可写权限
- [ ] HTTPS 证书配置（生产环境）
- [ ] 防火墙规则允许 API 访问
- [ ] 监控和日志轮转配置
- [ ] 备份策略已制定
- [ ] 性能基准测试完成

---

**文档版本**：v2.0
**更新日期**：2025-10-20
**兼容性**：Nginx HTTP WAF v2 标准
