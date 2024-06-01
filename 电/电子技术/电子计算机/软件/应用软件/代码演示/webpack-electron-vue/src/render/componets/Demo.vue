<template>
  <div>
    <button @click="demo">点我</button>
    <h1>{{ message }}</h1>
  </div>
</template>

<script>
const {ipcRenderer} = require('electron')

export default {
  name: "Demo",
  data() {
    return {
      message: null
    }
  },
  methods: {
    demo() {
      // 向主进程发送数据，并等待主进程返回数据
      this.message = ipcRenderer.sendSync("demo", {message: "Hello man!"})
    }
  }
}
</script>

<style scoped>

</style>
