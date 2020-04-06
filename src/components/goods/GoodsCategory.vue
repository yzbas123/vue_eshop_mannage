<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 添加分类 -->
      <el-row>
        <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      </el-row>
      <!-- 表格区域 -->
      <tree-table
        :data="categoryList"
        :columns="columns"
        :expand-type="false"
        :selection-type="false"
        :show-row-hover="false"
        border
        show-index
        index-text="#"
      >
        <!-- 是否有效列 -->
        <template v-slot:isOK="scope">
          <i
            class="el-icon-success statu_icon"
            style="color:lightgreen"
            v-if="!scope.row.cat_deleted"
          ></i>
          <i class="el-icon-error statu_icon" style="color:red" v-else></i>
        </template>
        <!-- 排序列 -->
        <template v-slot:order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template v-slot:operation="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditCateDialog(scope.row)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCate(scope.row)"
          >删除</el-button>
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination
        :current-page="categoryQueryInfo.pagenum"
        :page-sizes="[1, 3, 5, 10]"
        :page-size="categoryQueryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      ></el-pagination>
      <!-- 添加分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="addCateDialogClose"
      >
        <!-- 对话框主显示区 -->
        <el-form
          :model="addCateForm"
          :rules="addCateFormRules"
          ref="addCateFormRef"
          label-width="80px"
        >
          <!-- 分类名称 -->
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <!-- 父级分类 -->
          <el-form-item label="父级分类">
            <!-- 级联选择框 -->
            <el-cascader
              :options="parentCateList"
              v-model="selectedParentCates"
              @change="parentCateChange"
              :props="parentCateProps"
              clearable
              popper-class="cate_cascader-popmenu"
            ></el-cascader>
          </el-form-item>
        </el-form>
        <!-- 对话框底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCategory">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑分类对话框 -->
      <el-dialog
        title="编辑分类"
        :visible.sync="editCateDialogVisible"
        width="50%"
        @close="editCateDialogClose"
      >
        <!-- 对话框主显示区 -->
        <el-form
          :model="editCateForm"
          :rules="editCateFormRules"
          ref="editCateFormRef"
          label-width="80px"
        >
          <!-- 分类名称 -->
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 对话框底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCategory">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类请求对象
      categoryQueryInfo: {
        // 分类级别
        type: 3,
        // 当前页码值
        pagenum: 1,
        // 每页显示多少数据
        pagesize: 5
      },
      // 商品分类列表
      categoryList: [],
      // 总页数
      total: 0,
      // 列数据配置信息
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          // 具名插槽指定名称
          template: 'isOK'
        },
        {
          label: '排序',
          type: 'template',
          // 具名插槽指定名称
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          // 具名插槽指定名称
          template: 'operation'
        }
      ],
      // 控制 '添加分类'对话框的显示
      addCateDialogVisible: false,
      // '添加分类'中的表单数据对象
      addCateForm: {
        // 分类名称
        cat_name: '',
        // 分类等级
        cat_level: 0,
        // 父分类ID
        cat_pid: 0
      },
      // '添加分类'中的表单验证集
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trriger: 'blur' }
        ]
      },
      // 父级分类的数据列表
      parentCateList: [],
      // 被选中的父级分类列表
      selectedParentCates: [],
      // 父级分类的级联选择器的配置对象
      parentCateProps: {
        // 指定选项的名称
        label: 'cat_name',
        // 指定选项的值
        value: 'cat_id',
        // 指定依据什么属性作为级联关系的参考
        children: 'children',
        // 级联列表的弹出触发
        expandTrigger: 'hover',
        // 接连列表各级选项是否都可选
        checkStrictly: true
      },
      // 编辑分类的表单数据
      editCateForm: {
        cat_name: '',
        cat_id: '',
        cat_pid: '',
        cat_level: ''
      },
      // 控制 编辑分类对话框显示的变量
      editCateDialogVisible: false,
      // 编辑分类 表单验证对象集
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trriger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    // 获取分类数据列表
    async getCategoryList() {
      // 请求商品分类数据
      const { data: res } = await this.$https.get('categories', {
        params: this.categoryQueryInfo
      })
      //
      if (res.meta.status !== 200) this.$msg.error('请求商品分类错误!')
      // 缓存至分类列表
      this.categoryList = res.data.result
      // 缓存总页数
      this.total = res.data.total
    },
    // 监听 每页显示多少数据的修改
    handleSizeChange(size) {
      // 获取修改的每页显示数据条数
      this.categoryQueryInfo.pagesize = size
      // 发起请求,获取对应参数的数据
      this.getCategoryList()
    },
    // 监听当前页码变更
    handleCurrentChange(currentPage) {
      // 获取当前的页码
      this.categoryQueryInfo.pagenum = currentPage
      // 发起请求,获取对应参数的数据
      this.getCategoryList()
    },
    // 监听'添加分类'对话框关闭
    addCateDialogClose() {
      // 重置表单
      this.$refs.addCateFormRef.resetFields()
      // 清空选中项
      this.selectedParentCates = []
    },
    // 获取父级分类列表
    async getParentCateList() {
      // 只获取到第二层的分类信息
      const { data: res } = await this.$https.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) return this.$msg.error('请求父级分类错误!')
      // 将数据缓存起来
      this.parentCateList = res.data
    },
    // 监听 '添加分类' 按钮
    showAddCateDialog() {
      // 请求分类数据
      this.getParentCateList()
      // 显示对话框
      this.addCateDialogVisible = true
    },
    // 监听'级联选择器'对应的父级分类改变
    parentCateChange() {
      // 处理选中的级联选择器数据
      if (this.selectedParentCates.length !== 0) {
        // 如果有分类被选中
        // 那么数组中的最后一个数据才是父分类ID
        this.addCateForm.cat_pid = this.selectedParentCates[
          this.selectedParentCates.length - 1
        ]
        // 分类等级就是数组的长度
        this.addCateForm.cat_level = this.selectedParentCates.length
      } else {
        // 如果没有分类被选中,设置父分类ID为0,分类等级为1,代表添加的分类为一级分类
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 监听 '添加分类'对话框的确定按钮
    addCategory() {
      // 判断分类名称填写没有
      // if (this.addCateForm.cat_name === '') {
      //   return this.$msg.error('请输入分类名称')
      // }
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return this.$msg.error('请按照要求填写表单')

        // 发送请求
        const { data: res } = await this.$https.post(
          'categories',
          this.addCateForm
        )
        // 处理请求结果
        if (res.meta.status !== 201) return this.$msg.error('添加分类错误!')
        // 成功后,清空当前选中的数据
        // 这样的话,如果不成功还可以保留上一次选中的
        this.selectedParentCates = []
        // 通知
        this.$msg.success('添加分类成功!')
        // 更新
        this.getCategoryList()
        // 隐藏对话框
        this.addCateDialogVisible = false
      })
    },
    // 监听 '编辑' 按钮
    showEditCateDialog(cate) {
      // 设置当前分类
      this.editCateForm.cat_name = cate.cat_name
      this.editCateForm.cat_id = cate.cat_id
      this.editCateForm.cat_pid = cate.cat_pid
      this.editCateForm.cat_level = cate.cat_level
      console.log(cate)
      // 显示对话框true
      this.editCateDialogVisible = true
    },
    // 监听 '编辑分类'对话框的关闭
    editCateDialogClose() {
      // 清除表单
      this.$refs.editCateFormRef.resetFields()
    },
    // 监听 '编辑分类'对话框确定按钮
    editCategory() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return this.$msg.error('请按照要求填写表单')
        // 发送请求
        const { data: res } = await this.$https.put(
          `categories/${this.editCateForm.cat_id}`,
          {
            cat_name: this.editCateForm.cat_name
          }
        )
        // 请求失败,通知用户
        if (res.meta.status !== 200) return this.$msg.error('修改分类名称错误!')
        // 通知用户成功
        this.$msg.success('修改分类名称成功!')
        // TODO:根据当前表单中的id,找到在分类列表中的分类,修改其数据,不触发整体重绘
        // 重新获取分类列表
        this.getCategoryList()
        // 隐藏对话框
        this.editCateDialogVisible = false
      })
    },
    // 监听 '删除'按钮
    async removeCate(cate) {
      // 弹出消息盒子,提醒用户
      const result = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
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
      const { data: res } = await this.$https.delete(
        `categories/${cate.cat_id}`
      )
      if (res.meta.status !== 200) return this.$msg.error('删除分类失败!')
      // 重新获取
      this.getCategoryList()
    }
  }
}
</script>

<style lang="less" scoped>
.zk-table {
  margin-top: 10px;
}
.el-cascader {
  width: 100%;
}
</style>
