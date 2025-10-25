import * as echarts from 'echarts'

let _loaded = false

export async function loadChinaMap (url = '/maps/china.json') {
  if (_loaded) return true
  if (!echarts || typeof echarts.registerMap !== 'function') {
    console.error('[loadChinaMap] echarts.registerMap not available')
    return false
  }

  try {
    const res = await fetch(url, { cache: 'no-cache' })
    if (!res.ok) throw new Error('Failed to fetch china map: ' + res.status)
    const geo = await res.json()
    echarts.registerMap('china', geo)
    _loaded = true
    return true
  } catch (err) {
    console.error('[loadChinaMap] error loading china map', err)
    return false
  }
}
