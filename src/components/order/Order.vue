<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 订单搜索区域 -->
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="ordersQueryInfo.query"
            clearable
            @clear="getOrdersList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单表格区域 -->
      <el-table :data="ordersList" border stripe>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <!-- 订单编号 -->
        <el-table-column prop="order_number" label="订单编号" width="400px"></el-table-column>
        <!-- 订单价格 -->
        <el-table-column prop="order_price" label="订单价格" width="80px"></el-table-column>
        <!-- 是否付款 -->
        <el-table-column label="是否付款" width="100px">
          <template v-slot="scope">
            <el-tag type="danger" v-if="scope.row.pay_status==='0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <!-- 是否发货 -->
        <el-table-column prop="is_send" label="是否发货" width="80px"></el-table-column>
        <!-- 下单时间 -->
        <el-table-column label="下单时间">
          <template v-slot="scope">{{scope.row.create_time|dateFormate}}</template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column label="操作">
          <template>
            <!-- 修改地址按钮 -->
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editAddrDialogVisible=true"
            ></el-button>
            <!-- 物流进度按钮 -->
            <el-button
              size="mini"
              type="success"
              icon="el-icon-location"
              @click="showProgressDialog"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="ordersQueryInfo.pagenum"
        :page-sizes="[1, 3, 5, 10]"
        :page-size="ordersQueryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- '修改地址'对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editAddrDialogVisible"
      width="50%"
      @close="editAddrDialogClosed"
    >
      <!-- 对话框主显示区 -->
      <el-form
        :model="editAddrForm"
        :rules="editAddrFormRules"
        ref="editAddrFormRef"
        label-width="100px"
      >
        <!-- 省市区/县 -->
        <el-form-item label="省市区/县" prop="city_name">
          <!-- 级联选择器 -->
          <!-- 级联选择框 -->
          <el-cascader
            :options="citydata"
            v-model="editAddrForm.city_name"
            :props="cityProps"
            clearable
            popper-class="params_cascader-popmenu"
          ></el-cascader>
        </el-form-item>
        <!-- 详细地址 -->
        <el-form-item label="详细地址" prop="detail_address">
          <el-input v-model="editAddrForm.detail_address"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editAddrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddr">确 定</el-button>
      </span>
    </el-dialog>
    <!-- '物流进度'对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressDialogVisible"
      width="50%"
      @close="progressDialogClosed"
    >
      <!-- 对话框主显示区 -->
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in deliveryProgresses"
          :key="index"
          :timestamp="item.time"
        >{{item.context}}</el-timeline-item>
      </el-timeline>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="progress">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import citydata from './citydata'
export default {
  data() {
    return {
      // 查询订单信息的请求信息
      ordersQueryInfo: {
        // 查询参数
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 10,
        // 用户 ID
        user_id: '',
        // 支付状态,
        pay_status: '',
        // 是否发货
        is_send: '',
        // ['个人','公司']
        order_fapiao_title: '',
        // 公司名称
        order_fapiao_company: '',
        // 发票内容
        order_fapiao_content: '',
        // 发货地址
        consignee_addr: ''
      },
      // 省市区/县信息
      citydata,
      // 订单总量
      total: 0,
      // 订单列表
      ordersList: [],
      // 控制 '修改地址' 对话框的显示
      editAddrDialogVisible: false,
      // 修改地址的表单对象
      editAddrForm: {
        // 被选中的省市区/县信息
        city_name: [],
        // 详细信息
        detail_address: ''
      },
      // 修改地址的表单验证对象
      editAddrFormRules: {
        city_name: [
          {
            type: 'array',
            required: true,
            message: '请选择城市',
            trriger: 'change'
          }
        ],
        detail_address: [
          {
            type: 'string',
            required: true,
            message: '请输入详细地址',
            trriger: 'blur'
          }
        ]
      },
      // 配置选中省市区/县的级联选择器的信息
      cityProps: {
        // 指定选项的名称
        label: 'label',
        // 指定选项的值
        value: 'value',
        // 指定依据什么属性作为级联关系的参考
        children: 'children',
        // 级联列表的弹出触发
        expandTrigger: 'hover',
        // 接连列表各级选项是否都可选
        checkStrictly: false
      },
      // 控制 '物流进度'对话框的显示
      progressDialogVisible: false,
      // 物流进度信息列表
      deliveryProgresses: []
    }
  },
  created() {
    // 获取订单信息
    this.getOrdersList()
  },
  methods: {
    // 获取订单信息
    async getOrdersList() {
      const { data: res } = await this.$https.get('orders', {
        params: this.ordersQueryInfo
      })
      if (res.meta.status !== 200) return this.$msg.error('请求订单信息失败!')
      // 请求成功将数据缓存至订单列表
      this.ordersList = res.data.goods
      // 缓存全部订单数量
      this.total = res.data.total
      // 缓存当前页索引
      this.ordersQueryInfo.pagnum = res.data.pagenum
    },
    // 监听 每页显示总量改变
    handleSizeChange(size) {
      // 改变当前请求信息中的对应变量
      this.ordersQueryInfo.pagesize = size
      // 发起请求
      this.getOrdersList()
    },
    // 监听 当前页索引改变
    handleCurrentChange(currentPage) {
      // 改变当前请求信息中的对应变量
      this.ordersQueryInfo.pagenum = currentPage
      // 发起请求
      this.getOrdersList()
    },
    // 监听 '修改地址'对话框关闭
    editAddrDialogClosed() {
      // 重置表单
      this.$refs.editAddrFormRef.resetFields()
    },
    // 监听 修改地址 的确定按钮
    editAddr() {
      // 验证表单是否合格填写
      this.$refs.editAddrFormRef.validate(valid => {
        if (!valid) return this.$msg.error('请按要求填写表单!')
        // 验证无误
        this.$msg.success(
          '修改地址成功,但是服务器没这个功能,你就看看控制台打印算了'
        )
        console.log(
          `${this.editAddrForm.city_name.join('')} ${
            this.editAddrForm.detail_address
          }`
        )
      })
    },
    // 监听 物流进度 按钮
    async showProgressDialog() {
      // 发起请求获取物流进度信息
      const { data: res } = await this.$https.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) return this.$msg.error('请求物流信息失败')
      // 缓存物流信息到相关变量
      this.deliveryProgresses = res.data
      // 显示对话框
      this.progressDialogVisible = true
    },
    // 监听物流进度关闭事件
    progressDialogClosed() {},
    // 监听物流进度对话框的确定按钮事件
    progress() {}
  }
}
</script>

<style lang="less" scoped>
</style>
