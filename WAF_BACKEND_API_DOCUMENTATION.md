# WAF管理后端接口文档

## 文档说明

本文档详细描述了WAF管理后端系统的所有API接口，包括请求参数、响应格式和示例。所有接口均采用RESTful风格，使用JSON格式进行数据交换。

### 基础信息

- **服务地址**: `http://localhost:3000`
- **API版本**: v1
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

### 通用响应格式

所有接口均采用统一的响应格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": 1729425600000
}
```

### 错误响应格式

```json
{
  "code": 400,
  "message": "请求参数错误",
  "data": null,
  "timestamp": 1729425600000
}
```

### 认证说明

除了登录接口外，所有接口都需要在请求头中携带有效的JWT Token：

```
Authorization: Bearer <access_token>
```

---

## 1. 应用基础接口

### 1.1 获取应用信息

**接口地址**: `GET /`

**接口描述**: 获取应用基础信息

**请求参数**: 无

**请求示例**:
```http
GET / HTTP/1.1
Host: localhost:3000
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": "Hello World!",
  "timestamp": 1729425600000
}
```

---

## 2. 认证管理接口

### 2.1 用户登录

**接口地址**: `POST /auth/login`

**接口描述**: 用户使用用户名和密码登录系统

**请求参数**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**请求示例**:
```http
POST /auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW5fdXBkYXRlZCIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcyOTQyNTYwMCwiZXhwIjoxNzI5NDI2NTAwfQ.example",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW5fdXBkYXRlZCIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcyOTQyNTYwMCwiZXhwIjoxNzMwMDMwNDAwfQ.example",
    "expires_in": 900,
    "token_type": "Bearer"
  },
  "timestamp": 1729425600000
}
```

**失败响应示例**:
```json
{
  "code": 401,
  "message": "用户名或密码错误",
  "data": null,
  "timestamp": 1729425600000
}
```

### 2.2 刷新令牌

**接口地址**: `POST /auth/refresh`

**接口描述**: 使用刷新令牌获取新的访问令牌

**请求参数**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW5fdXBkYXRlZCIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcyOTQyNTYwMCwiZXhwIjoxNzMwMDMwNDAwfQ.example"
}
```

**请求示例**:
```http
POST /auth/refresh HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW5fdXBkYXRlZCIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcyOTQyNTYwMCwiZXhwIjoxNzMwMDMwNDAwfQ.example"
}
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "令牌刷新成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW5fdXBkYXRlZCIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcyOTQyNTYwMCwiZXhwIjoxNzI5NDI2NTAwfQ.new_example",
    "expires_in": 900,
    "token_type": "Bearer"
  },
  "timestamp": 1729425600000
}
```

**失败响应示例**:
```json
{
  "code": 401,
  "message": "刷新令牌无效或已过期",
  "data": null,
  "timestamp": 1729425600000
}
```

### 2.3 获取用户信息

**接口地址**: `GET /auth/profile`

**接口描述**: 获取当前登录用户的详细信息

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求示例**:
```http
GET /auth/profile HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW5fdXBkYXRlZCIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcyOTQyNTYwMCwiZXhwIjoxNzI5NDI2NTAwfQ.example
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取用户信息成功",
  "data": {
    "id": 1,
    "username": "admin_updated",
    "role": "ADMIN",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

**失败响应示例**:
```json
{
  "code": 401,
  "message": "未授权访问",
  "data": null,
  "timestamp": 1729425600000
}
```

### 2.4 退出登录

**接口地址**: `POST /auth/logout`

**接口描述**: 使当前用户的刷新令牌失效

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求示例**:
```http
POST /auth/logout HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW5fdXBkYXRlZCIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcyOTQyNTYwMCwiZXhwIjoxNzI5NDI2NTAwfQ.example
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "退出登录成功",
  "data": null,
  "timestamp": 1729425600000
}
```

**失败响应示例**:
```json
{
  "code": 401,
  "message": "未授权访问",
  "data": null,
  "timestamp": 1729425600000
}
```

---

## 3. 用户管理接口

### 3.1 创建用户

**接口地址**: `POST /users`

**接口描述**: 创建新的用户账户

**权限要求**: ADMIN

**请求参数**:
```json
{
  "username": "newuser",
  "password": "password123",
  "role": "OPERATOR"
}
```

**字段说明**:
- `username`: 用户名，必填，字符串
- `password`: 密码，必填，最少8位字符
- `role`: 用户角色，必填，枚举值（ADMIN/OPERATOR）

**请求示例**:
```http
POST /users HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "role": "OPERATOR"
}
```

**成功响应示例**:
```json
{
  "code": 201,
  "message": "用户创建成功",
  "data": {
    "id": 2,
    "username": "newuser",
    "role": "OPERATOR",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

**失败响应示例**:
```json
{
  "code": 409,
  "message": "用户名已存在",
  "data": null,
  "timestamp": 1729425600000
}
```

### 3.2 获取当前用户信息

**接口地址**: `GET /users/profile`

**接口描述**: 获取当前登录用户的详细信息

**请求示例**:
```http
GET /users/profile HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取用户信息成功",
  "data": {
    "id": 1,
    "username": "admin_updated",
    "role": "ADMIN",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

### 3.3 获取用户列表

**接口地址**: `GET /users`

**接口描述**: 获取所有用户列表，支持分页和搜索

**权限要求**: ADMIN

**请求参数**:
- `page`: 页码，默认1
- `pageSize`: 每页大小，默认20
- `search`: 搜索关键词（用户名）

**请求示例**:
```http
GET /users?page=1&pageSize=20&search=admin HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取用户列表成功",
  "data": {
    "items": [
      {
        "id": 1,
        "username": "admin_updated",
        "role": "ADMIN",
        "createdAt": "2025-01-01T00:00:00.000Z"
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

### 3.4 获取用户统计

**接口地址**: `GET /users/stats`

**接口描述**: 获取用户相关的统计信息

**权限要求**: ADMIN

**请求示例**:
```http
GET /users/stats HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取用户统计成功",
  "data": {
    "total": 10,
    "active": 8,
    "inactive": 2,
    "byRole": {
      "ADMIN": 2,
      "OPERATOR": 8
    }
  },
  "timestamp": 1729425600000
}
```

### 3.5 检查用户名可用性

**接口地址**: `GET /users/check-username/:username`

**接口描述**: 检查用户名是否已被占用

**权限要求**: ADMIN

**请求示例**:
```http
GET /users/check-username/newuser?excludeId=1 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "检查完成",
  "data": {
    "username": "newuser",
    "isTaken": false,
    "available": true
  },
  "timestamp": 1729425600000
}
```

### 3.6 获取用户详情

**接口地址**: `GET /users/:id`

**接口描述**: 根据ID获取用户详细信息

**权限要求**: ADMIN

**请求示例**:
```http
GET /users/1 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取用户详情成功",
  "data": {
    "id": 1,
    "username": "admin_updated",
    "role": "ADMIN",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

**失败响应示例**:
```json
{
  "code": 404,
  "message": "用户不存在",
  "data": null,
  "timestamp": 1729425600000
}
```

### 3.7 更新用户

**接口地址**: `PUT /users/:id`

**接口描述**: 更新指定用户的信息

**权限要求**: ADMIN

**请求参数**:
```json
{
  "username": "updateduser",
  "password": "newpassword123",
  "role": "OPERATOR"
}
```

**字段说明**:
- `username`: 用户名，可选，字符串
- `password`: 密码，可选，最少8位字符
- `role`: 用户角色，可选，枚举值（ADMIN/OPERATOR）

**请求示例**:
```http
PUT /users/2 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "username": "updateduser",
  "role": "OPERATOR"
}
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "用户更新成功",
  "data": {
    "id": 2,
    "username": "updateduser",
    "role": "OPERATOR",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

### 3.8 删除用户

**接口地址**: `DELETE /users/:id`

**接口描述**: 删除指定的用户

**权限要求**: ADMIN

**请求示例**:
```http
DELETE /users/2 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 204,
  "message": "用户删除成功",
  "data": null,
  "timestamp": 1729425600000
}
```

**失败响应示例**:
```json
{
  "code": 404,
  "message": "用户不存在",
  "data": null,
  "timestamp": 1729425600000
}
```

### 3.9 批量删除用户

**接口地址**: `POST /users/batch`

**接口描述**: 批量删除多个用户

**权限要求**: ADMIN

**请求参数**:
```json
{
  "userIds": [2, 3, 4]
}
```

**请求示例**:
```http
POST /users/batch HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "userIds": [2, 3, 4]
}
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "批量删除完成",
  "data": {
    "success": 3,
    "failed": 0,
    "details": []
  },
  "timestamp": 1729425600000
}
```

---

## 4. WAF规则管理接口

### 4.1 获取规则列表

**接口地址**: `GET /rules`

**接口描述**: 获取所有WAF规则，支持分页、过滤和搜索

**权限要求**: ADMIN, OPERATOR

**请求参数**:
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

**请求示例**:
```http
GET /rules?page=1&pageSize=20&target=ALL_PARAMS&action=DENY&isActive=true HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
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
        "action": "DENY",
        "score": 50,
        "priority": 1,
        "isActive": true,
        "tags": ["sqli", "high"],
        "description": "SQL注入检测规则",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
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

### 4.2 获取规则统计

**接口地址**: `GET /rules/stats`

**接口描述**: 获取WAF规则的统计信息

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
GET /rules/stats HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取规则统计成功",
  "data": {
    "total": 100,
    "active": 80,
    "inactive": 20,
    "byTarget": {
      "ALL_PARAMS": 40,
      "URI": 20,
      "BODY": 15,
      "HEADER": 10,
      "CLIENT_IP": 15
    },
    "byAction": {
      "DENY": 60,
      "LOG": 30,
      "BYPASS": 10
    },
    "byMatchType": {
      "CONTAINS": 50,
      "REGEX": 30,
      "EXACT": 15,
      "CIDR": 5
    }
  },
  "timestamp": 1729425600000
}
```

### 4.3 获取目标类型

**接口地址**: `GET /rules/targets`

**接口描述**: 获取所有可用的规则目标类型

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
GET /rules/targets HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取目标类型成功",
  "data": ["CLIENT_IP", "URI", "ALL_PARAMS", "ARGS_COMBINED", "ARGS_NAME", "ARGS_VALUE", "BODY", "HEADER"],
  "timestamp": 1729425600000
}
```

### 4.4 获取动作类型

**接口地址**: `GET /rules/actions`

**接口描述**: 获取所有可用的规则动作类型

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
GET /rules/actions HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取动作类型成功",
  "data": ["DENY", "LOG", "BYPASS"],
  "timestamp": 1729425600000
}
```

### 4.5 获取匹配类型

**接口地址**: `GET /rules/match-types`

**接口描述**: 获取所有可用的规则匹配类型

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
GET /rules/match-types HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取匹配类型成功",
  "data": ["CONTAINS", "EXACT", "REGEX", "CIDR"],
  "timestamp": 1729425600000
}
```

### 4.6 获取规则分类

**接口地址**: `GET /rules/categories`

**接口描述**: 获取所有可用的规则分类

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
GET /rules/categories HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取规则分类成功",
  "data": {
    "xss": 15,
    "sqli": 40,
    "rce": 20,
    "lfi": 10,
    "dir_traversal": 10,
    "custom": 5
  },
  "timestamp": 1729425600000
}
```

### 4.7 获取WAF配置

**接口地址**: `GET /rules/config`

**接口描述**: 获取WAF模块的配置信息

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
GET /rules/config HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取WAF配置成功",
  "data": {
    "wafRulesPath": "/usr/local/nginx/conf/waf/rules",
    "wafRulesMainFile": "main.json",
    "nginxConfigPath": "/usr/local/nginx/conf",
    "nginxBinaryPath": "/usr/local/nginx/sbin/nginx",
    "lastSyncTime": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

### 4.8 获取规则状态

**接口地址**: `GET /rules/status`

**接口描述**: 获取规则模块的运行状态

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
GET /rules/status HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取规则状态成功",
  "data": {
    "total": 100,
    "active": 80,
    "inactive": 20,
    "lastSync": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

### 4.9 导出规则

**接口地址**: `GET /rules/export`

**接口描述**: 导出所有规则为JSON格式

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
GET /rules/export HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "导出规则成功",
  "data": [
    {
      "id": 1,
      "ruleId": 1001,
      "target": "ALL_PARAMS",
      "match": "CONTAINS",
      "pattern": "attack",
      "action": "DENY",
      "score": 50,
      "priority": 1,
      "isActive": true,
      "tags": ["sqli", "high"],
      "description": "SQL注入检测规则"
    }
  ],
  "timestamp": 1729425600000
}
```

### 4.10 获取导入信息

**接口地址**: `GET /rules/import`

**接口描述**: 获取导入规则的信息

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
GET /rules/import HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取导入规则信息成功",
  "data": {
    "supportedFormats": ["json"],
    "maxSize": "10MB",
    "description": "请使用POST方法上传规则文件"
  },
  "timestamp": 1729425600000
}
```

### 4.11 获取批量操作信息

**接口地址**: `GET /rules/batch`

**接口描述**: 获取批量操作的信息

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
GET /rules/batch HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取批量操作信息成功",
  "data": {
    "supportedOperations": ["CREATE", "UPDATE", "DELETE"],
    "maxBatchSize": 100,
    "description": "请使用POST方法执行批量操作"
  },
  "timestamp": 1729425600000
}
```

### 4.12 获取规则详情

**接口地址**: `GET /rules/:id`

**接口描述**: 根据ID获取规则详细信息

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
GET /rules/1001 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
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
    "action": "DENY",
    "score": 50,
    "priority": 1,
    "isActive": true,
    "tags": ["sqli", "high"],
    "description": "SQL注入检测规则",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

**失败响应示例**:
```json
{
  "code": 404,
  "message": "规则不存在",
  "data": null,
  "timestamp": 1729425600000
}
```

### 4.13 创建规则

**接口地址**: `POST /rules`

**接口描述**: 创建新的WAF规则

**权限要求**: ADMIN, OPERATOR

**请求参数**:
```json
{
  "ruleId": 1002,
  "target": "ALL_PARAMS",
  "match": "CONTAINS",
  "pattern": "<script>",
  "action": "DENY",
  "score": 40,
  "priority": 2,
  "isActive": true,
  "tags": ["xss", "medium"],
  "description": "XSS攻击检测规则"
}
```

**请求示例**:
```http
POST /rules HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "ruleId": 1002,
  "target": "ALL_PARAMS",
  "match": "CONTAINS",
  "pattern": "<script>",
  "action": "DENY",
  "score": 40,
  "priority": 2,
  "isActive": true,
  "tags": ["xss", "medium"],
  "description": "XSS攻击检测规则"
}
```

**成功响应示例**:
```json
{
  "code": 201,
  "message": "规则创建成功",
  "data": {
    "id": 2,
    "ruleId": 1002,
    "target": "ALL_PARAMS",
    "match": "CONTAINS",
    "pattern": "<script>",
    "action": "DENY",
    "score": 40,
    "priority": 2,
    "isActive": true,
    "tags": ["xss", "medium"],
    "description": "XSS攻击检测规则",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

**失败响应示例**:
```json
{
  "code": 409,
  "message": "规则ID已存在",
  "data": null,
  "timestamp": 1729425600000
}
```

### 4.14 更新规则

**接口地址**: `PUT /rules/:id`

**接口描述**: 更新指定规则的信息

**权限要求**: ADMIN, OPERATOR

**请求参数**:
```json
{
  "pattern": "<script>alert(1)</script>",
  "score": 45,
  "isActive": false
}
```

**请求示例**:
```http
PUT /rules/1002 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "pattern": "<script>alert(1)</script>",
  "score": 45,
  "isActive": false
}
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "规则更新成功",
  "data": {
    "id": 2,
    "ruleId": 1002,
    "target": "ALL_PARAMS",
    "match": "CONTAINS",
    "pattern": "<script>alert(1)</script>",
    "action": "DENY",
    "score": 45,
    "priority": 2,
    "isActive": false,
    "tags": ["xss", "medium"],
    "description": "XSS攻击检测规则",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T01:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

### 4.15 删除规则

**接口地址**: `DELETE /rules/:id`

**接口描述**: 删除指定的规则

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
DELETE /rules/1002 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 204,
  "message": "规则删除成功",
  "data": null,
  "timestamp": 1729425600000
}
```

**失败响应示例**:
```json
{
  "code": 404,
  "message": "规则不存在",
  "data": null,
  "timestamp": 1729425600000
}
```

### 4.16 切换规则状态

**接口地址**: `POST /rules/:id/toggle`

**接口描述**: 启用或禁用指定规则

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
POST /rules/1002/toggle HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "规则状态切换成功",
  "data": {
    "id": 2,
    "ruleId": 1002,
    "isActive": true,
    "updatedAt": "2025-01-01T02:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

### 4.17 批量操作规则

**接口地址**: `POST /rules/batch`

**接口描述**: 批量创建、更新或删除规则

**权限要求**: ADMIN, OPERATOR

**请求参数**:
```json
{
  "operation": "UPDATE",
  "rules": [
    {
      "ruleId": 1001,
      "isActive": false
    },
    {
      "ruleId": 1002,
      "score": 60
    }
  ]
}
```

**请求示例**:
```http
POST /rules/batch HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "operation": "UPDATE",
  "rules": [
    {
      "ruleId": 1001,
      "isActive": false
    },
    {
      "ruleId": 1002,
      "score": 60
    }
  ]
}
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "批量操作完成",
  "data": {
    "success": 2,
    "failed": 0,
    "details": []
  },
  "timestamp": 1729425600000
}
```

### 4.18 同步规则

**接口地址**: `POST /rules/sync`

**接口描述**: 从文件系统同步规则到数据库

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
POST /rules/sync HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "规则同步完成",
  "data": {
    "synced": 10,
    "updated": 5,
    "created": 5,
    "failed": 0
  },
  "timestamp": 1729425600000
}
```

### 4.19 验证规则

**接口地址**: `POST /rules/validate`

**接口描述**: 验证规则配置的有效性

**权限要求**: ADMIN, OPERATOR

**请求参数**:
```json
{
  "ruleId": 1003,
  "target": "ALL_PARAMS",
  "match": "CONTAINS",
  "pattern": "test",
  "action": "DENY"
}
```

**请求示例**:
```http
POST /rules/validate HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "ruleId": 1003,
  "target": "ALL_PARAMS",
  "match": "CONTAINS",
  "pattern": "test",
  "action": "DENY"
}
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "规则验证通过",
  "data": {
    "isValid": true
  },
  "timestamp": 1729425600000
}
```

**失败响应示例**:
```json
{
  "code": 400,
  "message": "规则配置不完整，缺少必要字段",
  "data": null,
  "timestamp": 1729425600000
}
```

### 4.20 测试Nginx配置

**接口地址**: `POST /rules/config/test-nginx`

**接口描述**: 测试Nginx配置文件的有效性

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
POST /rules/config/test-nginx HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "Nginx配置测试成功",
  "data": {
    "success": true,
    "output": "nginx: configuration file test is successful"
  },
  "timestamp": 1729425600000
}
```

### 4.21 重载Nginx配置

**接口地址**: `POST /rules/config/reload-nginx`

**接口描述**: 重新加载Nginx配置文件

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
POST /rules/config/reload-nginx HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "Nginx重载成功",
  "data": {
    "success": true,
    "output": "nginx: configuration reloaded"
  },
  "timestamp": 1729425600000
}
```

---

## 5. WAF规则集管理接口

### 5.1 获取规则集列表

**接口地址**: `GET /rules/sets`

**接口描述**: 获取所有WAF规则集，支持分页、过滤和搜索

**权限要求**: ADMIN, OPERATOR

**请求参数**:
- `page`: 页码，默认1
- `pageSize`: 每页大小，默认20
- `sortBy`: 排序字段，默认createdAt
- `sortOrder`: 排序方式，默认DESC
- `isActive`: 按激活状态过滤
- `search`: 按名称搜索
- `tags`: 按标签过滤（多个标签用逗号分隔）

**请求示例**:
```http
GET /rules/sets?page=1&pageSize=20&isActive=true&search=main HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取规则集列表成功",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "main",
        "version": 1,
        "meta": {
          "name": "main",
          "extends": ["./base.json"],
          "duplicatePolicy": "warn_skip"
        },
        "isActive": true,
        "ruleCount": 10,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
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

### 5.2 获取规则集详情

**接口地址**: `GET /rules/sets/:name`

**接口描述**: 根据名称获取规则集详细信息

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
GET /rules/sets/main HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取规则集详情成功",
  "data": {
    "id": 1,
    "name": "main",
    "version": 1,
    "meta": {
      "name": "main",
      "extends": ["./base.json"],
      "duplicatePolicy": "warn_skip"
    },
    "disableById": [1001],
    "disableByTag": ["test"],
    "rules": [
      {
        "id": 1002,
        "target": "ALL_PARAMS",
        "match": "CONTAINS",
        "pattern": "test",
        "action": "DENY"
      }
    ],
    "isActive": true,
    "ruleCount": 1,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

### 5.3 创建规则集

**接口地址**: `POST /rules/sets`

**接口描述**: 创建新的WAF规则集

**权限要求**: ADMIN, OPERATOR

**请求参数**:
```json
{
  "name": "custom",
  "version": 1,
  "meta": {
    "name": "custom",
    "extends": ["./base.json"],
    "duplicatePolicy": "warn_skip"
  },
  "rules": [
    {
      "id": 2001,
      "target": "URI",
      "match": "EXACT",
      "pattern": "/test",
      "action": "BYPASS"
    }
  ]
}
```

**请求示例**:
```http
POST /rules/sets HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "custom",
  "version": 1,
  "meta": {
    "name": "custom",
    "extends": ["./base.json"],
    "duplicatePolicy": "warn_skip"
  },
  "rules": [
    {
      "id": 2001,
      "target": "URI",
      "match": "EXACT",
      "pattern": "/test",
      "action": "BYPASS"
    }
  ]
}
```

**成功响应示例**:
```json
{
  "code": 201,
  "message": "规则集创建成功",
  "data": {
    "id": 2,
    "name": "custom",
    "version": 1,
    "meta": {
      "name": "custom",
      "extends": ["./base.json"],
      "duplicatePolicy": "warn_skip"
    },
    "isActive": true,
    "ruleCount": 1,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

### 5.4 更新规则集

**接口地址**: `PUT /rules/sets/:name`

**接口描述**: 更新指定规则集的信息

**权限要求**: ADMIN, OPERATOR

**请求参数**:
```json
{
  "version": 2,
  "isActive": false
}
```

**请求示例**:
```http
PUT /rules/sets/custom HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "version": 2,
  "isActive": false
}
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "规则集更新成功",
  "data": {
    "id": 2,
    "name": "custom",
    "version": 2,
    "isActive": false,
    "updatedAt": "2025-01-01T01:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

### 5.5 删除规则集

**接口地址**: `DELETE /rules/sets/:name`

**接口描述**: 删除指定的规则集

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
DELETE /rules/sets/custom HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 204,
  "message": "规则集删除成功",
  "data": null,
  "timestamp": 1729425600000
}
```

### 5.6 同步规则集

**接口地址**: `POST /rules/sets/sync`

**接口描述**: 从规则集文件同步到数据库

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
POST /rules/sets/sync HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "规则集同步完成",
  "data": {
    "synced": 5,
    "updated": 3,
    "created": 2,
    "failed": 0
  },
  "timestamp": 1729425600000
}
```

### 5.7 同步到文件系统

**接口地址**: `POST /rules/sets/:name/sync-to-file`

**接口描述**: 将规则集同步到文件系统

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
POST /rules/sets/main/sync-to-file HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "同步到文件系统成功",
  "data": {
    "filePath": "/usr/local/nginx/conf/waf/rules/main.json",
    "syncedAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

### 5.8 添加规则到规则集

**接口地址**: `POST /rules/sets/:name/rules/:ruleId`

**接口描述**: 将指定规则添加到规则集中

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
POST /rules/sets/main/rules/1001 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "规则添加到规则集成功",
  "data": {
    "ruleSetName": "main",
    "ruleId": 1001,
    "addedAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

### 5.9 从规则集移除规则

**接口地址**: `DELETE /rules/sets/:name/rules/:ruleId`

**接口描述**: 将指定规则从规则集中移除

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
DELETE /rules/sets/main/rules/1001 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "规则从规则集移除成功",
  "data": {
    "ruleSetName": "main",
    "ruleId": 1001,
    "removedAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

### 5.10 切换规则集状态

**接口地址**: `POST /rules/sets/:name/toggle`

**接口描述**: 启用或禁用指定规则集

**权限要求**: ADMIN, OPERATOR

**请求参数**:
- `isActive`: 目标状态（true/false）

**请求示例**:
```http
POST /rules/sets/main/toggle?isActive=false HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "规则集状态切换成功",
  "data": {
    "name": "main",
    "isActive": false,
    "updatedAt": "2025-01-01T01:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

### 5.11 验证规则集

**接口地址**: `POST /rules/sets/validate`

**接口描述**: 验证规则集配置的有效性

**权限要求**: ADMIN, OPERATOR

**请求参数**:
```json
{
  "name": "test",
  "version": 1,
  "meta": {
    "name": "test",
    "extends": ["./base.json"]
  },
  "rules": []
}
```

**请求示例**:
```http
POST /rules/sets/validate HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "test",
  "version": 1,
  "meta": {
    "name": "test",
    "extends": ["./base.json"]
  },
  "rules": []
}
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "规则集验证通过",
  "data": {
    "isValid": true
  },
  "timestamp": 1729425600000
}
```

### 5.12 获取规则集统计

**接口地址**: `GET /rules/sets/stats`

**接口描述**: 获取WAF规则集的统计信息

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
GET /rules/sets/stats HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取规则集统计成功",
  "data": {
    "total": 10,
    "active": 8,
    "inactive": 2,
    "totalRules": 100,
    "averageRulesPerSet": 10
  },
  "timestamp": 1729425600000
}
```

---

## 6. 系统监控接口

### 6.1 获取系统健康状态

**接口地址**: `GET /system/health`

**接口描述**: 获取系统健康状态

**请求示例**:
```http
GET /system/health HTTP/1.1
Host: localhost:3000
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "系统健康状态获取成功",
  "data": {
    "status": "healthy",
    "uptime": 86400,
    "timestamp": "2025-01-01T00:00:00.000Z",
    "version": "1.0.0",
    "system_resources": {
      "cpu_usage": 45.2,
      "memory_usage": 68.5,
      "disk_usage": 32.1,
      "load_average": [0.5, 0.6, 0.7]
    },
    "service_status": {
      "database": "connected",
      "nginx": "running",
      "waf_module": "active"
    },
    "performance": {
      "response_time": 120,
      "request_rate": 150,
      "error_rate": 0.5
    },
    "security_events": {
      "blocked_requests": 50,
      "attack_attempts": 25,
      "unique_attackers": 10
    },
    "rule_info": {
      "total_rules": 100,
      "active_rules": 80,
      "last_update": "2025-01-01T00:00:00.000Z"
    }
  },
  "timestamp": 1729425600000
}
```

### 6.2 获取系统状态摘要

**接口地址**: `GET /system/summary`

**接口描述**: 获取系统状态摘要

**请求示例**:
```http
GET /system/summary HTTP/1.1
Host: localhost:3000
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "系统状态摘要获取成功",
  "data": {
    "overall_status": "healthy",
    "critical_alerts": 0,
    "warnings": 2,
    "uptime": 86400,
    "last_restart": "2024-12-31T00:00:00.000Z",
    "summary": {
      "system_health": "good",
      "performance": "normal",
      "security": "stable",
      "rules": "updated"
    }
  },
  "timestamp": 1729425600000
}
```

### 6.3 检查系统告警阈值

**接口地址**: `GET /system/alerts`

**接口描述**: 检查系统告警阈值

**请求示例**:
```http
GET /system/alerts HTTP/1.1
Host: localhost:3000
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "系统告警检查完成",
  "data": {
    "alerts": [
      {
        "level": "warning",
        "type": "cpu_usage",
        "message": "CPU使用率超过阈值",
        "current_value": 85.2,
        "threshold": 80.0,
        "timestamp": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total_alerts": 1,
    "critical": 0,
    "warning": 1,
    "info": 0
  },
  "timestamp": 1729425600000
}
```

### 6.4 获取详细监控指标

**接口地址**: `GET /system/metrics`

**接口描述**: 获取详细监控指标

**请求参数**:
- `type`: 指标类型（resources|performance|security|rules|all），默认all

**请求示例**:
```http
GET /system/metrics?type=resources HTTP/1.1
Host: localhost:3000
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "监控指标获取成功",
  "data": {
    "cpu_usage": 45.2,
    "memory_usage": 68.5,
    "disk_usage": 32.1,
    "load_average": [0.5, 0.6, 0.7],
    "network_io": {
      "bytes_in": 1024000,
      "bytes_out": 512000
    }
  },
  "timestamp": 1729425600000
}
```

### 6.5 获取服务状态

**接口地址**: `GET /system/status`

**接口描述**: 获取各服务状态

**请求示例**:
```http
GET /system/status HTTP/1.1
Host: localhost:3000
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "服务状态获取成功",
  "data": {
    "database": {
      "status": "connected",
      "response_time": 5,
      "last_check": "2025-01-01T00:00:00.000Z"
    },
    "nginx": {
      "status": "running",
      "version": "1.18.0",
      "uptime": 86400
    },
    "waf_module": {
      "status": "active",
      "rules_loaded": 80,
      "last_reload": "2025-01-01T00:00:00.000Z"
    }
  },
  "timestamp": 1729425600000
}
```

### 6.6 获取性能指标

**接口地址**: `GET /system/performance`

**接口描述**: 获取性能指标

**请求示例**:
```http
GET /system/performance HTTP/1.1
Host: localhost:3000
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "性能指标获取成功",
  "data": {
    "response_time": 120,
    "request_rate": 150,
    "error_rate": 0.5,
    "throughput": 1000,
    "concurrent_connections": 50,
    "peak_response_time": 250,
    "avg_response_time": 120
  },
  "timestamp": 1729425600000
}
```

### 6.7 获取安全指标

**接口地址**: `GET /system/security`

**接口描述**: 获取安全指标

**请求示例**:
```http
GET /system/security HTTP/1.1
Host: localhost:3000
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "安全指标获取成功",
  "data": {
    "blocked_requests": 50,
    "attack_attempts": 25,
    "unique_attackers": 10,
    "top_attack_types": {
      "sql_injection": 10,
      "xss": 8,
      "directory_traversal": 5
    },
    "blocked_ips": 15,
    "reputation_scores": {
      "high_risk": 5,
      "medium_risk": 10,
      "low_risk": 20
    }
  },
  "timestamp": 1729425600000
}
```

### 6.8 获取系统信息

**接口地址**: `GET /system/info`

**接口描述**: 获取系统信息

**请求示例**:
```http
GET /system/info HTTP/1.1
Host: localhost:3000
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "系统信息获取成功",
  "data": {
    "system_resources": {
      "cpu_usage": 45.2,
      "memory_usage": 68.5,
      "disk_usage": 32.1,
      "load_average": [0.5, 0.6, 0.7]
    },
    "service_status": {
      "database": "connected",
      "nginx": "running",
      "waf_module": "active"
    },
    "rule_info": {
      "total_rules": 100,
      "active_rules": 80,
      "last_update": "2025-01-01T00:00:00.000Z"
    }
  },
  "timestamp": 1729425600000
}
```

### 6.9 获取统计数据

**接口地址**: `GET /system/stats`

**接口描述**: 获取统计数据

**请求示例**:
```http
GET /system/stats HTTP/1.1
Host: localhost:3000
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "统计数据获取成功",
  "data": {
    "request_stats": {
      "total_requests": 10000,
      "blocked_requests": 500,
      "allowed_requests": 9500,
      "requests_per_minute": 150
    },
    "security_events": {
      "total_events": 100,
      "high_severity": 20,
      "medium_severity": 50,
      "low_severity": 30
    },
    "rule_info": {
      "total_rules": 100,
      "active_rules": 80,
      "rules_triggered": 25
    }
  },
  "timestamp": 1729425600000
}
```

### 6.10 获取日志统计信息

**接口地址**: `GET /system/logs/stats`

**接口描述**: 获取日志统计信息

**请求示例**:
```http
GET /system/logs/stats HTTP/1.1
Host: localhost:3000
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "日志统计信息获取成功",
  "data": {
    "total_logs": 50000,
    "error_logs": 100,
    "warning_logs": 500,
    "info_logs": 49400,
    "logs_by_service": {
      "auth": 5000,
      "rules": 10000,
      "system": 35000
    },
    "recent_errors": [
      {
        "timestamp": "2025-01-01T00:00:00.000Z",
        "level": "ERROR",
        "service": "auth",
        "message": "Authentication failed for user: test"
      }
    ]
  },
  "timestamp": 1729425600000
}
```

### 6.11 查询日志

**接口地址**: `GET /system/logs`

**接口描述**: 查询系统日志

**请求参数**:
- `level`: 日志级别（INFO|WARN|ERROR|DEBUG）
- `service`: 服务名称
- `startTime`: 开始时间（ISO字符串）
- `endTime`: 结束时间（ISO字符串）
- `limit`: 返回数量限制
- `offset`: 偏移量

**请求示例**:
```http
GET /system/logs?level=ERROR&limit=50&offset=0 HTTP/1.1
Host: localhost:3000
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "日志查询成功",
  "data": {
    "logs": [
      {
        "timestamp": "2025-01-01T00:00:00.000Z",
        "level": "ERROR",
        "service": "auth",
        "message": "Authentication failed for user: test",
        "metadata": {
          "ip": "192.168.1.100",
          "user_agent": "Mozilla/5.0..."
        }
      }
    ],
    "total": 100,
    "limit": 50,
    "offset": 0
  },
  "timestamp": 1729425600000
}
```

### 6.12 获取错误日志趋势

**接口地址**: `GET /system/logs/trends`

**接口描述**: 获取错误日志趋势

**请求参数**:
- `hours`: 时间范围（小时），默认24

**请求示例**:
```http
GET /system/logs/trends?hours=24 HTTP/1.1
Host: localhost:3000
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "错误日志趋势获取成功",
  "data": {
    "time_range": "24 hours",
    "trends": [
      {
        "hour": "2025-01-01T00:00:00.000Z",
        "error_count": 5,
        "warning_count": 15
      }
    ],
    "summary": {
      "total_errors": 100,
      "peak_hour": "2025-01-01T14:00:00.000Z",
      "trend_direction": "decreasing"
    }
  },
  "timestamp": 1729425600000
}
```

### 6.13 获取服务健康状态

**接口地址**: `GET /system/logs/health`

**接口描述**: 获取各服务健康状态

**请求示例**:
```http
GET /system/logs/health HTTP/1.1
Host: localhost:3000
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "服务健康状态获取成功",
  "data": {
    "services": [
      {
        "name": "auth",
        "status": "healthy",
        "last_check": "2025-01-01T00:00:00.000Z",
        "response_time": 5,
        "error_rate": 0.1
      },
      {
        "name": "rules",
        "status": "healthy",
        "last_check": "2025-01-01T00:00:00.000Z",
        "response_time": 10,
        "error_rate": 0.2
      }
    ],
    "overall_health": "healthy"
  },
  "timestamp": 1729425600000
}
```

---

## 7. 日志管理接口

### 7.1 日志搜索

**接口地址**: `GET /logs/search`

**接口描述**: 搜索WAF日志和访问日志

**权限要求**: ADMIN, OPERATOR

**请求参数**:
- `keyword`: 搜索关键词（必需）
- `type`: 日志类型（waf/access）
- `startDate`: 开始日期
- `endDate`: 结束日期

**请求示例**:
```http
GET /logs/search?keyword=attack&type=waf&startDate=2025-01-01&endDate=2025-01-02 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "日志搜索完成",
  "data": {
    "waf": [
      {
        "timestamp": "2025-01-01T00:00:00.000Z",
        "clientIp": "192.168.1.100",
        "method": "POST",
        "uri": "/api/login",
        "action": "BLOCK",
        "ruleId": 1001,
        "pattern": "attack"
      }
    ],
    "access": [],
    "total": 1
  },
  "timestamp": 1729425600000
}
```

### 7.2 导出日志

**接口地址**: `POST /logs/export`

**接口描述**: 导出WAF日志或访问日志

**权限要求**: ADMIN, OPERATOR

**请求参数**:
```json
{
  "type": "waf",
  "dateRange": {
    "start": "2025-01-01",
    "end": "2025-01-02"
  }
}
```

**请求示例**:
```http
POST /logs/export HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "type": "waf",
  "dateRange": {
    "start": "2025-01-01",
    "end": "2025-01-02"
  }
}
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "日志导出成功",
  "data": {
    "type": "waf",
    "dateRange": {
      "start": "2025-01-01",
      "end": "2025-01-02"
    },
    "data": [],
    "exportedAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

### 7.3 日志分析

**接口地址**: `GET /logs/analysis`

**接口描述**: 分析日志数据和趋势

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
GET /logs/analysis HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "日志分析完成",
  "data": {
    "totalRequests": 10000,
    "blockedRequests": 500,
    "topAttackTypes": [
      {
        "type": "SQL注入",
        "count": 200
      },
      {
        "type": "XSS",
        "count": 150
      }
    ],
    "timeDistribution": {
      "hourly": [100, 150, 200, 180, 160],
      "daily": [1000, 1200, 1100, 1300, 900]
    }
  },
  "timestamp": 1729425600000
}
```

### 7.4 清理日志

**接口地址**: `POST /logs/clear`

**接口描述**: 清理指定日期之前的日志

**权限要求**: ADMIN, OPERATOR

**请求参数**:
```json
{
  "type": "waf",
  "before": "2025-01-01"
}
```

**请求示例**:
```http
POST /logs/clear HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "type": "waf",
  "before": "2025-01-01"
}
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "日志清理完成",
  "data": {
    "type": "waf",
    "before": "2025-01-01",
    "clearedCount": 500,
    "clearedAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

### 7.5 获取实时日志

**接口地址**: `GET /logs/realtime`

**接口描述**: 获取实时日志流

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
GET /logs/realtime HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取实时日志成功",
  "data": {
    "waf": [
      {
        "time": "2025-01-01T00:00:00.000Z",
        "clientIp": "192.168.1.100",
        "method": "POST",
        "uri": "/api/login",
        "action": "BLOCK",
        "ruleId": 1234,
        "pattern": "<script>"
      }
    ],
    "access": [
      {
        "time": "2025-01-01T00:00:00.000Z",
        "ip": "192.168.1.101",
        "method": "GET",
        "uri": "/api/users",
        "status": 200,
        "responseTime": 45
      }
    ]
  },
  "timestamp": 1729425600000
}
```

---

## 8. WAF日志接口

### 8.1 查询WAF审计日志

**接口地址**: `GET /logs/waf`

**接口描述**: 查询WAF审计日志

**权限要求**: ADMIN, OPERATOR

**请求参数**:
- `page`: 页码，默认1
- `pageSize`: 每页大小，默认20
- `startTime`: 开始时间
- `endTime`: 结束时间
- `clientIp`: 客户端IP
- `action`: 动作类型
- `ruleId`: 规则ID

**请求示例**:
```http
GET /logs/waf?page=1&pageSize=20&startTime=2025-01-01&endTime=2025-01-02 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "items": [
      {
        "id": 1,
        "timestamp": "2025-01-01T00:00:00.000Z",
        "clientIp": "192.168.1.100",
        "method": "POST",
        "uri": "/api/login",
        "protocol": "HTTP/1.1",
        "host": "localhost",
        "userAgent": "Mozilla/5.0...",
        "action": "BLOCK",
        "ruleId": 1001,
        "pattern": "attack",
        "score": 50,
        "finalAction": "BLOCK",
        "requestId": "req_123456"
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

### 8.2 获取WAF日志统计信息

**接口地址**: `GET /logs/waf/stats`

**接口描述**: 获取WAF日志统计信息

**权限要求**: ADMIN, OPERATOR

**请求参数**:
- `startTime`: 开始时间
- `endTime`: 结束时间

**请求示例**:
```http
GET /logs/waf/stats?startTime=2025-01-01&endTime=2025-01-02 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "totalLogs": 1000,
    "blockedLogs": 50,
    "allowedLogs": 950,
    "bypassLogs": 0,
    "uniqueIps": 100,
    "topAttacks": [
      {
        "type": "xss",
        "count": 20,
        "percentage": 2.0
      }
    ],
    "topRules": [
      {
        "ruleId": 1001,
        "count": 15,
        "percentage": 1.5
      }
    ],
    "topIps": [
      {
        "ip": "192.168.1.100",
        "count": 10,
        "blockedCount": 5
      }
    ]
  },
  "timestamp": 1729425600000
}
```

### 8.3 导出WAF日志

**接口地址**: `GET /logs/waf/export`

**接口描述**: 导出WAF日志

**权限要求**: ADMIN, OPERATOR

**请求参数**: 同查询WAF审计日志接口

**请求示例**:
```http
GET /logs/waf/export?page=1&pageSize=10000 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 501,
  "message": "日志导出功能正在开发中",
  "data": null,
  "timestamp": 1729425600000
}
```

---

## 9. 访问日志接口

### 9.1 查询访问日志

**接口地址**: `GET /logs/access`

**接口描述**: 查询访问日志

**权限要求**: ADMIN, OPERATOR

**请求参数**:
- `page`: 页码，默认1
- `pageSize`: 每页大小，默认20
- `startTime`: 开始时间
- `endTime`: 结束时间
- `ip`: 客户端IP
- `method`: 请求方法
- `uri`: 请求URI
- `status`: 响应状态码

**请求示例**:
```http
GET /logs/access?page=1&pageSize=20&startTime=2025-01-01&endTime=2025-01-02 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "items": [
      {
        "id": 1,
        "timestamp": "2025-01-01T00:00:00.000Z",
        "ip": "192.168.1.100",
        "method": "GET",
        "uri": "/api/users",
        "protocol": "HTTP/1.1",
        "host": "localhost",
        "status": 200,
        "bytes": 1024,
        "responseTime": 45,
        "userAgent": "Mozilla/5.0...",
        "referer": "http://localhost:3000"
      }
    ],
    "total": 5000,
    "page": 1,
    "pageSize": 20,
    "totalPages": 250
  },
  "timestamp": 1729425600000
}
```

### 9.2 获取访问日志统计信息

**接口地址**: `GET /logs/access/stats`

**接口描述**: 获取访问日志统计信息

**权限要求**: ADMIN, OPERATOR

**请求参数**:
- `startTime`: 开始时间
- `endTime`: 结束时间

**请求示例**:
```http
GET /logs/access/stats?startTime=2025-01-01&endTime=2025-01-02 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "totalRequests": 5000,
    "blockedRequests": 50,
    "allowedRequests": 4950,
    "uniqueIps": 200,
    "avgResponseTime": 0.245,
    "totalBytes": 12500000,
    "topPaths": [
      {
        "path": "/api/users",
        "count": 500,
        "percentage": 10.0
      }
    ],
    "topIps": [
      {
        "ip": "192.168.1.100",
        "count": 100,
        "bytes": 250000,
        "blockedCount": 5
      }
    ],
    "statusDistribution": [
      {
        "status": 200,
        "count": 4000,
        "percentage": 80.0
      }
    ]
  },
  "timestamp": 1729425600000
}
```

### 9.3 获取热门访问路径

**接口地址**: `GET /logs/access/top-paths`

**接口描述**: 获取热门访问路径

**权限要求**: ADMIN, OPERATOR

**请求参数**:
- `limit`: 返回数量限制，默认10
- `startTime`: 开始时间
- `endTime`: 结束时间

**请求示例**:
```http
GET /logs/access/top-paths?limit=10&startTime=2025-01-01&endTime=2025-01-02 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "path": "/api/users",
      "count": 500,
      "percentage": 10.0
    }
  ],
  "timestamp": 1729425600000
}
```

### 9.4 获取热门访问IP

**接口地址**: `GET /logs/access/top-ips`

**接口描述**: 获取热门访问IP

**权限要求**: ADMIN, OPERATOR

**请求参数**:
- `limit`: 返回数量限制，默认10
- `startTime`: 开始时间
- `endTime`: 结束时间

**请求示例**:
```http
GET /logs/access/top-ips?limit=10&startTime=2025-01-01&endTime=2025-01-02 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "ip": "192.168.1.100",
      "count": 100,
      "bytes": 250000,
      "blockedCount": 5
    }
  ],
  "timestamp": 1729425600000
}
```

### 9.5 导出访问日志

**接口地址**: `GET /logs/access/export`

**接口描述**: 导出访问日志

**权限要求**: ADMIN, OPERATOR

**请求参数**: 同查询访问日志接口

**请求示例**:
```http
GET /logs/access/export?page=1&pageSize=10000 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 501,
  "message": "日志导出功能正在开发中",
  "data": null,
  "timestamp": 1729425600000
}
```

---

## 10. 日志统计接口

### 10.1 获取日志统计信息

**接口地址**: `GET /logs/stats`

**接口描述**: 获取日志统计信息

**权限要求**: ADMIN, OPERATOR

**请求参数**:
- `timeRange`: 时间范围（1h|24h|7d|30d）
- `groupBy`: 分组方式（minute|hour|day|week）
- `metric`: 指标类型（count|unique_ips|blocked_rate）

**请求示例**:
```http
GET /logs/stats?timeRange=24h&groupBy=hour&metric=count HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "timeRange": "24h",
    "groupBy": "hour",
    "metric": "count",
    "data": [
      {
        "key": "2025-10-20T10h",
        "value": 150,
        "percentage": 15.0
      }
    ],
    "total": 1000
  },
  "timestamp": 1729425600000
}
```

### 10.2 获取日志统计摘要

**接口地址**: `GET /logs/stats/summary`

**接口描述**: 获取日志统计摘要

**权限要求**: ADMIN, OPERATOR

**请求参数**: 同获取日志统计信息接口

**请求示例**:
```http
GET /logs/stats/summary?timeRange=24h HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "totalLogs": 1000,
    "timeRange": "24h",
    "topAttackTypes": [
      {
        "type": "xss",
        "count": 200,
        "percentage": 20.0
      }
    ],
    "topTargetIps": [
      {
        "ip": "192.168.1.100",
        "count": 50,
        "attackCount": 25
      }
    ],
    "topRules": [
      {
        "ruleId": 1001,
        "count": 30,
        "blockCount": 15
      }
    ],
    "timeline": [
      {
        "timestamp": "2025-10-20",
        "total": 100,
        "blocked": 10,
        "allowed": 90
      }
    ]
  },
  "timestamp": 1729425600000
}
```

### 10.3 获取日志分析数据

**接口地址**: `GET /logs/stats/analytics`

**接口描述**: 获取日志分析数据

**权限要求**: ADMIN, OPERATOR

**请求参数**: 同获取日志统计信息接口

**请求示例**:
```http
GET /logs/stats/analytics?timeRange=24h HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "attackDistribution": {
      "xss": 200,
      "sqli": 150,
      "rce": 50
    },
    "severityDistribution": {
      "high": 100,
      "medium": 200,
      "low": 100
    },
    "timeSeriesData": [
      {
        "timestamp": 1729425600000,
        "value": 150,
        "label": "10h"
      }
    ],
    "heatmapData": [
      {
        "hour": 10,
        "day": 1,
        "value": 25
      }
    ]
  },
  "timestamp": 1729425600000
}
```

### 10.4 获取日志趋势数据

**接口地址**: `GET /logs/stats/trends`

**接口描述**: 获取日志趋势数据

**权限要求**: ADMIN, OPERATOR

**请求参数**:
- `timeRange`: 时间范围，默认24h
- `metric`: 指标类型，默认count

**请求示例**:
```http
GET /logs/stats/trends?timeRange=24h&metric=count HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "key": "2025-10-20T10h",
      "value": 150,
      "percentage": 15.0
    }
  ],
  "timestamp": 1729425600000
}
```

### 10.5 获取仪表板数据

**接口地址**: `GET /logs/stats/dashboard`

**接口描述**: 获取仪表板数据

**权限要求**: ADMIN, OPERATOR

**请求参数**: 同获取日志统计信息接口

**请求示例**:
```http
GET /logs/stats/dashboard?timeRange=24h HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "summary": {
      "totalLogs": 1000,
      "timeRange": "24h"
    },
    "analytics": {
      "attackDistribution": {
        "xss": 200,
        "sqli": 150
      }
    },
    "recentStats": {
      "timeRange": "1h",
      "groupBy": "hour",
      "metric": "count",
      "data": []
    }
  },
  "timestamp": 1729425600000
}
```

---

## 11. 文件监控接口

### 11.1 获取文件监控统计信息

**接口地址**: `GET /file-watcher/stats`

**接口描述**: 获取文件监控统计信息

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
GET /file-watcher/stats HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取文件监控统计信息成功",
  "data": {
    "watchedFiles": 10,
    "lastSyncTime": "2025-01-01T00:00:00.000Z",
    "totalEvents": 100,
    "eventsByType": {
      "add": 30,
      "change": 50,
      "unlink": 20
    }
  },
  "timestamp": 1729425600000
}
```

### 11.2 获取当前监控的文件列表

**接口地址**: `GET /file-watcher/watched-files`

**接口描述**: 获取当前监控的文件列表

**权限要求**: ADMIN, OPERATOR

**请求示例**:
```http
GET /file-watcher/watched-files HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "获取监控文件列表成功",
  "data": {
    "/usr/local/nginx/conf/waf/rules": [
      "main.json",
      "base.json"
    ]
  },
  "timestamp": 1729425600000
}
```

### 11.3 检查文件是否被监控

**接口地址**: `GET /file-watcher/is-watched`

**接口描述**: 检查文件是否被监控

**权限要求**: ADMIN, OPERATOR

**请求参数**:
- `path`: 文件路径

**请求示例**:
```http
GET /file-watcher/is-watched?path=/usr/local/nginx/conf/waf/rules/main.json HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "检查文件监控状态成功",
  "data": {
    "path": "/usr/local/nginx/conf/waf/rules/main.json",
    "isWatched": true
  },
  "timestamp": 1729425600000
}
```

### 11.4 重新加载文件监控

**接口地址**: `POST /file-watcher/reload`

**接口描述**: 重新加载文件监控

**权限要求**: ADMIN

**请求示例**:
```http
POST /file-watcher/reload HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "重新加载文件监控成功",
  "data": {
    "success": true
  },
  "timestamp": 1729425600000
}
```

### 11.5 添加监控路径

**接口地址**: `POST /file-watcher/watch-path`

**接口描述**: 添加监控路径

**权限要求**: ADMIN

**请求参数**:
```json
{
  "path": "/usr/local/nginx/conf/waf/custom"
}
```

**请求示例**:
```http
POST /file-watcher/watch-path HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "path": "/usr/local/nginx/conf/waf/custom"
}
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "添加监控路径成功",
  "data": {
    "path": "/usr/local/nginx/conf/waf/custom",
    "success": true
  },
  "timestamp": 1729425600000
}
```

### 11.6 移除监控路径

**接口地址**: `DELETE /file-watcher/watch-path`

**接口描述**: 移除监控路径

**权限要求**: ADMIN

**请求参数**:
```json
{
  "path": "/usr/local/nginx/conf/waf/custom"
}
```

**请求示例**:
```http
DELETE /file-watcher/watch-path HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "path": "/usr/local/nginx/conf/waf/custom"
}
```

**成功响应示例**:
```json
{
  "code": 200,
  "message": "移除监控路径成功",
  "data": {
    "path": "/usr/local/nginx/conf/waf/custom",
    "success": true
  },
  "timestamp": 1729425600000
}
```

---

## 文档结束

**注意事项**:

1. 所有时间戳均为Unix时间戳（毫秒）
2. 所有日期时间格式均为ISO 8601格式
3. 需要认证的接口必须在请求头中携带有效的JWT Token
4. 部分接口需要特定的用户权限才能访问
5. 分页接口的页码从1开始
6. 批量操作接口有最大数量限制
7. 导出功能目前处于开发阶段，可能返回501状态码

**更新时间**: 2025-01-01
**文档版本**: v1.0.0