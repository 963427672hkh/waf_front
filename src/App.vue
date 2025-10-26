<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* 全局样式 */
body {
  margin: 0;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
  color: #e0e0e0;
  min-height: 100vh;
  overflow-x: hidden;
}

/* 添加全局背景粒子效果 */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(74,158,255,0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255,140,0,0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255,107,53,0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

#app {
  min-height: 100vh;
}
</style>