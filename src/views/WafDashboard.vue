<template>
  <div class="dashboard-container">
    <aside class="left-panel">
      <div class="stat-card" v-for="(item, idx) in statCards" :key="idx">
        <div class="stat-title">{{ item.title }}</div>
        <div class="stat-number" :class="{ danger: item.key === 'blocked' }">
          {{ formatNumber(stats[item.key]) }}
        </div>
      </div>
    </aside>

    <main class="map-panel">
      <div id="worldMap" class="map"></div>

      <transition name="fade">
        <div v-if="hoverInfo" class="tooltip" :style="tooltipStyle">
          <div v-if="hoverInfo.type === 'country'">
            <div class="tt-row"><span class="label">国家:</span> {{ hoverInfo.name }}</div>
            <div class="tt-row"><span class="label">攻击:</span> {{ hoverInfo.count }} 次</div>
            <div class="tt-row"><span class="label">最新:</span> {{ hoverInfo.time }}</div>
          </div>
          
          <div v-else>
            <div class="tt-title">{{ hoverInfo.location }}</div>
            <div class="tt-ip">{{ hoverInfo.ip }}</div>
            <div class="tt-ip" style="font-size:11px; color:#aaa; margin-top:2px">{{ hoverInfo.time }}</div>
          </div>
        </div>
      </transition>
    </main>

    <aside class="right-panel">
      <div class="attack-card">
        <div class="attack-header">
          <h3>实时 Web 攻击</h3>
          <div class="clock">{{ currentTime }}</div>
        </div>

        <div class="attack-scroll">
          <ul class="attack-list">
            <li v-for="(attack, idx) in attacks" :key="attack.id || idx"
                @mouseenter="handleListHover(attack)"
                @mouseleave="hoverInfo = null">
              <div class="left">
                <span class="rank">{{ idx + 1 }}</span>
                <div class="row1">
                  <span class="ip">{{ attack.ip }}</span>
                  <span class="loc">{{ attack.location }}</span>
                </div>
                <div class="row2">
                  <span class="time">{{ formatTime(attack.time) }}</span>
                  <span class="count">{{ attack.count }} 次</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
// 引入你的接口模块
import { trafficAPI } from '../api/index.js'
import { securityAPI } from '../api/securityAPI.js'

// --------------------- 数据定义 ---------------------
const stats = reactive({ visitors: 0, requests: 0, blocked: 0 })
const attacks = reactive([]) // 实时攻击列表
const regionStats = ref({})  // 每个国家的攻击总数 (24h)
const countryLastTimeMap = ref({}) // 【新增】每个国家最新攻击时间

const statCards = [
  { title: '近24小时独立访客', key: 'visitors' },
  { title: '近24小时访问次数', key: 'requests' },
  { title: '近24小时拦截次数', key: 'blocked' },
]

// tooltip 相关
const hoverInfo = ref(null)
const tooltipStyle = ref({ left: '0px', top: '0px' })

// 顶部时钟
const currentTime = ref('')
const updateClock = () => { currentTime.value = new Date().toLocaleString() }
let clockTimer = null

// --------------------- 辅助函数 ---------------------
const formatNumber = (num) => num ? num.toLocaleString() : '0'

// 格式化时间为 HH:mm:ss
const formatTime = (timeStr) => {
  if (!timeStr) return '--:--:--'
  try {
    const d = new Date(timeStr)
    return d.toLocaleTimeString('zh-CN', { hour12: false })
  } catch (e) {
    return timeStr
  }
}

// --------------------- 坐标映射逻辑 ---------------------
const geoMap = {
  '加拿大': [-106.3468, 56.1304],
  '美国': [-95.7129, 37.0902],
  '中国': [104.1954, 35.8617],
  '浙江': [120.15, 30.28],
  '北京': [116.40, 39.90],
  '上海': [121.47, 31.23],
  '广东': [113.26, 23.12],
  '俄罗斯': [105.31, 61.52],
  '德国': [10.45, 51.16],
  '英国': [-3.43, 55.37],
  '法国': [2.21, 46.22],
  '巴西': [-51.92, -14.23],
  '印度': [78.96, 20.59],
  '澳大利亚': [133.77, -25.27],
}

const locationToCoord = (loc) => {
  if (!loc) return [0, 0]
  for (const k in geoMap) {
    if (loc.includes(k)) return geoMap[k]
  }
  return [116.4074, 39.9042] // 默认北京
}

// --------------------- ECharts 初始化 ---------------------
let chart = null

const initChart = async () => {
  const el = document.getElementById('worldMap')
  if (!el) return

  try {
    const response = await fetch('/maps/world.json')
    const worldJson = await response.json()
    echarts.registerMap('world', worldJson)
  } catch (error) {
    console.error('Error loading world map:', error)
    return
  }

  chart = echarts.init(el)

  chart.setOption({
    backgroundColor: '#12121a',
    geo: {
      map: 'world',
      roam: true,
      silent: false,
      label: { show: false },
      itemStyle: {
        areaColor: '#2a2a3d',
        borderColor: '#444'
      },
      emphasis: {
        label: {
          show: true,
          color: '#ffffff',
          fontSize: 12
        },
        itemStyle: {
          areaColor: '#ff9f42',
          borderColor: '#ff9f42'
        }
      }
    },
    tooltip: { show: false },
    series: [
      {
        name: 'attack-lines',
        type: 'lines',
        coordinateSystem: 'geo',
        z: 2,
        effect: { show: true, period: 4, symbol: 'arrow', symbolSize: 6, color: '#ff5b5b' },
        lineStyle: { color: '#ff9f9f', width: 1, opacity: 0.6, curveness: 0.3 },
        data: []
      },
      {
        name: 'attack-points',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        z: 3,
        rippleEffect: { brushType: 'stroke' },
        symbolSize: 6,
        label: { show: false },
        itemStyle: { color: '#ff4d4f' },
        data: []
      }
    ]
  })

  // --------------------- 鼠标事件监听 (核心修改点) ---------------------
  chart.on('mousemove', params => {
    const offsetX = params.event.offsetX + 20
    const offsetY = params.event.offsetY + 20
    const style = { left: offsetX + 'px', top: offsetY + 'px' }

    // 1. 悬停在国家地图区域
    if (params.componentType === 'geo') {
      const countryName = params.name // 获取地图上的国家名(例如 "China")
      
      // 获取总数
      const count = regionStats.value[countryName] || 0
      
      // 获取该国最新攻击时间
      let rawTime = countryLastTimeMap.value[countryName]
      
      // 如果没有记录到时间，但有攻击数，说明攻击发生在列表之外，暂显示"近期"或留空
      const displayTime = rawTime ? formatTime(rawTime) : (count > 0 ? '近期' : '无记录')

      hoverInfo.value = {
        type: 'country',
        name: countryName,
        count: count,
        time: displayTime // 使用攻击时间
      }
      tooltipStyle.value = style
      return
    }

    // 2. 悬停在攻击点(红点)
    if (params.componentType === 'series' && params.data) {
      const d = params.data
      if (d.ip) {
        hoverInfo.value = {
          type: 'point',
          ip: d.ip,
          location: d.location,
          time: formatTime(d.time) // 攻击点的具体时间
        }
        tooltipStyle.value = style
        return
      }
    }

    hoverInfo.value = null
  })

  chart.on('globalout', () => { hoverInfo.value = null })
  window.addEventListener('resize', () => chart && chart.resize())
}

const handleListHover = (attack) => {
    // 列表悬停交互（可选）
}

// --------------------- 数据获取逻辑 ---------------------

// 1. 获取统计数据 (KPI)
const fetchStats = async () => {
  try {
    const [accessRes, wafRes] = await Promise.all([
      trafficAPI.getAccessStats({ timeRange: '24h' }),
      trafficAPI.getWafStats({ timeRange: '24h' })
    ])
    if (accessRes.data) {
      const d = accessRes.data
      stats.visitors = d.uv || d.visitors || 0
      stats.requests = d.pv || d.requests || 0
    }
    if (wafRes.data) {
       const d = wafRes.data
       stats.blocked = d.intercept_count || d.blocked || 0
    }
  } catch (error) { console.warn(error) }
}

// 2. 获取地理位置总数 (用于国家总攻击数)
const fetchGeoStats = async () => {
  try {
    const res = await trafficAPI.getGeoLocationData({ scope: 'world', type: 'intercept', timeRange: '24h' })
    if (res.data && Array.isArray(res.data)) {
      const map = {}
      res.data.forEach(item => {
        // item.name 必须匹配地图 JSON 的 name (通常是英文或中文)
        map[item.name] = item.value
      })
      regionStats.value = map
    }
  } catch (error) { console.warn(error) }
}

// 3. 获取实时攻击列表 & 提取每个国家最新时间
const fetchRealtimeAttacks = async () => {
  if (!chart) return

  try {
    const res = await securityAPI.getRealTimeEvents({ limit: 50 }) // 获取最近50条
    
    if (res.data && Array.isArray(res.data)) {
      const newAttacks = res.data.map(item => ({
        id: item.id || Math.random().toString(36),
        ip: item.source_ip || item.ip || 'Unknown',
        location: item.geo_location || item.location || 'Unknown',
        time: item.timestamp || item.time || new Date().toISOString(),
        count: item.attack_count || item.count || 1
      }))

      // 更新列表
      attacks.splice(0, attacks.length, ...newAttacks)

      // 【核心逻辑】遍历实时数据，记录每个国家出现的最新时间
      const tempTimeMap = { ...countryLastTimeMap.value } // 继承旧数据
      
      newAttacks.forEach(att => {
        // 尝试提取国家名，假设 location 格式为 "China-Beijing" 或 "China"
        // 这里的提取规则要和 trafficAPI 返回的 name 保持一致，最好是统一的
        let country = att.location
        if (att.location.includes('-')) {
            country = att.location.split('-')[0]
        }
        
        // 简单映射处理（如果接口返回中文，但地图用英文，需在此处转换，这里假设一致）
        // 比较时间，保留较晚（较新）的时间
        const currentStored = tempTimeMap[country]
        if (!currentStored || new Date(att.time) > new Date(currentStored)) {
          tempTimeMap[country] = att.time
        }
      })
      countryLastTimeMap.value = tempTimeMap

      // 绘制地图点线
      const scatterData = []
      const linesData = []
      const targetCoord = [116.4074, 39.9042]

      newAttacks.forEach(a => {
        const fromCoord = locationToCoord(a.location)
        if (fromCoord) {
            // 给散点数据带上 time 属性
            scatterData.push({ 
                name: a.ip, 
                value: [...fromCoord, a.count], 
                ip: a.ip, 
                location: a.location,
                time: a.time // 传入时间供 tooltip 使用
            })
            linesData.push({ 
                coords: [fromCoord, targetCoord], 
                value: a.count 
            })
        }
      })

      chart.setOption({
        series: [
          { name: 'attack-lines', data: linesData },
          { name: 'attack-points', data: scatterData }
        ]
      })
    }
  } catch (error) { console.warn(error) }
}

// --------------------- 生命周期 ---------------------
let dataInterval = null

onMounted(async () => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)

  await initChart()
  
  await Promise.all([ fetchStats(), fetchGeoStats(), fetchRealtimeAttacks() ])

  dataInterval = setInterval(() => {
    fetchStats()
    fetchGeoStats()
    fetchRealtimeAttacks()
  }, 10000)
})

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
  if (dataInterval) clearInterval(dataInterval)
  window.removeEventListener('resize', () => chart && chart.resize())
})
</script>

<style scoped>
/* 保持原有布局样式 */
.dashboard-container { 
  display: flex; 
  height: calc(100vh - 80px); 
  gap: 12px; 
  padding: 18px; 
  box-sizing: border-box; 
  background: linear-gradient(180deg, #1e1e2f 0%, #12121a 100%);
}
.left-panel, .right-panel { width: 18%; display: flex; flex-direction: column; gap: 16px; }
.map-panel { flex: 1; position: relative; background: #1f1f2e; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6); }
.map { width: 100%; height: 100%; }

.stat-card { padding: 16px; background: #2a2a3d; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5); }
.stat-title { color: #aaa; font-size: 14px; margin-bottom: 8px; }
.stat-number { font-size: 28px; margin-top: 8px; color: #f0f0f0; font-weight: bold; }
.stat-number.danger { color: #ff6b6b; }

.attack-card { height: 100%; padding: 12px; background: #2a2a3d; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5); }
.attack-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #444; padding-bottom: 8px; }
.attack-header h3 { margin: 0; color: #f0f0f0; font-size: 16px; }
.clock { font-size: 12px; color: #aaa; }
.attack-scroll { height: calc(100% - 56px); overflow-y: auto; }
.attack-list { list-style: none; padding: 0; margin: 0; }
.attack-list li { display: flex; justify-content: space-between; padding: 10px 8px; border-bottom: 1px solid #444; cursor: default; }
.attack-list li:hover { background-color: #33334d; }
.attack-list li .left { display: flex; flex-direction: column; gap: 2px; }
.rank { width: 20px; text-align: center; color: #fff; background: #6c8cff; padding: 2px 6px; border-radius: 12px; font-size: 12px; }
.ip { font-weight: 600; color: #f0f0f0; font-size: 13px; }
.loc { color: #aaa; font-size: 12px; }
.time { color: #888; font-size: 11px; }
.count { font-weight: 600; color: #ff6b6b; font-size: 12px; }
.row1, .row2 { display: flex; justify-content: flex-start; gap: 20px; font-size: 12px; color: #aaa; }

/* Tooltip 样式 */
.tooltip {
  position: absolute;
  pointer-events: none;
  background: rgba(20, 20, 35, 0.9); /* 深色背景 */
  border: 1px solid #ffffff;           /* 白色边框 */
  border-radius: 6px;
  padding: 10px 12px;
  min-width: 140px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.8);
  z-index: 1000;
  color: #ffffff; /* 确保文字全是白色 */
}

/* 强制内部元素白色 */
.tooltip .tt-title { 
  font-weight: bold; 
  margin-bottom: 4px; 
  color: #ffffff; 
  font-size: 14px; 
}
.tooltip .tt-ip { 
  font-size: 12px; 
  color: #ffffff;
}
.tooltip .tt-row { 
  display: flex; 
  align-items: center; 
  margin-bottom: 4px; 
  font-size: 13px; 
  color: #ffffff; 
  white-space: nowrap; 
}
.tooltip .tt-row:last-child { margin-bottom: 0; }
.tooltip .label { 
  color: #cccccc; /* 标签可以是浅灰，区分内容 */
  margin-right: 8px; 
  font-weight: normal; 
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media(max-width: 1100px) { .left-panel, .right-panel { display: none; } }
</style>
