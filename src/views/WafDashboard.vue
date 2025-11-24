<template>
  <div class="dashboard-container">
    <!-- 左侧统计卡片 -->
    <aside class="left-panel">
      <div class="stat-card" v-for="(item, idx) in statCards" :key="idx">
        <div class="stat-title">{{ item.title }}</div>
        <div class="stat-number" :class="{ danger: item.key === 'blocked' }">{{ stats[item.key] }}</div>
      </div>
    </aside>

    <!-- 中间世界地图 -->
    <main class="map-panel">
      <div id="worldMap" class="map"></div>

      <!-- 弹出小标签 -->
      <transition name="fade">
        <div v-if="hoverInfo" class="tooltip" :style="tooltipStyle">
          <div class="tt-title">{{ hoverInfo.location || hoverInfo.name }}</div>
          <div class="tt-ip">{{ hoverInfo.ip || '' }}</div>
        </div>
      </transition>
    </main>

    <!-- 右侧实时攻击列表 -->
    <aside class="right-panel">
      <div class="attack-card">
        <div class="attack-header">
          <h3>实时 Web 攻击</h3>
          <div class="clock">{{ currentTime }}</div>
        </div>

        <div class="attack-scroll">
          <ul class="attack-list">
            <li v-for="(attack, idx) in attacks" :key="attack.id"
                @mouseenter="hoverInfo = { ip: attack.ip, location: attack.location }"
                @mouseleave="hoverInfo = null">
              <div class="left">
                <span class="rank">{{ idx + 1 }}</span>
                <div class="row1">
                  <span class="ip">{{ attack.ip }}</span>
                  <span class="loc">{{ attack.location }}</span>
                </div>
                <div class="row2">
                  <span class="time">{{ attack.time }}</span>
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
import { trafficAPI, securityAPI } from '@/api'  // 你提供的接口模块

// --------------------- 数据 & 配置 ---------------------
const stats = reactive({ visitors: 0, requests: 0, blocked: 0 })
const attacks = reactive([])
const statCards = [
  { title: '近24小时独立访客', key: 'visitors' },
  { title: '近24小时访问次数', key: 'requests' },
  { title: '近24小时拦截次数', key: 'blocked' },
]

// tooltip
const hoverInfo = ref(null)
const tooltipStyle = ref({ left: '0px', top: '0px' })

// 当前时间
const currentTime = ref('')
const updateClock = () => { currentTime.value = new Date().toLocaleString() }
updateClock()
setInterval(updateClock, 1000)

// --------------------- 经纬度映射 ---------------------
const geoMap = {
  '加拿大': [-106.3468, 56.1304],
  '美国': [-95.7129, 37.0902],
  '中国': [104.1954, 35.8617],
  '浙江-台州': [121.4208, 28.6569],
  '山东-济宁': [116.6000, 35.4167],
  '河南-郑州': [113.65, 34.76],
  '湖北-荆州': [112.2411, 30.3326],
}
const locationToCoord = loc => {
  if (!loc) return null
  if (geoMap[loc]) return geoMap[loc]
  for (const k in geoMap) if (loc.includes(k)) return geoMap[k]
  return [116.4074, 39.9042] // 默认北京
}
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7)
const nowTime = () => new Date().toLocaleString()

// --------------------- 地图初始化 ---------------------
let chart = null
const initChart = async () => {
  const el = document.getElementById('worldMap')
  if (!el) return

  try {
    const response = await fetch('/maps/world.json')
    if (!response.ok) { console.error('Failed to load world map:', response.status); return }
    const worldJson = await response.json()
    echarts.registerMap('world', worldJson)
  } catch (error) { console.error('Error loading world map:', error); return }

  chart = echarts.init(el)
  chart.setOption({
    backgroundColor: '#f5f7fa00',
    geo: { map: 'world', roam: false, silent: true, label: { show: false }, itemStyle: { areaColor: '#f2f7ff', borderColor: '#e6eefc' } },
    tooltip: {
      trigger: 'item',
      formatter: params => {
        if(params.seriesType === 'effectScatter') return `${params.data.location}<br/>攻击次数: ${params.data.value[2]}`
        if(params.seriesType === 'map') return `${params.name}<br/>攻击次数: ${params.data.attackCount || 0}`
        return ''
      }
    },
    series: [
      { name: 'attack-lines', type: 'lines', coordinateSystem: 'geo', z:2, effect:{show:true, period:4, symbol:'arrow', symbolSize:6, color:'#ff5b5b'}, lineStyle:{color:'#ff9f9f', width:1, opacity:0.6, curveness:0.3}, data:[] },
      { name: 'attack-points', type: 'effectScatter', coordinateSystem: 'geo', z:3, rippleEffect:{brushType:'stroke'}, symbolSize: val=>6+Math.min(val[2]||1,10), label:{show:false}, data:[] }
    ]
  })

  chart.on('mousemove', params => {
    if (!params || !params.data) { hoverInfo.value = null; return }
    const d = params.data
    if (d && (d.ip || d.name)) {
      hoverInfo.value = { ip: d.ip, name: d.name, location: d.location }
      tooltipStyle.value = { left: params.event.offsetX + 12 + 'px', top: params.event.offsetY + 12 + 'px' }
    }
  })

  window.addEventListener('resize', () => chart && chart.resize())
}

// --------------------- 地图刷新 ---------------------
const refreshMap = () => {
  if (!chart) return
  const scatterData = []
  const linesData = []
  const targetCoord = [116.4074, 39.9042]
  const countryCount = {}

  attacks.forEach(a => {
    const fromCoord = locationToCoord(a.location)
    scatterData.push({ name: a.ip, value:[...fromCoord, a.count||1], ip:a.ip, location:a.location })
    linesData.push({ coords:[fromCoord, targetCoord], value: a.count })
    const country = a.location.split('-')[0]
    countryCount[country] = (countryCount[country] || 0) + (a.count || 1)
  })

  chart.setOption({
    series:[
      { name:'attack-lines', data:linesData },
      { name:'attack-points', data:scatterData }
    ],
    geo: { regions: Object.keys(countryCount).map(name => ({ name, attackCount: countryCount[name] })) }
  })
}

// --------------------- 接口数据拉取 ---------------------
const fetchStats = async () => {
  try {
    const accessRes = await trafficAPI.getAccessStats()
    const wafRes = await trafficAPI.getWafStats()
    stats.visitors = accessRes.data.visitors || 0
    stats.requests = accessRes.data.requests || 0
    stats.blocked = wafRes.data.blocked || 0
  } catch(e){ console.error('fetchStats error', e) }
}

const fetchRealtimeAttacks = async () => {
  try {
    const res = await securityAPI.getRealTimeEvents()
    attacks.length = 0
    res.data.forEach(ev => {
      attacks.push({
        id: uid(),
        ip: ev.ip || 'unknown',
        location: ev.location || '未知',
        time: ev.time || nowTime(),
        count: ev.count || 1
      })
    })
    refreshMap()
  } catch(e){ console.error('fetchRealtimeAttacks error', e) }
}

// --------------------- 初始化 ---------------------
onMounted(async () => {
  await initChart()
  await fetchStats()
  await fetchRealtimeAttacks()

  // 每10秒刷新一次数据（也可换成 WebSocket）
  setInterval(async () => {
    await fetchStats()
    await fetchRealtimeAttacks()
  }, 10000)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize',()=>chart&&chart.resize())
})
</script>

<style scoped>
.dashboard-container { display:flex; height:calc(100vh - 80px); gap:12px; padding:18px; box-sizing:border-box; background:linear-gradient(180deg,#f6f8fb 0%,#eef3fb 100%) }
.left-panel,.right-panel{ width:18%; display:flex; flex-direction:column; gap:16px }
.map-panel{ flex:1; position:relative; background:white; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(16,24,40,0.06) }
.map{ width:100%; height:100% }
.stat-card{ padding:16px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1) }
.stat-title{ color:#7b8aa3; font-size: 14px; margin-bottom: 8px }
.stat-number{ font-size:28px; margin-top:8px; color:#2b3a4b; font-weight: bold }
.stat-number.danger{ color:#ff4d4f }
.attack-card{ height:100%; padding:12px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1) }
.attack-header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:8px }
.attack-header h3{ margin:0; color:#2b3a4b; font-size:16px }
.clock{ font-size:12px; color:#7b8aa3 }
.attack-scroll{ height: calc(100% - 56px); overflow-y:auto }
.attack-list{ list-style:none; padding:0; margin:0 }
.attack-list li{ display:flex; justify-content:space-between; padding:10px 8px; border-bottom:1px solid #eef3fb; cursor:default }
.attack-list li:hover{ background-color: #f8f9fa }
.attack-list li .left{ display:flex; flex-direction:column; gap:2px }
.rank{ width:20px; text-align:center; color:#fff; background:#6c8cff; padding:2px 6px; border-radius:12px; font-size:12px }
.ip{ font-weight:600; color:#2b3a4b; font-size:13px }
.loc{ color:#7b8aa3; font-size:12px }
.time{ color:#9aa7be; font-size:11px }
.count{ font-weight:600; color:#ff4d4f; font-size:12px }
.row1, .row2{ display:flex; justify-content:flex-start; gap:20px; font-size:12px; color:#7b8aa3 }
.tooltip{ position:absolute; pointer-events:none; background:rgba(20,24,38,0.96); color:white; padding:8px 10px; border-radius:6px; transform: translate(-50%, -100%); min-width:140px; box-shadow:0 6px 18px rgba(0,0,0,0.12); z-index:1000 }
.tt-title{ font-weight:bold; margin-bottom:4px }
.tt-ip{ font-size:12px; color:#ccc }
.fade-enter-active,.fade-leave-active{ transition:opacity .2s }
.fade-enter-from,.fade-leave-to{ opacity:0 }
@media(max-width:1100px){ .left-panel,.right-panel{ display:none } }
</style>
