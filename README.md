# WAF 安全大屏前端系统

## 📋 项目概述

WAF安全大屏前端系统是一个基于Vue 3 + Vite构建的现代化安全监控仪表板，提供实时流量分析、安全态势监控、防护报告和监控大屏等功能。系统采用响应式设计，支持多种数据可视化图表，为安全运维人员提供直观的数据展示和决策支持。

## 🚀 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite 4.4.9
- **图表库**: ECharts 5.4.3 + ECharts-GL 2.0.9
- **HTTP客户端**: Axios 1.12.2
- **开发语言**: JavaScript/TypeScript
- **样式**: CSS3 + 响应式设计

## 📁 项目结构

```
waf_front/
├── public/                     # 静态资源
│   ├── maps/                  # 地图数据文件
│   │   ├── china.json        # 中国地图数据
│   │   └── world.json        # 世界地图数据
│   └── reports/              # 报告文件
├── src/
│   ├── api/                  # API接口配置
│   │   ├── index.js          # 流量分析API
│   │   └── securityAPI.js    # 安全态势API
│   ├── components/           # Vue组件
│   │   ├── dashboard/        # 图表组件
│   │   │   ├── AttackTrendChart.vue
│   │   │   ├── AttackTypePie.vue
│   │   │   └── BlackWhiteTrend.vue
│   │   ├── TrafficAnalysis.vue    # 流量分析页面
│   │   ├── SecurityStatus.vue     # 安全态势页面
│   │   ├── ProtectionReport.vue    # 防护报告页面
│   │   ├── WafDashboard.vue       # 监控大屏页面
│   │   └── Globe.vue              # 3D地球组件
│   ├── composables/          # 组合式函数
│   │   └── useDashboard.js   # 数据管理
│   ├── data/                 # 模拟数据
│   │   ├── mockData.js       # 模拟数据定义
│   │   ├── countryCoords.js  # 国家坐标数据
│   │   └── worldCoords.js    # 世界坐标数据
│   ├── lib/                  # 工具库
│   │   ├── china.js          # 中国地图工具
│   │   └── loadChinaMap.js   # 地图加载工具
│   ├── App.vue               # 主应用组件
│   ├── main.js               # 应用入口
│   └── style.css             # 全局样式
├── package.json              # 项目配置
├── vite.config.js            # Vite配置
└── env.example               # 环境变量示例
```

## 🛠️ 安装与运行

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

访问 http://localhost:3000

### 生产环境构建

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 🔧 环境配置

### 环境变量配置

复制 `env.example` 为 `.env` 并配置：

```bash
cp env.example .env
```

编辑 `.env` 文件：

```env
# API配置
VITE_API_BASE_URL=http://localhost:8080/api
```

### 后端接口配置

系统支持两种数据源模式：

1. **模拟数据模式** (默认) - 使用内置模拟数据
2. **API数据模式** - 连接后端API服务

在应用界面右上角可以切换数据源模式。

## 📡 API接口配置

### 基础配置

系统使用Axios作为HTTP客户端，基础配置在 `src/api/index.js`：

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### 流量分析API接口

**文件位置**: `src/api/index.js`

| 接口名称 | 请求方法 | 路径 | 描述 |
|---------|---------|------|------|
| 获取KPI数据 | GET | `/traffic/kpi` | 获取关键性能指标 |
| 获取地理位置数据 | GET | `/traffic/geo` | 获取地理分布数据 |
| 获取实时QPS | GET | `/traffic/qps` | 获取实时QPS数据 |
| 获取访问情况 | GET | `/traffic/visit` | 获取访问统计 |
| 获取拦截情况 | GET | `/traffic/intercept` | 获取拦截统计 |
| 获取攻击类型分布 | GET | `/traffic/attack-type` | 获取攻击类型数据 |
| 获取威胁监控 | GET | `/traffic/threats` | 获取威胁监控数据 |
| 获取性能指标 | GET | `/traffic/performance` | 获取性能指标 |
| 获取客户端数据 | GET | `/traffic/client` | 获取客户端统计 |
| 获取响应状态 | GET | `/traffic/response` | 获取响应状态码 |
| 获取外部域名 | GET | `/traffic/external-domains` | 获取外部来源域名 |
| 获取外部页面 | GET | `/traffic/external-pages` | 获取外部来源页面 |
| 获取受访域名 | GET | `/traffic/visited-domains` | 获取受访域名 |
| 获取受访页面 | GET | `/traffic/visited-pages` | 获取受访页面 |
| 获取所有流量数据 | GET | `/traffic/all` | 获取所有流量分析数据 |

### 安全态势API接口

**文件位置**: `src/api/securityAPI.js`

| 接口名称 | 请求方法 | 路径 | 描述 |
|---------|---------|------|------|
| 获取安全统计 | GET | `/security/stats` | 获取安全态势统计数据 |
| 获取攻击趋势 | GET | `/security/attack-trend` | 获取攻击防护趋势 |
| 获取攻击源IP | GET | `/security/attack-source-ips` | 获取攻击源IP数据 |
| 获取黑白名单趋势 | GET | `/security/black-white-trend` | 获取黑白名单趋势 |
| 获取实时事件 | GET | `/security/real-time-events` | 获取实时安全事件 |
| 获取Web攻击分布 | GET | `/security/web-attack-distribution` | 获取Web攻击分布 |
| 获取黑白名单规则 | GET | `/security/black-white-rules` | 获取黑白名单规则 |
| 获取安全事件 | GET | `/security/security-events` | 获取安全事件统计 |
| 获取威胁等级分布 | GET | `/security/threat-level-distribution` | 获取威胁等级分布 |
| 获取防护规则 | GET | `/security/protection-rules` | 获取防护规则状态 |
| 获取安全评分 | GET | `/security/security-score` | 获取安全评分 |
| 获取最近攻击趋势 | GET | `/security/recent-attacks-trend` | 获取最近攻击趋势 |
| 获取所有安全数据 | GET | `/security/all` | 获取所有安全态势数据 |

## 📊 数据格式规范

### KPI数据格式

```javascript
{
  "requests": 72800,           // 请求次数
  "pageViews": 7500,           // 访问次数(PV)
  "uniqueVisitors": 632,       // 独立访客(UV)
  "uniqueIPs": 674,           // 独立IP
  "intercepts": 12400,        // 拦截次数
  "attackIPs": 48,            // 攻击IP
  "error4xx": 5000,           // 4xx错误数
  "error4xxRate": 6.93,       // 4xx错误率
  "intercept4xx": 12400,      // 拦截4xx数
  "intercept4xxRate": 17.01,  // 拦截4xx率
  "error5xx": 80,             // 5xx错误数
  "error5xxRate": 0.11        // 5xx错误率
}
```

### 地理位置数据格式

```javascript
{
  "countries": [
    {
      "name": "中国",           // 国家名称
      "value": 72300,          // 访问量
      "percentage": 100        // 百分比
    }
  ]
}
```

### 实时QPS数据格式

```javascript
{
  "current": 1,               // 当前QPS
  "history": [                 // 历史数据
    {
      "time": "00:00",         // 时间
      "value": 2               // QPS值
    }
  ]
}
```

### 攻击趋势数据格式

```javascript
[
  {
    "timestamp": "2024-01-01 12:00:00",  // 时间戳
    "count": 150                         // 攻击次数
  }
]
```

### 攻击类型分布数据格式

```javascript
[
  {
    "type": "SQL注入",          // 攻击类型
    "count": 45                // 攻击次数
  }
]
```

### 黑白名单趋势数据格式

```javascript
[
  {
    "timestamp": "12:00",      // 时间
    "blacklist": 20,           // 黑名单数量
    "whitelist": 5             // 白名单数量
  }
]
```

## 🔄 数据源切换

系统支持在运行时切换数据源：

### 模拟数据模式

- 使用 `src/data/mockData.js` 中定义的模拟数据
- 适合开发和测试环境
- 无需后端服务即可运行

### API数据模式

- 连接后端API服务获取真实数据
- 需要配置 `VITE_API_BASE_URL` 环境变量
- 支持实时数据更新

### 切换方式

1. **界面切换**: 点击右上角"使用模拟数据"/"使用API数据"按钮
2. **代码切换**: 修改 `src/composables/useDashboard.js` 中的 `useMockData` 默认值

## 🎨 页面功能

### 1. 流量分析页面

- **KPI指标展示**: 请求次数、访问次数、独立访客等
- **地理位置分析**: 3D地球和2D地图展示
- **实时QPS监控**: 实时请求量监控
- **访问情况**: 访问趋势图表
- **拦截情况**: 拦截统计和趋势
- **攻击类型分布**: 饼图展示攻击类型
- **威胁监控**: 实时威胁事件列表
- **性能指标**: 性能监控图表

### 2. 安全态势页面

- **安全统计卡片**: 攻击防护、黑白名单等统计
- **攻击趋势图表**: 攻击防护趋势分析
- **攻击源IP列表**: 攻击源IP统计表格
- **黑白名单趋势**: 黑白名单变化趋势
- **实时事件**: 实时安全事件列表
- **Web攻击分布**: 攻击类型饼图
- **安全评分**: 安全评分面板

### 3. 防护报告页面

- **报告列表**: 防护报告历史记录
- **报告生成**: 生成新的防护报告
- **报告预览**: 报告内容预览
- **报告下载**: PDF格式报告下载
- **搜索功能**: 按时间、名称搜索报告

### 4. 监控大屏页面

- **实时监控**: 实时安全监控大屏
- **3D可视化**: 3D地球攻击可视化
- **实时数据**: WebSocket实时数据更新
- **全屏展示**: 适合大屏展示的界面

## 🔧 开发指南

### 添加新的API接口

1. 在 `src/api/index.js` 或 `src/api/securityAPI.js` 中添加接口定义
2. 在对应的组件中调用API
3. 更新模拟数据以支持新接口

### 添加新的图表组件

1. 在 `src/components/dashboard/` 中创建新的图表组件
2. 使用ECharts进行图表渲染
3. 在页面组件中引入和使用

### 自定义样式

- 全局样式: `src/style.css`
- 组件样式: 使用 `<style scoped>` 定义组件样式
- 响应式设计: 使用CSS媒体查询

## 🚀 部署指南

### 开发环境部署

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 生产环境部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### Docker部署

```dockerfile
FROM node:16-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔍 故障排除

### 常见问题

1. **API请求失败**
   - 检查 `VITE_API_BASE_URL` 配置
   - 确认后端服务是否启动
   - 检查网络连接

2. **图表不显示**
   - 检查ECharts是否正确加载
   - 确认数据格式是否正确
   - 查看浏览器控制台错误信息

3. **地图不显示**
   - 检查地图数据文件是否存在
   - 确认地图组件是否正确初始化
   - 检查ECharts-GL是否正确加载

### 调试模式

启用Vue DevTools进行调试：

```bash
# 安装Vue DevTools浏览器扩展
# 在开发环境中自动启用
```

## 📝 更新日志

### v1.0.0 (2024-01-01)

- 初始版本发布
- 支持流量分析、安全态势、防护报告、监控大屏四个主要功能模块
- 集成ECharts图表库和3D可视化
- 支持模拟数据和API数据两种模式
- 响应式设计，支持多种屏幕尺寸

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 项目Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 邮箱: your-email@example.com

---

**注意**: 本项目目前使用模拟数据进行开发和测试。在生产环境中，请确保后端API服务正常运行，并正确配置环境变量。