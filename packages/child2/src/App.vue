<template>
<div id="app">
  <img
    alt="Vue logo"
    src="./assets/logo.png"
  >

  <div>global:{{global}}</div>
  <button @click="globalSend">全局发送</button>
  <HelloWorld msg="This is child2" />
  <microApp
    :src="appConfig.url"
    frameborder="0"
    class="container-item"
    :microAppCode="appConfig.microAppCode"
    @edit="onEdit"
  >
  </microApp>
</div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  data() {
    const IP = 'http://localhost';
    return {
      appConfig: {
        url: IP + ':7012/?microAppCode=grand2',
        microAppCode: 'grand2'
      },
      global: ''
    }
  },
  created() {
    this.$connector.$on(this, ({ data }) => {
      if (data.type === 'message') {
        this.global = data.data;
        console.warn('callback global send success-----------------', data, this.$connector.getMicroAppCode());
      }
    })
  },
  methods: {
    globalSend() {
      this.$connector.$send({
        target: 'global',
        type: 'message',
        data: Math.floor(Math.random() * 100000)
      })
    },
    onEdit(data) {
      console.log('onEdit,this is child2--------------', data)
    }
  }
}
</script>

<style>
  html,
  body {
    height: 100vh;
    margin: 0;
  }

  iframe {
    height: 100%;
  }

  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    height: 100%;
  }
</style>
