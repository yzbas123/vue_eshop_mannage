<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 登录表单区域 -->
      <el-form
        ref="loginFormRef"
        label-width="0px"
        class="login_form"
        :model="loginForm"
        :rules="loginFormrules"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            prefix-icon="iconfont icon-3702mima"
            v-model="loginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: '',
        password: ''
      },
      // 表单验证规则集对象
      loginFormrules: {
        //   属性名称为规则字段名称,属性值是个验证对象数组,代表多个针对指定字段的具体规则

        // 验证用户名
        username: [
          // required 表示是否必填,message是不合格时出现的错误信息,trigger表示触发验证的时机,blur表示离开焦点
          { required: true, message: '请输入用户名', trriger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码
        password: [
          { required: true, message: '请输入密码', trriger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ]
      },
      // 表单实例对象
      loginFormInstance: null
    }
  },
  mounted() {
    //   挂载后获取登录表单实例
    this.loginFormInstance = this.$refs.loginFormRef
  },
  methods: {
    // 重置登录表单
    resetLoginForm: function() {
      this.loginFormInstance.resetFields()
    },
    // 登录功能
    login: function() {
      this.loginFormInstance.validate(async valid => {
        if (!valid) return undefined
        const { data: res } = await this.$https.post('/login', this.loginForm)
        if (res.meta.status !== 200) {
          return this.$msg.error('登录失败,用户名或密码错误')
        }
        this.$msg.success('登录成功!')
        // 存放token到sessionStorge中
        window.sessionStorage.setItem('token', res.data.token)
        // 跳转到home页面
        this.$router.replace('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  position: relative;
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  .avatar_box {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.btns {
  display: flex;
  justify-content: flex-end;
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>
