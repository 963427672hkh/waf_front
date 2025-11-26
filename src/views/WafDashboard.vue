<template>
  <div class="waf-dashboard">
    <div class="header">
      <div class="stats">
        <div class="card" v-for="card in statCards" :key="card.key">
          <div class="title">{{ card.title }}</div>
          <div class="value">{{ stats[card.key] }}</div>
        </div>
      </div>
      <div class="clock">{{ currentTime }}</div>
    </div>

    <div class="content">
      <div id="worldMap" class="map" />
      <aside class="sidebar">
        <h3>最近攻击</h3>
        <ul class="attack-list">
          <li v-for="a in attacks" :key="a.id" class="attack-item">
            <div class="attack-title">{{ a.ip || a.location }}</div>
            <div class="attack-meta">次数: {{ a.count }} · {{ a.time }}</div>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

// --------------------- 全局配置 ---------------------
const API_BASE = 'http://47.109.154.103:3000' // ✅ 后端接口地址
const WS_URL = 'ws://47.109.154.103:3000/ws'  // ✅ 后端 WebSocket 地址

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

// --------------------- HTTP 轮询（使用 /dashboard/all 聚合接口） ---------------------
let pollTimer = null
async function fetchDashboardAll() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/all?timeRange=24h`)
    const json = await res.json()
    if (json.code !== 200 || !json.data) return

    const data = json.data
    // 尝试从聚合数据中填充 stats（会尝试多种字段以兼容不同后端返回）
    if (data.kpi) {
      // 假设 kpi 中存在 requests/blocks/uniqueIps 等字段
      stats.visitors = data.kpi.uniqueIps?.today ?? stats.visitors
      stats.requests = data.kpi.requests?.today ?? stats.requests
      stats.blocked = data.kpi.blocks?.today ?? stats.blocked
    }

    // 如果存在 overview 类型聚合
    if (data.overview) {
      stats.requests = data.overview.total ?? stats.requests
      stats.blocked = data.overview.blocked ?? stats.blocked
      stats.visitors = data.overview.uniqueIps ?? stats.visitors
    }

    // 清空并重建 attacks 列表：优先使用 geo.mapData 或 charts.topIps/topAttacks
    attacks.length = 0
    const pushPoint = (lat, lng, count = 1, ip = '', location = '', country = '') => {
      if (lat == null || lng == null) return
      attacks.push({ id: uid(), ip, location, latitude: lat, longitude: lng, country: country || location.split(' ')[0] || '', count, time: nowTime() })
    }

    if (data.geo && Array.isArray(data.geo.mapData)) {
      for (const item of data.geo.mapData) {
        const lat = item.lat ?? item.latitude
        const lng = item.lng ?? item.longitude
        const count = item.count ?? item.value ?? 1
        pushPoint(lat, lng, count, item.ip || '', item.city ? `${item.country || ''} ${item.city}`.trim() : item.country || '', item.country)
      }
    }

    // charts.topIps / charts.topAttacks 可能包含 ip/location/count
    if (data.charts) {
      const tops = data.charts.topIps || data.charts.topAttacks || data.topIps || data.topAttacks
      if (Array.isArray(tops)) {
        for (const t of tops) {
          if (t.latitude && t.longitude) pushPoint(t.latitude, t.longitude, t.count || t.value || 1, t.ip || '', t.location || t.city || '', t.country)
          else if (t.ip) {
            // 如果没有经纬度，尝试用 geo 接口补全（异步但不阻塞主渲染）
            getGeo(t.ip).then(geo => {
              if (!geo) return
              pushPoint(geo.latitude, geo.longitude, t.count || 1, t.ip, `${geo.country || ''} ${geo.city || ''}`.trim(), geo.country)
              refreshMap()
            }).catch(() => {})
          }
        }
      }
    }

    // 如果没有任何点，尝试从 data.topIps（兼容）
    if (attacks.length === 0 && Array.isArray(data.topIps)) {
      for (const t of data.topIps) {
        if (t.latitude && t.longitude) pushPoint(t.latitude, t.longitude, t.count || 1, t.ip || '', t.location || '', t.country)
      }
    }

    // 限制数量
    if (attacks.length > 50) attacks.splice(50)
    refreshMap()
  } catch (e) {
    console.error('fetchDashboardAll failed', e)
  }
}

function startPolling(interval = 5000) {
  // 立即拉取一次
  fetchDashboardAll()
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = setInterval(fetchDashboardAll, interval)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
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
  // 使用聚合接口轮询替代 WebSocket，避免 404
  startPolling(5000)
})

onBeforeUnmount(() => {
  stopPolling()
  if (ws) ws.close()
  if (heartbeatTimer) clearInterval(heartbeatTimer)
})
</script>

<style scoped>
  .waf-dashboard { padding: 16px; font-family: Arial, Helvetica, sans-serif; }
  .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px }
  .stats { display:flex; gap:12px }
  .card { background:#fff; border-radius:6px; padding:12px 16px; box-shadow:0 1px 3px rgba(0,0,0,0.06); min-width:140px }
  .card .title { color:#666; font-size:12px }
  .card .value { font-size:20px; font-weight:700; margin-top:6px }
  .clock { color:#888 }
  .content { display:flex; gap:12px }
  .map { flex:1; height:560px; background:#f8f9fb; border-radius:6px }
  .sidebar { width:320px; background:#fff; border-radius:6px; padding:12px; box-shadow:0 1px 3px rgba(0,0,0,0.06); overflow:auto }
  .attack-list { list-style:none; padding:0; margin:0 }
  .attack-item { padding:8px 0; border-bottom:1px solid #f0f3f8 }
  .attack-title { font-weight:600 }
  .attack-meta { color:#888; font-size:12px }
</style>
