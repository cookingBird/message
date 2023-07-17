/**
 * @author dengtao
 */
import './polyfill';
import { ApplicationChannel } from './ApplicationChannel';
import microAppVue from './MicroApp.vue';

/**@type {ApplicationChannel} */
const connector = new ApplicationChannel()
connector.applicationBootstrap()

export { connector }

export default {
  install(app, options = {}) {
    if (options.configKey) {
      connector.setGlobalConfigField(configKey)
    }
    Object.defineProperty(app.config.globalProperties, '$connector', {
      get() {
        return connector
      },
      set(v) {
        throw Error("$connector can't set value")
      }
    })
    console.log("microAppVue", microAppVue);
    app.component(microAppVue.__name, microAppVue);
  }
}
