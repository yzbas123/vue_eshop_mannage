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
          <el-input placeholder="请输入内容" v-model="queryObj.query" clearable @clear="getUsersList">
            <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加用户按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表展示区域 -->
      <el-table :data="userList" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- 使用作用域插槽获取传入子组件中的mg_state状态数据 -->
          <!-- 这里我之前的疑惑是:既然父组件自己就能访问到这个mg_state,干嘛还要通过作用域插槽去访问一个父组件传进去的组件呢 -->
          <!-- 其实,这里虽然能直接通过userList获取用户信息对象,但是不是具体的某一个,而是一个数组,之前通过:data传入userList之后,子组件获取的就是遍历过程中的每个单个的用户信息了 -->
          <!-- 这样就能使得这里的状态信息反应每个用户自己不同的状态了 -->
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="handleStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="scope">
            <!-- 编辑用户 -->
            <el-tooltip effect="dark" content="编辑用户" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditUserDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 删除用户 -->
            <el-tooltip effect="dark" content="删除用户" placement="top" :enterable="false">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="removeUserByID(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 修改角色 -->
            <el-tooltip effect="dark" content="修改角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRoleDialogShow(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 数据分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryObj.pagenum"
        :page-sizes="[1, 3, 5, 10]"
        :page-size="queryObj.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalPage"
      ></el-pagination>

      <!-- '添加用户'对话框 -->
      <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <!-- 对话框主显示区 -->
        <el-form
          :model="addUserForm"
          :rules="addUserFormRules"
          ref="addUserFormRef"
          label-width="70px"
        >
          <!-- 用户名 -->
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addUserForm.username"></el-input>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item label="密码" prop="password">
            <el-input v-model="addUserForm.password"></el-input>
          </el-form-item>
          <!-- 邮箱 -->
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addUserForm.email"></el-input>
          </el-form-item>
          <!-- 手机 -->
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 对话框底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- '编辑用户信息'对话框 -->
      <el-dialog
        title="编辑用户信息"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
      >
        <!-- 对话框主显示区 -->
        <el-form
          :model="editUserForm"
          :rules="editUserFormRules"
          ref="editUserFormRef"
          label-width="70px"
        >
          <!-- 用户名 -->
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editUserForm.username" disabled></el-input>
          </el-form-item>
          <!-- 邮箱 -->
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editUserForm.email"></el-input>
          </el-form-item>
          <!-- 手机 -->
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 对话框底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- '修改角色'对话框 -->
      <el-dialog
        title="修改角色"
        :visible.sync="setRoleDialogVisible"
        width="50%"
        @close="setRoleDialogClose"
      >
        <!-- 对话框主显示区 -->
        <div>
          <p>用户名: {{this.userInfor.username}}</p>
          <p>当前角色: {{this.userInfor.role_name}}</p>
          <p>
            分配新角色:
            <el-select v-model="selectedRoleID" placeholder="请选择">
              <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              ></el-option>
            </el-select>
          </p>
        </div>
        <!-- 对话框底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="setRole">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义邮箱验证规则
    var emailValidator = (rule, value, cb) => {
      // 邮箱验证的正则表达式
      const regEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      // 验证传入值是否满足
      if (regEmail.test(value)) {
        // 满足就调用回调函数,结束
        return cb()
      }
      // 不满足就新建错误对象
      return cb(new Error('请输入正确的邮箱'))
    }
    // 自定义手机验证规则
    var mobileValidator = (rule, value, cb) => {
      // 手机号验证的正则表达式
      const regmobile = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-7|9])|(?:5[0-3|5-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1|8|9]))\d{8}$/
      // 验证传入值是否满足
      if (regmobile.test(value)) {
        // 满足就调用回调函数,结束
        return cb()
      }
      // 不满足就新建错误对象
      return cb(new Error('请输入正确的手机号'))
    }
    return {
      // 请求参数对象
      queryObj: {
        // 搜索字符串
        query: '',
        // 当前的页
        pagenum: 1,
        // 每页显示的数据数量
        pagesize: 3
      },
      // 总页数
      totalPage: 0,
      // 用户列表
      userList: [],
      // 控制 '添加用户' 对话框是否显示
      addDialogVisible: false,
      // '添加用户'的表单数据
      addUserForm: {
        // 用户名
        username: '',
        // 密码
        password: '',
        // 邮箱
        email: '',
        // 手机号
        mobile: ''
      },
      // '添加用户'的表单验证规则集
      addUserFormRules: {
        // 用户名验证规则
        username: [
          { required: true, message: '请输入用户名', trriger: 'blur' },
          { min: 3, max: 10, message: '长度在3~10个字符之间', trigger: 'blur' }
        ],
        // 密码验证规则
        password: [
          { required: true, message: '请输入密码', trriger: 'blur' },
          { min: 6, max: 15, message: '长度在6~15个字符之间', trigger: 'blur' }
        ],
        // 邮箱验证规则
        email: [
          { required: true, message: '请输入邮箱', trriger: 'blur' },
          { validator: emailValidator, trigger: 'blur' }
        ],
        // 手机号验证规则
        mobile: [
          { required: true, message: '请输入手机号', trriger: 'blur' },
          { validator: mobileValidator, trigger: 'blur' }
        ]
      },
      // 控制 '编辑用户信息'对话框是否显示
      editDialogVisible: false,
      // '编辑用户信息' 中 根据用户ID获取的表单数据
      editUserForm: {
        username: '',
        email: '',
        mobile: ''
      },
      // '编辑用户信息'的表单验证规则集
      editUserFormRules: {
        // 邮箱验证规则
        email: [
          { required: true, message: '请输入邮箱', trriger: 'blur' },
          { validator: emailValidator, trigger: 'blur' }
        ],
        // 手机号验证规则
        mobile: [
          { required: true, message: '请输入手机号', trriger: 'blur' },
          { validator: mobileValidator, trigger: 'blur' }
        ]
      },
      // 控制 '修改角色' 对话框显示
      setRoleDialogVisible: false,
      // 当前待修改角色的用户信息
      userInfor: {},
      // 被选中的角色ID
      selectedRoleID: '',
      // 所有角色列表
      rolesList: []
    }
  },
  created() {
    //   组件创建后立即请求数据
    this.getUsersList()
  },
  methods: {
    // 请求用户数剧
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
    },
    // 监听 每页显示多少数据的修改
    handleSizeChange(size) {
      // 获取修改的每页显示数据条数
      this.queryObj.pagesize = size
      // 发起请求,获取对应参数的数据
      this.getUsersList()
    },
    // 监听 页面切换
    handleCurrentChange(currentPage) {
      // 获取当前的页码
      this.queryObj.pagenum = currentPage
      // 发起请求,获取对应参数的数据
      this.getUsersList()
    },
    // 监听 开关状态改变
    async handleStateChange(userData) {
      // 发送PUT请求使数据库存放修改后的数据
      const { data: res } = await this.$https.put(
        `users/${userData.id}/state/${userData.mg_state}`
      )
      // 判断请求是否成功
      if (res.meta.status !== 200) {
        // 通知用户
        this.$msg.error('修改用户状态失败')
        // 并且将页面上的状态修改回来
        userData.mg_state = !userData.mg_state
      }
      // 通知用户请求成功
      this.$msg.success('修改用户状态成功')
    },
    // 监听 '添加用户'对话框关闭
    addDialogClosed() {
      // 获取表单对象,重置表单
      this.$refs.addUserFormRef.resetFields()
    },
    // 监听 '添加用户' 对话框的确定按钮
    addUser() {
      // 首先使用表达对象判断验证是否通过
      this.$refs.addUserFormRef.validate(async valid => {
        // 如果没有通过就返回
        if (!valid) return undefined
        // 否则发送添加用户的请求
        const { data: res } = await this.$https.post('users', this.addUserForm)
        // 如果创建添加失败提示用户
        if (res.meta.status !== 201) return this.$msg.error('添加用户失败')
        // 否则提示用户添加成功
        this.$msg.success('添加用户成功')
        // 重新获取用户数据
        this.getUsersList()
        // 关闭对话框
        this.addDialogVisible = false
      })
    },
    // 监听 '编辑用户信息' 按钮,显示对话框
    async showEditUserDialog(id) {
      // 发送网络请求获取对应ID的用户数据
      const { data: res } = await this.$https.get(`users/${id}`)
      // 如果请求失败,返回
      if (res.meta.status !== 200) return undefined
      // 否则将数据缓存到对应表单数据中
      this.editUserForm = res.data
      // 修改'编辑用户信息'对话框的显示控制变量
      this.editDialogVisible = true
    },
    // 监听 '编辑用户信息'对话框关闭
    editDialogClosed() {
      // 获取表单对象,重置表单
      this.$refs.editUserFormRef.resetFields()
    },
    // 监听 '编辑用户信息'对话框中的确定按钮
    editUser() {
      // 表单预验证
      this.$refs.editUserFormRef.validate(async valid => {
        if (!valid) return undefined
        const { data: res } = await this.$https.put(
          `users/${this.editUserForm.id}`,
          {
            email: this.editUserForm.email,
            mobile: this.editUserForm.mobile
          }
        )
        // 判断是否请求成功
        if (res.meta.status !== 200) return this.$msg.error('更新用户信息失败')
        // 否则
        // 更新用户数据
        this.getUsersList()
        // 关闭对话框
        this.editDialogVisible = false
        // 提示用户更新成功
        this.$msg.success('更新用户信息成功')
      })
    },
    // 监听 '删除用户' 按钮rids
    async removeUserByID(id) {
      // 弹出消息盒子,提醒用户
      const result = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
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
      const { data: res } = await this.$https.delete(`users/${id}`)
      // 判断是否请求成功
      if (res.meta.status !== 200) return this.$msg.error('删除用户失败!')
      // 否则提醒删除成功
      this.$msg.success('删除用户成功')
      // 更新用户列表
      this.getUsersList()
    },
    // 点击 修改角色 按钮
    async setRoleDialogShow(userInfor) {
      // 缓存当前用户信息
      this.userInfor = userInfor
      // 发起请求获取所有角色信息
      const { data: res } = await this.$https.get('roles')
      if (res.meta.status !== 200) return undefined
      this.rolesList = res.data
      // 显示对话框
      this.setRoleDialogVisible = true
    },
    // 监听对话框关闭
    setRoleDialogClose() {
      this.selectedRoleID = ''
    },
    // 设置角色
    async setRole() {
      if (!this.selectedRoleID) return this.$msg.error('请选择设置的角色!')
      const { data: res } = await this.$https.put(
        `users/${this.userInfor.id}/role`,
        {
          rid: this.selectedRoleID
        }
      )
      if (res.meta.status !== 200) return this.$msg.error('修改角色错误!')
      // 修改成功
      this.$msg.success('修改角色成功!')
      // 重新加载数据
      this.getUsersList()
      // 关闭对话框
      this.setRoleDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
</style>
