<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              v-for="(rtlv1,rli1) in scope.row.children"
              :key="rtlv1.id"
              :class="['bdbottom',rli1===0 ? 'bdtop':'','vcenter']"
            >
              <!-- 一级权限 列-->
              <el-col :span="8">
                <el-tag closable @close="removeRightByID(scope.row,rtlv1.id)">{{rtlv1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级,三级权限 列 -->
              <el-col :span="16">
                <!-- 二级权限 行 -->
                <el-row
                  v-for="(rtlv2,rli2) in rtlv1.children"
                  :key="rtlv2.id"
                  :class="[rli2===0?'':'bdtop','vcenter']"
                >
                  <el-col :span="8">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightByID(scope.row,rtlv2.id)"
                    >{{rtlv2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 列 -->
                  <el-col :span="16">
                    <el-tag
                      type="warning"
                      v-for="(rtlv3) in rtlv2.children"
                      :key="rtlv3.id"
                      closable
                      @close="removeRightByID(scope.row,rtlv3.id)"
                    >{{rtlv3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="290px">
          <template v-slot="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditRoleDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRoleByID(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showRightsAlloc(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClosed"
    >
      <!-- 对话框主显示区 -->
      <el-form
        :model="addRoleForm"
        :rules="addRoleFormRules"
        ref="addRoleFormRef"
        label-width="80px"
      >
        <!-- 角色名称 -->
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <!-- 角色描述 -->
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleDialogClosed"
    >
      <!-- 对话框主显示区 -->
      <el-form
        :model="editRoleForm"
        :rules="editRoleFormRules"
        ref="editRoleFormRef"
        label-width="80px"
      >
        <!-- 角色名称 -->
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <!-- 角色描述 -->
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 配置权限对话框 -->
    <el-dialog
      title="配置权限"
      :visible.sync="rightsAllocDialogVisible"
      width="50%"
      @close="rightsAllocDialogClose"
    >
      <!-- 对话框主显示区 -->
      <el-tree
        :data="rightsTree"
        :props="rightTreeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defaultCheckedItems"
        ref="rightsTreeRef"
      ></el-tree>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightsAllocDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表
      rolesList: [],
      // 控制'添加角色'对话框的显示与否
      addRoleDialogVisible: false,
      // '添加角色'的表单数据对象
      addRoleForm: {
        // 角色名称
        roleName: '',
        // 角色描述
        roleDesc: ''
      },
      // '添加角色'的表单数据验证集
      addRoleFormRules: {
        // 角色名称验证规则
        roleName: [
          { required: true, message: '请输入角色名称', trriger: 'blur' }
        ]
      },
      // 控制'编辑角色'对话框的显示与否
      editRoleDialogVisible: false,
      // '编辑角色'的表单数据对象
      editRoleForm: {
        // 角色名称
        roleName: '',
        // 角色描述
        roleDesc: ''
      },
      // '编辑角色'的表单数据验证集
      editRoleFormRules: {
        // 角色名称验证规则
        roleName: [
          { required: true, message: '请输入角色名称', trriger: 'blur' }
        ]
      },
      // '分配权限'对话框显示变量
      rightsAllocDialogVisible: false,
      // 缓存所有权限的树形数据对象
      rightsTree: {},
      // 树形组件的props设置
      rightTreeProps: {
        // 节点的名称为权限名称
        label: 'authName',
        // 树形组件根据权限对象的children进行树形结构渲染
        children: 'children'
      },
      // 树形控件中默认勾选的项目集合
      defaultCheckedItems: [],
      // 当前需要分配权限的角色ID
      rightRoleID: ''
    }
  },
  created() {
    // 组件创建后,获取角色列表
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const { data: res } = await this.$https.get('roles')
      if (res.meta.status !== 200) return this.$msg.error('获取角色列表失败')
      this.rolesList = res.data
    },
    // 监听 关闭'添加角色'对话框
    addRoleDialogClosed() {
      // 获取表单对象重置所有表单域
      this.$refs.addRoleFormRef.resetFields()
      // 失能'添加角色'对话框显示标志
      this.addRoleDialogVisible = false
    },
    // 监听 '添加角色'对话框确定按钮
    addRole() {
      // 判断验证是否通过
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return undefined
        // 发送请求
        const { data: res } = await this.$https.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) return this.$msg.error('添加角色失败!')
        this.$msg.success('添加角色成功!')
        // 重新获取角色列表
        this.getRolesList()
        // 关闭对话框
        this.addRoleDialogVisible = false
      })
    },
    // 监听 '编辑角色'按钮
    async showEditRoleDialog(id) {
      // 发送网络请求获取对应ID的用户数据
      const { data: res } = await this.$https.get(`roles/${id}`)
      // 如果请求失败,返回
      if (res.meta.status !== 200) return undefined
      // 否则将数据缓存到对应表单数据中
      this.editRoleForm = res.data
      // 修改'编辑用户信息'对话框的显示控制变量
      this.editRoleDialogVisible = true
    },
    // 监听 关闭'编辑角色'对话框
    editRoleDialogClosed() {
      // 获取表单对象重置所有表单域
      this.$refs.editRoleFormRef.resetFields()
      // 失能'编辑角色'对话框显示标志
      this.editRoleDialogVisible = false
    },
    // 监听 '编辑角色'对话框确定按钮
    editRole() {
      // 判断验证是否通过
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return undefined
        // 发送请求
        const { data: res } = await this.$https.put(
          `roles/${this.editRoleForm.roleId}`,
          {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc
          }
        )
        if (res.meta.status !== 200) return this.$msg.error('编辑角色失败!')
        this.$msg.success('编辑角色成功!')
        // 修改角色列表中对应id的数据
        const targetRole = this.rolesList.find(
          value => value.id === this.editRoleForm.roleId
        )
        // 利用服务器返回的数据直接修改对应数据,减少再次整体请求
        targetRole.roleName = res.data.roleName
        targetRole.roleDesc = res.data.roleDesc
        // 关闭对话框
        this.editRoleDialogVisible = false
      })
    },
    // 监听 '删除角色' 按钮
    async removeRoleByID(id) {
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
      const { data: res } = await this.$https.delete(`roles/${id}`)
      // 判断是否请求成功
      if (res.meta.status !== 200) return this.$msg.error('删除角色失败!')
      // 否则提醒删除成功
      this.$msg.success('删除角色成功')
      // 更新角色列表
      this.getRolesList()
    },
    // 监听 '权限'标签上的删除
    async removeRightByID(role, rightID) {
      // 弹出消息盒子,提醒用户
      const result = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
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
        `roles/${role.id}/rights/${rightID}`
      )
      if (res.meta.status !== 200) return this.$msg.error('删除权限失败!')
      // 通知删除权限成功
      this.$msg.success('删除权限成功!')
      // 使用返回的数据更新当前角色的信息,避免重新发送请求,整体重绘
      // 注意这里不能直接赋值role,这样不会触发重绘
      role.children = res.data
    },
    // 监听 '分配权限' 按钮
    async showRightsAlloc(role) {
      // 缓存当前待修改权限的角色id,用于后续发送修改权限请求
      this.rightRoleID = role.id
      // 以树形结构发起请求获取所有权限
      const { data: res } = await this.$https.get('rights/tree')
      if (res.meta.status !== 200) this.msg.error('获取权限错误!')
      // 缓存到权限对象中
      this.rightsTree = res.data
      // 在打开对话框前,缓存所有三级节点
      this.collectNodes(role, this.defaultCheckedItems)
      // 修改 '分配权限'对话框 的显示控制变量
      this.rightsAllocDialogVisible = true
    },
    // 递归地将所有三级节点添加到目标数组
    collectNodes(node, arr) {
      // 首先判断是否有子节点
      if (!node.children) {
        // 如果没有,则表示为三级节点
        // 直接添加到对应数组
        return arr.push(node.id)
      }
      // 如果有则需遍历子节点,并将子节点递归
      node.children.forEach(child => {
        this.collectNodes(child, arr)
      })
    },
    // 监听 '分配权限'对话框关闭
    rightsAllocDialogClose() {
      // 清空默认勾选的集合,否则会导致展示状态混乱
      this.defaultCheckedItems = []
      // 隐藏对话框
      this.rightsAllocDialogVisible = false
    },
    // 将已经分配好的权限,发送请求到服务器
    async setRights() {
      // 获取所有半选和全选的权限ID
      // 转换为以,分隔的字符串
      const selectedRightsID = [
        ...this.$refs.rightsTreeRef.getCheckedKeys(),
        ...this.$refs.rightsTreeRef.getHalfCheckedKeys()
      ].join(',')
      // 发送请求
      const { data: res } = await this.$https.post(
        `roles/${this.rightRoleID}/rights`,
        {
          rids: selectedRightsID
        }
      )

      if (res.meta.status !== 200) return this.$msg.error('分配权限错误!')
      this.$msg.success('分配权限成功')
      // 更新角色列表 ,这里可以的话,应该只更新当前角色权限
      this.getRolesList()
      // 隐藏对话框
      this.rightsAllocDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 10px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
