// 模拟数据，用于开发测试
export const mockKPIData = {
  requests: 72800,
  pageViews: 7500,
  uniqueVisitors: 632,
  uniqueIPs: 674,
  intercepts: 12400,
  attackIPs: 48,
  error4xx: 5000,
  error4xxRate: 6.93,
  intercept4xx: 12400,
  intercept4xxRate: 17.01,
  error5xx: 80,
  error5xxRate: 0.11
}

export const mockGeoData = {
  countries: [
    { name: '中国', value: 72300, percentage: 100 },
    { name: '美国', value: 180, percentage: 25 },
    { name: '日本', value: 95, percentage: 13 },
    { name: '爱尔兰', value: 86, percentage: 12 },
    { name: '荷兰', value: 22, percentage: 3 },
    { name: '英国', value: 8, percentage: 1 },
    { name: '俄罗斯', value: 5, percentage: 1 }
  ]
}

export const mockQPSData = {
  current: 1,
  history: [
    { time: '00:00', value: 2 },
    { time: '00:05', value: 5 },
    { time: '00:10', value: 8 },
    { time: '00:15', value: 3 },
    { time: '00:20', value: 1 },
    { time: '00:25', value: 0 },
    { time: '00:30', value: 0 },
    { time: '00:35', value: 0 },
    { time: '00:40', value: 0 },
    { time: '00:45', value: 0 },
    { time: '00:50', value: 0 },
    { time: '00:55', value: 0 }
  ]
}

export const mockVisitData = {
  peak: 19400,
  data: [
    { time: '00:00', value: 100 },
    { time: '02:00', value: 200 },
    { time: '04:00', value: 150 },
    { time: '06:00', value: 300 },
    { time: '08:00', value: 500 },
    { time: '10:00', value: 19400 },
    { time: '12:00', value: 800 },
    { time: '14:00', value: 400 },
    { time: '16:00', value: 300 },
    { time: '18:00', value: 200 },
    { time: '20:00', value: 150 },
    { time: '22:00', value: 100 }
  ]
}

export const mockInterceptData = {
  peak: 12000,
  data: [
    { time: '00:00', value: 50 },
    { time: '02:00', value: 100 },
    { time: '04:00', value: 80 },
    { time: '06:00', value: 150 },
    { time: '08:00', value: 200 },
    { time: '10:00', value: 12000 },
    { time: '12:00', value: 500 },
    { time: '14:00', value: 300 },
    { time: '16:00', value: 200 },
    { time: '18:00', value: 150 },
    { time: '20:00', value: 100 },
    { time: '22:00', value: 80 }
  ]
}

export const mockClientData = {
  operatingSystems: [
    { name: 'MacOS', value: 35600, color: '#4a9eff' },
    { name: 'Windows', value: 28200, color: '#ffd93d' },
    { name: 'Linux', value: 6100, color: '#ff6b9d' },
    { name: 'iOS', value: 2100, color: '#1e3a8a' },
    { name: 'Android', value: 385, color: '#ff8c00' }
  ],
  browsers: [
    { name: 'Chrome', value: 41600, color: '#4a9eff' },
    { name: 'Firefox', value: 10200, color: '#ffd93d' },
    { name: 'Opera', value: 6100, color: '#ff6b9d' },
    { name: 'Safari', value: 4100, color: '#1e3a8a' },
    { name: 'Edge', value: 2200, color: '#ff8c00' }
  ]
}

export const mockResponseData = {
  statusCodes: [
    { code: '200', value: 54000, color: '#4a9eff' },
    { code: '404', value: 4900, color: '#ffd93d' },
    { code: '206', value: 1300, color: '#ff6b9d' },
    { code: '405', value: 93, color: '#1e3a8a' },
    { code: '403', value: 56, color: '#ff8c00' },
    { code: '429', value: 8300, color: '#888' },
    { code: '403', value: 2000, color: '#666' },
    { code: '467', value: 1400, color: '#444' },
    { code: '468', value: 734, color: '#222' },
    { code: '502', value: 80, color: '#111' }
  ]
}

export const mockExternalDomains = [
  { domain: 'help.waf-ce.chaitin.cn', count: 256, percentage: 100 },
  { domain: 'stackblitz.com', count: 39, percentage: 15 },
  { domain: 'console.cloud.tencent.com', count: 31, percentage: 12 },
  { domain: 'www.bilibili.com', count: 27, percentage: 11 },
  { domain: 'cn.bing.com', count: 23, percentage: 9 }
]

export const mockExternalPages = [
  { url: 'https://help.waf-ce.chaitin.cn/', count: 207, percentage: 100 },
  { url: 'https://stackblitz.com/', count: 39, percentage: 19 },
  { url: 'https://help.waf-ce.chaitin.cn/node/01973fc6-e046-7489-bcd9-7b155439385', count: 38, percentage: 18 },
  { url: 'https://demo.waf-ce.chaitin.cn/', count: 18, percentage: 9 },
  { url: 'https://console.cloud.tencent.com/', count: 18, percentage: 9 }
]

export const mockVisitedDomains = [
  { domain: 'demo.waf-ce.chaitin.cn', count: 53000, percentage: 100 },
  { domain: 'demo.waf-ce.chaitin.cn:10084', count: 1600, percentage: 3 },
  { domain: 'demo.waf-ce.chaitin.cn:7888', count: 1500, percentage: 3 },
  { domain: 'demo.waf-ce.chaitin.cn:22443', count: 906, percentage: 2 },
  { domain: '47.104.188.110:7888', count: 891, percentage: 2 }
]

export const mockVisitedPages = [
  { url: 'https://demo.waf-ce.chaitin.cn/image.tar.gz', count: 51300, percentage: 100 },
  { url: 'https://demo.waf-ce.chaitin.cn/', count: 1600, percentage: 3 },
  { url: 'https://demo.waf-ce.chaitin.cn/favicon.ico', count: 332, percentage: 1 },
  { url: 'https://demo.waf-ce.chaitin.cn/hello.js', count: 59, percentage: 0.1 },
  { url: 'https://demo.waf-ce.chaitin.cn/bootstrap.bundle.min.js', count: 57, percentage: 0.1 }
]

// 完整的仪表板数据
export const mockAllDashboardData = {
  kpi: mockKPIData,
  geo: mockGeoData,
  qps: mockQPSData,
  visit: mockVisitData,
  intercept: mockInterceptData,
  client: mockClientData,
  response: mockResponseData,
  externalDomains: mockExternalDomains,
  externalPages: mockExternalPages,
  visitedDomains: mockVisitedDomains,
  visitedPages: mockVisitedPages
}
