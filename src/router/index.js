import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../components/Home.vue'
import Login from '../components/Login.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home }
]

const router = new VueRouter({
  routes
})
router.beforeEach((to, from, next) => {
  // 目标路径如果是登录界面就继续
  if (to.path === '/login') return next()
  // 否则其他页面都需要从sessionStorge中去除token判断是否存在
  const tokenStr = window.sessionStorage.getItem('token')
  // 若不存在强制跳转到登录界面 next(路径) 直接指定跳转的路径
  if (!tokenStr) return next('/login')
  // 若存在继续
  next()
})
export default router
