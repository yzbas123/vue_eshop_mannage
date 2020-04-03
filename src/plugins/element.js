import { Aside, Breadcrumb, BreadcrumbItem, Button, Card, Col, Container, Form, FormItem, Header, Icon, Input, Main, Menu, MenuItem, Message, Row, Submenu, Table, TableColumn } from 'element-ui'
import Vue from 'vue'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(Icon)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
// Message的使用是挂在Vue的原型对象上
Vue.prototype.$msg = Message
