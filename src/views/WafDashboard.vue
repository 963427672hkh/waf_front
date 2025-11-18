<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

// --------------------- 全局配置 ---------------------
const API_BASE = 'http://localhost:3000' // ✅ 后端接口地址
const WS_URL = 'ws://localhost:3000/ws'  // ✅ 后端 WebSocket 地址

const stats = reactive({ visitors: 0, requests: 0, blocked: 0 })
const attacks = reactive([])
const statCards = [
  { title: '近24小时独立访客', key: 'visitors' },
  { title: '近24小时访问次数', key: 'requests' },
  { title: '近24小时拦截次数', key: 'blocked' },
]

let ws = null
let chart = null
let heartbeatTimer = null

const hoverInfo = ref(null)
const tooltipStyle = ref({ left: '0px', top: '0px' })

// --------------------- 时间 ---------------------
const currentTime = ref('')
function updateClock() { currentTime.value = new Date().toLocaleString() }
setInterval(updateClock, 1000)

// --------------------- 经纬度缓存 ---------------------
const geoCache = new Map()
async function getGeo(ip) {
  if (geoCache.has(ip)) return geoCache.get(ip)
  try {
    const res = await fetch(`${API_BASE}/geo/ip?ip=${ip}`)
    const json = await res.json()
    if (json.code === 200) {
      geoCache.set(ip, json.data)
      return json.data
    }
  } catch (e) { console.error('geo查询失败:', e) }
  return null
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7) }
function nowTime() { return new Date().toLocaleString() }

// --------------------- 地图初始化 ---------------------
async function initChart() {
  const el = document.getElementById('worldMap')
  if (!el) return
  const res = await fetch('/maps/world.json')
  const worldJson = await res.json()
  echarts.registerMap('world', worldJson)
  chart = echarts.init(el)
  chart.setOption({
    backgroundColor: '#f5f7fa00',
    geo: {
      map: 'world',
      roam: false,
      silent: true,
      label: { show: false },
      itemStyle: { areaColor: '#f2f7ff', borderColor: '#e6eefc' },
    },
    tooltip: {
      trigger: 'item',
      formatter: p => {
        if (p.seriesType === 'effectScatter')
          return `${p.data.location || p.name}<br/>攻击次数: ${p.data.value[2]}`
        return ''
      }
    },
    series: [
      {
        name: 'attack-lines',
        type: 'lines',
        coordinateSystem: 'geo',
        effect: { show: true, period: 4, symbol: 'arrow', symbolSize: 6, color: '#ff5b5b' },
        lineStyle: { color: '#ff9f9f', width: 1, opacity: 0.6, curveness: 0.3 },
        data: []
      },
      {
        name: 'attack-points',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        rippleEffect: { brushType: 'stroke' },
        symbolSize: val => 6 + Math.min(val[2] || 1, 10),
        label: { show: false },
        data: []
      }
    ]
  })
}

// --------------------- 刷新地图 ---------------------
function refreshMap() {
  if (!chart) return
  const scatterData = []
  const linesData = []
  const targetCoord = [116.4074, 39.9042] // 默认目标点: 北京
  const countryCount = {}

  for (const a of attacks) {
    if (!a.latitude || !a.longitude) continue
    const fromCoord = [a.longitude, a.latitude]
    scatterData.push({
      name: a.ip,
      value: [...fromCoord, a.count || 1],
      ip: a.ip,
      location: a.location
    })
    linesData.push({ coords: [fromCoord, targetCoord], value: a.count })
    const country = a.country || '未知'
    countryCount[country] = (countryCount[country] || 0) + (a.count || 1)
  }

  chart.setOption({
    series: [
      { name: 'attack-lines', data: linesData },
      { name: 'attack-points', data: scatterData }
    ],
    geo: {
      regions: Object.keys(countryCount).map(name => ({ name, attackCount: countryCount[name] }))
    }
  })
}

// --------------------- WebSocket ---------------------
function connectWebSocket() {
  ws = new WebSocket(WS_URL)
  ws.onopen = () => {
    console.log('[WS] Connected')
    heartbeatTimer = setInterval(() => ws?.send('ping'), 20000)
  }
  ws.onmessage = async evt => {
    const data = JSON.parse(evt.data)
    if (data.type === 'stats') {
      stats.visitors = data.visitors ?? stats.visitors
      stats.requests = data.requests ?? stats.requests
      stats.blocked = data.blocked ?? stats.blocked
    }
    if (data.type === 'attack') {
      const geo = await getGeo(data.ip)
      if (!geo) return
      const item = {
        id: uid(),
        ip: data.ip,
        location: `${geo.country || '未知'} ${geo.city || ''}`,
        latitude: geo.latitude,
        longitude: geo.longitude,
        country: geo.country,
        count: data.count || 1,
        time: data.time || nowTime()
      }
      attacks.unshift(item)
      if (attacks.length > 50) attacks.pop()
      refreshMap()
    }
  }
  ws.onclose = () => {
    console.warn('[WS] Closed, reconnecting...')
    clearInterval(heartbeatTimer)
    setTimeout(connectWebSocket, 5000)
  }
  ws.onerror = err => {
    console.error('[WS] Error:', err)
    ws.close()
  }
}

// --------------------- 初始化 ---------------------
onMounted(async () => {
  await initChart()

  // ✅ 初始化仪表盘国家数据（可选）
  try {
    const res = await fetch(`${API_BASE}/dashboard/geo?timeRange=24h`)
    const json = await res.json()
    if (json.code === 200) {
      const countries = json.data.countries
      countries.forEach(c => {
        attacks.push({
          id: uid(),
          ip: '',
          location: c.name,
          latitude: null,
          longitude: null,
          count: c.value,
          country: c.name
        })
      })
      refreshMap()
    }
  } catch (e) {
    console.error('加载仪表板地理数据失败', e)
  }

  connectWebSocket()
})

onBeforeUnmount(() => {
  if (ws) ws.close()
  clearInterval(heartbeatTimer)
})
</script>
