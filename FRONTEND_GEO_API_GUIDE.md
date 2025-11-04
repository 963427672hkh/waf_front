# IP地理位置接口前端对接文档

## 概述

本文档提供IP地理位置查询接口的前端对接指南，包括接口说明、请求格式、响应格式和示例代码。

## 接口基础信息

- **基础URL**: `http://localhost:3000`
- **认证方式**: JWT Bearer Token
- **内容类型**: `application/json`
- **接口前缀**: 无（不带/api前缀）

## 认证说明

**地理位置接口无需认证**，可以直接调用，无需在请求头中添加Authorization。

其他需要认证的接口（如仪表板数据）仍需要JWT认证：
```http
Authorization: Bearer <access_token>
```

获取令牌接口：
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

## 接口列表

### 1. 查询单个IP地理位置

**接口地址**: `GET /geo/ip`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ip | string | 是 | 要查询的IP地址 |

**请求示例**:
```http
GET /geo/ip?ip=8.8.8.8
```

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "ip": "8.8.8.8",
    "country": "US",
    "region": "",
    "city": "",
    "latitude": 37.751,
    "longitude": -97.822,
    "timezone": "America/Chicago"
  },
  "timestamp": 1762139798334
}
```

**响应字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| ip | string | 查询的IP地址 |
| country | string | 国家代码（如US、CN等） |
| region | string | 地区/省份 |
| city | string | 城市 |
| latitude | number | 纬度 |
| longitude | number | 经度 |
| timezone | string | 时区 |

### 2. 批量查询IP地理位置

**接口地址**: `GET /geo/batch`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ips | string | 是 | IP地址列表，逗号分隔 |

**请求示例**:
```http
GET /geo/batch?ips=8.8.8.8,1.1.1.1,114.114.114.114
```

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "ip": "8.8.8.8",
      "country": "US",
      "region": "",
      "city": "",
      "latitude": 37.751,
      "longitude": -97.822,
      "timezone": "America/Chicago"
    },
    {
      "ip": "1.1.1.1",
      "country": "",
      "region": "",
      "city": "",
      "latitude": null,
      "longitude": null,
      "timezone": ""
    },
    {
      "ip": "114.114.114.114",
      "country": "CN",
      "region": "",
      "city": "",
      "latitude": 34.7732,
      "longitude": 113.722,
      "timezone": "Asia/Shanghai"
    }
  ],
  "timestamp": 1762139806838
}
```

### 3. 统计国家分布

**接口地址**: `GET /geo/countries`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ips | string | 是 | IP地址和数量列表，格式：ip1:count1,ip2:count2 |

**请求示例**:
```http
GET /geo/countries?ips=8.8.8.8:10,114.114.114.114:20,1.1.1.1:5
```

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "name": "中国",
      "value": 20,
      "percentage": 57
    },
    {
      "name": "美国",
      "value": 10,
      "percentage": 29
    },
    {
      "name": "未知",
      "value": 5,
      "percentage": 14
    }
  ],
  "timestamp": 1762139811544
}
```

**响应字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| name | string | 国家名称（中文） |
| value | number | 访问次数 |
| percentage | number | 占比（百分比） |

### 4. 获取仪表板地理位置数据

**接口地址**: `GET /dashboard/geo`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| timeRange | string | 否 | 时间范围（1h, 6h, 24h, 7d, 30d） |

**请求示例**:
```http
GET /dashboard/geo?timeRange=24h
```

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "countries": [
      {
        "name": "中国",
        "value": 100,
        "percentage": 70
      },
      {
        "name": "美国",
        "value": 30,
        "percentage": 21
      },
      {
        "name": "日本",
        "value": 14,
        "percentage": 9
      }
    ]
  },
  "timestamp": 1762139815511
}
```

## 前端集成示例

### JavaScript/TypeScript 示例

```typescript
// API配置
const API_BASE_URL = 'http://localhost:3000';
let accessToken = '';

// 登录获取令牌
async function login() {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  accessToken = data.data.accessToken;
  return accessToken;
}

// 查询单个IP地理位置（无需认证）
async function getIpLocation(ip: string) {
  const response = await fetch(`${API_BASE_URL}/geo/ip?ip=${ip}`);
  
  return await response.json();
}

// 批量查询IP地理位置（无需认证）
async function getBatchIpLocations(ips: string[]) {
  const response = await fetch(`${API_BASE_URL}/geo/batch?ips=${ips.join(',')}`);
  
  return await response.json();
}

// 获取国家分布统计（无需认证）
async function getCountryStats(ipStats: Array<{ip: string, count: number}>) {
  const ipParams = ipStats.map(item => `${item.ip}:${item.count}`).join(',');
  const response = await fetch(`${API_BASE_URL}/geo/countries?ips=${ipParams}`);
  
  return await response.json();
}

// 获取仪表板地理位置数据（无需认证）
async function getDashboardGeoData(timeRange = '24h') {
  const response = await fetch(`${API_BASE_URL}/dashboard/geo?timeRange=${timeRange}`);
  
  return await response.json();
}

// 使用示例
async function example() {
  // 先登录
  await login();
  
  // 查询单个IP
  const singleResult = await getIpLocation('8.8.8.8');
  console.log('单个IP查询结果:', singleResult);
  
  // 批量查询
  const batchResult = await getBatchIpLocations(['8.8.8.8', '1.1.1.1', '114.114.114.114']);
  console.log('批量查询结果:', batchResult);
  
  // 国家统计
  const countryStats = await getCountryStats([
    {ip: '8.8.8.8', count: 10},
    {ip: '114.114.114.114', count: 20}
  ]);
  console.log('国家统计结果:', countryStats);
  
  // 仪表板数据
  const dashboardData = await getDashboardGeoData();
  console.log('仪表板数据:', dashboardData);
}
```

### React Hook 示例

```typescript
import { useState, useEffect } from 'react';

interface IpGeoInfo {
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

interface CountryStat {
  name: string;
  value: number;
  percentage: number;
}

// 使用地理位置查询的Hook
export function useGeoLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 获取单个IP地理位置（无需认证）
  const getIpLocation = async (ip: string): Promise<IpGeoInfo | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/geo/ip?ip=${ip}`);
      
      const data = await response.json();
      if (data.code === 200) {
        return data.data;
      } else {
        setError(data.message);
        return null;
      }
    } catch (err) {
      setError('网络错误');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // 获取国家分布（无需认证）
  const getCountryStats = async (ipStats: Array<{ip: string, count: number}>): Promise<CountryStat[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const ipParams = ipStats.map(item => `${item.ip}:${item.count}`).join(',');
      const response = await fetch(`/geo/countries?ips=${ipParams}`);
      
      const data = await response.json();
      if (data.code === 200) {
        return data.data;
      } else {
        setError(data.message);
        return [];
      }
    } catch (err) {
      setError('网络错误');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    error,
    getIpLocation,
    getCountryStats,
  };
}
```

## 错误处理

### 常见错误码

| 错误码 | 说明 | 处理方式 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查IP地址格式 |
| 404 | 接口不存在 | 检查接口地址 |
| 500 | 服务器内部错误 | 联系后端开发人员 |
| 401 | 未授权（仅限需要认证的接口） | 重新登录获取令牌 |

### 错误响应格式

```json
{
  "code": 401,
  "message": "Unauthorized",
  "error": "UnauthorizedException",
  "details": null,
  "timestamp": 1762139787124,
  "path": "/geo/ip?ip=8.8.8.8",
  "method": "GET"
}
```

## 注意事项

1. **地理位置和仪表板接口无需认证**：可以直接调用，无需提供JWT令牌
2. **IP格式**：确保传入的IP地址格式正确（IPv4）
3. **批量查询限制**：建议单次批量查询不超过50个IP
4. **时区处理**：返回的时区为标准时区标识符，如"Asia/Shanghai"
5. **未知地理位置**：对于无法识别的IP，country字段可能为空，归类为"未知"
6. **令牌过期**：仅限需要认证的接口（如用户管理、规则管理等），Access Token有效期为15分钟，过期后需要使用Refresh Token刷新

## Swagger文档

访问 `http://localhost:3000/docs` 查看完整的交互式API文档。

**Swagger认证使用说明**：
1. **地理位置接口**：无需认证，可以直接在Swagger页面中测试
2. **仪表板接口**：无需认证，可以直接在Swagger页面中测试
3. **其他接口**（如用户管理、规则管理等）需要认证：
   - 在Swagger页面右上角点击"Authorize"按钮
   - 在弹出对话框的Value输入框中输入JWT访问令牌（直接输入令牌，无需添加Bearer前缀）
   - 点击"Authorize"按钮确认

注意：系统支持两种令牌格式：
- 直接输入令牌：`eyJhbGciOiJIUzI1NiIs...`（推荐）
- 带Bearer前缀：`Bearer eyJhbGciOiJIUzI1NiIs...`（也支持）

在Swagger中建议使用第一种格式（不带Bearer前缀），这样更简洁且符合其他接口的使用习惯。

**获取访问令牌**：
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

---

# Dashboard仪表板接口文档

## 概述

仪表板接口提供WAF系统的整体数据概览，包括KPI指标、地理位置、QPS、访问趋势、拦截趋势、客户端分析、响应状态码等数据。

**注意：所有Dashboard接口均无需认证**，可以直接调用。

## 时间范围参数

所有仪表板接口都支持以下时间范围参数：

| 参数值 | 说明 |
|--------|------|
| 1h | 最近1小时 |
| 6h | 最近6小时 |
| 24h | 最近24小时（默认） |
| 7d | 最近7天 |
| 30d | 最近30天 |

## 接口列表

### 1. 获取KPI指标数据

**接口地址**: `GET /dashboard/kpi`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| timeRange | string | 否 | 时间范围，默认24h |

**请求示例**:
```http
GET /dashboard/kpi?timeRange=24h
```

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "requests": 150000,
    "pageViews": 120000,
    "uniqueVisitors": 45000,
    "uniqueIPs": 38000,
    "intercepts": 2500,
    "attackIPs": 1200,
    "error4xx": 3500,
    "error4xxRate": 2.33,
    "intercept4xx": 2100,
    "intercept4xxRate": 1.4,
    "error5xx": 800,
    "error5xxRate": 0.53
  },
  "timestamp": 1762139798334
}
```

**响应字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| requests | number | 总请求数 |
| pageViews | number | 页面浏览量 |
| uniqueVisitors | number | 独立访客数 |
| uniqueIPs | number | 独立IP数 |
| intercepts | number | 拦截次数 |
| attackIPs | number | 攻击IP数 |
| error4xx | number | 4xx错误数 |
| error4xxRate | number | 4xx错误率(%) |
| intercept4xx | number | 4xx拦截数 |
| intercept4xxRate | number | 4xx拦截率(%) |
| error5xx | number | 5xx错误数 |
| error5xxRate | number | 5xx错误率(%) |

### 2. 获取地理位置数据

**接口地址**: `GET /dashboard/geo`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| timeRange | string | 否 | 时间范围，默认24h |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "countries": [
      {
        "name": "中国",
        "value": 80000,
        "percentage": 53.3
      },
      {
        "name": "美国",
        "value": 35000,
        "percentage": 23.3
      },
      {
        "name": "日本",
        "value": 20000,
        "percentage": 13.3
      }
    ]
  },
  "timestamp": 1762139806838
}
```

**响应字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| countries | array | 国家分布数组 |
| countries[].name | string | 国家名称 |
| countries[].value | number | 访问次数 |
| countries[].percentage | number | 占比(%) |

### 3. 获取QPS数据

**接口地址**: `GET /dashboard/qps`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| timeRange | string | 否 | 时间范围，默认24h |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "current": 1250,
    "history": [
      {
        "time": "2025-11-03T07:00:00Z",
        "value": 1100
      },
      {
        "time": "2025-11-03T07:05:00Z",
        "value": 1200
      },
      {
        "time": "2025-11-03T07:10:00Z",
        "value": 1250
      }
    ]
  },
  "timestamp": 1762139811544
}
```

**响应字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| current | number | 当前QPS |
| history | array | 历史QPS数据 |
| history[].time | string | 时间点 |
| history[].value | number | QPS值 |

### 4. 获取访问趋势数据

**接口地址**: `GET /dashboard/visit`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| timeRange | string | 否 | 时间范围，默认24h |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "peak": 3500,
    "data": [
      {
        "time": "2025-11-03T07:00:00Z",
        "value": 2500
      },
      {
        "time": "2025-11-03T07:05:00Z",
        "value": 3000
      },
      {
        "time": "2025-11-03T07:10:00Z",
        "value": 3500
      }
    ]
  },
  "timestamp": 1762139815511
}
```

**响应字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| peak | number | 峰值 |
| data | array | 趋势数据 |
| data[].time | string | 时间点 |
| data[].value | number | 访问量 |

### 5. 获取拦截趋势数据

**接口地址**: `GET /dashboard/intercept`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| timeRange | string | 否 | 时间范围，默认24h |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "peak": 180,
    "data": [
      {
        "time": "2025-11-03T07:00:00Z",
        "value": 120
      },
      {
        "time": "2025-11-03T07:05:00Z",
        "value": 150
      },
      {
        "time": "2025-11-03T07:10:00Z",
        "value": 180
      }
    ]
  },
  "timestamp": 1762139820000
}
```

### 6. 获取客户端数据

**接口地址**: `GET /dashboard/client`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| timeRange | string | 否 | 时间范围，默认24h |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "operatingSystems": [
      {
        "name": "Windows",
        "value": 60000,
        "color": "#0078d4"
      },
      {
        "name": "Linux",
        "value": 45000,
        "color": "#0078d4"
      },
      {
        "name": "macOS",
        "value": 30000,
        "color": "#0078d4"
      }
    ],
    "browsers": [
      {
        "name": "Chrome",
        "value": 80000,
        "color": "#4285f4"
      },
      {
        "name": "Firefox",
        "value": 35000,
        "color": "#ff6611"
      },
      {
        "name": "Safari",
        "value": 20000,
        "color": "#007aff"
      }
    ]
  },
  "timestamp": 1762139825000
}
```

**响应字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| operatingSystems | array | 操作系统分布 |
| operatingSystems[].name | string | 操作系统名称 |
| operatingSystems[].value | number | 访问次数 |
| operatingSystems[].color | string | 图表颜色 |
| browsers | array | 浏览器分布 |
| browsers[].name | string | 浏览器名称 |
| browsers[].value | number | 访问次数 |
| browsers[].color | string | 图表颜色 |

### 7. 获取响应状态码数据

**接口地址**: `GET /dashboard/response`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| timeRange | string | 否 | 时间范围，默认24h |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "statusCodes": [
      {
        "code": "200",
        "value": 120000,
        "color": "#28a745"
      },
      {
        "code": "404",
        "value": 2500,
        "color": "#ffc107"
      },
      {
        "code": "500",
        "value": 800,
        "color": "#dc3545"
      }
    ]
  },
  "timestamp": 1762139830000
}
```

### 8. 获取外部域名数据

**接口地址**: `GET /dashboard/external-domains`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| timeRange | string | 否 | 时间范围，默认24h |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "domain": "api.example.com",
      "count": 5000,
      "percentage": 25.0
    },
    {
      "domain": "cdn.example.com",
      "count": 3000,
      "percentage": 15.0
    }
  ],
  "timestamp": 1762139835000
}
```

### 9. 获取外部页面数据

**接口地址**: `GET /dashboard/external-pages`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| timeRange | string | 否 | 时间范围，默认24h |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "url": "/api/users",
      "count": 2000,
      "percentage": 10.0
    },
    {
      "url": "/api/orders",
      "count": 1500,
      "percentage": 7.5
    }
  ],
  "timestamp": 1762139840000
}
```

### 10. 获取访问域名数据

**接口地址**: `GET /dashboard/visited-domains`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| timeRange | string | 否 | 时间范围，默认24h |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "domain": "www.example.com",
      "count": 8000,
      "percentage": 40.0
    },
    {
      "domain": "admin.example.com",
      "count": 4000,
      "percentage": 20.0
    }
  ],
  "timestamp": 1762139845000
}
```

### 11. 获取访问页面数据

**接口地址**: `GET /dashboard/visited-pages`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| timeRange | string | 否 | 时间范围，默认24h |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "url": "/",
      "count": 5000,
      "percentage": 25.0
    },
    {
      "url": "/dashboard",
      "count": 3000,
      "percentage": 15.0
    }
  ],
  "timestamp": 1762139850000
}
```

### 12. 获取完整仪表板数据

**接口地址**: `GET /dashboard/all`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| timeRange | string | 否 | 时间范围，默认24h |

**响应格式**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "kpi": {
      "requests": 150000,
      "pageViews": 120000,
      "uniqueVisitors": 45000,
      "uniqueIPs": 38000,
      "intercepts": 2500,
      "attackIPs": 1200,
      "error4xx": 3500,
      "error4xxRate": 2.33,
      "intercept4xx": 2100,
      "intercept4xxRate": 1.4,
      "error5xx": 800,
      "error5xxRate": 0.53
    },
    "geo": {
      "countries": [
        {
          "name": "中国",
          "value": 80000,
          "percentage": 53.3
        }
      ]
    },
    "qps": {
      "current": 1250,
      "history": []
    },
    "visit": {
      "peak": 3500,
      "data": []
    },
    "intercept": {
      "peak": 180,
      "data": []
    },
    "client": {
      "operatingSystems": [],
      "browsers": []
    },
    "response": {
      "statusCodes": []
    },
    "externalDomains": [],
    "externalPages": [],
    "visitedDomains": [],
    "visitedPages": []
  },
  "timestamp": 1762139855000
}
```

## 前端集成示例

### React Hook 示例

```typescript
import { useState, useEffect } from 'react';

export enum TimeRange {
    ONE_HOUR = '1h',
    SIX_HOURS = '6h',
    ONE_DAY = '24h',
    SEVEN_DAYS = '7d',
    THIRTY_DAYS = '30d',
}

interface DashboardData {
    kpi: {
        requests: number;
        pageViews: number;
        uniqueVisitors: number;
        uniqueIPs: number;
        intercepts: number;
        attackIPs: number;
        error4xx: number;
        error4xxRate: number;
        intercept4xx: number;
        intercept4xxRate: number;
        error5xx: number;
        error5xxRate: number;
    };
    geo: {
        countries: Array<{
            name: string;
            value: number;
            percentage: number;
        }>;
    };
    qps: {
        current: number;
        history: Array<{
            time: string;
            value: number;
        }>;
    };
    // ... 其他数据字段
}

export function useDashboard() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // 获取KPI数据（无需认证）
    const getKPIData = async (timeRange: TimeRange = TimeRange.ONE_DAY) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/dashboard/kpi?timeRange=${timeRange}`);
            const data = await response.json();
            
            if (data.code === 200) {
                return data.data;
            } else {
                setError(data.message);
                return null;
            }
        } catch (err) {
            setError('网络错误');
            return null;
        } finally {
            setLoading(false);
        }
    };
    
    // 获取完整仪表板数据（无需认证）
    const getAllData = async (timeRange: TimeRange = TimeRange.ONE_DAY): Promise<DashboardData | null> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/dashboard/all?timeRange=${timeRange}`);
            const data = await response.json();
            
            if (data.code === 200) {
                return data.data;
            } else {
                setError(data.message);
                return null;
            }
        } catch (err) {
            setError('网络错误');
            return null;
        } finally {
            setLoading(false);
        }
    };
    
    return {
        loading,
        error,
        getKPIData,
        getAllData,
        TimeRange,
    };
}
```

### Vue Composition API 示例

```typescript
import { ref, reactive } from 'vue';

export enum TimeRange {
    ONE_HOUR = '1h',
    SIX_HOURS = '6h',
    ONE_DAY = '24h',
    SEVEN_DAYS = '7d',
    THIRTY_DAYS = '30d',
}

export function useDashboard() {
    const loading = ref(false);
    const error = ref<string | null>(null);
    const data = reactive({
        kpi: null,
        geo: null,
        qps: null,
    });
    
    // 获取KPI数据（无需认证）
    const fetchKPIData = async (timeRange: TimeRange = TimeRange.ONE_DAY) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await fetch(`/dashboard/kpi?timeRange=${timeRange}`);
            const result = await response.json();
            
            if (result.code === 200) {
                data.kpi = result.data;
            } else {
                error.value = result.message;
            }
        } catch (err) {
            error.value = '网络错误';
        } finally {
            loading.value = false;
        }
    };
    
    // 获取地理位置数据（无需认证）
    const fetchGeoData = async (timeRange: TimeRange = TimeRange.ONE_DAY) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await fetch(`/dashboard/geo?timeRange=${timeRange}`);
            const result = await response.json();
            
            if (result.code === 200) {
                data.geo = result.data;
            } else {
                error.value = result.message;
            }
        } catch (err) {
            error.value = '网络错误';
        } finally {
            loading.value = false;
        }
    };
    
    return {
        loading,
        error,
        data,
        fetchKPIData,
        fetchGeoData,
        TimeRange,
    };
}
```

## 注意事项

1. **无需认证**：所有Dashboard接口都可以直接调用，无需提供JWT令牌
2. **时间范围**：所有接口都支持timeRange参数，默认为24h
3. **数据缓存**：建议前端对仪表板数据进行适当缓存，避免频繁请求
4. **错误处理**：所有接口都返回统一的错误格式，前端需要统一处理
5. **性能优化**：对于完整数据接口(/dashboard/all)，建议根据实际需求选择性调用单个接口

---

更新日期：2025-11-03
版本：1.1.0