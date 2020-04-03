/* 导入网络请求相关 */
import axios from 'axios'
import Vue from 'vue'
import App from './App.vue'
/* 导入全局样式表 */
import './assets/css/global.css'
/* 导入字体图标 */
import './assets/fonts/iconfont.css'
import './plugins/element.js'
import router from './router'
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8888/api/private/v1/'
})
Vue.prototype.$https = axiosInstance
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
