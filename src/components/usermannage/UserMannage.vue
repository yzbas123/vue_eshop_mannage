<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片显示区域 -->
    <el-card>
      <!-- 用户搜索区域 -->
      <el-row :gutter="20">
        <!-- 用户搜索区域 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <!-- 添加用户按钮 -->
        <el-col :span="4">
          <el-button type="primary">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表展示区域 -->
      <el-table :data="userList" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state"></el-table-column>
        <el-table-column label="操作"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 请求参数对象
      queryObj: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 总页数
      totalPage: 0,
      // 用户列表
      userList: []
    }
  },
  created() {
    //   组件创建后立即请求数据
    this.getUsersList()
  },
  methods: {
    async getUsersList() {
      const { data: res } = await this.$https.get('users', {
        params: this.queryObj
      })
      if (res.meta.status !== 200) {
        this.$messg.error('获取用户列表失败')
      }
      //   缓存相关数据
      this.totalPage = res.data.total // 此次接口文档有问题
      this.userList = res.data.users
    }
  }
}
</script>

<style lang="less" scoped>
</style>
