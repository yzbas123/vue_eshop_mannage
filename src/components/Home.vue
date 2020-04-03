<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="黑马" />
        <span>电商管理系统</span>
      </div>
      <el-button @click="logout" type="info">退出登录</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="asideWidth">
        <!-- 折叠菜单按钮 -->
        <div class="collapseMenu" @click="collapseMenu">|||</div>
        <!-- 菜单栏 -->
        <el-menu
          background-color="#313743"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
          v-if="aisdeMenuList.length!=0"
        >
          <!-- 菜单项目 -->
          <el-submenu v-for="item in aisdeMenuList" :key="item.id" :index="item.id+''">
            <!-- 菜单标题 -->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 子菜单项目 -->
            <el-menu-item
              v-for="child in item.children"
              :key="child.id"
              :index="'/'+child.path"
              @click="setActivePath('/'+child.path)"
            >
              <!-- 子菜单标题 -->
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{child.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主显示区 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单列表
      aisdeMenuList: [],
      // 字体图标与id的对应表
      iconsObj: {
        125: 'iconfont icon-users', // 用户管理的图标
        103: 'iconfont icon-tijikongjian', // 权限管理的图标
        101: 'iconfont icon-shangpin', // 商品管理的图标
        102: 'iconfont icon-danju', // 订单管理的图标
        145: 'iconfont icon-baobiao' // 数据统计的图标
      },
      // 控制菜单栏是否折叠的变量
      isCollapse: false,
      // 当前链接路径
      activePath: ''
    }
  },
  computed: {
    // 根据菜单是否缩放调整侧边栏的宽度
    asideWidth() {
      return this.isCollapse ? '64px' : '200px'
    }
  },
  created() {
    // 组件一旦创建,立即获取左侧菜单列表
    this.getAsideMenuList()
    // 组件一旦创建,获取当前链接
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 账号登出
    logout() {
      // sessionStorge清除缓存的数据
      window.sessionStorage.clear()
      // 使用路由管理对象跳转到登录界面
      this.$router.push('/login')
    },
    // 获取菜单列表数据
    async getAsideMenuList() {
      const { data: res } = await this.$https.get('menus')
      // 接收失败,提示用户相关错误信息
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 如果接收成功,将数据缓存到菜单列表中
      this.aisdeMenuList = res.data
    },
    // 控制菜单列表折叠
    collapseMenu() {
      this.isCollapse = !this.isCollapse
    },
    // 设置当前的链接
    setActivePath(path) {
      // 缓存到变量中
      this.activePath = path
      // 存储到sessionStorge中
      window.sessionStorage.setItem('activePath', this.activePath)
    }
  }
}
</script>

<style lang='less' scoped>
.el-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  background-color: rgb(54, 61, 64);
  > div {
    display: flex;
    align-items: center;
    > span {
      margin-left: 10px;
      color: #fff;
      font-size: 20px;
    }
  }
}
.el-aside {
  background-color: rgb(49, 55, 67);
  > .collapseMenu {
    font-size: 10px;
    color: #fff;
    text-align: center;
    line-height: 30px;
    letter-spacing: 0.5em;
    cursor: pointer;
  }
  > .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: rgb(233, 237, 240);
}
.iconfont {
  margin-right: 10px;
}
</style>
