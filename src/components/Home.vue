<template>
<div>
    <el-button @click="logout" type='info'>退出登录</el-button>
</div>
</template>

<script>
export default {
  methods: {
    logout () {
      // sessionStorge清除缓存的数据
      window.sessionStorage.clear()
      // 使用路由管理对象跳转到登录界面
      this.$router.push('/login')
    }
  }
}
</script>

<style lang='less' scoped>

</style>
