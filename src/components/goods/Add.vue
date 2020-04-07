<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 头部提示区 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤指示区域 -->
      <el-steps :active="activeStep-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 表单域 -->
      <!-- 由于最终添加商品信息需要几个标签中的信息综合在一起,所以外部使用一个大表单进行包裹 -->
      <el-form
        :model="addGoodsForm"
        :rules="addGoodsFormRules"
        ref="addGoodsFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- 侧边的标签页 -->
        <el-tabs
          tab-position="left"
          v-model="activeStep"
          :before-leave="handleBeforeTabLeave"
          @tab-click="tabClicked"
        >
          <!-- 基本信息标签页 -->
          <el-tab-pane label="基本信息" name="0">
            <!-- 商品名称-->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <!-- 商品价格-->
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model.number="addGoodsForm.goods_price"></el-input>
            </el-form-item>
            <!-- 商品重量-->
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model.number="addGoodsForm.goods_weight"></el-input>
            </el-form-item>
            <!-- 商品数量-->
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model.number="addGoodsForm.goods_number"></el-input>
            </el-form-item>
            <!-- 商品分类-->
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择框 -->
              <el-cascader
                :options="cateList"
                v-model="addGoodsForm.goods_cat"
                @change="cateChange"
                :props="cateProps"
                clearable
                popper-class="params_cascader-popmenu"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数标签页 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyList" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(el,i) in item.attr_vals" :key="i" :label="el" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性标签页 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="(item,i) in onlyList" :key="i">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片标签页 -->
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadImgURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="hadleUpLoadDone"
              :headers="uploadImgHeader"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <!-- 商品内容标签页 -->
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addGoodsForm.goods_introduce" ref="goodsIntroRef"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btn_mt" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="preViewDialogVisible" width="50%">
      <img :src="preViewURL" class="preViewIMG" />
    </el-dialog>
  </div>
</template>

<script>
var _ = require('lodash')
export default {
  // Load the full build.
  data() {
    return {
      // 当前步骤
      activeStep: '0',
      // 添加商品的表单对象
      addGoodsForm: {
        // 商品名称
        goods_name: '',
        // 商品价格
        goods_price: 0,
        // 商品重量
        goods_weight: 0,
        // 商品数量
        goods_number: 0,
        // 商品分类数组
        goods_cat: [],
        // 商品参数,包含动态参数 和 静态属性
        attrs: [],
        // 商品图片临时路径,是一个对象数组 存放上传图片成功后服务器返回的临时路径
        pics: [],
        // 商品介绍字符串
        goods_introduce: ''
      },
      // 添加商品的表单验证对象
      addGoodsFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trriger: 'blur' }
        ],
        goods_price: [
          {
            type: 'number',
            required: true,
            message: '请输入商品价格',
            trriger: 'blur'
          }
        ],
        goods_weight: [
          {
            type: 'number',
            required: true,
            message: '请输入商品重量',
            trriger: 'blur'
          }
        ],
        goods_number: [
          {
            type: 'number',
            required: true,
            message: '请输入商品数量',
            trriger: 'blur'
          }
        ],
        goods_cat: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value.length !== 3) {
                callback(new Error('请选择商品分类'))
              }
              callback()
            },
            trriger: 'change'
          }
        ]
      },
      // 商品分类列表
      cateList: [],
      // 级联列表配置选项
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
      // 商品动态参数列表
      manyList: [],
      // 商品静态属性列表
      onlyList: [],
      // 上传图片的URL
      uploadImgURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 上传图片的头部信息,用于设置上传图片的Token验证
      uploadImgHeader: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片的URL
      preViewURL: '',
      // 预览图片的对话框是否可见
      preViewDialogVisible: false
    }
  },
  created() {
    // 获取所有商品分类数据
    this.getCateList()
  },
  computed: {
    // 将商品分类数据转化成字符串
    strCateList() {
      return this.addGoodsForm.goods_cat.join(',')
    },
    // 获取商品分类对应的ID
    cateID() {
      if (this.addGoodsForm.goods_cat.length === 3) {
        return this.addGoodsForm.goods_cat[2]
      }
      return ''
    }
  },
  methods: {
    // 获取分类列表
    async getCateList() {
      const { data: res } = await this.$https.get('categories')
      if (res.meta.status !== 200) {
        return this.$msg.error('获取商品分类信息失败!')
      }
      this.cateList = res.data
    },
    // 级联选项改变
    cateChange() {
      if (this.addGoodsForm.goods_cat.length !== 3) {
        // 若选中的不是三级分类
        // 清空选中数组
        this.addGoodsForm.goods_cat = []
        return undefined
      }
    },
    // 监听 标签页切换前的事件
    handleBeforeTabLeave(activeName, oldActiveName) {
      // 如果当前页是第一页,且级联列表对应的数组中没有有效数据
      if (oldActiveName === '0' && this.addGoodsForm.goods_cat.length !== 3) {
        // 提醒用户选择分类
        this.$msg.error('请先选择商品分类!')
        // 阻止跳转标签页
        return false
      }
    },
    // 监听 标签页 的点击事件
    async tabClicked() {
      // 商品动态参数页
      if (this.activeStep === '1') {
        // 发送获取商品参数请求
        const { data: res } = await this.$https.get(
          `categories/${this.cateID}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$msg.error('请求商品动态参数失败!')
        }
        // 处理参数中的attr_vals将其转换为数组
        res.data.forEach(ele => {
          ele.attr_vals = ele.attr_vals === '' ? [] : ele.attr_vals.split(' ')
        })
        // 缓存数据到商品动态参数列表中
        this.manyList = res.data
      } else if (this.activeStep === '2') {
        // 商品的静态属性页
        // 发送获取商品静态属性请求
        const { data: res } = await this.$https.get(
          `categories/${this.cateID}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$msg.error('请求商品静态属性失败!')
        }
        this.onlyList = res.data
      }
    },
    // 处理 上传图片的 预览
    handlePreview(file) {
      // 设置对应的图片路径
      this.preViewURL = file.response.data.url
      // 显示对话框
      this.preViewDialogVisible = true
    },
    // 处理 图片的删除 时间
    handleRemove(file) {
      // 找到当前文件在临时图片中的索引
      const index = this.addGoodsForm.pics.findIndex(
        val => val.pic === file.response.data.tmp_path
      )
      // 弹出索引对应项目
      this.addGoodsForm.pics.splice(index, 1)
    },
    // 处理 图片上传成功
    hadleUpLoadDone(res) {
      // 获取临时路径设置到对象中
      const temp = { pic: res.data.tmp_path }
      // 添加到图片临时列表中
      this.addGoodsForm.pics.push(temp)
    },
    // 添加商品信息
    addGoods() {
      this.$refs.addGoodsFormRef.validate(async valid => {
        if (!valid) return this.$msg.error('请按照要求填写表单!')
        // 循环将 动态参数 和 静态属性 添加到attrs中
        // 动态参数
        this.manyList.forEach(ele => {
          // 创建符合请求格式的对象
          const temp = {
            attr_id: ele.attr_id,
            attr_value: ele.attr_vals.join(' ')
          }
          // 放入attrs中
          this.addGoodsForm.attrs.push(temp)
        })
        // 静态属性
        this.onlyList.forEach(ele => {
          // 创建符合请求格式的对象
          const temp = {
            attr_id: ele.attr_id,
            attr_value: ele.attr_vals
          }
          // 放入attrs中
          this.addGoodsForm.attrs.push(temp)
        })
        // 深拷贝表单数据
        const form = _.cloneDeep(this.addGoodsForm)
        // 将goods_cate转换成字符串
        form.goods_cat = form.goods_cat.join(',')
        // console.log(form)

        // 发送添加商品请求
        const { data: res } = await this.$https.post('goods', form)
        // 请求失败通知用户
        if (res.meta.status !== 201) return this.$msg.error('添加商品失败!')
        // 请求成功通知用户
        this.$msg.success('添加商品成功!')
        // 调用路由管理器,跳转回到商品列表页
        this.$router.push('/goods')
      })
    }
  }
}
</script>

<style lang='less' scoped>
.el-steps {
  margin: 15px;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.preViewIMG {
  width: 100%;
}
.btn_mt {
  margin-top: 10px;
}
</style>
