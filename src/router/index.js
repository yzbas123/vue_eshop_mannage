import Vue from 'vue'
import VueRouter from 'vue-router'
import Add from '../components/goods/Add.vue'
import GoodsCategory from '../components/goods/GoodsCategory.vue'
import List from '../components/goods/List.vue'
import Params from '../components/goods/Params.vue'
import Home from '../components/Home.vue'
import Login from '../components/Login.vue'
import Order from '../components/order/Order.vue'
import Rights from '../components/rights/Rights.vue'
import Roles from '../components/rights/Roles.vue'
import UserMannage from '../components/usermannage/UserMannage.vue'
import Welcome from '../components/Welcome.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcom',
    children: [
      { path: '/welcom', component: Welcome },
      { path: '/users', component: UserMannage },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: GoodsCategory },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order }
    ]
  }
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
