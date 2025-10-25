<template>
  <div ref="chartRef" style="height:100%; width:100%;"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { ref, onMounted, watch, nextTick } from 'vue'

const props = defineProps<{ data: {type: string, count: number}[] }>()
const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

// 攻击类型颜色映射
const getAttackColor = (type: string) => {
  const colors: { [key: string]: string } = {
    '目录穿越': '#4a9eff',
    '后门': '#ff8c00',
    '信息泄露': '#52c41a',
    '文件包含': '#722ed1',
    '命令注入': '#1890ff',
    'SQL注入': '#ff4d4f',
    'XSS': '#faad14',
    'CSRF': '#13c2c2'
  }
  return colors[type] || '#666'
}

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
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#ff8c00',
      borderWidth: 1,
      textStyle: { color: '#fff' },
      formatter: function (params: any) {
        return `<div style="padding: 8px;">
          <div style="font-weight: bold; color: #ff8c00; margin-bottom: 4px;">${params.name}</div>
          <div style="color: #fff;">攻击次数: <span style="color: #4a9eff; font-weight: bold;">${params.value}</span></div>
          <div style="color: #fff;">占比: <span style="color: #4a9eff; font-weight: bold;">${params.percent}%</span></div>
        </div>`
      }
    },
    legend: {
      show: false
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        data: props.data.map(d => ({ 
          name: d.type, 
          value: d.count,
          itemStyle: { 
            color: getAttackColor(d.type),
            borderColor: '#fff',
            borderWidth: 2,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 10
          }
        })),
        label: { 
          show: false 
        },
        labelLine: { 
          show: false 
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#fff'
          }
        },
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx: number) {
          return Math.random() * 200
        }
      }
    ]
  }
  
  chart.setOption(option)
  chart.resize()
}
</script>