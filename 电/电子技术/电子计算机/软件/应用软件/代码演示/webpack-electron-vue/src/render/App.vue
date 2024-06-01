<template>
  <div>
    <div>
      <h1>{{ message }}</h1>
      <Demo></Demo>
      <router-link to="/router-demo">router-demo</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import Demo from './componets/Demo'

export default {
  name: "App",
  data() {
    return {
      message: "Hello World"
    }
  },
  components: {
    Demo
  }
}
</script>