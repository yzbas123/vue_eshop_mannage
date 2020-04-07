<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图区 -->
    <el-card>
      <!-- 商品搜索区域 -->
      <el-row :gutter="20">
        <!-- 商品搜索区域 -->
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="goodsQueryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加商品按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="showAddGoodsPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="goodsList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="120px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="80px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="180px">
          <template v-slot="scope">{{scope.row.add_time|dateFormate}}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template v-slot="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteGood(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 数据分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="goodsQueryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="goodsQueryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 请求商品信息的查询对象
      goodsQueryInfo: {
        // 商品查询字符串
        query: '',
        // 当前页索引
        pagenum: 1,
        // 每页显示多少条商品数据
        pagesize: 15
      },
      // 商品列表
      goodsList: [],
      // 商品的总数
      total: 0,
      // 控制'添加商品'显示对话框
      addDialogVisible: false
      //
    }
  },
  created() {
    // 组件创建时,获取商品列表信息
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      // 发起请求
      const { data: res } = await this.$https.get('goods', {
        params: this.goodsQueryInfo
      })
      if (res.meta.status !== 200) return this.$msg.error('请求商品信息失败!')
      // 缓存商品信息
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 监听分页的页索引变化
    handleCurrentChange(pageIndex) {
      // 修改商品相关请求信息
      this.goodsQueryInfo.pagenum = pageIndex
      // 发起请求
      this.getGoodsList()
    },
    // 监听每页包含数据量变化
    handleSizeChange(size) {
      // 修改商品相关请求信息
      this.goodsQueryInfo.pagesize = size
      // 发起请求
      this.getGoodsList()
    },
    // 监听 '删除'商品按钮
    async deleteGood(row) {
      // 弹出消息盒子,提醒用户
      const result = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果result不是confirm 提示用户,取消删除,并结束本次操作
      if (result !== 'confirm') return this.$msg.info('已取消删除')
      // 否则发起删除请求
      const { data: res } = await this.$https.delete(`goods/${row.goods_id}`)
      // 判断是否请求成功
      if (res.meta.status !== 200) return this.$msg.error('删除商品失败!')
      // 否则提醒删除成功
      this.$msg.success('删除商品成功')
      // 重新获取商品列表
      this.goodsList.splice(
        this.goodsList.findIndex(val => val.goods_id === row.goods_id),
        1
      )
    },
    // 监听'添加商品'按钮
    showAddGoodsPage() {
      // 使用路由管理器跳转到添加页面
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang='less' scoped>
</style>
