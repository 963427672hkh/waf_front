<template>
  <!-- 3D地球组件已移至App.vue中实现 -->
  <div class="globe-placeholder">
    <p>3D地球组件已集成到主组件中</p>
  </div>
</template>

<script>
export default {
  name: 'Globe',
  setup() {
    console.log('Globe组件已加载，但实际功能在App.vue中实现')
    return {}
  }
}
</script>

<style scoped>
.globe-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #888;
  font-size: 14px;
}
</style>
