/* 导入网络请求相关 */
import axios from 'axios'
import 'quill/dist/quill.bubble.css'
// 导入vue-quill-editor的相关样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import Vue from 'vue'
// 导入vue-quill-editor
import VueQuillEditor from 'vue-quill-editor'
// 导入tree-table
import TreeTable from 'vue-table-with-tree-grid'
import App from './App.vue'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入element-ui
import './plugins/element.js'
import router from './router'

// 全局导入tree-table
Vue.component('tree-table', TreeTable)

// 全局安装vue-quill-editor
Vue.use(VueQuillEditor)

// 创建Axios实例 并设置基地址
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8888/api/private/v1/'
})
// 将axios实例挂载到全局
Vue.prototype.$https = axiosInstance
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

// 注册全局过滤器,用于处理时间格式
Vue.filter('dateFormate', originalVal => {
  const date = new Date(originalVal)
  const y = date.getFullYear()
  const m = ((date.getMonth() + 1) + '').padStart(2, '0')
  const d = (date.getDate() + '').padStart(2, '0')
  const h = (date.getHours() + '').padStart(2, '0')
  const mm = (date.getMinutes() + '').padStart(2, '0')
  const s = (date.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${h}:${mm}:${s}`
})

Vue.config.productionTip = false
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
