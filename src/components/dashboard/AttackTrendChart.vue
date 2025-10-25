<template>
  <div ref="chartRef" style="height:100%; width:100%;"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { ref, onMounted, watch, nextTick } from 'vue'

const props = defineProps<{ data: {timestamp: string, count: number}[] }>()
const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

onMounted(async () => {
  await nextTick()
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    renderChart()
  }
})

watch(() => props.data, () => {
  if (chart) {
    renderChart()
  }
}, { deep: true })

function renderChart() {
  if (!chart || !props.data.length) return
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#ff8c00',
      borderWidth: 1,
      textStyle: { color: '#fff' },
      formatter: function (params: any) {
        const data = params[0]
        return `<div style="padding: 8px;">
          <div style="font-weight: bold; color: #ff8c00; margin-bottom: 4px;">${data.name}</div>
          <div style="color: #fff;">攻击次数: <span style="color: #4a9eff; font-weight: bold;">${data.value}</span></div>
        </div>`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.data.map(d => d.timestamp),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { 
        color: '#888', 
        fontSize: 10,
        interval: 0,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#888', fontSize: 10 },
      splitLine: { 
        lineStyle: { 
          color: '#333',
          type: 'dashed'
        } 
      }
    },
    series: [{
      type: 'line',
      data: props.data.map(d => d.count),
      smooth: true,
      lineStyle: { 
        color: '#4a9eff', 
        width: 3,
        shadowColor: 'rgba(74, 158, 255, 0.3)',
        shadowBlur: 10,
        shadowOffsetY: 5
      },
      itemStyle: { 
        color: '#4a9eff',
        borderColor: '#fff',
        borderWidth: 2,
        shadowColor: 'rgba(74, 158, 255, 0.5)',
        shadowBlur: 8
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(74, 158, 255, 0.4)' },
          { offset: 1, color: 'rgba(74, 158, 255, 0.05)' }
        ])
      },
      emphasis: {
        itemStyle: {
          color: '#ff8c00',
          borderColor: '#fff',
          borderWidth: 3,
          shadowColor: 'rgba(255, 140, 0, 0.8)',
          shadowBlur: 15
        }
      }
    }]
  }
  
  chart.setOption(option)
  chart.resize()
}
</script>
