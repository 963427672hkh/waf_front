# 前端接口配置指南

本文档详细说明了告警管理页面和规则配置页面所需的后端接口配置。

## 目录

1. [告警管理接口](#告警管理接口)
2. [规则配置接口](#规则配置接口)
3. [WebSocket配置](#websocket配置)
4. [环境变量配置](#环境变量配置)

---

## 告警管理接口

### 1. 获取告警列表

**接口地址**: `GET /api/alerts`

**请求参数**:
```javascript
{
  page: 1,           // 页码，默认1
  pageSize: 20,      // 每页大小，默认20
  status: 'pending', // 可选：pending | processing | resolved | ignored
  level: 'critical', // 可选：critical | high | medium | low | info
  type: 'attack',    // 可选：attack | traffic | security | system | unknown
  keyword: '搜索关键词' // 可选：搜索告警内容、IP地址等
}
```

**响应格式**:
```json
{
  "code": 200,
  "message": "获取告警列表成功",
  "data": {
    "list": [
      {
        "id": "alert-1",
        "title": "攻击告警: SQL注入检测",
        "message": "检测到SQL注入攻击，需要及时处理",
        "level": "critical",
        "type": "attack",
        "status": "pending",
        "sourceIP": "192.168.1.100",
        "target": "example.com/api",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z",
        "progress": 0,
        "handler": null,
        "handleRecords": []
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

**告警对象字段说明**:
- `id`: 告警唯一标识
- `title`: 告警标题
- `message`: 告警详细内容
- `level`: 告警级别（critical | high | medium | low | info）
- `type`: 告警类型（attack | traffic | security | system | unknown）
- `status`: 告警状态（pending | processing | resolved | ignored）
- `sourceIP`: 来源IP地址
- `target`: 目标地址
- `createdAt`: 创建时间（ISO 8601格式）
- `updatedAt`: 更新时间（ISO 8601格式）
- `progress`: 处理进度（0-100，仅当status为processing时有效）
- `handler`: 处理人（可选）
- `handleRecords`: 处理记录数组（可选）

---

### 2. 获取告警统计信息

**接口地址**: `GET /api/alerts/stats`

**响应格式**:
```json
{
  "code": 200,
  "message": "获取告警统计成功",
  "data": {
    "total": 100,
    "pending": 20,
    "processing": 10,
    "resolved": 60,
    "ignored": 10,
    "critical": 15
  },
  "timestamp": 1729425600000
}
```

---

### 3. 获取单个告警详情

**接口地址**: `GET /api/alerts/:alertId`

**响应格式**:
```json
{
  "code": 200,
  "message": "获取告警详情成功",
  "data": {
    "id": "alert-1",
    "title": "攻击告警: SQL注入检测",
    "message": "检测到SQL注入攻击，需要及时处理",
    "level": "critical",
    "type": "attack",
    "status": "processing",
    "sourceIP": "192.168.1.100",
    "target": "example.com/api",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T01:00:00.000Z",
    "progress": 50,
    "handler": "管理员",
    "handleRecords": [
      {
        "createdAt": "2025-01-01T01:00:00.000Z",
        "action": "开始处理",
        "handler": "管理员",
        "note": "已开始分析攻击特征"
      }
    ]
  },
  "timestamp": 1729425600000
}
```

---

### 4. 更新告警状态

**接口地址**: `PUT /api/alerts/:alertId/status`

**请求体**:
```json
{
  "status": "processing"  // pending | processing | resolved | ignored
}
```

**响应格式**:
```json
{
  "code": 200,
  "message": "更新告警状态成功",
  "data": {
    "id": "alert-1",
    "status": "processing"
  },
  "timestamp": 1729425600000
}
```

---

### 5. 批量更新告警状态

**接口地址**: `PUT /api/alerts/batch-status`

**请求体**:
```json
{
  "alertIds": ["alert-1", "alert-2", "alert-3"],
  "status": "resolved"
}
```

**响应格式**:
```json
{
  "code": 200,
  "message": "批量更新告警状态成功",
  "data": {
    "success": 3,
    "failed": 0
  },
  "timestamp": 1729425600000
}
```

---

### 6. 添加告警处理记录

**接口地址**: `POST /api/alerts/:alertId/handle`

**请求体**:
```json
{
  "action": "开始处理",
  "handler": "管理员",
  "note": "已开始分析攻击特征"
}
```

**响应格式**:
```json
{
  "code": 200,
  "message": "添加处理记录成功",
  "data": {
    "recordId": "record-1",
    "createdAt": "2025-01-01T01:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

---

### 7. 获取告警处理进度

**接口地址**: `GET /api/alerts/:alertId/progress`

**响应格式**:
```json
{
  "code": 200,
  "message": "获取告警处理进度成功",
  "data": {
    "alertId": "alert-1",
    "progress": 75,
    "handler": "管理员",
    "updatedAt": "2025-01-01T01:30:00.000Z"
  },
  "timestamp": 1729425600000
}
```

---

### 8. 标记告警为已处理

**接口地址**: `PUT /api/alerts/:alertId/handle`

**响应格式**:
```json
{
  "code": 200,
  "message": "标记告警为已处理成功",
  "data": {
    "id": "alert-1",
    "status": "resolved",
    "progress": 100
  },
  "timestamp": 1729425600000
}
```

---

### 9. 批量标记告警为已处理

**接口地址**: `PUT /api/alerts/batch-handle`

**请求体**:
```json
{
  "alertIds": ["alert-1", "alert-2", "alert-3"]
}
```

**响应格式**:
```json
{
  "code": 200,
  "message": "批量标记告警为已处理成功",
  "data": {
    "success": 3,
    "failed": 0
  },
  "timestamp": 1729425600000
}
```

---

### 10. 删除告警

**接口地址**: `DELETE /api/alerts/:alertId`

**响应格式**:
```json
{
  "code": 200,
  "message": "删除告警成功",
  "data": null,
  "timestamp": 1729425600000
}
```

---

### 11. 批量删除告警

**接口地址**: `DELETE /api/alerts/batch`

**请求体**:
```json
{
  "alertIds": ["alert-1", "alert-2", "alert-3"]
}
```

**响应格式**:
```json
{
  "code": 200,
  "message": "批量删除告警成功",
  "data": {
    "success": 3,
    "failed": 0
  },
  "timestamp": 1729425600000
}
```

---

### 12. 获取告警类型列表

**接口地址**: `GET /api/alerts/types`

**响应格式**:
```json
{
  "code": 200,
  "message": "获取告警类型列表成功",
  "data": ["attack", "traffic", "security", "system", "unknown"],
  "timestamp": 1729425600000
}
```

---

### 13. 获取告警级别列表

**接口地址**: `GET /api/alerts/levels`

**响应格式**:
```json
{
  "code": 200,
  "message": "获取告警级别列表成功",
  "data": ["critical", "high", "medium", "low", "info"],
  "timestamp": 1729425600000
}
```

---

### 14. 导出告警数据

**接口地址**: `GET /api/alerts/export`

**请求参数**: 同获取告警列表接口

**响应**: 返回JSON格式的Blob数据

---

## 规则配置接口

### 1. 获取规则列表

**接口地址**: `GET /api/rules`

**请求参数**:
```javascript
{
  page: 1,              // 页码，默认1
  pageSize: 20,         // 每页大小，默认20
  sortBy: 'ruleId',     // 排序字段，默认ruleId
  sortOrder: 'ASC',     // 排序方式，ASC | DESC
  target: 'ALL_PARAMS', // 可选：按目标类型过滤
  action: 'DENY',       // 可选：按动作类型过滤
  matchType: 'CONTAINS', // 可选：按匹配类型过滤
  isActive: true,       // 可选：按激活状态过滤
  tags: 'sqli,high',   // 可选：按标签过滤（多个标签用逗号分隔）
  search: 'SQL注入'    // 可选：按描述搜索
}
```

**响应格式**:
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
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  },
  "timestamp": 1729425600000
}
```

**规则对象字段说明**:
- `id`: 数据库主键ID
- `ruleId`: 规则ID（业务标识，唯一）
- `target`: 目标类型（CLIENT_IP | URI | ALL_PARAMS | ARGS_COMBINED | ARGS_NAME | ARGS_VALUE | BODY | HEADER）
- `match`: 匹配类型（CONTAINS | EXACT | REGEX | CIDR）
- `pattern`: 匹配模式（字符串、正则表达式等）
- `action`: 动作类型（DENY | LOG | BYPASS）
- `score`: 规则评分（可选，数字）
- `priority`: 优先级（可选，数字越小优先级越高）
- `isActive`: 是否激活（true | false）
- `tags`: 标签数组（可选，如：["sqli", "high"]）
- `description`: 规则描述（可选）
- `createdAt`: 创建时间（ISO 8601格式）
- `updatedAt`: 更新时间（ISO 8601格式）

---

### 2. 获取规则统计信息

**接口地址**: `GET /api/rules/stats`

**响应格式**:
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

---

### 3. 获取目标类型

**接口地址**: `GET /api/rules/targets`

**响应格式**:
```json
{
  "code": 200,
  "message": "获取目标类型成功",
  "data": [
    "CLIENT_IP",
    "URI",
    "ALL_PARAMS",
    "ARGS_COMBINED",
    "ARGS_NAME",
    "ARGS_VALUE",
    "BODY",
    "HEADER"
  ],
  "timestamp": 1729425600000
}
```

---

### 4. 获取动作类型

**接口地址**: `GET /api/rules/actions`

**响应格式**:
```json
{
  "code": 200,
  "message": "获取动作类型成功",
  "data": ["DENY", "LOG", "BYPASS"],
  "timestamp": 1729425600000
}
```

---

### 5. 获取匹配类型

**接口地址**: `GET /api/rules/match-types`

**响应格式**:
```json
{
  "code": 200,
  "message": "获取匹配类型成功",
  "data": ["CONTAINS", "EXACT", "REGEX", "CIDR"],
  "timestamp": 1729425600000
}
```

---

### 6. 获取规则详情

**接口地址**: `GET /api/rules/:ruleId`

**响应格式**:
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

---

### 7. 创建规则

**接口地址**: `POST /api/rules`

**请求体**:
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

**响应格式**:
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

---

### 8. 更新规则

**接口地址**: `PUT /api/rules/:ruleId`

**请求体**:
```json
{
  "pattern": "<script>alert(1)</script>",
  "score": 45,
  "isActive": false,
  "description": "更新后的规则描述"
}
```

**注意**: 可以只更新部分字段

**响应格式**:
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
    "description": "更新后的规则描述",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T01:00:00.000Z"
  },
  "timestamp": 1729425600000
}
```

---

### 9. 删除规则

**接口地址**: `DELETE /api/rules/:ruleId`

**响应格式**:
```json
{
  "code": 204,
  "message": "规则删除成功",
  "data": null,
  "timestamp": 1729425600000
}
```

---

### 10. 切换规则状态

**接口地址**: `POST /api/rules/:ruleId/toggle`

**响应格式**:
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

---

### 11. 批量操作规则

**接口地址**: `POST /api/rules/batch`

**请求体**:
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

**operation可选值**: `CREATE` | `UPDATE` | `DELETE`

**响应格式**:
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

---

### 12. 同步规则

**接口地址**: `POST /api/rules/sync`

**响应格式**:
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

---

### 13. 验证规则

**接口地址**: `POST /api/rules/validate`

**请求体**:
```json
{
  "ruleId": 1003,
  "target": "ALL_PARAMS",
  "match": "CONTAINS",
  "pattern": "test",
  "action": "DENY"
}
```

**响应格式**:
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

**验证失败时**:
```json
{
  "code": 400,
  "message": "规则配置不完整，缺少必要字段",
  "data": {
    "isValid": false,
    "errors": ["缺少target字段", "缺少pattern字段"]
  },
  "timestamp": 1729425600000
}
```

---

### 14. 导出规则

**接口地址**: `GET /api/rules/export`

**请求参数**: 同获取规则列表接口

**响应**: 返回JSON格式的Blob数据

---

## WebSocket配置

### 告警实时推送

**WebSocket地址**: 通过环境变量 `VITE_WAF_WS` 配置，默认 `ws://localhost:3000`

**连接方式**:
```javascript
const ws = new WebSocket('ws://localhost:3000')
```

**消息格式**:

#### 1. 新告警推送
```json
{
  "type": "alert",
  "id": "alert-123",
  "title": "新告警: SQL注入检测",
  "message": "检测到SQL注入攻击",
  "level": "critical",
  "type": "attack",
  "sourceIP": "192.168.1.100",
  "target": "example.com/api",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

#### 2. 告警更新推送
```json
{
  "type": "alert_update",
  "alertId": "alert-123",
  "status": "processing",
  "progress": 50,
  "handler": "管理员",
  "updatedAt": "2025-01-01T01:00:00.000Z"
}
```

**心跳机制**:
- 前端每20秒发送一次ping消息: `{"type": "ping"}`
- 后端应响应pong消息: `{"type": "pong"}`

---

## 环境变量配置

在项目根目录创建或修改 `.env` 文件：

```bash
# API基础地址
VITE_API_BASE_URL=http://localhost:3000/api

# WebSocket地址
VITE_WAF_WS=ws://localhost:3000
```

**说明**:
- `VITE_API_BASE_URL`: 后端API的基础地址，前端所有API请求会以此为基础路径
- `VITE_WAF_WS`: WebSocket服务器地址，用于实时接收告警数据

---

## 认证说明

所有接口都需要在请求头中携带JWT Token：

```
Authorization: Bearer <access_token>
```

Token应该存储在localStorage中，key为 `waf_access_token`。

---

## 错误处理

所有接口都应该遵循统一的错误响应格式：

```json
{
  "code": 400,  // HTTP状态码或业务错误码
  "message": "错误描述信息",
  "data": null,
  "timestamp": 1729425600000
}
```

**常见错误码**:
- `200`: 成功
- `201`: 创建成功
- `204`: 删除成功（无返回数据）
- `400`: 请求参数错误
- `401`: 未授权（Token无效或过期）
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 资源冲突（如规则ID已存在）
- `500`: 服务器内部错误

---

## 分页说明

所有分页接口应该支持以下参数：
- `page`: 页码（从1开始）
- `pageSize`: 每页大小（默认20）

响应应该包含：
- `items` 或 `list`: 数据数组
- `total`: 总记录数
- `page`: 当前页码
- `pageSize`: 每页大小
- `totalPages`: 总页数

---

## 注意事项

1. **时间格式**: 所有时间字段统一使用ISO 8601格式，例如：`2025-01-01T00:00:00.000Z`

2. **空值处理**: 
   - 可选字段如果为空，应该返回 `null` 而不是空字符串
   - 数组字段如果为空，应该返回 `[]` 而不是 `null`

3. **CORS配置**: 
   后端需要配置CORS，允许前端域名访问

4. **请求超时**: 
   前端设置了10秒的请求超时，后端接口应在合理时间内响应

5. **批量操作**: 
   批量操作接口应该有合理的最大数量限制（建议100条）

6. **规则ID唯一性**: 
   规则ID（ruleId）应该是唯一的，创建规则时如果ID已存在，应返回409错误

7. **告警ID唯一性**: 
   告警ID应该是全局唯一的，建议使用UUID或时间戳+随机数

---

## 测试建议

1. **使用Postman或类似工具**测试所有接口
2. **模拟数据**: 如果后端接口未实现，前端会自动使用模拟数据，不影响开发测试
3. **错误场景**: 测试各种错误情况（400、401、404、500等）
4. **WebSocket**: 使用WebSocket客户端工具测试实时推送功能

---

## 快速开始

### 1. 启动后端服务

确保后端服务运行在 `http://localhost:3000`

### 2. 配置环境变量

创建 `.env` 文件并配置：
```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WAF_WS=ws://localhost:3000
```

### 3. 启动前端服务

```bash
npm run dev
```

### 4. 访问页面

- 告警管理: 在Dashboard中点击"告警管理"
- 规则配置: 在Dashboard中点击"规则配置"

---

**文档更新时间**: 2025-01-01
**文档版本**: v1.0.0

