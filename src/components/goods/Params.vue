<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图区 -->
    <el-card>
      <!-- 头部警告区 -->
      <el-alert title="注意:只允许为第三级分类设置相关参数!" type="warning" :closable="false" show-icon></el-alert>
      <!-- 选中商品分类 -->
      <el-row class="cat_opt">
        <el-col>
          <span class="cat_title">选择商品分类:</span>
          <!-- 级联选择框 -->
          <el-cascader
            :options="cateList"
            v-model="selectedCates"
            @change="cateChange"
            :props="cateProps"
            clearable
            popper-class="params_cascader-popmenu"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页 -->
      <el-tabs v-model="activeTabName" @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyParamsList" stripe border>
            <!-- 可扩展行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="removeParamVal(scope.row,i)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引行 -->
            <el-table-column type="index" label="#"></el-table-column>
            <!-- 参数名称 -->
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <!-- 操作 -->
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  size="mini"
                  @click="showEditParams(scope.row.attr_id)"
                  icon="el-icon-edit"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="deleteParamByID(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyParamsList" stripe border>
            <!-- 可扩展行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="removeParamVal(scope.row,i)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引行 -->
            <el-table-column type="index" label="#"></el-table-column>
            <!-- 参数名称 -->
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <!-- 操作 -->
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  size="mini"
                  @click="showEditParams(scope.row.attr_id)"
                  icon="el-icon-edit"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="deleteParamByID(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- '添加参数'对话框 -->
    <el-dialog
      :title="'添加'+dialogTitleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 对话框主显示区 -->
      <el-form
        :model="addParamsForm"
        :rules="addParamsFormRules"
        ref="addParamsFormRef"
        label-width="100px"
      >
        <!-- 参数名称 -->
        <el-form-item :label="dialogTitleText" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- '修改参数'对话框 -->
    <el-dialog
      :title="'修改'+dialogTitleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 对话框主显示区 -->
      <el-form
        :model="editParamsForm"
        :rules="editParamsFormRules"
        ref="editParamsFormRef"
        label-width="100px"
      >
        <!-- 参数名称 -->
        <el-form-item :label="dialogTitleText" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 被选中商品分类列表,
      selectedCates: [],
      // 级联选择框配置对象,
      cateProps: {
        // 指定选项的名称
        label: 'cat_name',
        // 指定选项的值
        value: 'cat_id',
        // 指定依据什么属性作为级联关系的参考
        children: 'children',
        // 级联列表的弹出触发
        expandTrigger: 'hover',
        // 接连列表各级选项是否都可选
        checkStrictly: false
      },
      // 标签页选中的数据,默认选中动态
      activeTabName: 'many',
      // 动态参数列表
      manyParamsList: [],
      // 静态属性列表
      onlyParamsList: [],
      // '添加参数'对话框的显示
      addDialogVisible: false,
      // '添加参数'对话框中的表单对象
      addParamsForm: {
        attr_name: ''
      },
      // '添加参数'对话框中的表单验证对象
      addParamsFormRules: {
        attr_name: [{ required: true, message: '请输入参数', trriger: 'blur' }]
      },
      // '修改参数'对话框的显示
      editDialogVisible: false,
      // '修改参数'对话框中的表单对象
      editParamsForm: {
        attr_name: ''
      },
      // '修改参数'的表单验证对象
      editParamsFormRules: {
        attr_name: [{ required: true, message: '请输入参数', trriger: 'blur' }]
      }
    }
  },
  created() {
    // 创建时,获取分类列表
    this.getCateList()
  },
  computed: {
    // 是否禁用按钮
    isBtnDisabled() {
      //   只要选中的项目个数不是三,代表不是三级标题,就禁用按钮
      return this.selectedCates.length !== 3
    },
    // 获取当前选中的三级分类id
    lv3CateID() {
      if (this.selectedCates.length === 3) {
        return this.selectedCates[this.selectedCates.length - 1]
      }
      return null
    },
    // 根据标签页名称设置对话框标题
    dialogTitleText() {
      let res = ''
      if (this.activeTabName === 'many') {
        res = '动态参数'
      } else if (this.activeTabName === 'only') {
        res = '静态属性'
      }
      return res
    }
  },
  methods: {
    // 获取商品分类列表
    async getCateList() {
      const { data: res } = await this.$https.get('categories')
      if (res.meta.status !== 200) return this.$msg.error('商品分类请求失败!')
      this.cateList = res.data
    },
    // 监听级联选择的选项改变事件
    cateChange() {
      this.getParams()
    },
    // 监听标签页点击事件
    handleTabClick() {
      this.getParams()
    },
    //
    async getParams() {
      if (this.selectedCates.length !== 3) {
        // 若选中的不是三级分类
        // 清空选中数组
        this.selectedCates = []
        // 清空下面的表格渲染所需的两个数组
        this.manyParamsList = []
        this.onlyParamsList = []
        return undefined
      }
      // 发送请求获取参数或是属性
      const { data: res } = await this.$https.get(
        `categories/${this.lv3CateID}/attributes`,
        {
          params: {
            sel: this.activeTabName
          }
        }
      )
      if (res.meta.status !== 200) return this.$msg.error('获取参数失败!')
      res.data.forEach(ele => {
        // 将其中的attr_vals的数据整理为数组
        ele.attr_vals = ele.attr_vals === '' ? [] : ele.attr_vals.split(' ')
        // 设置自定义属性,用于控制标签显示 和 值绑定
        ele.inputVisible = false
        ele.inputValue = ''
      })
      if (this.activeTabName === 'many') {
        // 如果是动态参数,就存到动态参数对应列表
        this.manyParamsList = res.data
      } else {
        // 如果是静态属性,就存到静态属性对应列表
        this.onlyParamsList = res.data
      }
    },
    // 监听 '添加参数'对话框关闭
    addDialogClosed() {
      this.$refs.addParamsFormRef.resetFields()
    },
    // 添加参数
    addParams() {
      // 验证
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) return this.$msg.error('请按要求填写表单!')
        // 发送请求
        const { data: res } = await this.$https.post(
          `categories/${this.lv3CateID}/attributes`,
          {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeTabName
          }
        )
        if (res.meta.status !== 201) return this.$msg.error('添加参数失败!')
        // 通知成功
        this.$msg.success('添加参数成功!')
        // 重新获取参数列表
        this.getParams()
        // 隐藏对话框
        this.addDialogVisible = false
      })
    },
    // 监听 修改 按钮
    async showEditParams(attrID) {
      // 根据参数ID请求数据
      const { data: res } = await this.$https.get(
        `categories/${this.lv3CateID}/attributes/${attrID}`
      )
      if (res.meta.status !== 200) return this.$msg.error('获取参数失败!')
      // 缓存数据到表单对象中
      this.editParamsForm = res.data
      // 显示 '修改对话框'
      this.editDialogVisible = true
    },
    // 监听 '修改参数'对话框关闭
    editDialogClosed() {
      this.$refs.editParamsFormRef.resetFields()
    },
    // 修改参数
    editParams() {
      // 验证
      this.$refs.editParamsFormRef.validate(async valid => {
        if (!valid) return this.$msg.error('请按照要求填写表单!')
        // 发送修改请求
        const { data: res } = await this.$https.put(
          `categories/${this.lv3CateID}/attributes/${this.editParamsForm.attr_id}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeTabName
          }
        )
        // 判断修改请求是否成功
        if (res.meta.status !== 200) return this.$msg.error('修改参数失败!')
        // 通知成功
        this.$msg.success('修改参数成功!')
        // 重新获取参数列表
        this.getParams()
        // 隐藏对话框
        this.editDialogVisible = false
      })
    },
    // 监听'删除'按钮
    async deleteParamByID(attrID) {
      // 弹出消息盒子,提醒用户
      const result = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果result不是confirm 提示用户,取消删除,并结束本次操作
      if (result !== 'confirm') return this.$msg.info('已取消删除')
      // 发起删除请求
      const { data: res } = await this.$https.delete(
        `categories/${this.lv3CateID}/attributes/${attrID}`
      )
      // 判断 删除请求是否成功
      if (res.meta.status !== 200) return this.$msg.error('删除参数失败!')
      // 通知
      this.$msg.success('删除参数成功!')
      // 重新获取参数列表
      this.getParams()
    },
    // 监听 按下enter 或则 失去焦点
    handleInputConfirm(row) {
      // 如果文本内容为空,则处理返回
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return undefined
      }
      // 添加到数组中
      row.attr_vals.push(row.inputValue)
      // 重置文本值
      row.inputValue = ''
      // 隐藏
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // 将attr_vals的改动发送请求到服务器进行修改
    async saveAttrVals(row) {
      // 发送更改参数值的请求修改参数
      const { data: res } = await this.$https.put(
        `categories/${this.lv3CateID}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeTabName,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      // 判断修改请求是否成功
      if (res.meta.status !== 200) return this.$msg.error('修改参数项失败!')
      // 提醒用户
      this.$msg.success('修改参数项成功!')
    },
    // 监听 标签的点击事件
    showInput(row) {
      // 显示输入框
      row.inputVisible = true
      // 等待设置的输入框被绘制出来再设置其焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 监听 标签 的关闭事件
    removeParamVal(row, index) {
      // 数组中删除被点击的标签
      row.attr_vals.splice(index)
      // 将此改动存到数据库
      this.saveAttrVals(row)
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 20px 16px;
}
.cat_title {
  margin-right: 10px;
}
.el-cascader {
  width: 250px;
}
.el-tag {
  margin: 0 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
