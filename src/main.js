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
import TreeTable from 'vue-table-with-tree-grid'

Vue.component('tree-table', TreeTable)
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8888/api/private/v1/'
})
// 增加请求拦截器
axiosInstance.interceptors.request.use(config => {
  // 所有请求发送前,都读取sessionStorge中的token
  // 设置到请求头的自定义字段 Authorization 中 ,该字段是服务器定好的
  // 这里简单说明一下为什么不适用发送请求时,传入配置,因为那样每调用一次,就要写一次这句话
  // 这里统一拦截所有的请求,并设置,减少代码
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 拦截后,必须返回config,否则请求无响应配置
  return config
})
Vue.prototype.$https = axiosInstance
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
