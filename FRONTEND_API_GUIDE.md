# WAF Manager Backend 前端对接接口文档

## 基础信息

- **API 基础地址**: `http://localhost:3000`
- **认证方式**: JWT Bearer Token
- **响应格式**: 统一JSON格式
- **API 文档地址**: `http://localhost:3000/docs`

## 通用响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}, // 具体数据
  "timestamp": 1729425600000
}
```

### 错误响应
```json
{
  "code": 401,
  "message": "未授权访问",
  "error": "Unauthorized",
  "timestamp": 1729425600000
}
```

### 分页响应
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "items": [], // 数据列表
    "total": 100, // 总数
    "page": 1, // 当前页
    "pageSize": 20, // 每页大小
    "totalPages": 5 // 总页数
  },
  "timestamp": 1729425600000
}
```

---

## 1. 应用基础模块

### 1.1 获取应用信息
- **URL**: `GET /`
- **描述**: 返回应用的基本信息和状态
- **请求头**: 无
- **请求参数**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": "Hello World!",
    "timestamp": 1761444361827
  }
  ```
- **认证**: 无需认证

---

## 2. 认证模块

### 2.1 用户登录
- **URL**: `POST /auth/login`
- **描述**: 使用用户名和密码登录系统
- **请求头**: 
  ```
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 3,
        "username": "admin",
        "role": "ADMIN",
        "email": "admin@example.com"
      }
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 无需认证

### 2.2 刷新令牌
- **URL**: `GET /auth/refresh`
- **描述**: 使用刷新令牌获取新的访问令牌
- **请求头**: 
  ```
  Authorization: Bearer <refresh_token>
  ```
- **请求参数**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "刷新成功",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT刷新令牌

### 2.3 获取用户信息
- **URL**: `GET /auth/profile`
- **描述**: 获取当前登录用户的详细信息
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **请求参数**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "id": 3,
      "username": "admin",
      "role": "ADMIN",
      "email": "admin@example.com",
      "createdAt": "2025-11-10T04:29:37.000Z",
      "updatedAt": "2025-11-10T04:29:37.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 2.4 用户登出
- **URL**: `POST /auth/logout`
- **描述**: 使当前用户的刷新令牌失效
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **请求参数**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "退出成功",
    "data": null,
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

---

## 3. 用户管理模块

### 3.1 创建用户
- **URL**: `POST /users`
- **描述**: 创建新的用户账户
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "username": "newuser",
    "password": "password123",
    "role": "OPERATOR",
    "email": "user@example.com"
  }
  ```
- **响应体**:
  ```json
  {
    "code": 201,
    "message": "用户创建成功",
    "data": {
      "id": 4,
      "username": "newuser",
      "role": "OPERATOR",
      "email": "user@example.com",
      "createdAt": "2025-11-10T05:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN角色

### 3.2 获取用户列表
- **URL**: `GET /users`
- **描述**: 获取所有用户列表，支持分页和搜索
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `page`: 页码，默认1
  - `pageSize`: 每页大小，默认20
  - `search`: 搜索关键词（用户名）
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取用户列表成功",
    "data": {
      "items": [
        {
          "id": 3,
          "username": "admin",
          "role": "ADMIN",
          "email": "admin@example.com",
          "createdAt": "2025-11-10T04:29:37.000Z"
        }
      ],
      "total": 1,
      "page": 1,
      "pageSize": 20,
      "totalPages": 1
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN角色

### 3.3 获取用户详情
- **URL**: `GET /users/:id`
- **描述**: 根据ID获取用户详细信息
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **路径参数**: `id` - 用户ID
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取用户详情成功",
    "data": {
      "id": 3,
      "username": "admin",
      "role": "ADMIN",
      "email": "admin@example.com",
      "createdAt": "2025-11-10T04:29:37.000Z",
      "updatedAt": "2025-11-10T04:29:37.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN角色

### 3.4 更新用户
- **URL**: `PUT /users/:id`
- **描述**: 更新指定用户的信息
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **路径参数**: `id` - 用户ID
- **请求体**:
  ```json
  {
    "username": "admin",
    "role": "ADMIN",
    "email": "admin@example.com"
  }
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "用户更新成功",
    "data": {
      "id": 3,
      "username": "admin",
      "role": "ADMIN",
      "email": "admin@example.com",
      "updatedAt": "2025-11-10T05:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN角色

### 3.5 删除用户
- **URL**: `DELETE /users/:id`
- **描述**: 删除指定的用户
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **路径参数**: `id` - 用户ID
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "用户删除成功",
    "data": null,
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN角色

### 3.6 批量删除用户
- **URL**: `POST /users/batch`
- **描述**: 批量删除多个用户
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "userIds": [4, 5, 6]
  }
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "批量删除用户成功",
    "data": {
      "deleted": 3,
      "failed": 0
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN角色

### 3.7 检查用户名可用性
- **URL**: `GET /users/check-username/:username`
- **描述**: 检查用户名是否已被占用
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **路径参数**: `username` - 用户名
- **查询参数**: `excludeId` - 排除的用户ID（用于更新时检查）
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "检查完成",
    "data": {
      "available": true,
      "username": "newuser"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN角色

### 3.8 用户统计
- **URL**: `GET /users/stats`
- **描述**: 获取用户相关的统计信息
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取统计成功",
    "data": {
      "total": 10,
      "admins": 2,
      "operators": 8,
      "active": 9,
      "inactive": 1
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN角色

---

## 4. WAF规则管理模块

### 4.1 获取规则列表
- **URL**: `GET /rules`
- **描述**: 获取所有WAF规则，支持分页、过滤和搜索
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `page`: 页码，默认1
  - `pageSize`: 每页大小，默认20
  - `sortBy`: 排序字段，默认ruleId
  - `sortOrder`: 排序方式，默认ASC
  - `target`: 按目标类型过滤
  - `action`: 按动作类型过滤
  - `matchType`: 按匹配类型过滤
  - `isActive`: 按激活状态过滤
  - `tags`: 按标签过滤（多个标签用逗号分隔）
  - `search`: 按描述搜索
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取规则列表成功",
    "data": {
      "items": [
        {
          "id": 1,
          "ruleId": 1001,
          "target": "ALL_PARAMS",
          "match": "CONTAINS",
          "pattern": "attack",
          "caseless": true,
          "action": "DENY",
          "score": 50,
          "priority": 1,
          "tags": ["sqli", "high"],
          "description": "SQL注入攻击检测",
          "isActive": true,
          "createdAt": "2025-11-10T04:29:37.000Z"
        }
      ],
      "total": 1,
      "page": 1,
      "pageSize": 20,
      "totalPages": 1
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 4.2 获取规则详情
- **URL**: `GET /rules/:id`
- **描述**: 根据ID获取规则详细信息
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **路径参数**: `id` - 规则ID
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取规则详情成功",
    "data": {
      "id": 1,
      "ruleId": 1001,
      "target": "ALL_PARAMS",
      "match": "CONTAINS",
      "pattern": "attack",
      "caseless": true,
      "action": "DENY",
      "score": 50,
      "priority": 1,
      "tags": ["sqli", "high"],
      "description": "SQL注入攻击检测",
      "isActive": true,
      "createdAt": "2025-11-10T04:29:37.000Z",
      "updatedAt": "2025-11-10T04:29:37.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 4.3 创建规则
- **URL**: `POST /rules`
- **描述**: 创建新的WAF规则
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "ruleId": 1002,
    "target": "ALL_PARAMS",
    "match": "REGEX",
    "pattern": "<script[^>]*>.*?</script>",
    "caseless": true,
    "action": "DENY",
    "score": 80,
    "priority": 2,
    "tags": ["xss", "critical"],
    "description": "XSS攻击检测"
  }
  ```
- **响应体**:
  ```json
  {
    "code": 201,
    "message": "规则创建成功",
    "data": {
      "id": 2,
      "ruleId": 1002,
      "target": "ALL_PARAMS",
      "match": "REGEX",
      "pattern": "<script[^>]*>.*?</script>",
      "caseless": true,
      "action": "DENY",
      "score": 80,
      "priority": 2,
      "tags": ["xss", "critical"],
      "description": "XSS攻击检测",
      "isActive": true,
      "createdAt": "2025-11-10T05:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 4.4 更新规则
- **URL**: `PUT /rules/:id`
- **描述**: 更新指定规则的信息
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **路径参数**: `id` - 规则ID
- **请求体**:
  ```json
  {
    "ruleId": 1002,
    "target": "ALL_PARAMS",
    "match": "REGEX",
    "pattern": "<script[^>]*>.*?</script>",
    "caseless": true,
    "action": "DENY",
    "score": 90,
    "priority": 2,
    "tags": ["xss", "critical"],
    "description": "XSS攻击检测（已更新）"
  }
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "规则更新成功",
    "data": {
      "id": 2,
      "ruleId": 1002,
      "target": "ALL_PARAMS",
      "match": "REGEX",
      "pattern": "<script[^>]*>.*?</script>",
      "caseless": true,
      "action": "DENY",
      "score": 90,
      "priority": 2,
      "tags": ["xss", "critical"],
      "description": "XSS攻击检测（已更新）",
      "isActive": true,
      "updatedAt": "2025-11-10T05:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 4.5 删除规则
- **URL**: `DELETE /rules/:id`
- **描述**: 删除指定的规则
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **路径参数**: `id` - 规则ID
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "规则删除成功",
    "data": null,
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 4.6 切换规则状态
- **URL**: `POST /rules/:id/toggle`
- **描述**: 启用或禁用指定规则
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **路径参数**: `id` - 规则ID
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "规则状态切换成功",
    "data": {
      "id": 1,
      "isActive": false,
      "updatedAt": "2025-11-10T05:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 4.7 批量操作规则
- **URL**: `POST /rules/batch`
- **描述**: 批量创建、更新或删除规则
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "operation": "CREATE",
    "rules": [
      {
        "ruleId": 1003,
        "target": "URI",
        "match": "CONTAINS",
        "pattern": "../../",
        "action": "DENY",
        "score": 70,
        "description": "路径遍历攻击检测"
      }
    ]
  }
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "批量操作完成",
    "data": {
      "success": 1,
      "failed": 0,
      "results": [...]
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 4.8 同步规则
- **URL**: `POST /rules/sync`
- **描述**: 从文件系统同步规则到数据库
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "规则同步完成",
    "data": {
      "synced": 10,
      "updated": 2,
      "created": 3,
      "deleted": 0
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 4.9 验证规则
- **URL**: `POST /rules/validate`
- **描述**: 验证规则配置的有效性
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "ruleId": 1004,
    "target": "ALL_PARAMS",
    "match": "REGEX",
    "pattern": "union.*select",
    "action": "DENY"
  }
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "规则验证完成",
    "data": {
      "valid": true,
      "errors": [],
      "warnings": []
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 4.10 获取规则统计
- **URL**: `GET /rules/stats`
- **描述**: 获取WAF规则的统计信息
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取统计成功",
    "data": {
      "total": 100,
      "active": 85,
      "inactive": 15,
      "byTarget": {
        "ALL_PARAMS": 40,
        "URI": 30,
        "BODY": 20,
        "HEADERS": 10
      },
      "byAction": {
        "DENY": 80,
        "ALLOW": 15,
        "LOG": 5
      },
      "byTags": {
        "sqli": 30,
        "xss": 25,
        "rce": 20,
        "lfi": 15,
        "other": 10
      }
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 4.11 获取目标类型
- **URL**: `GET /rules/targets`
- **描述**: 获取所有可用的规则目标类型
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取目标类型成功",
    "data": [
      {
        "value": "ALL_PARAMS",
        "label": "所有参数",
        "description": "检查所有请求参数"
      },
      {
        "value": "URI",
        "label": "请求URI",
        "description": "检查请求的URI路径"
      },
      {
        "value": "BODY",
        "label": "请求体",
        "description": "检查请求体内容"
      },
      {
        "value": "HEADERS",
        "label": "请求头",
        "description": "检查HTTP请求头"
      }
    ],
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 4.12 获取动作类型
- **URL**: `GET /rules/actions`
- **描述**: 获取所有可用的规则动作类型
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取动作类型成功",
    "data": [
      {
        "value": "DENY",
        "label": "拒绝",
        "description": "拒绝请求并返回403"
      },
      {
        "value": "ALLOW",
        "label": "允许",
        "description": "允许请求通过"
      },
      {
        "value": "LOG",
        "label": "记录",
        "description": "仅记录日志，不阻止请求"
      }
    ],
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 4.13 获取匹配类型
- **URL**: `GET /rules/match-types`
- **描述**: 获取所有可用的规则匹配类型
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取匹配类型成功",
    "data": [
      {
        "value": "CONTAINS",
        "label": "包含",
        "description": "检查是否包含指定字符串"
      },
      {
        "value": "REGEX",
        "label": "正则表达式",
        "description": "使用正则表达式匹配"
      },
      {
        "value": "EQUALS",
        "label": "等于",
        "description": "检查是否完全相等"
      },
      {
        "value": "STARTS_WITH",
        "label": "开始于",
        "description": "检查是否以指定字符串开始"
      },
      {
        "value": "ENDS_WITH",
        "label": "结束于",
        "description": "检查是否以指定字符串结束"
      }
    ],
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 4.14 获取规则分类
- **URL**: `GET /rules/categories`
- **描述**: 获取所有可用的规则分类
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取规则分类成功",
    "data": [
      {
        "value": "sqli",
        "label": "SQL注入",
        "description": "SQL注入攻击检测"
      },
      {
        "value": "xss",
        "label": "XSS攻击",
        "description": "跨站脚本攻击检测"
      },
      {
        "value": "rce",
        "label": "远程代码执行",
        "description": "远程代码执行攻击检测"
      },
      {
        "value": "lfi",
        "label": "本地文件包含",
        "description": "本地文件包含攻击检测"
      }
    ],
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 4.15 获取WAF配置
- **URL**: `GET /rules/config`
- **描述**: 获取WAF模块的配置信息
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取WAF配置成功",
    "data": {
      "rulesDirectory": "./waf_rules",
      "mainRuleFile": "./waf_rules/main.json",
      "autoSyncEnabled": false,
      "fileWatcherEnabled": true,
      "nginxConfigPath": "/usr/local/nginx/conf",
      "nginxBinaryPath": "/usr/local/nginx/sbin/nginx"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 4.16 获取规则状态
- **URL**: `GET /rules/status`
- **描述**: 获取规则模块的运行状态
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取规则状态成功",
    "data": {
      "status": "running",
      "lastSync": "2025-11-10T04:40:24.000Z",
      "syncStatus": "success",
      "totalRules": 100,
      "activeRules": 85,
      "watchedFiles": 5
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 4.17 导出规则
- **URL**: `GET /rules/export`
- **描述**: 导出所有规则为JSON格式
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "规则导出成功",
    "data": {
      "rules": [...],
      "exportedAt": "2025-11-10T05:00:00.000Z",
      "total": 100
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 4.18 测试Nginx配置
- **URL**: `POST /rules/config/test-nginx`
- **描述**: 测试Nginx配置文件的有效性
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "Nginx配置测试完成",
    "data": {
      "valid": true,
      "output": "nginx: configuration file test is successful",
      "errors": []
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 4.19 重载Nginx配置
- **URL**: `POST /rules/config/reload-nginx`
- **描述**: 重新加载Nginx配置文件
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "Nginx配置重载成功",
    "data": {
      "success": true,
      "output": "nginx: configuration reloaded",
      "reloadedAt": "2025-11-10T05:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

---

## 5. WAF规则集管理模块

### 5.1 获取规则集列表
- **URL**: `GET /rule-sets`
- **描述**: 获取所有WAF规则集，支持分页、过滤和搜索
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `page`: 页码，默认1
  - `pageSize`: 每页大小，默认20
  - `sortBy`: 排序字段，默认createdAt
  - `sortOrder`: 排序方式，默认DESC
  - `isActive`: 按激活状态过滤
  - `search`: 按名称搜索
  - `tags`: 按标签过滤（多个标签用逗号分隔）
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取规则集列表成功",
    "data": {
      "items": [
        {
          "name": "baseline",
          "description": "基础规则集",
          "version": 1,
          "isActive": true,
          "tags": ["baseline"],
          "extends": ["./base.json"],
          "createdAt": "2025-11-10T04:29:37.000Z"
        }
      ],
      "total": 1,
      "page": 1,
      "pageSize": 20,
      "totalPages": 1
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 5.2 获取规则集详情
- **URL**: `GET /rule-sets/:name`
- **描述**: 根据名称获取规则集详细信息
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **路径参数**: `name` - 规则集名称
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取规则集详情成功",
    "data": {
      "name": "baseline",
      "description": "基础规则集",
      "version": 1,
      "isActive": true,
      "tags": ["baseline"],
      "extends": ["./base.json"],
      "disableById": [1001, 1002],
      "disableByTag": ["test"],
      "rules": [
        {
          "id": 1001,
          "target": "ALL_PARAMS",
          "match": "CONTAINS",
          "pattern": "attack",
          "action": "DENY"
        }
      ],
      "createdAt": "2025-11-10T04:29:37.000Z",
      "updatedAt": "2025-11-10T04:29:37.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 5.3 创建规则集
- **URL**: `POST /rule-sets`
- **描述**: 创建新的WAF规则集
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "name": "custom",
    "description": "自定义规则集",
    "version": 1,
    "isActive": true,
    "tags": ["custom"],
    "extends": ["./baseline.json"],
    "rules": [
      {
        "id": 2001,
        "target": "URI",
        "match": "REGEX",
        "pattern": "^/admin",
        "action": "DENY"
      }
    ]
  }
  ```
- **响应体**:
  ```json
  {
    "code": 201,
    "message": "规则集创建成功",
    "data": {
      "name": "custom",
      "description": "自定义规则集",
      "version": 1,
      "isActive": true,
      "tags": ["custom"],
      "extends": ["./baseline.json"],
      "createdAt": "2025-11-10T05:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 5.4 更新规则集
- **URL**: `PUT /rule-sets/:name`
- **描述**: 更新指定规则集的信息
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **路径参数**: `name` - 规则集名称
- **请求体**:
  ```json
  {
    "description": "自定义规则集（已更新）",
    "version": 2,
    "isActive": true,
    "tags": ["custom", "updated"]
  }
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "规则集更新成功",
    "data": {
      "name": "custom",
      "description": "自定义规则集（已更新）",
      "version": 2,
      "isActive": true,
      "tags": ["custom", "updated"],
      "updatedAt": "2025-11-10T05:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 5.5 删除规则集
- **URL**: `DELETE /rule-sets/:name`
- **描述**: 删除指定的规则集
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **路径参数**: `name` - 规则集名称
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "规则集删除成功",
    "data": null,
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 5.6 同步规则集
- **URL**: `POST /rule-sets/sync`
- **描述**: 从规则集文件同步到数据库
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "规则集同步完成",
    "data": {
      "synced": 5,
      "updated": 2,
      "created": 1,
      "deleted": 0
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 5.7 同步到文件
- **URL**: `POST /rule-sets/:name/sync-to-file`
- **描述**: 将规则集同步到文件系统
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **路径参数**: `name` - 规则集名称
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "规则集同步到文件成功",
    "data": {
      "filePath": "./waf_rules/custom.json",
      "syncedAt": "2025-11-10T05:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 5.8 添加规则到规则集
- **URL**: `POST /rule-sets/:name/rules/:ruleId`
- **描述**: 将指定规则添加到规则集中
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **路径参数**: 
  - `name` - 规则集名称
  - `ruleId` - 规则ID
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "规则已添加到规则集",
    "data": null,
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 5.9 从规则集移除规则
- **URL**: `DELETE /rule-sets/:name/rules/:ruleId`
- **描述**: 将指定规则从规则集中移除
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **路径参数**: 
  - `name` - 规则集名称
  - `ruleId` - 规则ID
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "规则已从规则集移除",
    "data": null,
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 5.10 切换规则集状态
- **URL**: `POST /rule-sets/:name/toggle`
- **描述**: 启用或禁用指定规则集
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **路径参数**: `name` - 规则集名称
- **查询参数**: `isActive` - 目标状态（true/false）
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "规则集状态切换成功",
    "data": {
      "name": "baseline",
      "isActive": false,
      "updatedAt": "2025-11-10T05:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 5.11 验证规则集
- **URL**: `POST /rule-sets/validate`
- **描述**: 验证规则集配置的有效性
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "name": "test",
    "rules": [
      {
        "id": 3001,
        "target": "ALL_PARAMS",
        "match": "CONTAINS",
        "pattern": "test",
        "action": "DENY"
      }
    ]
  }
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "规则集验证完成",
    "data": {
      "valid": true,
      "errors": [],
      "warnings": []
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 5.12 获取规则集统计
- **URL**: `GET /rule-sets/stats`
- **描述**: 获取WAF规则集的统计信息
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取规则集统计成功",
    "data": {
      "total": 10,
      "active": 8,
      "inactive": 2,
      "avgRulesPerSet": 25,
      "totalRules": 250,
      "byTags": {
        "baseline": 3,
        "custom": 4,
        "production": 3
      }
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

---

## 6. 系统监控模块

### 6.1 获取系统健康状态
- **URL**: `GET /system/health`
- **描述**: 获取系统健康状态
- **请求头**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "系统运行正常",
    "data": {
      "waf_status": "running",
      "timestamp": 1762749625694,
      "request_stats": {
        "total": 16716,
        "blocked": 388,
        "allowed": 16328,
        "last_5min": 1458,
        "block_rate": 2.32,
        "allow_rate": 97.68
      },
      "security_events": {
        "xss_attempts": 151,
        "sql_injection_attempts": 99,
        "rce_attempts": 45,
        "lfi_attempts": 68,
        "dir_traversal_attempts": 34,
        "total_blocked": 355,
        "high_severity": 45,
        "medium_severity": 140,
        "low_severity": 166
      },
      "system_resources": {
        "cpu_usage": "28.2%",
        "memory_usage": "61.0%",
        "disk_usage": "40.3%",
        "network_io": "114.4 MB/s",
        "uptime": "36天1小时53分",
        "load_average": "1.18",
        "process_count": 168
      },
      "rule_info": {
        "total_rules": 1316,
        "active_rules": 1184,
        "inactive_rules": 132,
        "last_update": "2025-11-10T04:40:24.686Z",
        "update_status": "success"
      },
      "service_status": {
        "database": "connected",
        "detection_engine": "active",
        "logging": "enabled",
        "cache_service": "active"
      },
      "performance": {
        "avg_response_time": "44ms",
        "max_response_time": "114ms",
        "min_response_time": "15ms",
        "requests_per_second": 241,
        "error_rate": 1.98
      }
    },
    "timestamp": 1762749625694
  }
  ```
- **认证**: 无需认证

### 6.2 获取系统状态摘要
- **URL**: `GET /system/summary`
- **描述**: 获取系统状态摘要
- **请求头**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取系统摘要成功",
    "data": {
      "status": "healthy",
      "uptime": "36天1小时53分",
      "requests_today": 50000,
      "blocks_today": 1200,
      "active_rules": 1184,
      "last_update": "2025-11-10T04:40:24.686Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 无需认证

### 6.3 检查系统告警阈值
- **URL**: `GET /system/alerts`
- **描述**: 检查系统告警阈值
- **请求头**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取告警阈值成功",
    "data": {
      "cpu_threshold": 80,
      "memory_threshold": 85,
      "disk_threshold": 90,
      "error_rate_threshold": 5,
      "current_alerts": []
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 无需认证

### 6.4 获取详细监控指标
- **URL**: `GET /system/metrics`
- **描述**: 获取详细监控指标
- **查询参数**: `type` - 指标类型: resources|performance|security|rules|all
- **请求头**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取监控指标成功",
    "data": {
      "resources": {
        "cpu": {
          "usage": "28.2%",
          "cores": 4,
          "load": [1.18, 1.15, 1.20]
        },
        "memory": {
          "usage": "61.0%",
          "total": "8GB",
          "used": "4.88GB",
          "free": "3.12GB"
        },
        "disk": {
          "usage": "40.3%",
          "total": "100GB",
          "used": "40.3GB",
          "free": "59.7GB"
        }
      },
      "performance": {
        "response_time": {
          "avg": "44ms",
          "min": "15ms",
          "max": "114ms",
          "p95": "85ms"
        },
        "throughput": {
          "requests_per_second": 241,
          "bytes_per_second": "1.3GB/s"
        }
      }
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 无需认证

### 6.5 获取服务状态
- **URL**: `GET /system/status`
- **描述**: 获取服务状态
- **请求头**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取服务状态成功",
    "data": {
      "database": "connected",
      "detection_engine": "active",
      "logging": "enabled",
      "cache_service": "active",
      "notification_service": "active",
      "backup_service": "active"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 无需认证

### 6.6 获取性能指标
- **URL**: `GET /system/performance`
- **描述**: 获取性能指标
- **请求头**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取性能指标成功",
    "data": {
      "response_time": {
        "avg": "44ms",
        "min": "15ms",
        "max": "114ms",
        "p95": "85ms",
        "p99": "102ms"
      },
      "throughput": {
        "requests_per_second": 241,
        "bytes_per_second": "1.3GB/s",
        "connections": 87
      },
      "cache": {
        "hit_rate": "94.5%",
        "miss_rate": "5.5%",
        "size": "512MB"
      }
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 无需认证

### 6.7 获取安全指标
- **URL**: `GET /system/security`
- **描述**: 获取安全指标
- **请求头**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取安全指标成功",
    "data": {
      "attacks": {
        "total_blocked": 355,
        "xss": 151,
        "sql_injection": 99,
        "rce": 45,
        "lfi": 68,
        "dir_traversal": 34
      },
      "severity": {
        "high": 45,
        "medium": 140,
        "low": 166
      },
      "top_ips": [
        {"ip": "192.168.1.100", "count": 30},
        {"ip": "192.168.1.101", "count": 25}
      ],
      "top_countries": [
        {"country": "CN", "count": 200},
        {"country": "US", "count": 100}
      ]
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 无需认证

### 6.8 获取系统信息
- **URL**: `GET /system/info`
- **描述**: 获取系统信息
- **请求头**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取系统信息成功",
    "data": {
      "hostname": "waf-server",
      "os": "Linux",
      "os_version": "6.8.0-63-generic",
      "node_version": "v18.19.0",
      "platform": "linux",
      "arch": "x64",
      "uptime": "36天1小时53分"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 无需认证

### 6.9 获取统计数据
- **URL**: `GET /system/stats`
- **描述**: 获取统计数据
- **请求头**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取统计数据成功",
    "data": {
      "requests": {
        "today": 50000,
        "this_week": 300000,
        "this_month": 1200000
      },
      "blocks": {
        "today": 1200,
        "this_week": 7200,
        "this_month": 28800
      },
      "unique_ips": {
        "today": 5000,
        "this_week": 25000,
        "this_month": 80000
      }
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 无需认证

### 6.10 获取日志统计信息
- **URL**: `GET /system/logs/stats`
- **描述**: 获取日志统计信息
- **请求头**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取日志统计成功",
    "data": {
      "total_logs": 1000000,
      "logs_today": 50000,
      "error_logs": 500,
      "warning_logs": 2000,
      "info_logs": 47500
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 无需认证

### 6.11 查询日志
- **URL**: `GET /system/logs`
- **描述**: 查询系统日志
- **查询参数**:
  - `level`: 日志级别: INFO|WARN|ERROR|DEBUG
  - `service`: 服务名称
  - `startTime`: 开始时间 (ISO字符串)
  - `endTime`: 结束时间 (ISO字符串)
  - `limit`: 返回数量限制
  - `offset`: 偏移量
- **请求头**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取日志成功",
    "data": {
      "logs": [
        {
          "timestamp": "2025-11-10T05:00:00.000Z",
          "level": "INFO",
          "service": "WAF",
          "message": "Request processed successfully",
          "metadata": {}
        }
      ],
      "total": 1000,
      "limit": 50,
      "offset": 0
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 无需认证

### 6.12 获取错误日志趋势
- **URL**: `GET /system/logs/trends`
- **描述**: 获取错误日志趋势
- **查询参数**: `hours` - 时间范围(小时)，默认24
- **请求头**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取日志趋势成功",
    "data": {
      "timeRange": "24 hours",
      "trends": [
        {"time": "2025-11-09T05:00:00.000Z", "count": 20},
        {"time": "2025-11-09T06:00:00.000Z", "count": 15},
        {"time": "2025-11-09T07:00:00.000Z", "count": 25}
      ],
      "total": 500,
      "peak": 30
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 无需认证

### 6.13 获取服务健康状态
- **URL**: `GET /system/logs/health`
- **描述**: 获取服务健康状态
- **请求头**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取服务健康状态成功",
    "data": {
      "status": "healthy",
      "checks": [
        {"service": "database", "status": "healthy"},
        {"service": "redis", "status": "healthy"},
        {"service": "nginx", "status": "healthy"}
      ]
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 无需认证

---

## 7. 地理位置模块

### 7.1 查询IP地理位置信息
- **URL**: `GET /geo/ip`
- **描述**: 查询单个IP的地理位置信息
- **查询参数**: `ip` - IP地址
- **请求头**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "查询成功",
    "data": {
      "ip": "192.168.1.100",
      "country": "中国",
      "countryCode": "CN",
      "region": "广东省",
      "city": "深圳市",
      "isp": "电信",
      "location": {
        "latitude": 22.5431,
        "longitude": 114.0579
      }
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 无需认证

### 7.2 批量查询IP地理位置信息
- **URL**: `GET /geo/batch`
- **描述**: 批量查询多个IP的地理位置信息
- **查询参数**: `ips` - IP地址列表，逗号分隔
- **请求头**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "批量查询成功",
    "data": [
      {
        "ip": "192.168.1.100",
        "country": "中国",
        "countryCode": "CN",
        "region": "广东省",
        "city": "深圳市"
      },
      {
        "ip": "192.168.1.101",
        "country": "美国",
        "countryCode": "US",
        "region": "加利福尼亚",
        "city": "旧金山"
      }
    ],
    "timestamp": 1729425600000
  }
  ```
- **认证**: 无需认证

### 7.3 根据IP列表统计国家分布
- **URL**: `GET /geo/countries`
- **描述**: 根据IP列表统计国家分布
- **查询参数**: `ips` - IP:count列表，格式：ip1:count1,ip2:count2
- **请求头**: 无
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "统计成功",
    "data": [
      {
        "country": "中国",
        "countryCode": "CN",
        "count": 1500,
        "percentage": 60.0
      },
      {
        "country": "美国",
        "countryCode": "US",
        "count": 750,
        "percentage": 30.0
      },
      {
        "country": "日本",
        "countryCode": "JP",
        "count": 250,
        "percentage": 10.0
      }
    ],
    "timestamp": 1729425600000
  }
  ```
- **认证**: 无需认证

---

## 8. 日志管理模块

### 8.1 日志搜索
- **URL**: `GET /logs/search`
- **描述**: 搜索WAF日志和访问日志
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `keyword`: 搜索关键词
  - `type`: 日志类型：waf/access
  - `startDate`: 开始日期
  - `endDate`: 结束日期
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "搜索完成",
    "data": {
      "results": [
        {
          "id": 1,
          "type": "waf",
          "timestamp": "2025-11-10T05:00:00.000Z",
          "level": "WARN",
          "message": "SQL injection attempt blocked",
          "details": {
            "ip": "192.168.1.100",
            "uri": "/api/users",
            "method": "POST",
            "ruleId": 1001,
            "pattern": "union select"
          }
        }
      ],
      "total": 100,
      "page": 1,
      "pageSize": 20
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 8.2 导出日志
- **URL**: `POST /logs/export`
- **描述**: 导出WAF日志或访问日志
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "type": "waf",
    "dateRange": {
      "start": "2025-11-09T00:00:00.000Z",
      "end": "2025-11-10T23:59:59.999Z"
    },
    "format": "csv"
  }
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "导出任务已创建",
    "data": {
      "taskId": "export_20251110_001",
      "downloadUrl": "/api/downloads/export_20251110_001.csv",
      "expiresAt": "2025-11-11T05:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 8.3 日志分析
- **URL**: `GET /logs/analysis`
- **描述**: 分析日志数据和趋势
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `type`: 日志类型：waf/access
  - `timeRange`: 时间范围：1h/24h/7d/30d
  - `groupBy`: 分组字段：hour/day/ip/rule
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "分析完成",
    "data": {
      "summary": {
        "total": 10000,
        "blocked": 500,
        "allowed": 9500,
        "blockRate": 5.0
      },
      "trends": [
        {"time": "2025-11-10T00:00:00.000Z", "count": 400},
        {"time": "2025-11-10T01:00:00.000Z", "count": 350},
        {"time": "2025-11-10T02:00:00.000Z", "count": 450}
      ],
      "topAttacks": [
        {"type": "sqli", "count": 200},
        {"type": "xss", "count": 150},
        {"type": "rce", "count": 100}
      ],
      "topIps": [
        {"ip": "192.168.1.100", "count": 50},
        {"ip": "192.168.1.101", "count": 40}
      ]
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 8.4 清理日志
- **URL**: `POST /logs/clear`
- **描述**: 清理指定日期之前的日志
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "type": "waf",
    "before": "2025-11-01T00:00:00.000Z"
  }
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "日志清理完成",
    "data": {
      "deleted": 50000,
      "type": "waf",
      "before": "2025-11-01T00:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 8.5 实时日志
- **URL**: `GET /logs/realtime`
- **描述**: 获取实时日志流（Server-Sent Events）
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  Accept: text/event-stream
  ```
- **响应**: SSE流
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

---

## 9. WAF日志模块

### 9.1 查询WAF审计日志
- **URL**: `GET /logs/waf`
- **描述**: 查询WAF审计日志
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `startTime`: 开始时间
  - `endTime`: 结束时间
  - `page`: 页码
  - `pageSize`: 每页数量
  - `ip`: IP地址过滤
  - `uri`: URI过滤
  - `method`: HTTP方法过滤
  - `action`: 动作过滤（BLOCK/ALLOW）
  - `ruleId`: 规则ID过滤
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取WAF日志成功",
    "data": {
      "items": [
        {
          "id": 1,
          "timestamp": "2025-11-10T05:00:00.000Z",
          "ip": "192.168.1.100",
          "uri": "/api/users",
          "method": "POST",
          "protocol": "HTTP/1.1",
          "userAgent": "Mozilla/5.0...",
          "action": "BLOCK",
          "ruleId": 1001,
          "ruleName": "SQL注入检测",
          "pattern": "union select",
          "score": 50,
          "requestHeaders": {...},
          "requestBody": "...",
          "responseStatus": 403,
          "responseTime": 25
        }
      ],
      "total": 1000,
      "page": 1,
      "pageSize": 20,
      "totalPages": 50
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 9.2 获取WAF日志统计信息
- **URL**: `GET /logs/waf/stats`
- **描述**: 获取WAF日志统计信息
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `startTime`: 开始时间
  - `endTime`: 结束时间
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取WAF日志统计成功",
    "data": {
      "summary": {
        "total": 10000,
        "blocked": 500,
        "allowed": 9500,
        "blockRate": 5.0,
        "avgResponseTime": 30
      },
      "byAction": {
        "BLOCK": 500,
        "ALLOW": 9500
      },
      "byRule": [
        {"ruleId": 1001, "count": 200},
        {"ruleId": 1002, "count": 150}
      ],
      "byIp": [
        {"ip": "192.168.1.100", "count": 50},
        {"ip": "192.168.1.101", "count": 40}
      ],
      "topAttacks": [
        {"type": "sqli", "count": 200},
        {"type": "xss", "count": 150}
      ]
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 9.3 导出WAF日志
- **URL**: `GET /logs/waf/export`
- **描述**: 导出WAF日志
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**: 同查询WAF日志接口
- **响应**: 文件下载流
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

---

## 10. 访问日志模块

### 10.1 查询访问日志
- **URL**: `GET /logs/access`
- **描述**: 查询访问日志
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `startTime`: 开始时间
  - `endTime`: 结束时间
  - `page`: 页码
  - `pageSize`: 每页数量
  - `ip`: IP地址过滤
  - `uri`: URI过滤
  - `method`: HTTP方法过滤
  - `status`: 状态码过滤
  - `referer`: 来源页面过滤
  - `userAgent`: 用户代理过滤
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取访问日志成功",
    "data": {
      "items": [
        {
          "id": 1,
          "timestamp": "2025-11-10T05:00:00.000Z",
          "ip": "192.168.1.100",
          "uri": "/api/users",
          "method": "GET",
          "protocol": "HTTP/1.1",
          "status": 200,
          "responseSize": 1024,
          "responseTime": 25,
          "referer": "https://example.com",
          "userAgent": "Mozilla/5.0...",
          "requestHeaders": {...},
          "country": "中国",
          "region": "广东省",
          "city": "深圳市"
        }
      ],
      "total": 10000,
      "page": 1,
      "pageSize": 20,
      "totalPages": 500
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 10.2 获取访问日志统计信息
- **URL**: `GET /logs/access/stats`
- **描述**: 获取访问日志统计信息
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `startTime`: 开始时间
  - `endTime`: 结束时间
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取访问日志统计成功",
    "data": {
      "summary": {
        "total": 10000,
        "uniqueIps": 5000,
        "avgResponseTime": 30,
        "totalBytes": 10485760
      },
      "byStatus": {
        "200": 8000,
        "404": 1000,
        "500": 500,
        "403": 500
      },
      "byMethod": {
        "GET": 7000,
        "POST": 2000,
        "PUT": 500,
        "DELETE": 500
      },
      "topPaths": [
        {"path": "/api/users", "count": 2000},
        {"path": "/api/rules", "count": 1500}
      ],
      "topIps": [
        {"ip": "192.168.1.100", "count": 100},
        {"ip": "192.168.1.101", "count": 90}
      ]
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 10.3 获取热门访问路径
- **URL**: `GET /logs/access/top-paths`
- **描述**: 获取热门访问路径
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `limit`: 限制数量，默认10
  - `startTime`: 开始时间
  - `endTime`: 结束时间
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取热门路径成功",
    "data": [
      {
        "path": "/api/users",
        "count": 2000,
        "percentage": 20.0,
        "avgResponseTime": 25
      },
      {
        "path": "/api/rules",
        "count": 1500,
        "percentage": 15.0,
        "avgResponseTime": 30
      }
    ],
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 10.4 获取热门访问IP
- **URL**: `GET /logs/access/top-ips`
- **描述**: 获取热门访问IP
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `limit`: 限制数量，默认10
  - `startTime`: 开始时间
  - `endTime`: 结束时间
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取热门IP成功",
    "data": [
      {
        "ip": "192.168.1.100",
        "count": 100,
        "percentage": 2.0,
        "country": "中国",
        "city": "深圳市",
        "blockedCount": 10
      },
      {
        "ip": "192.168.1.101",
        "count": 90,
        "percentage": 1.8,
        "country": "美国",
        "city": "旧金山",
        "blockedCount": 5
      }
    ],
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 10.5 导出访问日志
- **URL**: `GET /logs/access/export`
- **描述**: 导出访问日志
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**: 同查询访问日志接口
- **响应**: 文件下载流
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

---

## 11. 日志统计模块

### 11.1 获取日志统计信息
- **URL**: `GET /logs/stats`
- **描述**: 获取日志统计信息
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `startTime`: 开始时间
  - `endTime`: 结束时间
  - `type`: 日志类型：waf/access/all
  - `groupBy`: 分组字段：hour/day/ip/rule/status
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取日志统计成功",
    "data": {
      "summary": {
        "total": 20000,
        "waf": 10000,
        "access": 10000,
        "blocked": 500,
        "errors": 100
      },
      "trends": [
        {"time": "2025-11-10T00:00:00.000Z", "waf": 400, "access": 600},
        {"time": "2025-11-10T01:00:00.000Z", "waf": 350, "access": 650}
      ],
      "distribution": {
        "byHour": [...],
        "byDay": [...],
        "byIp": [...],
        "byStatus": [...]
      }
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 11.2 获取日志统计摘要
- **URL**: `GET /logs/stats/summary`
- **描述**: 获取日志统计摘要
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**: 同上
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取日志摘要成功",
    "data": {
      "today": {
        "total": 5000,
        "blocked": 125,
        "errors": 25,
        "uniqueIps": 1000
      },
      "thisWeek": {
        "total": 30000,
        "blocked": 750,
        "errors": 150,
        "uniqueIps": 5000
      },
      "thisMonth": {
        "total": 100000,
        "blocked": 2500,
        "errors": 500,
        "uniqueIps": 15000
      }
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 11.3 获取日志分析数据
- **URL**: `GET /logs/stats/analytics`
- **描述**: 获取日志分析数据
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**: 同上
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取日志分析成功",
    "data": {
      "attackPatterns": [
        {"pattern": "union select", "count": 200, "type": "sqli"},
        {"pattern": "<script", "count": 150, "type": "xss"}
      ],
      "attackSources": [
        {"country": "CN", "count": 500},
        {"country": "US", "count": 300}
      ],
      "timeDistribution": [
        {"hour": 0, "count": 100},
        {"hour": 1, "count": 150}
      ],
      "correlations": {
        "ipVsAttack": [...],
        "pathVsAttack": [...]
      }
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 11.4 获取日志趋势数据
- **URL**: `GET /logs/stats/trends`
- **描述**: 获取日志趋势数据
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `timeRange`: 时间范围，默认24h
  - `metric`: 指标，默认count
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取趋势数据成功",
    "data": {
      "timeRange": "24 hours",
      "interval": "1 hour",
      "data": [
        {"time": "2025-11-09T05:00:00.000Z", "value": 400},
        {"time": "2025-11-09T06:00:00.000Z", "value": 350},
        {"time": "2025-11-09T07:00:00.000Z", "value": 450}
      ],
      "summary": {
        "min": 300,
        "max": 500,
        "avg": 400,
        "total": 9600
      }
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 11.5 获取仪表板数据
- **URL**: `GET /logs/stats/dashboard`
- **描述**: 获取仪表板数据
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**: 同上
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取仪表板数据成功",
    "data": {
      "overview": {
        "total": 20000,
        "blocked": 500,
        "errors": 100,
        "uniqueIps": 5000
      },
      "charts": {
        "timeline": [...],
        "topAttacks": [...],
        "topIps": [...],
        "topPaths": [...],
        "geoDistribution": [...]
      },
      "alerts": [
        {
          "type": "spike",
          "message": "检测到异常流量激增",
          "timestamp": "2025-11-10T04:30:00.000Z"
        }
      ]
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

---

## 12. 仪表板模块

### 12.1 获取KPI指标数据
- **URL**: `GET /dashboard/kpi`
- **描述**: 获取KPI指标数据
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `timeRange`: 时间范围：1h/24h/7d/30d
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取KPI数据成功",
    "data": {
      "requests": {
        "total": 50000,
        "today": 5000,
        "change": "+10.5%"
      },
      "blocks": {
        "total": 1200,
        "today": 125,
        "change": "+5.2%"
      },
      "uniqueIps": {
        "total": 5000,
        "today": 500,
        "change": "+8.3%"
      },
      "avgResponseTime": {
        "value": 44,
        "unit": "ms",
        "change": "-2.1%"
      },
      "errorRate": {
        "value": 1.98,
        "unit": "%",
        "change": "-0.5%"
      }
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 12.2 获取地理位置数据
- **URL**: `GET /dashboard/geo`
- **描述**: 获取地理位置数据
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `timeRange`: 时间范围：1h/24h/7d/30d
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取地理位置数据成功",
    "data": {
      "countries": [
        {"country": "中国", "countryCode": "CN", "count": 3000, "percentage": 60.0},
        {"country": "美国", "countryCode": "US", "count": 1500, "percentage": 30.0}
      ],
      "cities": [
        {"city": "深圳", "country": "中国", "count": 1000},
        {"city": "北京", "country": "中国", "count": 800}
      ],
      "mapData": [
        {"lat": 22.5431, "lng": 114.0579, "count": 1000},
        {"lat": 39.9042, "lng": 116.4074, "count": 800}
      ]
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 12.3 获取QPS数据
- **URL**: `GET /dashboard/qps`
- **描述**: 获取QPS数据
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `timeRange`: 时间范围：1h/24h/7d/30d
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取QPS数据成功",
    "data": {
      "current": 241,
      "peak": 350,
      "avg": 200,
      "timeline": [
        {"time": "2025-11-10T04:00:00.000Z", "value": 200},
        {"time": "2025-11-10T04:01:00.000Z", "value": 220},
        {"time": "2025-11-10T04:02:00.000Z", "value": 241}
      ]
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 12.4 获取访问趋势数据
- **URL**: `GET /dashboard/visit`
- **描述**: 获取访问趋势数据
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `timeRange`: 时间范围：1h/24h/7d/30d
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取访问趋势成功",
    "data": {
      "timeline": [
        {"time": "2025-11-10T00:00:00.000Z", "count": 400},
        {"time": "2025-11-10T01:00:00.000Z", "count": 350},
        {"time": "2025-11-10T02:00:00.000Z", "count": 450}
      ],
      "summary": {
        "total": 5000,
        "avg": 208,
        "peak": 450,
        "peakTime": "2025-11-10T02:00:00.000Z"
      }
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 12.5 获取拦截趋势数据
- **URL**: `GET /dashboard/intercept`
- **描述**: 获取拦截趋势数据
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `timeRange`: 时间范围：1h/24h/7d/30d
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取拦截趋势成功",
    "data": {
      "timeline": [
        {"time": "2025-11-10T00:00:00.000Z", "blocked": 20, "allowed": 380},
        {"time": "2025-11-10T01:00:00.000Z", "blocked": 15, "allowed": 335}
      ],
      "summary": {
        "totalBlocked": 125,
        "totalAllowed": 4875,
        "blockRate": 2.5
      },
      "byType": [
        {"type": "sqli", "count": 50},
        {"type": "xss", "count": 40},
        {"type": "rce", "count": 35}
      ]
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 12.6 获取客户端数据
- **URL**: `GET /dashboard/client`
- **描述**: 获取客户端数据
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `timeRange`: 时间范围：1h/24h/7d/30d
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取客户端数据成功",
    "data": {
      "browsers": [
        {"name": "Chrome", "count": 3000, "percentage": 60.0},
        {"name": "Firefox", "count": 1500, "percentage": 30.0}
      ],
      "os": [
        {"name": "Windows", "count": 2500, "percentage": 50.0},
        {"name": "Linux", "count": 1500, "percentage": 30.0}
      ],
      "devices": [
        {"type": "desktop", "count": 4000, "percentage": 80.0},
        {"type": "mobile", "count": 1000, "percentage": 20.0}
      ]
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 12.7 获取响应状态码数据
- **URL**: `GET /dashboard/response`
- **描述**: 获取响应状态码数据
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `timeRange`: 时间范围：1h/24h/7d/30d
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取响应状态码成功",
    "data": {
      "distribution": [
        {"status": 200, "count": 4000, "percentage": 80.0},
        {"status": 404, "count": 500, "percentage": 10.0},
        {"status": 403, "count": 300, "percentage": 6.0},
        {"status": 500, "count": 200, "percentage": 4.0}
      ],
      "timeline": [
        {"time": "2025-11-10T04:00:00.000Z", "200": 160, "404": 20, "403": 12, "500": 8}
      ]
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 12.8 获取外部域名数据
- **URL**: `GET /dashboard/external-domains`
- **描述**: 获取外部域名数据
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `timeRange`: 时间范围：1h/24h/7d/30d
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取外部域名数据成功",
    "data": {
      "domains": [
        {"domain": "example.com", "count": 1000, "blocked": 50},
        {"domain": "test.com", "count": 800, "blocked": 40}
      ],
      "summary": {
        "total": 3000,
        "blocked": 200,
        "blockRate": 6.67
      }
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 12.9 获取外部页面数据
- **URL**: `GET /dashboard/external-pages`
- **描述**: 获取外部页面数据
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `timeRange`: 时间范围：1h/24h/7d/30d
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取外部页面数据成功",
    "data": {
      "pages": [
        {"url": "/login", "domain": "example.com", "count": 500},
        {"url": "/admin", "domain": "example.com", "count": 300}
      ],
      "summary": {
        "total": 2000,
        "unique": 50
      }
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 12.10 获取访问域名数据
- **URL**: `GET /dashboard/visited-domains`
- **描述**: 获取访问域名数据
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `timeRange`: 时间范围：1h/24h/7d/30d
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取访问域名数据成功",
    "data": {
      "domains": [
        {"domain": "api.example.com", "count": 2000},
        {"domain": "cdn.example.com", "count": 1500}
      ],
      "summary": {
        "total": 5000,
        "unique": 10
      }
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 12.11 获取访问页面数据
- **URL**: `GET /dashboard/visited-pages`
- **描述**: 获取访问页面数据
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `timeRange`: 时间范围：1h/24h/7d/30d
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取访问页面数据成功",
    "data": {
      "pages": [
        {"path": "/api/users", "count": 2000},
        {"path": "/api/rules", "count": 1500}
      ],
      "summary": {
        "total": 10000,
        "unique": 100
      }
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 12.12 获取完整仪表板数据
- **URL**: `GET /dashboard/all`
- **描述**: 获取完整仪表板数据
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `timeRange`: 时间范围：1h/24h/7d/30d
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取仪表板数据成功",
    "data": {
      "kpi": {...},
      "geo": {...},
      "qps": {...},
      "visit": {...},
      "intercept": {...},
      "client": {...},
      "response": {...},
      "external": {...},
      "visited": {...}
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

---

## 13. 告警管理模块

### 13.1 发送测试告警
- **URL**: `POST /alerts/test`
- **描述**: 发送测试告警
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "测试告警发送成功",
    "data": null,
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 13.2 获取告警统计
- **URL**: `GET /alerts/stats`
- **描述**: 获取告警统计
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取告警统计成功",
    "data": {
      "total": 100,
      "sent": 95,
      "failed": 5,
      "pending": 0,
      "byType": {
        "WAF_BLOCK": 40,
        "SYSTEM_RESOURCE": 30,
        "ERROR_RATE": 20,
        "SECURITY_EVENT": 10
      },
      "byLevel": {
        "LOW": 50,
        "MEDIUM": 30,
        "HIGH": 15,
        "CRITICAL": 5
      }
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 13.3 获取告警历史
- **URL**: `GET /alerts/history`
- **描述**: 获取告警历史
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `page`: 页码，默认1
  - `pageSize`: 每页大小，默认20
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取告警历史成功",
    "data": {
      "items": [
        {
          "id": 1,
          "type": "WAF_BLOCK",
          "level": "MEDIUM",
          "title": "WAF拦截次数超过阈值",
          "message": "在过去5分钟内，WAF拦截了150次请求",
          "emailAddress": "user@example.com",
          "status": "SENT",
          "sentAt": "2025-11-10T04:30:00.000Z",
          "createdAt": "2025-11-10T04:30:00.000Z"
        }
      ],
      "total": 100,
      "page": 1,
      "pageSize": 20,
      "totalPages": 5
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 13.4 获取全局告警统计（管理员）
- **URL**: `GET /alerts/admin/stats`
- **描述**: 获取全局告警统计（管理员）
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取全局告警统计成功",
    "data": {
      "total": 500,
      "sent": 480,
      "failed": 15,
      "pending": 5,
      "users": 10,
      "activeConfigs": 8
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 13.5 获取全局告警历史（管理员）
- **URL**: `GET /alerts/admin/history`
- **描述**: 获取全局告警历史（管理员）
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `page`: 页码，默认1
  - `pageSize`: 每页大小，默认20
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取全局告警历史成功",
    "data": {
      "items": [
        {
          "id": 1,
          "userId": 3,
          "username": "admin",
          "type": "WAF_BLOCK",
          "level": "MEDIUM",
          "title": "WAF拦截次数超过阈值",
          "emailAddress": "admin@example.com",
          "status": "SENT",
          "sentAt": "2025-11-10T04:30:00.000Z"
        }
      ],
      "total": 500,
      "page": 1,
      "pageSize": 20,
      "totalPages": 25
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 13.6 为指定用户发送测试告警（管理员）
- **URL**: `POST /alerts/admin/test/:userId`
- **描述**: 为指定用户发送测试告警（管理员）
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **路径参数**: `userId` - 用户ID
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "测试告警发送成功",
    "data": null,
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

---

## 14. 邮箱告警配置模块

### 14.1 创建邮箱告警配置
- **URL**: `POST /alerts/email-config`
- **描述**: 创建邮箱告警配置
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "emailAddress": "user@example.com",
    "alertTypes": ["WAF_BLOCK", "SYSTEM_RESOURCE", "ERROR_RATE"],
    "wafBlockThreshold": 100,
    "wafBlockTimeWindow": 5,
    "systemCpuThreshold": 80,
    "systemMemoryThreshold": 85,
    "systemDiskThreshold": 90,
    "errorRateThreshold": 5,
    "isEnabled": true
  }
  ```
- **响应体**:
  ```json
  {
    "code": 201,
    "message": "邮箱告警配置创建成功",
    "data": {
      "id": 1,
      "userId": 3,
      "emailAddress": "user@example.com",
      "alertTypes": ["WAF_BLOCK", "SYSTEM_RESOURCE", "ERROR_RATE"],
      "status": "ACTIVE",
      "wafBlockThreshold": 100,
      "wafBlockTimeWindow": 5,
      "systemCpuThreshold": 80,
      "systemMemoryThreshold": 85,
      "systemDiskThreshold": 90,
      "errorRateThreshold": 5,
      "isEnabled": true,
      "lastSentAt": null,
      "totalSent": 0,
      "createdAt": "2025-11-10T05:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 14.2 获取当前用户的邮箱配置
- **URL**: `GET /alerts/email-config/mine`
- **描述**: 获取当前用户的邮箱配置
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取邮箱配置成功",
    "data": {
      "id": 1,
      "userId": 3,
      "emailAddress": "user@example.com",
      "alertTypes": ["WAF_BLOCK", "SYSTEM_RESOURCE", "ERROR_RATE"],
      "status": "ACTIVE",
      "wafBlockThreshold": 100,
      "wafBlockTimeWindow": 5,
      "systemCpuThreshold": 80,
      "systemMemoryThreshold": 85,
      "systemDiskThreshold": 90,
      "errorRateThreshold": 5,
      "isEnabled": true,
      "lastSentAt": "2025-11-10T04:30:00.000Z",
      "totalSent": 5,
      "createdAt": "2025-11-10T04:29:37.000Z",
      "updatedAt": "2025-11-10T04:29:37.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 14.3 更新当前用户的邮箱配置
- **URL**: `PUT /alerts/email-config/mine`
- **描述**: 更新当前用户的邮箱配置
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "emailAddress": "newuser@example.com",
    "alertTypes": ["WAF_BLOCK", "SYSTEM_RESOURCE"],
    "wafBlockThreshold": 150,
    "systemCpuThreshold": 85,
    "systemMemoryThreshold": 90,
    "systemDiskThreshold": 95,
    "errorRateThreshold": 3,
    "isEnabled": true
  }
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "邮箱配置更新成功",
    "data": {
      "id": 1,
      "userId": 3,
      "emailAddress": "newuser@example.com",
      "alertTypes": ["WAF_BLOCK", "SYSTEM_RESOURCE"],
      "status": "ACTIVE",
      "wafBlockThreshold": 150,
      "systemCpuThreshold": 85,
      "systemMemoryThreshold": 90,
      "systemDiskThreshold": 95,
      "errorRateThreshold": 3,
      "isEnabled": true,
      "updatedAt": "2025-11-10T05:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 14.4 删除当前用户的邮箱配置
- **URL**: `DELETE /alerts/email-config/mine`
- **描述**: 删除当前用户的邮箱配置
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "邮箱配置删除成功",
    "data": null,
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 14.5 启用/禁用当前用户的邮箱配置
- **URL**: `POST /alerts/email-config/mine/toggle`
- **描述**: 启用/禁用当前用户的邮箱配置
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "邮箱配置已禁用",
    "data": {
      "id": 1,
      "status": "INACTIVE",
      "updatedAt": "2025-11-10T05:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 14.6 测试当前用户的邮箱配置
- **URL**: `POST /alerts/email-config/mine/test`
- **描述**: 测试当前用户的邮箱配置
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "测试完成",
    "data": {
      "success": true,
      "message": "测试邮件发送成功",
      "sentAt": "2025-11-10T05:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 14.7 获取当前用户的告警历史
- **URL**: `GET /alerts/email-config/mine/history`
- **描述**: 获取当前用户的告警历史
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `page`: 页码，默认1
  - `pageSize`: 每页大小，默认20
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取告警历史成功",
    "data": {
      "items": [
        {
          "id": 1,
          "alertType": "WAF_BLOCK",
          "level": "MEDIUM",
          "subject": "WAF拦截次数超过阈值",
          "content": "在过去5分钟内，WAF拦截了150次请求",
          "status": "SENT",
          "sentAt": "2025-11-10T04:30:00.000Z",
          "createdAt": "2025-11-10T04:30:00.000Z"
        }
      ],
      "total": 10,
      "page": 1,
      "pageSize": 20,
      "totalPages": 1
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 14.8 获取所有邮箱配置（管理员）
- **URL**: `GET /alerts/email-config`
- **描述**: 获取所有邮箱配置（管理员）
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**:
  - `page`: 页码，默认1
  - `pageSize`: 每页大小，默认20
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取邮箱配置列表成功",
    "data": {
      "items": [
        {
          "id": 1,
          "userId": 3,
          "username": "admin",
          "emailAddress": "admin@example.com",
          "status": "ACTIVE",
          "isEnabled": true,
          "totalSent": 5,
          "lastSentAt": "2025-11-10T04:30:00.000Z",
          "createdAt": "2025-11-10T04:29:37.000Z"
        }
      ],
      "total": 10,
      "page": 1,
      "pageSize": 20,
      "totalPages": 1
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 14.9 获取邮箱配置统计（管理员）
- **URL**: `GET /alerts/email-config/stats`
- **描述**: 获取邮箱配置统计（管理员）
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取邮箱配置统计成功",
    "data": {
      "total": 10,
      "active": 8,
      "inactive": 2,
      "totalSent": 100,
      "avgSentPerUser": 10,
      "byAlertType": {
        "WAF_BLOCK": 8,
        "SYSTEM_RESOURCE": 7,
        "ERROR_RATE": 6,
        "SECURITY_EVENT": 5
      }
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 14.10 获取可用的告警类型
- **URL**: `GET /alerts/email-config/types`
- **描述**: 获取可用的告警类型
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取告警类型成功",
    "data": [
      {
        "value": "WAF_BLOCK",
        "label": "WAF拦截告警",
        "description": "当WAF拦截次数超过阈值时触发"
      },
      {
        "value": "SYSTEM_RESOURCE",
        "label": "系统资源告警",
        "description": "当系统资源使用率超过阈值时触发"
      },
      {
        "value": "ERROR_RATE",
        "label": "错误率告警",
        "description": "当错误率超过阈值时触发"
      },
      {
        "value": "SECURITY_EVENT",
        "label": "安全事件告警",
        "description": "当检测到高危安全事件时触发"
      },
      {
        "value": "SERVICE_DOWN",
        "label": "服务异常告警",
        "description": "当服务状态异常时触发"
      }
    ],
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 14.11 切换指定用户的邮箱配置状态（管理员）
- **URL**: `POST /alerts/email-config/:userId/toggle`
- **描述**: 切换指定用户的邮箱配置状态（管理员）
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **路径参数**: `userId` - 用户ID
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "用户3的邮箱配置已禁用",
    "data": {
      "id": 1,
      "status": "INACTIVE",
      "updatedAt": "2025-11-10T05:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 14.12 重置指定用户的发送计数（管理员）
- **URL**: `POST /alerts/email-config/:userId/reset`
- **描述**: 重置指定用户的发送计数（管理员）
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **路径参数**: `userId` - 用户ID
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "用户3的发送计数已重置",
    "data": null,
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 14.13 批量切换用户邮箱配置状态（管理员）
- **URL**: `POST /alerts/email-config/batch/toggle`
- **描述**: 批量切换用户邮箱配置状态（管理员）
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "userIds": [3, 4, 5],
    "status": "INACTIVE"
  }
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "批量操作完成",
    "data": {
      "total": 3,
      "success": 3,
      "failed": 0,
      "results": [
        {"userId": 3, "success": true},
        {"userId": 4, "success": true},
        {"userId": 5, "success": true}
      ]
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

---

## 15. 邮件测试模块

### 15.1 获取邮件配置状态
- **URL**: `GET /alerts/email-test/status`
- **描述**: 获取邮件配置状态
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取邮件配置状态成功",
    "data": {
      "configured": true,
      "smtpConfig": {
        "host": "smtp.qq.com",
        "port": "587",
        "secure": "false",
        "user": "***",
        "pass": "***"
      },
      "alertCount": 1
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 15.2 测试邮件服务连接
- **URL**: `GET /alerts/email-test/connection`
- **描述**: 测试邮件服务连接
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "邮件服务连接测试完成",
    "data": {
      "success": true,
      "message": "邮件服务连接成功"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 15.3 发送测试邮件
- **URL**: `POST /alerts/email-test/send`
- **描述**: 发送测试邮件
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "emailAddress": "test@example.com"
  }
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "测试邮件发送成功",
    "data": {
      "success": true,
      "messageId": "abc123@example.com"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 15.4 向当前用户发送测试邮件
- **URL**: `POST /alerts/email-test/send-to-current-user`
- **描述**: 向当前用户发送测试邮件
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "测试邮件发送成功",
    "data": {
      "success": true,
      "message": "测试邮件已发送至您的邮箱"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

### 15.5 触发测试告警
- **URL**: `POST /alerts/email-test/trigger-alert`
- **描述**: 触发测试告警
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "测试告警已触发",
    "data": null,
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌

---

## 文件监控模块

### 16.1 获取文件监控统计信息
- **URL**: `GET /file-watcher/stats`
- **描述**: 获取文件监控统计信息
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取文件监控统计成功",
    "data": {
      "watchedFiles": 5,
      "totalEvents": 100,
      "eventsToday": 20,
      "lastEvent": "2025-11-10T04:45:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 16.2 获取当前监控的文件列表
- **URL**: `GET /file-watcher/watched-files`
- **描述**: 获取当前监控的文件列表
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "获取监控文件列表成功",
    "data": [
      {
        "path": "./waf_rules/main.json",
        "size": 1024,
        "lastModified": "2025-11-10T04:40:24.686Z",
        "events": 5
      },
      {
        "path": "./waf_rules/base.json",
        "size": 2048,
        "lastModified": "2025-11-10T04:30:00.000Z",
        "events": 3
      }
    ],
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 16.3 检查文件是否被监控
- **URL**: `GET /file-watcher/is-watched`
- **描述**: 检查文件是否被监控
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **查询参数**: `path` - 文件路径
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "检查完成",
    "data": {
      "isWatched": true,
      "path": "./waf_rules/main.json",
      "events": 5
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN或OPERATOR角色

### 16.4 重新加载文件监控
- **URL**: `POST /file-watcher/reload`
- **描述**: 重新加载文件监控
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "文件监控重新加载成功",
    "data": {
      "watchedFiles": 5,
      "reloadedAt": "2025-11-10T05:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN角色

### 16.5 添加监控路径
- **URL**: `POST /file-watcher/watch-path`
- **描述**: 添加监控路径
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "path": "./waf_rules/custom"
  }
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "监控路径添加成功",
    "data": {
      "path": "./waf_rules/custom",
      "addedAt": "2025-11-10T05:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN角色

### 16.6 移除监控路径
- **URL**: `DELETE /file-watcher/watch-path`
- **描述**: 移除监控路径
- **请求头**: 
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "path": "./waf_rules/custom"
  }
  ```
- **响应体**:
  ```json
  {
    "code": 200,
    "message": "监控路径移除成功",
    "data": {
      "path": "./waf_rules/custom",
      "removedAt": "2025-11-10T05:00:00.000Z"
    },
    "timestamp": 1729425600000
  }
  ```
- **认证**: 需要JWT访问令牌 + ADMIN角色

---

## 错误处理

所有API错误都会返回统一的错误格式：

```json
{
  "code": 401,
  "message": "未授权访问",
  "error": "Unauthorized",
  "timestamp": 1729425600000
}
```

常见错误码：
- `400`: 请求参数错误
- `401`: 未授权（令牌无效或过期）
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 资源冲突（如用户名已存在）
- `422`: 请求参数验证失败
- `500`: 服务器内部错误

## 注意事项

1. **认证**: 除特别说明外，所有API都需要在请求头中携带有效的JWT Token
   ```
   Authorization: Bearer <access_token>
   ```

2. **角色权限**: 
   - `ADMIN`: 管理员，拥有所有权限
   - `OPERATOR`: 操作员，拥有查看和编辑权限

3. **分页参数**:
   - `page`: 页码，从1开始
   - `pageSize`: 每页数量，默认20，最大100

4. **时间格式**: 所有时间参数使用ISO 8601格式
   ```
   2025-11-10T12:00:00.000Z
   ```

5. **时间范围参数**:
   - `1h`: 最近1小时
   - `24h`: 最近24小时
   - `7d`: 最近7天
   - `30d`: 最近30天

6. **开发环境**:
   - 默认管理员账户: username: `admin`, password: `admin123`
   - 默认操作员账户: username: `operator`, password: `operator123`

7. **邮件配置**:
   - 支持QQ邮箱SMTP: smtp.qq.com:587
   - 支持163邮箱SMTP: smtp.163.com:465
   - 需要使用授权码而非密码

---

