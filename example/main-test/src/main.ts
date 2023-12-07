import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import router from '@/router/index';
import 'ant-design-vue/dist/antd.css';
import WujieVue from 'wujie-vue3';
import App from './App.vue';

const app = createApp(App);
app
  .use(router)
  .use(WujieVue)
  .use(Antd)
  .mount('#app');
