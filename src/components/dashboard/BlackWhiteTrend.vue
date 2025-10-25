<template>
  <div ref="chartRef" style="height:100%; width:100%;"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { ref, onMounted, watch, nextTick } from 'vue'

/**
 * props.data 示例：
 * [
 *   { timestamp: '12:00', blacklist: 20, whitelist: 5 },
 *   { timestamp: '13:00', blacklist: 15, whitelist: 8 },
 *   { timestamp: '14:00', blacklist: 30, whitelist: 12 }
 * ]
 */
const props = defineProps<{ data: { timestamp: string, blacklist: number, whitelist: number }[] }>()

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
        let result = `<div style="padding: 8px;">
          <div style="font-weight: bold; color: #ff8c00; margin-bottom: 4px;">${params[0].name}</div>`
        params.forEach((param: any) => {
          result += `<div style="color: #fff; margin: 2px 0;">
            <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 8px;"></span>
            ${param.seriesName}: <span style="color: #4a9eff; font-weight: bold;">${param.value}</span>
          </div>`
        })
        result += '</div>'
        return result
      }
    },
    legend: {
      data: ['黑名单', '白名单'],
      textStyle: { color: '#e0e0e0' },
      top: '5%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
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
    series: [
      {
        name: '黑名单',
        type: 'line',
        smooth: true,
        data: props.data.map(d => d.blacklist),
        lineStyle: { 
          color: '#ff4d4f', 
          width: 3,
          shadowColor: 'rgba(255, 77, 79, 0.3)',
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        itemStyle: { 
          color: '#ff4d4f',
          borderColor: '#fff',
          borderWidth: 2,
          shadowColor: 'rgba(255, 77, 79, 0.5)',
          shadowBlur: 8
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 77, 79, 0.4)' },
            { offset: 1, color: 'rgba(255, 77, 79, 0.05)' }
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
      },
      {
        name: '白名单',
        type: 'line',
        smooth: true,
        data: props.data.map(d => d.whitelist),
        lineStyle: { 
          color: '#52c41a', 
          width: 3,
          shadowColor: 'rgba(82, 196, 26, 0.3)',
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        itemStyle: { 
          color: '#52c41a',
          borderColor: '#fff',
          borderWidth: 2,
          shadowColor: 'rgba(82, 196, 26, 0.5)',
          shadowBlur: 8
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(82, 196, 26, 0.4)' },
            { offset: 1, color: 'rgba(82, 196, 26, 0.05)' }
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
      }
    ]
  }
  
  chart.setOption(option)
  chart.resize()
}
</script>