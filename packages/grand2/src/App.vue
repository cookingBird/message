<template>
<div id="app">
  <img
    alt="Vue logo"
    src="./assets/logo.png"
  >
  <div>global:{{global}}</div>
  <button @click="getConfig">获取全局配置</button>
  <button @click="responserTest">Responser Test</button>
  <button @click="configTest">Config Test</button>
  <button @click="globalSend">全局发送</button>
  <div>{{msg}}</div>
  <HelloWorld msg="This is grand2" />
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
    return {
      msg: '',
      global: ''
    }
  },
  //grand2
  created() {
    this.$connector.$on(this, 'callback', (res) => {
      console.warn('success------callback--------', res)
    })
    this.$connector.$on(this, ({ data }) => {
      if (data.type === 'message') {
        this.global = data.data;
        console.warn('callback global send success-----------------', data, this.$connector.getMicroAppCode());
      }
    })
  },
  methods: {
    getConfig() {
      this.$connector.getConfig().then(res => {
        console.warn('get config success--------------', res)
      })
    },
    responserTest() {
      this.$connector.$send({
        target: 'main',
        type: 'responser',
        timeout: 3000
      }).then(res => {
        console.error('test responser success--------------', res)
      })
    },
    configTest() {
      this.$connector.$send({
        target: 'main',
        type: 'configTest',
        timeout: 3000
      }).then(res => {
        console.error('test configTest success--------------', res)
      })
    },
    globalSend() {
      this.$connector.$send({
        target: 'global',
        type: 'message',
        data: Math.floor(Math.random() * 100000)
      })
    }
  }
}
</script>

<style>
  body {
    height: 100vh;
    margin: 0;
  }

  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
</style>
